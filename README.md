# Easy Paint WebUI

<p align="center">
  <img src="./build-tools/EasyPaint.ico" width="96" alt="Easy Paint">
</p>

> 给 ComfyUI 用的简易出图界面。**双击即用，不需要安装任何东西。**

在浏览器里输提示词，出图存桌面。ComfyUI 没开时会自动帮你拉起来。

**[⬇ 下载 EasyPaint.exe](https://github.com/Hits-pano/easy-paint-webui/releases/latest)** · 22 MB · Windows

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![Size](https://img.shields.io/badge/size-22%20MB-green.svg)]()

---

## 这是什么

从 [dsh-easy-paint](https://github.com/Hits-pano/dsh-easy-paint) 插件改造而来。界面、工作流、模型扫描、ComfyUI 通信全部一样，只是换了个外壳：

| | [插件版](https://github.com/Hits-pano/dsh-easy-paint) | **独立版（本仓库）** |
|---|---|---|
| 需要 DSH | ✅ 需要 | ❌ 不需要 |
| 需要 Node.js | ✅ 需要 | ❌ 不需要 |
| 形态 | DSH 插件 | 单个 exe |
| 对话出图 | ✅ 说「画一只猫」就出图 | ❌ 只能在界面里输提示词 |
| 出图自检 | ✅ 视觉检查 | ❌ 没有 |
| 快速出图 / 工作流 / 模型扫描 / 自动启停 ComfyUI | ✅ | ✅ **完全一致** |

两边**各用各的配置**，装哪个都不影响另一个（插件版在 `~\.dsh\`，独立版在 `%APPDATA%`）。

## 为什么只有 22 MB

程序本身只有 **400 KB**，剩下 22 MB 是 Node.js 运行时（用 [SEA](https://nodejs.org/api/single-executable-applications.html) 打包进 exe）。

**没有打包浏览器内核** —— 用的是你系统自带的浏览器。真正的重活在 ComfyUI 那边，这个程序只是遥控器。

## 依赖

| 依赖 | 是否必需 |
|---|---|
| **ComfyUI** | ✅ 必需（已装好并能运行） |
| **浏览器** | ✅ 必需（Edge / Chrome / Firefox 都行） |
| ComfyUI 模型 | ✅ 至少一套 |
| Node.js | ❌ **不需要** |
| DSH | ❌ **不需要** |

---

## 快速开始

### 1. 确认 ComfyUI 能用

先手动启动一次，确认浏览器能打开 `http://127.0.0.1:8188`。

### 2. 双击 `EasyPaint.exe`

浏览器自动打开界面。**没有黑框，不需要装任何东西。**

首次打开会自动扫描常见位置找 ComfyUI（`C:\Software`、`D:\ComfyUI`、桌面、下载目录等），**找到就直接填好，你什么都不用做**。

找不到的话，点状态栏右边的「选择 ComfyUI 路径」，在目录树里点到 ComfyUI 安装目录（含 `main.py` 和 `comfy` 文件夹的那层），点「用这个目录」。

> 只需要配置一次，之后会记住。

### 3. 出图

展开「快速出图」，输入提示词，点「出图」。

- 出图期间状态胶囊显示进度（`Qwen 出图中 4/25`）
- 出完自动保存到桌面 `Easy Paint` 文件夹
- 缩略图左键打开所在文件夹并选中该文件
- 右上角 × 只关预览，不删文件

---

## ComfyUI 没启动怎么办

**会自动拉起。**

打开界面时如果 ComfyUI 离线，状态胶囊显示红色「ComfyUI 已离线」。点一下就会启动并等待就绪。也可以什么都不点 —— 直接出图时发现离线会自动启动。

> 「连不上时自动启动」开关在「基础设置」里，默认开启。

---

## 界面

### 状态栏

| 状态 | 含义 |
|---|---|
| 请选择 ComfyUI 路径 | 还没配置过，自动检测也没找到 |
| 请重新选择 ComfyUI 路径 | 配了，但那个目录里没有 ComfyUI |
| 已关联 ComfyUI，等待启动 | 路径对了，ComfyUI 没启动 |
| `v0.46.2 · http://127.0.0.1:8188` | 已启动，可以出图 |

### 六个折叠面板

| 面板 | 内容 |
|---|---|
| **快速出图** | 提示词 + 参考图 + 出图按钮 + 结果缩略图 |
| **基础设置** | 输出目录、自动启动、模型架构、画幅、自动重试、出图自检 |
| **SDXL 设置** | Checkpoint、5 个 LoRA 槽、采样参数、提示词 |
| **Qwen 设置** | 三件套模型、采样参数、提示词、参考图上限 |
| **Z-Image 设置** | 三件套模型、采样参数、提示词 |
| **外观** | 对话框状态胶囊开关 |

### 状态胶囊

| 状态 | 颜色 | 点击行为 |
|---|---|---|
| ComfyUI 已在线 | 绿 | 第一次点变「终止进程」，3 秒内再点才真停 |
| 出图中 N/M | 黄（带进度填充） | 同上 |
| ComfyUI 已离线 | 红 | 点一下启动 |
| ComfyUI 启动中 | 蓝 | 同上（可终止） |
| 自检中… | 紫 | — |
| 配置待优化 | 黄 | 跳转到要改的设置项 |

---

## 模型

程序**不会自动下载模型**。放进 ComfyUI 的 `models/` 目录，刷新模型列表就能看到。

<details>
<summary><b>Qwen-Image</b></summary>

| 类型 | 文件 | 放哪里 |
|---|---|---|
| 主模型 | `qwen_image_2.1_int8_convrot.safetensors` | `models/diffusion_models/` |
| 文本编码器 | `qwen3vl_8b_w4a8.safetensors` | `models/text_encoders/` |
| VAE | `qwen_image_2.1_vae_bf16.safetensors` | `models/vae/` |

</details>

<details>
<summary><b>SDXL</b></summary>

单文件 checkpoint，放 `models/checkpoints/`。写实推荐 Juggernaut XL，动漫推荐 Illustrious / NoobAI。

</details>

<details>
<summary><b>Z-Image-Turbo</b></summary>

| 类型 | 文件 | 放哪里 |
|---|---|---|
| diffusion | `z_image_turbo_int8_convrot.safetensors` | `models/diffusion_models/` |
| 文本编码器 | `qwen_3_4b_fp8_mixed.safetensors` | `models/text_encoders/` |
| VAE | `ae.safetensors` | `models/vae/` |

⚠️ Z-Image 的 diffusion 模型**不能**放 `checkpoints/`，它是纯 diffusion 权重。

</details>

---

## 配置文件

```
%APPDATA%\easy-paint\config.json
```

即 `C:\Users\你的用户名\AppData\Roaming\easy-paint\config.json`。

Windows 应用的标准配置位置，和 DSH 无关 —— **不需要装 DSH**，程序会自己创建这个目录。

> **从旧版本升级？** 早期版本把配置放在 `~\.dsh\easy-paint\`。新版本第一次启动会自动把
> `config.json` 和 `models-cache.json` 搬过来，你什么都不用做。

---

## 已知限制

| 限制 | 说明 |
|---|---|
| **没有视觉自检** | 需要 DSH 的 LLM 服务，独立版不可用 |
| **没有对话出图** | 只能在界面里输提示词 |
| **只监听本机** | `127.0.0.1`，外部设备访问不到 |
| **端口固定 7860** | 被占用时用 `set EASY_PAINT_PORT=7861` 换一个 |
| **Windows only** | 打包链用了 PE 修改和 UPX，只做了 Windows |
| **模型不会自动下载** | 见上方「模型」 |
| **配置和插件版不互通** | 各自独立：插件版 ~\\.dsh\\，独立版 %APPDATA% |

---

## 不想用 exe

exe 只是把「起一个本地 HTTP 服务 + 打开浏览器」打包了。你也可以自己起：

```bash
# 需要 Node.js 18+
npx serve . -l 7860
```

然后浏览器打开 `http://127.0.0.1:7860/`。功能一样，只是不会自动开浏览器、
也不会自动拉 ComfyUI（这两件事由 server 逻辑负责，打包版内置）。

要完整的本地版体验，直接重新打包：

```bash
node sync.mjs --build   # 需要 build-tools/ 完整
```

## 开发

### 目录结构

```
easy-paint-webui/
├─ EasyPaint.exe          成品（双击这个）
├─ app.js                 前端界面（sync 生成，别直接改）
├─ backend.js             后端逻辑（sync 生成，别直接改）
├─ index.html             页面壳
├─ vendor/                React 18 UMD
├─ sync.mjs               从插件源同步 app.js / backend.js
├─ build.mjs              打包成 exe
├─ build-tools/           打包工具（图标、UPX、postject、脚本）
└─ LICENSE
```

### 改了界面怎么更新 exe

界面和后端都是**从插件源转换**来的，不要直接改 `app.js` / `backend.js`：

```bash
node sync.mjs            # 只同步（改完刷新浏览器就能看）
node sync.mjs --build    # 同步 + 打包 exe
```

`sync.mjs` 会做 4 道校验（语法、关键符号、无残留、路由数），**校验不过不覆盖旧文件**。

### 打包链

```
node.exe (89.2 MB)
  → postject 注入 SEA blob
  → Win32 API 替换图标（6 尺寸）
  → PE Subsystem 3(CUI) → 2(GUI)，去掉黑框
  → UPX --best --lzma
  → 22.4 MB 单文件
```

---

## 常见问题

**Q：双击 exe 没反应？**

exe 是 GUI 程序，不弹控制台窗口。检查端口是否被占用：

```bat
set EASY_PAINT_PORT=7861
EasyPaint.exe
```

**Q：浏览器打开是白屏？**

按 F12 看控制台。常见原因：`vendor/` 下的 React 文件缺失，或 `app.js` 加载失败。

**Q：状态栏显示「请选择 ComfyUI 路径」，但 ComfyUI 明明装了？**

可能装在检测范围外。点「选择 ComfyUI 路径」手动指一次。检测覆盖 `C:\Software`、`C:\Software_Portable`、`C:\Program Files`、`D:\Software`、`D:\ComfyUI`、桌面、下载、文档，以及 `C:\`、`D:\` 三层的搜。

**Q：能不能给别人用？**

可以。把 `EasyPaint.exe` 单独复制过去就行 —— 它是单文件，不需要其他任何东西。对方需要装 ComfyUI 和有浏览器。

**Q：和插件版能同时用吗？**

能。共用同一份配置，互不干扰。

---

## 许可

[MIT](./LICENSE) · 和 [dsh-easy-paint](https://github.com/Hits-pano/dsh-easy-paint) 一致
