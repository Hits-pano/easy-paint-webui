/**
 * Easy Paint · 把 exe 改成「无控制台窗口」
 *
 * node.exe 是控制台程序（PE Subsystem = 3 / WINDOWS_CUI），SEA 打包后仍是。
 * 双击时 Windows 会为它创建一个控制台窗口。
 *
 * 这个脚本把 PE 头里的 Subsystem 改成 2（WINDOWS_GUI），双击就不再弹黑框。
 * 代价：console.log 没地方输出了（重定向到文件仍然可以）。
 *
 * 用法：
 *   node set-gui-subsystem.mjs dist\EasyPaint.exe
 */

import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('用法: node set-gui-subsystem.mjs <exe 路径>')
  process.exit(1)
}

const buf = readFileSync(file)

// DOS 头 0x3C 处是 PE 头的偏移
const peOff = buf.readInt32LE(0x3c)
if (buf.readUInt32LE(peOff) !== 0x00004550) {
  console.error('不是有效的 PE 文件（缺 PE 签名）')
  process.exit(1)
}

// PE 签名(4) + COFF 头(20) = Optional Header 起点
const optOff = peOff + 4 + 20
const magic = buf.readUInt16LE(optOff)
if (magic !== 0x10b && magic !== 0x20b) {
  console.error(`Optional Header magic 异常: 0x${magic.toString(16)}`)
  process.exit(1)
}

// PE32 和 PE32+ 的 Subsystem 都在 Optional Header + 68
const subOff = optOff + 68
const before = buf.readUInt16LE(subOff)

if (before === 2) {
  console.log('   已经是 GUI 子系统，无需修改')
  process.exit(0)
}

buf.writeUInt16LE(2, subOff)
writeFileSync(file, buf)

const after = readFileSync(file).readUInt16LE(subOff)
console.log(`   Subsystem: ${before} (CUI) → ${after} (GUI)`)
