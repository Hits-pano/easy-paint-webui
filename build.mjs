/**
 * Easy Paint · 打包脚本
 *
 * 把当前目录的程序打成单个 exe：
 *   1. 静态资源 base64 内嵌
 *   2. backend.js 的 ESM import 转成 require
 *   3. 合并成一份 CJS
 *   4. 用 node --experimental-sea-config 生成 blob
 *   5. 复制 node.exe 并注入 blob（postject api）
 *   6. 换图标（rcedit，可选）
 *   7. UPX 压缩（可选）
 *
 * 用法：
 *   node build.mjs                 完整构建
 *   node build.mjs --no-upx        不压缩
 *   node build.mjs --no-icon       不换图标
 *   node build.mjs --no-console    保留控制台窗口（调试用）
 *
 * 依赖（放在 build-tools/ 下）：
 *   build-tools/postject/          postject 的 package 目录
 *   build-tools/rcedit.exe         换图标（可选）
 *   build-tools/upx/upx.exe        UPX（可选）
 *   build-tools/EasyPaint.ico      图标
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TOOLS = join(HERE, 'build-tools')
const WORK = join(HERE, '.build')

const args = process.argv.slice(2)
const noUpx = args.includes('--no-upx')
const noIcon = args.includes('--no-icon')
const noConsole = args.includes('--no-console')

const step = (msg) => console.log(`\n>> ${msg}`)
const ok = (msg) => console.log(`   ${msg}`)

/* ------------------------------------------------------- 1. 静态资源 ---- */

step('内嵌静态资源')
const ASSET_FILES = {
  'index.html': join(HERE, 'index.html'),
  'app.js': join(HERE, 'app.js'),
  'vendor/react.production.min.js': join(HERE, 'vendor', 'react.production.min.js'),
  'vendor/react-dom.production.min.js': join(HERE, 'vendor', 'react-dom.production.min.js'),
}
let assetsSrc = '// ---- 内嵌静态资源 ----\nconst ASSETS = {\n'
for (const [name, file] of Object.entries(ASSET_FILES)) {
  if (!existsSync(file)) throw new Error(`缺少文件：${file}`)
  const b64 = readFileSync(file).toString('base64')
  assetsSrc += `  ${JSON.stringify(name)}: '${b64}',\n`
  ok(`${name}  ${(statSync(file).size / 1024).toFixed(1)} KB`)
}
assetsSrc += '}\n'

/* --------------------------------------------------------- 2. 后端 ---- */

step('转换 backend.js')
let backend = readFileSync(join(HERE, 'backend.js'), 'utf8')
// ESM import → CJS require
backend = backend
  .replace(/^import \{([^}]+)\} from 'node:child_process'/m, "const {$1} = require('node:child_process')")
  .replace(/^import \{([^}]+)\} from 'node:fs'/m, "const {$1} = require('node:fs')")
  .replace(/^import \{([^}]+)\} from 'node:fs\/promises'/m, "const {$1} = require('node:fs/promises')")
  .replace(/^import net from 'node:net'/m, "const net = require('node:net')")
  .replace(/^import \{([^}]+)\} from 'node:os'/m, "const {$1} = require('node:os')")
  .replace(/^import \{([^}]+)\} from 'node:path'/m, "const {$1} = require('node:path')")
  .replace(/^export function createApp/m, 'function createApp')
  .replace(/^import .*$/gm, '')
ok(`backend.js  ${(backend.length / 1024).toFixed(1)} KB`)

/* ------------------------------------------------------- 3. 主程序 ---- */

step('合并主程序')
const mainSrc = `#!/usr/bin/env node
/**
 * Easy Paint · 打包版（单文件）
 *
 * 由 build.mjs 生成。静态资源以 base64 内嵌，后端代码直接内联，
 * 运行时不依赖任何外部文件。
 */
'use strict'

const { createServer } = require('node:http')
const { spawn: spawnDetached } = require('node:child_process')

${assetsSrc}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}
const DECODED = {}

function assetFor(urlPath) {
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\\/+/, '')
  if (!Object.prototype.hasOwnProperty.call(ASSETS, rel)) return null
  if (!DECODED[rel]) DECODED[rel] = Buffer.from(ASSETS[rel], 'base64')
  const ext = rel.includes('.') ? '.' + rel.split('.').pop() : ''
  return { buf: DECODED[rel], type: MIME[ext] ?? 'application/octet-stream' }
}

${backend}

const PORT = Number(process.env.EASY_PAINT_PORT ?? 7860)
const HOST = '127.0.0.1'

function main() {
  const app = createApp({}, {})

  const server = createServer((req, res) => {
    const urlPath = (req.url || '/').split('?')[0]

    const handler = app.routes[urlPath]
    if (handler) {
      Promise.resolve(handler(req, res)).catch((error) => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        }
        res.end(JSON.stringify({ ok: false, error: String(error && error.message || error) }))
      })
      return
    }

    const asset = assetFor(urlPath)
    if (!asset) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('not found')
      return
    }
    res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache' })
    res.end(asset.buf)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(\`\\n  端口 \${PORT} 已被占用。\`)
      console.error('  换一个：set EASY_PAINT_PORT=7861\\n')
    } else {
      console.error('\\n  启动失败：', error)
    }
    process.exit(1)
  })

  server.listen(PORT, HOST, () => {
    const url = \`http://\${HOST}:\${PORT}/\`
    console.log('')
    console.log('  Easy Paint 已启动')
    console.log('  ' + url)
    console.log('  按 Ctrl+C 退出')
    console.log('')
    if (!process.argv.includes('--no-open')) {
      try {
        spawnDetached('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
      } catch { /* 打不开就算了 */ }
    }
  })

  const shutdown = () => {
    console.log('\\n  正在退出…')
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 1500)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()
`

