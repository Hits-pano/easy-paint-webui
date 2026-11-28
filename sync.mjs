/**
 * Easy Paint · 从 DSH 插件同步到独立版
 *
 * 插件源改了之后跑这个，一条命令把改动带过来：
 *
 *   node sync.mjs          只同步（重新生成 app.js / backend.js）
 *   node sync.mjs --build  同步 + 打包 exe
 *
 * 转换规则（插件 → 独立版的全部差异）：
 *
 *   client.js → app.js
 *     - 去掉 window.__ModuleLoader__.load({...}) 外壳
 *     - 去掉 const React = require('react') / const h = ...
 *     - 去掉 const NS = '...'
 *     - 主体统一去掉 4 格缩进（原来在外壳里）
 *     - 追加 mount()：直接渲染到 #app
 *
 *   index.js → backend.js
 *     - 去掉 export const name / inject
 *     - export function apply(ctx, rawConfig) → function createApp(ctx, rawConfig)
 *     - 删掉 ctx.tools.register({...}) 整块（独立版没有对话工具）
 *     - 跳过 ctx.inject(['attachments','llm']) 整块（视觉自检降级）
 *     - 截掉末尾 webServer 注册段，改为 return { routes }
 *
 * 校验（任何一项失败都不覆盖已有文件）：
 *   1. 语法检查通过
 *   2. app.js 含 zh / en / EasyPaintSettings / STYLE
 *   3. backend.js 含 createApp / routes，且不含 ctx.tools.register
 *   4. 路由数量 = 12
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

// 插件源目录：默认是同级的 dsh-easy-paint，可用 --src 覆盖
const args = process.argv.slice(2)
const srcArgIdx = args.indexOf('--src')
const SRC = srcArgIdx >= 0 && args[srcArgIdx + 1]
  ? resolve(args[srcArgIdx + 1])
  : resolve(HERE, '..', '..', '..', '工作区1', 'dsh-easy-paint')
const doBuild = args.includes('--build')

const step = (m) => console.log(`\n>> ${m}`)
const ok = (m) => console.log(`   ${m}`)
const warn = (m) => console.log(`   ⚠ ${m}`)

function die(msg) {
  console.error(`\n   ✗ ${msg}\n`)
  process.exit(1)
}

/* ---------------------------------------------------------- 前置检查 ---- */

step('检查插件源')
if (!existsSync(join(SRC, 'client.js'))) die(`找不到插件源：${SRC}\n   用 --src 指定，例如 node sync.mjs --src "D:\\path\\to\\dsh-easy-paint"`)
ok(`源目录 ${SRC}`)
const clientSrc = readFileSync(join(SRC, 'client.js'), 'utf8')
const indexSrc = readFileSync(join(SRC, 'index.js'), 'utf8')
ok(`client.js  ${(clientSrc.length / 1024).toFixed(1)} KB`)
ok(`index.js   ${(indexSrc.length / 1024).toFixed(1)} KB`)

/* ------------------------------------------------- client → app.js ---- */

step('转换 client.js → app.js')
const cl = clientSrc.split(/\r?\n/)

// 主体起点：const NS 那行的下一行
let bodyStart = -1
for (let i = 0; i < cl.length; i++) {
  if (/^\s*const NS = 'settings\.easyPaint'\s*$/.test(cl[i])) { bodyStart = i + 1; break }
}
if (bodyStart < 0) die('找不到 `const NS = \'settings.easyPaint\'`，client.js 的外壳结构可能变了')

// 主体终点：return { inject: ['slots','locale'] ... } 之前
let bodyEnd = -1
for (let i = bodyStart; i < cl.length; i++) {
  if (/^\s+return \{\s*$/.test(cl[i]) && /^\s+inject: \[/.test(cl[i + 1] ?? '')) { bodyEnd = i - 1; break }
}
if (bodyEnd < 0) die('找不到 `return { inject: [...] }`，client.js 的外壳结构可能变了')
ok(`主体 L${bodyStart + 1} → L${bodyEnd + 1}（${bodyEnd - bodyStart + 1} 行）`)

// 去 4 格缩进
const appBody = []
for (let i = bodyStart; i <= bodyEnd; i++) {
  const line = cl[i]
  const m = line.match(/^ {4}(.*)$/)
  if (m) appBody.push(m[1])
  else appBody.push(line.trim() === '' ? '' : line)
}

const appHeader = `/**
 * easy-paint · 前端界面（独立 WebUI 版）
 *
 * ⚠ 本文件由 sync.mjs 自动生成，不要直接改。
 *   要改界面请改插件源的 client.js，然后跑 node sync.mjs
 *
 * 与插件版的差异只有挂载方式：
 *   - 去掉 window.__ModuleLoader__ 外壳，改为标准 ES module
 *   - 去掉 ctx.slots / ctx.locale，改为直接挂到 #app
 *   - React / ReactDOM 从全局取（index.html 提供）
 */
const React = window.React
const h = React.createElement

`

const appFooter = `

/* ------------------------------------------------------------ 启动 ---- */

/**
 * 独立版入口：直接渲染 EasyPaintSettings，不做任何槽注册。
 * 插件版靠 ctx.slots.register 挂到 DSH 设置页；独立版自己开页面。
 */
function mount() {
  const t = (key) => {
    const dict = (navigator.language || '').toLowerCase().startsWith('zh') ? zh : en
    return dict[key] ?? key
  }
  const root = ReactDOM.createRoot(document.getElementById('app'))
  root.render(h('div', { className: 'qwd-standalone' }, h(EasyPaintSettings, { t })))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
`

const appJs = appHeader + appBody.join('\n') + appFooter

/* ---------------------------------------------- index → backend.js ---- */

step('转换 index.js → backend.js')
const ix = indexSrc.split(/\r?\n/)
const be = []
let i = 0
let cutAt = -1

while (i < ix.length) {
  const line = ix[i]

  // 去掉插件的导出声明
  if (/^export const name = /.test(line) || /^export const inject = /.test(line)) { i++; continue }

  // apply → createApp
  if (/^export function apply\(ctx, rawConfig\) \{/.test(line)) {
    be.push('export function createApp(ctx, rawConfig) {')
    i++; continue
  }

  // 删 ctx.tools.register({...}) 整块
  if (/^\s+ctx\.tools\.register\(\{/.test(line)) {
    let depth = 0
    let j = i
    while (j < ix.length) {
      for (const ch of ix[j]) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (depth === 0 && j > i) break
      j++
    }
    be.push('  // 独立版没有对话工具，不注册 draw_image；出图走下面的 HTTP 端点。')
    ok(`删除 ctx.tools.register  L${i + 1} → L${j + 1}（${j - i + 1} 行）`)
    i = j + 1
    continue
  }

  // 跳过整个 if (typeof ctx.inject === 'function') { ctx.inject(['attachments','llm'] ...) }
  if (/if \(typeof ctx\.inject === 'function'\) \{/.test(line)
      && /ctx\.inject\(\['attachments', 'llm'\]/.test(ix[i + 1] ?? '')) {
    let depth = 0
    let j = i
    while (j < ix.length) {
      for (const ch of ix[j]) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (depth === 0 && j > i) break
      j++
    }
    be.push('  // 独立版没有 DSH 的 attachments / llm 服务，视觉自检降级跳过')
    ok(`跳过 ctx.inject(attachments/llm)  L${i + 1} → L${j + 1}`)
    i = j + 1
    continue
  }

  // 末尾 webServer 注册段：从这里截断。
  // 锚点跟着插件源一起变——插件那边改成同步注册后注释也换了，
  // 这里两种写法都认，免得下次再对不上。
  if (/\/\/ 设置页要用的 HTTP 路由/.test(line) || /\/\/ webServer 是可选服务/.test(line)) {
    cutAt = i + 1
    ok(`截断于 L${cutAt}（webServer 注册段）`)
    break
  }

  be.push(line)
  i++
}

if (cutAt < 0) warn('没找到 webServer 注册段，可能已经被改过——请检查生成的 backend.js 末尾')

const beTail = `
  /* ---------------------------------------------------- 独立版导出 ---- */

  /**
   * 独立版不用 DSH 的 webServer：把路由直接返回出去，
   * 由 server.js 挂到原生 http.Server 上。
   */
  return {
    routes: {
      [CONFIG_PATH]: onConfig,
      [STATUS_PATH]: onStatus,
      [MODELS_PATH]: onModels,
      [LAUNCH_PATH]: onLaunch,
      [STOP_PATH]: onStop,
      [VISION_MODELS_PATH]: onVisionModels,
      [DETECT_PATH]: onDetect,
      [BROWSE_PATH]: onBrowse,
      [DRAW_PATH]: onDraw,
      [IMAGE_PATH]: onImage,
      [REVEAL_PATH]: onReveal,
      [OPEN_OUTPUT_PATH]: onOpenOutput,
    },
  }
}
`

let backendJs = be.join('\n') + '\n' + beTail

/* ------------------------------------------- 配置目录改到 %APPDATA% ---- */

step('改写配置目录')

// 插件版必须放 ~/.dsh/easy-paint（和 DSH 一致）；
// 独立版不能这样——那目录名会让人以为非装 DSH 不可，
// 而且 DSH 被卸载/清理时可能连带删掉。
//
// 独立版改用 %APPDATA%\easy-paint，首次启动时把旧位置的数据搬过来。
const APP_DIR_EXPR = "process.env.APPDATA ? join(process.env.APPDATA, 'easy-paint') : join(homedir(), '.easy-paint')"

let rewrites = 0
backendJs = backendJs.replace(
  "const COMFY_LOG = join(homedir(), '.dsh', 'easy-paint', 'comfyui.log')",
  () => { rewrites++; return "const COMFY_LOG = join(APP_DIR, 'comfyui.log')" }
)
backendJs = backendJs.replace(
  "const STATE_DIR = join(homedir(), '.dsh', 'easy-paint')",
  () => { rewrites++; return "const STATE_DIR = APP_DIR" }
)

if (rewrites !== 2) {
  die(`配置目录改写失败：只替换了 ${rewrites}/2 处，插件源的路径定义可能变了`)
}
ok('COMFY_LOG / STATE_DIR → %APPDATA%\\easy-paint')

// APP_DIR 必须定义在 COMFY_LOG 之前——后者在模块顶层就用到了它，
// 放到 CONFIG_PATH 前面会触发 TDZ（Cannot access before initialization）。
const anchor = 'const COMFY_LOG = '
const appDirDef = `/**
 * 独立版的配置目录。
 *
 * 插件版存在 ~/.dsh/easy-paint（和 DSH 保持一致），但独立版不该用那个目录：
 * 名字会让人以为非装 DSH 不可，且卸载 DSH 时可能被清理工具连带删掉。
 * 这里改用 Windows 标准的 %APPDATA%\\easy-paint。
 */
const APP_DIR = ${APP_DIR_EXPR}
const LEGACY_DIR = join(homedir(), '.dsh', 'easy-paint')

/** 老版本把配置放在 ~/.dsh/easy-paint，第一次启动时搬过来 */
function migrateLegacyState() {
  try {
    if (existsSync(STATE_FILE)) return
    if (!existsSync(LEGACY_DIR)) return
    mkdirSync(STATE_DIR, { recursive: true })
    for (const name of ['config.json', 'models-cache.json']) {
      const from = join(LEGACY_DIR, name)
      const to = join(STATE_DIR, name)
      if (existsSync(from) && !existsSync(to)) copyFileSync(from, to)
    }
  } catch {
    // 迁移失败不影响启动：用户重新配一次即可
  }
}

`

if (!backendJs.includes(anchor)) die('找不到 COMFY_LOG 锚点，无法插入 APP_DIR 定义')
backendJs = backendJs.replace(anchor, appDirDef + anchor)

// 补需要的 fs 函数。backend.js 保持 ESM import（转 require 是 build.mjs 的活），
// 所以这里改的是 import 语句，不是 require。
const fsImportRe = /^import \{([^}]+)\} from 'node:fs'$/m
const fsMatch = backendJs.match(fsImportRe)
if (!fsMatch) {
  die('找不到 `import ... from \'node:fs\'`，无法补 mkdirSync / copyFileSync')
}
const fsNames = new Set(fsMatch[1].split(',').map((x) => x.trim()).filter(Boolean))
let added = 0
for (const fn of ['mkdirSync', 'copyFileSync']) {
  if (!fsNames.has(fn)) { fsNames.add(fn); added++ }
}
if (added > 0) {
  backendJs = backendJs.replace(
    fsImportRe,
    () => `import { ${[...fsNames].join(', ')} } from 'node:fs'`
  )
  ok(`补齐 fs 导入（+${added} 个函数）`)
} else {
  ok('fs 导入已齐全')
}

// 启动时调用一次迁移
const mainAnchor = 'void loadFileConfig()'
if (backendJs.includes(mainAnchor)) {
  backendJs = backendJs.replace(mainAnchor, 'migrateLegacyState()\n  void loadFileConfig()')
  ok('已挂上迁移调用')
} else {
  warn('找不到 loadFileConfig 调用点，迁移不会自动执行')
}

/* ---------------------------------------------------------- 校验 ---- */

step('校验生成结果')
let failed = false

// 1) 语法
const tmpApp = join(HERE, '.sync-app.mjs')
const tmpBackend = join(HERE, '.sync-backend.mjs')
writeFileSync(tmpApp, appJs, 'utf8')
writeFileSync(tmpBackend, backendJs, 'utf8')

for (const [name, file] of [['app.js', tmpApp], ['backend.js', tmpBackend]]) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
    ok(`语法 ${name} ✓`)
  } catch (e) {
    console.error(`   ✗ 语法 ${name} 失败:\n${e.stderr?.toString() ?? e.message}`)
    failed = true
  }
}

// 2) app.js 关键符号
const appChecks = [
  ['const zh =', '中文文案表'],
  ['const en =', '英文文案表'],
  ['function EasyPaintSettings', '主组件'],
  ['const STYLE =', '样式表'],
  ['function DirPicker', '路径选择器'],
]
for (const [needle, label] of appChecks) {
  if (appJs.includes(needle)) ok(`app.js 含 ${label} ✓`)
  else { console.error(`   ✗ app.js 缺 ${label}（找不到 "${needle}"）`); failed = true }
}

// 3) backend.js 关键符号
if (backendJs.includes('function createApp')) ok('backend.js 含 createApp ✓')
else { console.error('   ✗ backend.js 缺 createApp'); failed = true }

if (!backendJs.includes('ctx.tools.register')) ok('backend.js 已无 ctx.tools.register ✓')
else { console.error('   ✗ backend.js 里还有 ctx.tools.register'); failed = true }

// 3.4) 迁移所需函数必须可用
for (const fn of ['mkdirSync', 'copyFileSync']) {
  const hasImport = new RegExp(`import \\{[^}]*\\b${fn}\\b[^}]*\\} from 'node:fs'`).test(backendJs)
  if (hasImport) ok(`已导入 ${fn} ✓`)
  else { console.error(`   ✗ 缺 ${fn} 的导入，迁移会失败`); failed = true }
}

// 3.5) 配置目录必须已改写（不能再指向 .dsh）
if (!backendJs.includes("'easy-paint')") && !backendJs.includes('APP_DIR')) {
  console.error('   ✗ backend.js 里找不到 APP_DIR，配置目录改写没生效')
  failed = true
}
const dshRefs = (backendJs.match(/\.dsh', 'easy-paint'/g) ?? []).length
if (dshRefs === 0) ok('已无 .dsh 路径残留 ✓')
else {
  // LEGACY_DIR 里保留一处是正常的（用于迁移）
  const legacyOnly = backendJs.includes("const LEGACY_DIR = join(homedir(), '.dsh', 'easy-paint')")
  if (dshRefs === 1 && legacyOnly) ok('.dsh 路径只剩迁移用的 LEGACY_DIR ✓')
  else { console.error(`   ✗ 还有 ${dshRefs} 处 .dsh 路径残留`); failed = true }
}

// 4) 路由数量
const routeCount = (backendJs.match(/\[[A-Z_]+_PATH\]: on/g) ?? []).length
if (routeCount === 12) ok(`路由数量 ${routeCount} ✓`)
else { console.error(`   ✗ 路由数量 ${routeCount}，应为 12`); failed = true }

if (failed) {
  try { execFileSync('cmd', ['/c', 'del', tmpApp, tmpBackend], { stdio: 'ignore' }) } catch {}
  die('校验失败，未覆盖已有文件。请检查上面的错误。')
}

/* ---------------------------------------------------------- 写入 ---- */

step('写入')
const appDest = join(HERE, 'app.js')
const backendDest = join(HERE, 'backend.js')

// 备份旧文件
if (existsSync(appDest)) copyFileSync(appDest, join(HERE, '.app.js.bak'))
if (existsSync(backendDest)) copyFileSync(backendDest, join(HERE, '.backend.js.bak'))

copyFileSync(tmpApp, appDest)
copyFileSync(tmpBackend, backendDest)
try { execFileSync('cmd', ['/c', 'del', tmpApp, tmpBackend], { stdio: 'ignore' }) } catch {}

ok(`app.js       ${(appJs.length / 1024).toFixed(1)} KB`)
ok(`backend.js   ${(backendJs.length / 1024).toFixed(1)} KB`)

// 写入成功，删掉这次的备份（只在校验/写入失败时才需要它）
try { execFileSync('cmd', ['/c', 'del', join(HERE, '.app.js.bak'), join(HERE, '.backend.js.bak')], { stdio: 'ignore' }) } catch {}

/* ---------------------------------------------------------- 构建 ---- */

if (doBuild) {
  step('打包 exe')

  // 先杀掉占用文件的进程，否则 UPX 会静默失败
  try {
    execFileSync('taskkill', ['/F', '/IM', 'EasyPaint.exe'], { stdio: 'ignore' })
    ok('已结束占用文件的 EasyPaint 进程')
    // 给系统一点时间释放句柄
    execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},1500)'], { stdio: 'ignore' })
  } catch {
    // 进程本来就没在跑，正常
  }

  execFileSync(process.execPath, [join(HERE, 'build.mjs')], { stdio: 'inherit' })
}

step('完成')
console.log('   同步链路：插件源 → app.js / backend.js' + (doBuild ? ' → dist/EasyPaint.exe' : ''))
console.log('   要让 exe 也更新，加上 --build；改了界面请刷新浏览器（bat 方式）\n')