if (existsSync(WORK)) rmSync(WORK, { recursive: true })
mkdirSync(WORK, { recursive: true })
const mainFile = join(WORK, 'main.js')
writeFileSync(mainFile, mainSrc, 'utf8')
ok(`main.js  ${(mainSrc.length / 1024).toFixed(1)} KB`)

/* -------------------------------------------------------- 4. SEA ---- */

step('生成 SEA blob')
const seaCfg = join(WORK, 'sea-config.json')
writeFileSync(seaCfg, JSON.stringify({
  main: mainFile,
  output: join(WORK, 'sea-prep.blob'),
  disableExperimentalSEAWarning: true,
  useSnapshot: false,
  useCodeCache: false,
}, null, 2), 'utf8')

execFileSync(process.execPath, ['--experimental-sea-config', seaCfg], { stdio: 'inherit' })
ok('blob 已生成')

/* ------------------------------------------------------ 5. 注入 ---- */

step('注入 blob 到 node.exe')
const nodeExe = process.execPath
const target = join(WORK, 'EasyPaint.exe')
copyFileSync(nodeExe, target)
ok(`基底 ${(statSync(target).size / 1024 / 1024).toFixed(1)} MB`)

const postjectApi = join(TOOLS, 'postject', 'dist', 'api.js')
if (!existsSync(postjectApi)) throw new Error(`缺少 postject：${postjectApi}`)
const { inject } = await import(`file:///${postjectApi.replace(/\\/g, '/')}`)
await inject(
  target,
  'NODE_SEA_BLOB',
  readFileSync(join(WORK, 'sea-prep.blob')),
  {
    sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    machoSegmentName: 'NODE_SEA',
  }
)
ok('注入完成')

/* -------------------------------------------------------- 6. 图标 ---- */

if (!noIcon) {
  step('替换图标')
  const setIcon = join(TOOLS, 'set-icon.ps1')
  const ico = join(TOOLS, 'EasyPaint.ico')
  if (existsSync(setIcon) && existsSync(ico)) {
    // 用 Windows 原生 API，不用 rcedit（对 89 MB 的 node.exe 会卡死）
    execFileSync('powershell', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass',
      '-File', setIcon, '-Exe', target, '-Ico', ico,
    ], { stdio: 'inherit' })
    ok('图标已替换')
  } else {
    ok(`跳过（缺 ${!existsSync(setIcon) ? 'set-icon.ps1' : 'EasyPaint.ico'}）`)
  }
}

/* -------------------------------------------------- 7. 去掉黑框 ---- */

if (!noConsole) {
  step('改为 GUI 子系统（双击不弹黑框）')
  const setGui = join(TOOLS, 'set-gui-subsystem.mjs')
  if (existsSync(setGui)) {
    execFileSync(process.execPath, [setGui, target], { stdio: 'inherit' })
    ok('已改为 GUI')
  } else {
    ok('跳过（缺 set-gui-subsystem.mjs）')
  }
}

/* --------------------------------------------------------- 8. UPX ---- */

if (!noUpx) {
  step('UPX 压缩')
  const upx = join(TOOLS, 'upx', 'upx.exe')
  if (existsSync(upx)) {
    const before = statSync(target).size
    execFileSync(upx, ['--best', '--lzma', target], { stdio: 'inherit' })
    const after = statSync(target).size
    ok(`${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`)
  } else {
    ok('跳过（缺 upx.exe）')
  }
}

/* -------------------------------------------------------- 输出 ---- */

step('完成')
// 成品放在源码目录的上一级：这里是与源码分开的构建产物目录，
// 双击上级的 EasyPaint.exe 就能用。exe 不入 git（见 .gitignore），
// GitHub 上通过 Release 附件分发。
const finalExe = join(HERE, '..', 'EasyPaint.exe')
copyFileSync(target, finalExe)
ok(`${finalExe}`)
ok(`${(statSync(finalExe).size / 1024 / 1024).toFixed(2)} MB`)

rmSync(WORK, { recursive: true })
ok('已清理中间文件')
