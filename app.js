/**
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


/** 前端没有 node:path，拼 Windows 路径用这个 */
function joinLike(dir, name) {
  const base = String(dir ?? '').replace(/[\\/]+$/u, '')
  return base === '' ? name : `${base}\\${name}`
}

const API_CONFIG = 'api/easy-paint/config'
const API_STATUS = 'api/easy-paint/status'
const API_MODELS = 'api/easy-paint/models'
const API_LAUNCH = 'api/easy-paint/launch'
const API_STOP = 'api/easy-paint/stop'
const API_VISION_MODELS = 'api/easy-paint/vision-models'
const API_DETECT = 'api/easy-paint/detect'
const API_BROWSE = 'api/easy-paint/browse'
const API_DRAW = 'api/easy-paint/draw'
const API_IMAGE = 'api/easy-paint/image'
const API_OPEN_OUTPUT = 'api/easy-paint/open-output'
const API_REVEAL = 'api/easy-paint/reveal'

const zh = {
  title: 'Easy Paint',
  lead: '通过本机 ComfyUI 出图，支持切换模型架构。',
  autoStart: '连不上时自动启动',
  autoStartHint: '出图前先探活；连不上就用下面的 python 把 ComfyUI 拉起来，再提交任务。',
  seatStarting: 'ComfyUI 启动中',
  archLabel: '模型架构',
  archHint: '决定用哪套 ComfyUI 工作流。换架构后要重新选模型，采样参数默认值也不同。',
  archQwen: 'Qwen-Image',
  archSdxl: 'SDXL',
  checkpoint: 'Checkpoint',
  checkpointHint: 'models/checkpoints 里的单文件模型',
  sdxlEditNote: 'SDXL 的图生图是标准重绘：只能「照着这张图再画一张」，不理解「把背景换成海边」这类指令。如果想要指令式编辑，请用 Qwen-Image 架构。',
  sdxlStepsHint: 'SDXL 通常 25–30 步。太少会糊，再多收益递减。',
  sdxlCfgHint: 'SDXL 通常 7–8。低于 5 出图会发灰、不跟提示词。',
  sdxlEditDenoiseHint: '0.6–0.75 保留原图结构；1.0 等于整图重画。',
  unet: '主模型',
  unetHint: 'models/diffusion_models 下的文件名。',
  clip: '文本编码器',
  clipHint: 'models/text_encoders 下的文件名。',
  vae: 'VAE',
  vaeHint: 'models/vae 下的文件名。',
  steps: '采样步数',
  stepsHintTurbo: 'turbo 模型推荐 8–12 步——步数再多速度白花，画面还可能过曝。',
  stepsHintNative: '原生模型推荐 20–30 步，25 是常用工作点。',
  stepsOutOfRange: '当前值超出推荐范围',
  paramCfgTooLowForNative: 'CFG 是 {v}。这个模型不是 turbo 蒸馏版，CFG 低于 {low} 时提示词几乎没有引导力——图生图会表现得像「不响应描述」。建议 {low}–{high}。',
  paramCfgTooHighForNative: 'CFG 是 {v}。这个模型不是 turbo 蒸馏版，CFG 高于 {high} 时引导过强，画面容易过曝、发闷、笔触僵硬。建议 {low}–{high}。',
  paramCfgTooHighForTurbo: 'CFG 是 {v}。turbo 蒸馏版按 CFG 1 训练，调高画面容易过曝。建议改回 1。',
  paramStepsOutOfRange: '采样步数是 {v}，当前模型推荐 {low}–{high} 步。',
  // SDXL
  sdxlCfgLow: 'CFG 是 {v}。SDXL 低于 7 时提示词引导偏弱，画面容易发灰。建议 7–8。',
  sdxlCfgHigh: 'CFG 是 {v}。SDXL 高于 8 容易出现高光溢出、画面发糊、笔触僵硬。建议 7–8。',
  sdxlStepsOutOfRange: '采样步数是 {v}，SDXL 推荐 {low}–{high} 步。太少会糊，再多收益递减。',
  // Z-Image
  zimageCfgHigh: 'CFG 是 {v}。Z-Image-Turbo 按 CFG 1 训练，调高容易过曝。建议改回 1。',
  zimageStepsOutOfRange: '采样步数是 {v}，Z-Image-Turbo 推荐 {low}–{high} 步（8 步是官方甜点）。',
  autoRetry: '自动重试次数',
  autoRetryHint: '不满意就自动多抽几张。0 = 每次只出 1 张；N = 一次出 1+N 张（不同随机种子）供你挑。越多越慢。',
  editDenoise: '图生图重绘强度',
  editDenoiseHint: '1.0 = 整图重画，能改颜色/换背景，但连续用同一张图迭代会逐轮累积过曝；0.6–0.8 = 保留原图，迭代稳定但只能微调（改不动整体色）。默认 1.0。',
  foldQuickDraw: '快速出图',
  foldQuickDrawHint: '不经过对话，直接在这里出图',
  quickPromptLabel: '提示词',
  quickPromptPlaceholder: '写要画的内容，Ctrl+Enter 直接出图',
  quickRefsLabel: '参考图路径（可选）',
  quickRefsPlaceholder: '每行一个本地图片的绝对路径，上限按显存自动判断',
  quickDrawBtn: '出图',
  quickDrawing: '出图中…',
  quickEmptyPrompt: '先写提示词再出图',
  quickResultTitle: '出好了',
  openOutputDir: '打开',
  connectComfy: '选择 ComfyUI 路径',
  pickerTitle: '选择 ComfyUI 安装目录',
  pickerRoot: '此电脑',
  pickerLoading: '读取中…',
  pickerEmpty: '这里是空的',
  pickerNoPick: '先在下面点一个目录',
  pickerUp: '上一级',
  pickerConfirm: '用这个目录',
  pickerCancel: '取消',
  pickerComfyTag: 'ComfyUI',
  pickerScanning: '正在查找 ComfyUI…',
  pickerProbeFound: '✓ 找到 ComfyUI，已填写路径并连接',
  pickerProbeMulti: '这里有 {n} 个 ComfyUI，点一个用',
  pickerProbeNone: '这个目录里没有找到 ComfyUI',
  pickerConnecting: '连接中…',
  pickerProbeHint: '点「用这个目录」才会写入并连接',
  comfyOnline: 'ComfyUI 在线',
  comfyLinked: '已关联 ComfyUI，等待启动',
  comfyInvalid: '请重新选择 ComfyUI 路径',
  comfyNeedPick: '请选择 ComfyUI 路径',
  quickThumbHint: '点击打开所在文件夹并选中这张图',
  quickRevealFailed: '打不开文件夹',
  quickClosePreview: '关闭预览',

  outputDirPlaceholder: '',
  quickFailed: '出图失败',
  foldQwen: 'Qwen 设置',
  foldQwenHint: 'Qwen-Image 分离式三件套（diffusion_models + text_encoders + vae）',
  qwenNote: '三件套和 Z-Image 不通用，别混用。',
  foldZImage: 'Z-Image 设置',
  foldZImageHint: 'Z-Image-Turbo 分离式三件套（diffusion_models + text_encoders + vae）',
  zimageNote: '三件套和 Qwen 不通用，别混用。',
  zimageRecHint: '放进对应目录后点上面的「刷新模型列表」即可识别。主模型有三个量化版本：int8（5.8 GB，已验证）、bf16（11.5 GB，画质最好但显存吃紧）、nvfp4（4.2 GB，需 RTX 50 系）——放进 diffusion_models 就会自动出现在下拉里。',
  zimagePositiveHint: '留空即可。Z-Image 不需要质量标签，用自然语言描述，它会推理；中英文文字渲染是强项。',
  zimageStepsHint: 'Z-Image-Turbo 推荐 6–12 步，8 步是官方甜点。',
  zimageCfgHint: 'Z-Image-Turbo 固定 1.0。调高会让负面词生效，但容易过曝。',
  zimageEditDenoiseHint: '0.6–0.75 保留原图结构；1.0 等于整图重画。官方 Z-Image-Edit 还没发布，这里是标准重绘。',
  archZimage: 'Z-Image',
  foldSdxl: 'SDXL 设置',
  foldSdxlHint: 'SDXL 单文件 checkpoint（models/checkpoints）',
  foldParams: '基础设置',
  foldParamsHint: '输出目录、架构、画幅、重试、出图自检',
  foldAppearance: '外观设置',
  foldAppearanceHint: '对话框状态按钮',
  showStatusSeat: '对话框显示 ComfyUI 状态',
  showStatusSeatHint: '关闭后输入框右侧不再显示状态胶囊；仍可用本页顶部控制条启动/终止 ComfyUI。改完需重启 DSH 生效。',
  maxRefImages: '参考图上限',
  maxRefImagesHint: '一次图生图最多用几张参考图。',
  maxRefImagesHintAuto: '硬件推荐 {n} 张（按 {vram} MB 显存自动推算）。',
  maxRefImagesOver: '⚠ 超出硬件能力上限：本机只能安全处理 {n} 张，填再多也会被压回 {n} 张；硬上更会撑爆显存卡死任务。',
  cfg: '提示词引导 CFG',
  cfgHint: '提示词引导强度。turbo 模型建议 1.0——实测 2.5 时连续图生图会逐轮过曝（3 轮纯白占比 0.18%→17.6%），1.0 下完全稳定且更快。',
  size: '默认画幅',
  positivePrompt: '默认正面提示词',
  positivePromptHint: '出图时拼在你的描述前面。留空则只用你自己的描述。',
  negativePrompt: '默认负面提示词',
  negativePromptHint: '出图时作为 negative 送进去，用来压制不想要的东西。',
  sdxlPositiveHint: 'SDXL 系模型常用 masterpiece, best quality 这类质量词。留空则只用你自己的描述。',
  sdxlNegativeHint: '出图时作为 negative 送进去，用来压制不想要的东西。',
  loraSlotEmpty: '（空）',
  loraLoaded: '已装载',
  loraIncompatible: '不兼容，LoRA 未生效',
  loraCross: '跨系 LoRA，效果可能不佳',
  loraCrossTitle: '这个 LoRA 是为 {lora} 训练的，当前 Checkpoint 属于 {cp}。能加载，但风格和细节会打折。',
  loraNoMeta: '文件里没写底模信息，无法判断兼容性',
  loraNoCkpt: '未选底模，兼容性未知',
  loraMissing: '文件已失效',
  loraMissingTitle: '配置里记的这个文件名在 models/loras 下已经找不到了（可能被改名或删除）。请重新选一个，或把它从槽位里清掉。',
  loraNoCkptTitle: '先在上面选一个 Checkpoint，才能判断这个 LoRA 是否同系',
  loraSd15Warn: '⚠ 这是 SD1.5 的 LoRA，SDXL 用不了',
  loraMismatchTitle: '这个 LoRA 是为 {lora} 训练的，当前 Checkpoint 属于 {cp}。混用效果会打折。',
  loraStrengthHint: '权重 0–2，0.8 常用',
  outputDir: '输出目录',
  outputDirHint: '图片存在 ComfyUI 的 output\\Easy Paint\\ 下，由 ComfyUI 直接保存，这里只读。',
    outputDirUnset: '还没选 ComfyUI 路径',
  gpu: '显卡',
  vram: '显存',
  hwUnknown: '未检测到（ComfyUI 运行后自动获取）',
  barTitle: 'ComfyUI 状态',
  selfCheckMode: '自检强度',
  selfCheckHint: '出图后自动检查画面，失败只提示、不丢图、也不会自动重画。开启「视觉」后会用所选模型看一次图，选云端 API 时每张图和重试都会各计一次费。',
  selfCheckOff: '不自检（直接出图）',
  selfCheckVision: '视觉自检（用模型看图，可能产生费用）',
  visionModel: '检查用模型',
  visionModelHint: '只列出 DSH 里声明支持图片输入的模型。选远程 API 模型时，每出一张图就是一次调用，开自动重试时按张数累加。',
  visionCostWarning: '⚠ 视觉自检会用下方所选模型真的看一次图。如果选的是云端 API 模型，每张图都会产生一次调用费用；开自动重试时按张数翻倍。用不按次计费的模型则不产生额外费用。',
  visionModelNone: '没有找到支持图片输入的模型（需在 DSH 的模型配置里声明 input: image）',
  visionModelLoading: '正在读取可用模型…',
  saved: '已保存',
  saveSettings: '保存设置',
  saving: '保存中…',
  unsavedCount: '{n} 项未保存',
  saveWhileBusy: '有出图进程正在运行，改动将在出图进程结束后生效',
  modelIncompatibleWarn: '这个模型看起来不属于当前架构，出图可能失败。仍可使用。',
  incompatibleCount: '{n} 个模型可能不兼容',
  saveConfirm: '确认保存',
  paramWarnCount: '{n} 个参数待优化',
  warnTagBad: '不兼容',
  warnTagWarn: '预警',
  incompatibleSummary: '{n} 个模型可能不属于当前架构，出图可能失败',
  noChanges: '没有需要保存的改动',
  resetDefault: '恢复默认',
  resetConfirm: '确定恢复',
  resetDone: '已恢复默认设置',
  saveFailed: '保存失败',
  loadFailed: '读取配置失败',
  loading: '正在读取配置…',
  modelFallback: '未能从 ComfyUI 取得模型列表，手动填写文件名。',
  modelNotPicked: '（未选择）',
  modelIncompatible: '不兼容',
  recTitle: '推荐模型',
  recColKind: '类型',
  recColFile: '文件',
  recColStatus: '状态',
  recInstalled: '已安装',
  recMissing: '未找到',
  recHint: '把对应文件放进上面目录后点「刷新模型列表」即可识别。插件不自动下载模型。',
  modelStale: 'ComfyUI 当前离线，下面是上次缓存的列表 —— 选好后照样会保存，出图时会自动启动。',
  reload: '刷新模型列表',
  reloading: '刷新中…',
  seatOnline: 'ComfyUI 已在线',
  seatBusy: '出图中',
  seatPreparing: '准备中',
  seatOffline: 'ComfyUI 已离线',
  seatUnknown: '检测中…',
  seatTitleStop: '点击终止 ComfyUI，释放显存和端口',
  seatTitleLaunch: '点击启动 ComfyUI（端口被占时会先清掉卡死的进程）',
  seatConfirmStop: '终止进程',
  seatTitleConfirm: '再点一次确认终止 ComfyUI',
  seatZombie: '端口被占用 · 点击释放',
  seatChecking: '自检中…',
  seatParamWarn: '配置待优化',
}
const en = {
  title: 'Easy Paint',
  lead: 'Generates images through a local ComfyUI instance, with switchable model architectures.',
  autoStart: 'Start it when unreachable',
  autoStartHint: 'Probes before drawing; starts ComfyUI with the python below when it is down.',
  seatStarting: 'ComfyUI starting',
  archLabel: 'Architecture',
  archHint: 'Decides which ComfyUI workflow is used. Switching architecture means re-picking models; sampling defaults differ too.',
  archQwen: 'Qwen-Image',
  archSdxl: 'SDXL',
  checkpoint: 'Checkpoint',
  checkpointHint: 'Single-file model in models/checkpoints',
  sdxlEditNote: 'SDXL image-to-image is plain repaint: it can only "paint another picture like this one", it does not understand instructions like "change the background to a beach". Use the Qwen-Image architecture for instruction-based editing.',
  sdxlStepsHint: 'SDXL usually wants 25–30 steps. Too few looks mushy; beyond that returns diminish.',
  sdxlCfgHint: 'SDXL usually 7–8. Below 5 the image goes flat and ignores the prompt.',
  sdxlEditDenoiseHint: '0.6–0.75 keeps the original structure; 1.0 repaints the whole image.',
  unet: 'Diffusion model',
  unetHint: 'File name under models/diffusion_models.',
  clip: 'Text encoder',
  clipHint: 'File name under models/text_encoders.',
  vae: 'VAE',
  vaeHint: 'File name under models/vae.',
  steps: 'Sampling steps',
  stepsHintTurbo: 'Turbo models work best at 8–12 steps; more only wastes time and can overexpose.',
  stepsHintNative: 'Native models: 20–30 steps, with 25 as the usual working point.',
  stepsOutOfRange: 'current value is outside the recommended range',
  paramCfgTooLowForNative: 'CFG is {v}. This model is not a distilled turbo variant; below CFG {low} the prompt has almost no guidance and image-to-image behaves as if it ignores your description. Suggested range: {low}-{high}.',
  paramCfgTooHighForNative: 'CFG is {v}. This model is not a distilled turbo variant; above CFG {high} the guidance becomes too strong and the image tends to blow out, look muddy or stiff. Suggested range: {low}-{high}.',
  paramCfgTooHighForTurbo: 'CFG is {v}. Distilled turbo models are trained at CFG 1; higher values tend to blow out the image. Suggested value: 1.',
  paramStepsOutOfRange: 'Steps is {v}; this model works best at {low}-{high}.',
  // SDXL
  sdxlCfgLow: 'CFG is {v}. Below 7 SDXL guidance is weak and the image tends to look flat. Suggested range: 7-8.',
  sdxlCfgHigh: 'CFG is {v}. Above 8 SDXL tends to clip highlights, blur and stiffen. Suggested range: 7-8.',
  sdxlStepsOutOfRange: 'Steps is {v}; SDXL works best at {low}-{high}.',
  // Z-Image
  zimageCfgHigh: 'CFG is {v}. Z-Image-Turbo is trained at CFG 1; higher values tend to blow out. Suggested: 1.',
  zimageStepsOutOfRange: 'Steps is {v}; Z-Image-Turbo works best at {low}-{high} (8 is the sweet spot).',
  autoRetry: 'Auto retries',
  autoRetryHint: 'Draw extra candidates automatically. 0 = one image; N = 1+N images with different seeds per call. More is slower.',
  editDenoise: 'Edit strength',
  editDenoiseHint: '1.0 repaints the whole image — changes color/background work, but chained edits accumulate overexposure. 0.6–0.8 keeps the source and stays stable but only allows subtle tweaks. Default 1.0.',
  foldQuickDraw: 'Quick draw',
  foldQuickDrawHint: 'Render right here, without going through the chat',
  quickPromptLabel: 'Prompt',
  quickPromptPlaceholder: 'Describe the image; Ctrl+Enter renders it',
  quickRefsLabel: 'Reference image paths (optional)',
  quickRefsPlaceholder: 'One absolute path per line; the cap follows your VRAM',
  quickDrawBtn: 'Render',
  quickDrawing: 'Rendering…',
  quickEmptyPrompt: 'Write a prompt first',
  quickResultTitle: 'Done',
  openOutputDir: 'Open',
  connectComfy: 'Choose ComfyUI folder',
  pickerTitle: 'Choose the ComfyUI folder',
  pickerRoot: 'This PC',
  pickerLoading: 'Reading…',
  pickerEmpty: 'Empty folder',
  pickerNoPick: 'Pick a folder below first',
  pickerUp: 'Up',
  pickerConfirm: 'Use this folder',
  pickerCancel: 'Cancel',
  pickerComfyTag: 'ComfyUI',
  pickerScanning: 'Looking for ComfyUI…',
  pickerProbeFound: '✓ ComfyUI found, path filled and connected',
  pickerProbeMulti: '{n} ComfyUI folders here, pick one',
  pickerProbeNone: 'No ComfyUI in this folder',
  pickerConnecting: 'Connecting…',
  pickerProbeHint: 'Press "Use this folder" to save and connect',
  pickerScanning: '正在查找 ComfyUI…',
  pickerProbeFound: '✓ 找到 ComfyUI，已填写路径并连接',
  pickerProbeMulti: '这里有 {n} 个 ComfyUI，点一个用',
  pickerProbeNone: '这个目录里没有找到 ComfyUI',
  pickerConnecting: '连接中…',
  pickerProbeHint: '点「用这个目录」才会写入并连接',
  comfyOnline: 'ComfyUI online',
  comfyLinked: 'ComfyUI linked, waiting to start',
  comfyInvalid: 'Choose the ComfyUI folder again',
  comfyNeedPick: 'Choose the ComfyUI folder',
  quickThumbHint: 'Click to open the folder and select this image',
  quickRevealFailed: 'Could not open the folder',
  quickClosePreview: 'Close preview',

  outputDirPlaceholder: '',
  quickFailed: 'Render failed',
  foldQwen: 'Qwen',
  foldQwenHint: 'Qwen-Image split files (diffusion_models + text_encoders + vae)',
  qwenNote: 'These files are not interchangeable with Z-Image.',
  foldZImage: 'Z-Image',
  foldZImageHint: 'Z-Image-Turbo split files (diffusion_models + text_encoders + vae)',
  zimageNote: 'These files are not interchangeable with Qwen.',
  zimageRecHint: 'Put the files in the folders above, then hit "Reload models". The main model comes in three quantizations: int8 (5.8 GB, verified), bf16 (11.5 GB, best quality but heavy), nvfp4 (4.2 GB, needs RTX 50 series) — drop one into diffusion_models and it shows up in the dropdown automatically.',
  zimagePositiveHint: 'Leave empty. Z-Image needs no quality tags; describe naturally and it reasons. Strong at rendering Chinese and English text.',
  zimageStepsHint: 'Z-Image-Turbo works best at 6-12 steps; 8 is the official sweet spot.',
  zimageCfgHint: 'Fixed at 1.0 for Z-Image-Turbo. Raising it makes negatives apply but tends to blow out highlights.',
  zimageEditDenoiseHint: '0.6-0.75 keeps the original structure; 1.0 repaints the whole image. Official Z-Image-Edit is not released yet, this is plain repaint.',
  archZimage: 'Z-Image',
  foldSdxl: 'SDXL',
  foldSdxlHint: 'SDXL single-file checkpoint (models/checkpoints)',
  foldParams: 'Basics',
  foldParamsHint: 'Output directory, architecture, size, retries, post-check',
  foldAppearance: 'Appearance',
  foldAppearanceHint: 'Composer status chip',
  showStatusSeat: 'Show status chip in composer',
  showStatusSeatHint: 'When off, the chip next to the composer is hidden; the control bar at the top of this page still starts/stops ComfyUI. Requires a DSH restart to take effect.',
  maxRefImages: 'Reference cap',
  maxRefImagesHint: 'Maximum reference images per img2img call.',
  maxRefImagesHintAuto: 'Hardware recommends {n} (auto from {vram} MB VRAM).',
  maxRefImagesOver: '⚠ Above hardware limit: only {n} can be handled safely; higher values are clamped to {n} and risk VRAM exhaustion.',
  cfg: 'Prompt guidance CFG',
  cfgHint: 'Prompt guidance. Use 1.0 with turbo models — at 2.5 repeated img2img drifts brighter (blown pixels 0.18%→17.6% over 3 rounds); 1.0 stays stable and is faster.',
  size: 'Default aspect',
  positivePrompt: 'Default positive prompt',
  positivePromptHint: 'Prepended to your description. Leave empty to use only your description.',
  negativePrompt: 'Default negative prompt',
  negativePromptHint: 'Sent as the negative prompt to suppress what you do not want.',
  sdxlPositiveHint: 'SDXL-family models often use quality words like masterpiece, best quality. Leave empty to use only your description.',
  sdxlNegativeHint: 'Sent as the negative prompt to suppress what you do not want.',
  loraSlotEmpty: '(empty)',
  loraLoaded: 'Loaded',
  loraIncompatible: 'Incompatible, LoRA not applied',
  loraCross: 'Cross-base LoRA, may look worse',
  loraCrossTitle: 'This LoRA was trained for {lora} but the Checkpoint is {cp}. It loads, but style and detail will degrade.',
  loraNoMeta: 'This file has no base-model metadata; compatibility unknown',
  loraNoCkpt: 'No checkpoint, compatibility unknown',
  loraMissing: 'File missing',
  loraMissingTitle: 'The file recorded in config no longer exists under models/loras (renamed or deleted). Pick another one or clear this slot.',
  loraNoCkptTitle: 'Pick a Checkpoint above first, then compatibility can be judged',
  loraSd15Warn: '⚠ SD1.5 LoRA, unusable on SDXL',
  loraMismatchTitle: 'This LoRA was trained for {lora}, but the current Checkpoint is {cp}. Mixing them weakens the effect.',
  loraStrengthHint: 'Weight 0-2, 0.8 is typical',
  outputDir: 'Output directory',
  outputDirHint: 'Images are saved by ComfyUI into output\\Easy Paint\\; this path is read-only.',
    outputDirUnset: 'ComfyUI path not set yet',
  gpu: 'GPU',
  vram: 'VRAM',
  hwUnknown: 'Not detected (available once ComfyUI runs)',
  barTitle: 'ComfyUI status',
  selfCheckMode: 'Check level',
  selfCheckHint: 'Inspects the image afterwards; a failed check only warns — the image is kept and nothing is redrawn automatically. Vision calls the selected model once per image; cloud APIs bill per call.',
  selfCheckOff: 'None (use the image directly)',
  selfCheckVision: 'Vision (model looks at it — may cost money)',
  visionModel: 'Check model',
  visionModelHint: 'Lists only models that declare image input in DSH. Remote API models are billed per call — one call per generated image, multiplied when auto-retry is on.',
  visionCostWarning: '⚠ Vision check really calls the selected model once per image. With a cloud API model this costs money every generation, multiplied by auto-retry count. Models that are not billed per call incur no extra cost.',
  visionModelNone: 'No image-capable model found (set input: image in the DSH model config)',
  visionModelLoading: 'Loading available models…',
  saved: 'Saved',
  saveSettings: 'Save settings',
  saving: 'Saving…',
  unsavedCount: '{n} unsaved',
  saveWhileBusy: 'A render is running; changes take effect after it finishes',
  modelIncompatibleWarn: 'This model does not look like it belongs to the current architecture; generation may fail. It is still selectable.',
  incompatibleCount: '{n} model(s) may be incompatible',
  saveConfirm: 'Confirm save',
  paramWarnCount: '{n} parameter(s) need tuning',
  warnTagBad: 'incompatible',
  warnTagWarn: 'warning',
  incompatibleSummary: '{n} model(s) may not belong to the current architecture; generation may fail',
  noChanges: 'Nothing to save',
  resetDefault: 'Reset to defaults',
  resetConfirm: 'Confirm reset',
  resetDone: 'Defaults restored',
  saveFailed: 'Save failed',
  loadFailed: 'Failed to read configuration',
  loading: 'Loading configuration…',
  modelFallback: 'Could not read the model list from ComfyUI; type the file name.',
  modelNotPicked: '(not selected)',
  modelIncompatible: 'incompatible',
  recTitle: 'Recommended models',
  recColKind: 'Kind',
  recColFile: 'File',
  recColStatus: 'Status',
  recInstalled: 'installed',
  recMissing: 'missing',
  recHint: 'Put the files in the folders shown, then hit "Refresh" above. The plugin does not download models.',
  modelStale: 'ComfyUI is offline; this list is cached. Your choice still saves, and drawing will start ComfyUI.',
  reload: 'Refresh models',
  reloading: 'Refreshing…',
  seatOnline: 'ComfyUI online',
  seatBusy: 'Drawing',
  seatPreparing: 'Preparing',
  seatOffline: 'ComfyUI offline',
  seatUnknown: 'Checking…',
  seatTitleStop: 'Click to stop ComfyUI and free VRAM and the port',
  seatTitleLaunch: 'Click to launch ComfyUI (a hung process holding the port is cleared first)',
  seatConfirmStop: 'Stop process',
  seatTitleConfirm: 'Click again to confirm stopping ComfyUI',
  seatZombie: 'Port taken · click to release',
  seatChecking: 'Checking…',
  seatParamWarn: 'Config needs tuning',
}

const STYLE = `
.qwd-root { max-width: 660px; padding: 2px 0 32px; }
/* 设置面板的选项列是滚动容器（DSH 的 .options，类名被 CSS Module 哈希过）。
   展开/收起折叠面板时内容高度变化 → 滚动条出现/消失 → 该列宽度抖动约 15px。
   这里只对「包含本插件设置页」的滚动容器预留滚动条槽位，消除跳动。 */
[class*="options"]:has(.qwd-root) { scrollbar-gutter: stable; }
/* 恢复默认：红框红字；长按时红色从左侧慢慢填满 */
.qwd-reset-btn {
  height: 30px; padding: 0 16px; border-radius: 7px;
  /* 和「保存设置」同宽：「恢复默认」和「确定恢复」都是 4 字，切换时不会跳 */
  min-width: 96px; text-align: center;
  border: 1.5px solid rgba(224, 90, 80, .65);
  color: #e05a50;
  font-size: 12px; cursor: pointer;
  background: transparent;
  transition: background .25s ease, border-color .25s ease, color .25s ease;
}
.qwd-reset-btn:hover:not(:disabled) { background-color: rgba(224, 90, 80, .1); }
.qwd-reset-btn:disabled { opacity: .45; cursor: default; }
/* 待确认态：半透明暗红填充 + 亮红边框，提示「再点一次」 */
.qwd-reset-armed {
  background: rgba(176, 82, 74, .45) !important;
  border-color: rgba(224, 90, 80, .95);
  color: #ffb8ad;
  font-weight: 500;
}
.qwd-reset-armed:hover:not(:disabled) { border-color: #f5867c; }

/* LoRA 编辑区 */
/* LoRA 行：标题+内联说明在左，下拉+权重在右，整行不折 */
.qwd-lora-line { gap: 12px; flex-wrap: nowrap; }
.qwd-lora-label {
  display: flex; align-items: baseline; gap: 6px;
  min-width: 0; white-space: nowrap;
}
.qwd-lora-name {
  font-size: 13px; color: var(--dsw-alias-text-primary, #ededed);
  transition: color .15s;
}
.qwd-lora-note {
  font-size: 11px; color: var(--dsw-alias-text-secondary, #8b8f96);
}
/* 标题颜色完全由 tone 决定（见下方 .qwd-lora-tone-*），这里不再单独染色 */
/* 状态文字：默认灰（留空不使用）/ 蓝（已装载）/ 红（不兼容） */
/* 标题和状态文字共用同一套色调，保证一致 */
.qwd-lora-tone-ok { color: var(--dsw-alias-accent-primary, #6ba4ff); }
.qwd-lora-tone-idle { color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-lora-tone-warn { color: #e0b054; }
.qwd-lora-tone-bad { color: #e05a50; }
.qwd-lora-note-ok { color: var(--dsw-alias-accent-primary, #6ba4ff); font-weight: 500; }
.qwd-lora-note-warn { color: #e0b054; font-weight: 500; }
.qwd-lora-note-bad { color: #e05a50; font-weight: 500; }
.qwd-lora-controls {
  display: flex; align-items: center; gap: 8px;
  flex: 0 0 auto;
}
.qwd-input.qwd-lora-select { width: 200px; font-size: 12px; }
.qwd-input.qwd-lora-strength {
  width: 54px; flex: none;
  padding: 6px 2px 6px 6px;
  font-size: 12px; text-align: center;
}
/* 数字输入框的上下箭头压窄一点，别把 54px 吃掉 */
.qwd-lora-strength::-webkit-inner-spin-button,
.qwd-lora-strength::-webkit-outer-spin-button { margin-left: 1px; }

/* 有未保存改动的折叠面板：外边框变蓝 */
.qwd-fold-dirty {
  border-color: rgba(107, 164, 255, .55) !important;
  box-shadow: 0 0 0 1px rgba(107, 164, 255, .18);
}
.qwd-fold-dirty > .qwd-fold-head .qwd-fold-title {
  color: var(--dsw-alias-accent-primary, #6ba4ff);
}

/* 底部保存条 */
/* 本机参数：只读检测结果，固定在设置页最后 */
.qwd-machine {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
  margin: 18px 0 14px; padding-top: 6px;
  border-top: 1px dashed rgba(128, 128, 128, .2);
  font-size: 11px; line-height: 1.5;
}
.qwd-machine-k { color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-machine-v { color: var(--dsw-alias-text-primary, #ededed); }
.qwd-machine-sep { color: rgba(128, 128, 128, .4); }

/* 弹层渐显渐隐：遮罩淡入 + 卡片轻微上浮，关闭时反向播一遍再卸载 */
@keyframes qwd-picker-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes qwd-picker-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes qwd-picker-box-in {
  from { opacity: 0; transform: translateY(8px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes qwd-picker-box-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(6px) scale(.99); }
}
.qwd-picker-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, .45);
  animation: qwd-picker-in .16s ease-out both;
}
.qwd-picker-mask.qwd-picker-out { animation: qwd-picker-out .16s ease-in both; }
.qwd-picker {
  display: flex;
  flex-direction: column;
  width: 520px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  border-radius: 10px;
  background: var(--dsw-alias-bg-elevated, #2b2b2b);
  border: 1px solid rgba(128, 128, 128, .24);
  box-shadow: 0 8px 32px rgba(0, 0, 0, .4);
  overflow: hidden;
  animation: qwd-picker-box-in .18s cubic-bezier(.22, .61, .36, 1) both;
}
.qwd-picker-out .qwd-picker { animation: qwd-picker-box-out .16s ease-in both; }
@media (prefers-reduced-motion: reduce) {
  .qwd-picker-mask,
  .qwd-picker-mask.qwd-picker-out,
  .qwd-picker,
  .qwd-picker-out .qwd-picker { animation-duration: .01ms; }
}
.qwd-picker-head {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(128, 128, 128, .14);
}
.qwd-picker-title { flex: 1; font-size: 14px; font-weight: 600; }
.qwd-picker-close {
  width: 22px; height: 22px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; border: 1px solid transparent;
  background: transparent; color: #8b8f96;
  font: inherit; font-size: 15px; line-height: 1; cursor: pointer;
  transition: background .2s ease, color .15s ease, border-color .15s ease;
}
.qwd-picker-close:hover:not(:disabled) { background: rgba(128, 128, 128, .18); border-color: rgba(128, 128, 128, .35); color: #e6e6e6; }
.qwd-picker-crumbs {
  display: flex; flex-wrap: wrap; gap: 2px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(128, 128, 128, .1);
}
.qwd-crumb {
  padding: 3px 7px;
  border-radius: 4px; border: 1px solid transparent;
  background: transparent; color: #8b8f96;
  font: inherit; font-size: 12px; cursor: pointer;
  transition: background .18s ease, color .15s ease;
}
.qwd-crumb:hover { background: rgba(128, 128, 128, .12); color: #e6e6e6; }
.qwd-crumb + .qwd-crumb::before { content: '› '; color: #5c6169; }
.qwd-picker-list {
  flex: 1;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  padding: 6px;
}
/* 切换目录时保留旧列表，只叠一层淡遮罩，避免闪 */
.qwd-picker-loading {
  opacity: .45;
  pointer-events: none;
  transition: opacity .12s ease;
}
.qwd-picker-empty {
  padding: 28px 12px;
  text-align: center;
  font-size: 12px;
  color: #8b8f96;
}
.qwd-picker-err { color: #e0867c; }
.qwd-dir-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.qwd-dir-row:hover { background: rgba(128, 128, 128, .1); }
.qwd-dir-selected {
  border-color: rgba(107, 164, 255, .7);
  background: rgba(107, 164, 255, .14);
}
.qwd-dir-icon { flex: none; width: 14px; color: #8b8f96; font-size: 11px; }
.qwd-dir-comfy .qwd-dir-icon { color: #4ea36b; }
.qwd-dir-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qwd-dir-comfy .qwd-dir-name { color: #4ea36b; font-weight: 500; }
.qwd-dir-tag {
  flex: none;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(78, 163, 107, .5);
  color: #4ea36b;
  font-size: 10.5px;
}
.qwd-picker-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(128, 128, 128, .14);
}
.qwd-picker-sel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11.5px;
  color: #8b8f96;
}
/* 目录树底部两个按钮（上一级 / 用这个目录）的公共尺寸，靠 min-width 保持等宽 */
/* 选中目录后的自动探测结果 */
.qwd-probe {
  padding: 7px 14px;
  border-top: 1px solid rgba(128, 128, 128, .1);
  font-size: 11.5px;
  color: #8b8f96;
}
.qwd-probe-ok { color: #4ea36b; }
.qwd-probe-none { color: #e0b054; }
.qwd-probe-list {
  display: flex; flex-direction: column; gap: 2px;
  padding: 4px 10px 8px;
  border-top: 1px solid rgba(128, 128, 128, .1);
}
.qwd-probe-item {
  padding: 6px 8px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: #4ea36b;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background .15s ease, border-color .15s ease;
}
.qwd-probe-item:hover { background: rgba(78, 163, 107, .12); }
.qwd-probe-item-on {
  background: rgba(78, 163, 107, .14);
  border-color: rgba(78, 163, 107, .5);
}
.qwd-confirm-btn {
  box-sizing: border-box;
  min-width: 88px;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1.5px solid rgba(128, 128, 128, .3);
  background: transparent;
  color: #a8adb8;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: background .2s ease, color .15s ease, border-color .15s ease;
}
.qwd-confirm-btn:hover:not(:disabled) { background: rgba(128, 128, 128, .12); border-color: rgba(128, 128, 128, .55); color: #e6e6e6; }
.qwd-confirm-btn:active:not(:disabled) { background: rgba(128, 128, 128, .2); }
.qwd-confirm-btn:disabled { opacity: .45; cursor: default; }
.qwd-confirm-accent {
  border-color: rgba(107, 164, 255, .75);
  background: rgba(107, 164, 255, .16);
  color: #6ba4ff;
}
.qwd-confirm-accent:hover:not(:disabled) {
  border-color: rgba(107, 164, 255, .95);
  background: rgba(107, 164, 255, .26);
  color: #8bbcff;
}
/* 快速出图：提示词 + 参考图 + 出图按钮 + 结果缩略图（本面板不显示进度） */
.qwd-quick { display: flex; flex-direction: column; gap: 10px; }
.qwd-quick-prompt,
.qwd-quick-refs {
  width: 100%;
  box-sizing: border-box;
  /* 标签和输入框直接相邻，没有 .qwd-field 的 gap 撑开，靠这里留出间距 */
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 7px;
  border: 1px solid rgba(128, 128, 128, .22);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}
.qwd-quick-prompt:focus,
.qwd-quick-refs:focus {
  outline: none;
  border-color: var(--dsw-alias-accent-primary, #6ba4ff);
}
.qwd-quick-prompt:disabled,
.qwd-quick-refs:disabled { opacity: .6; }
.qwd-quick-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.qwd-quick-btn { min-width: 96px; flex: none; }
.qwd-quick-error { font-size: 12px; line-height: 1.5; color: #e0867c; }
.qwd-quick-result { display: flex; gap: 14px; align-items: flex-start; }
/* 缩略图容器：给右上角的叉号当定位基准 */
.qwd-quick-thumb-wrap {
  position: relative;
  flex: none;
  width: 120px;
  height: 120px;
}
.qwd-quick-thumb {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 7px;
  border: 1px solid rgba(128, 128, 128, .2);
  background: rgba(128, 128, 128, .06);
  cursor: pointer;
  transition: border-color .15s ease, filter .15s ease;
}
.qwd-quick-thumb:hover { border-color: rgba(107, 164, 255, .75); filter: brightness(1.08); }
/* 手动关掉预览的小叉号：方形，点一下只清界面，不动文件 */
.qwd-quick-close {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, .35);
  background: var(--dsw-alias-bg-elevated, #2b2b2b);
  color: #a8adb8;
  font: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}
.qwd-quick-close:hover {
  border-color: rgba(207, 106, 95, .7);
  background: rgba(207, 106, 95, .16);
  color: #e07b6f;
}
.qwd-quick-meta { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.qwd-quick-done { font-size: 13px; font-weight: 500; color: #4ea36b; }
.qwd-quick-path {
  font-size: 11px;
  color: #8b8f96;
  word-break: break-all;
}
.qwd-savebar {
  display: flex; align-items: center; gap: 10px;
  /* 底部操作区和上面的设置项拉开距离，一眼能看出是两个层次。
 上面各折叠面板之间有 10px，这里给到 24px，视觉上明显分开。 */
  margin: 24px 0 10px;
}
.qwd-save-btn {
  height: 30px; padding: 0 16px; border-radius: 7px;
  /* 固定最小宽度：文字在「保存设置」和「确认保存？」之间切换时长度不变 */
  min-width: 96px; text-align: center;
  border: 1.5px solid rgba(237, 237, 237, .55);
  background: transparent;
  color: var(--dsw-alias-text-primary, #ededed);
  font-size: 12px; cursor: pointer;
  transition: background .25s ease, border-color .25s ease, color .25s ease;
}
.qwd-save-btn:hover:not(:disabled) { background: rgba(237, 237, 237, .12); border-color: rgba(237, 237, 237, .8); }
.qwd-save-btn:disabled { opacity: .55; cursor: default; }
/* 有未保存改动时高亮，提示用户点它 */
.qwd-save-dirty {
  border-color: var(--dsw-alias-accent-primary, #6ba4ff);
  color: var(--dsw-alias-accent-primary, #6ba4ff);
  background: rgba(107, 164, 255, .1);
}
/* 有预警（参数偏离或模型不兼容）时保存按钮转黄，点击会先确认一次 */
.qwd-save-warn,
.qwd-save-warn.qwd-save-dirty {
  border-color: rgba(224, 176, 84, .7);
  color: #e0b054;
  background: rgba(224, 176, 84, .1);
}
/* 待确认态：整块填充，颜色沿用按钮自己的蓝色主调（就是「有改动」时那个蓝），
   而不是突兀地跳到黄色——保存不是危险操作，不该用危险色。
   用 color-mix 把主色调压深一档再铺满，白字在上面才有足够对比度。
   放在 warn / dirty 后面并用更长的选择器，确保盖掉它们的浅色底。 */
.qwd-save-armed,
.qwd-save-armed.qwd-save-warn,
.qwd-save-armed.qwd-save-dirty {
  /* 同上：半透明主色填充，边框用完全不透明的主色，边框比填充亮 */
  border-color: var(--dsw-alias-accent-primary, #6ba4ff);
  background: color-mix(in srgb, var(--dsw-alias-accent-primary, #6ba4ff) 48%, transparent);
  /* 文字用主色的亮版，不是纯白 */
  color: color-mix(in srgb, var(--dsw-alias-accent-primary, #6ba4ff) 55%, #ffffff);
  font-weight: 500;
}
.qwd-save-armed:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-accent-primary, #6ba4ff) 60%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-accent-primary, #6ba4ff) 62%, #ffffff);
}
/* 最下方的预警清单：全部用黄色，不再区分严重程度 */
.qwd-warn-list {
  display: flex; flex-direction: column; gap: 5px;
  margin: 10px 0 4px; padding: 10px 12px;
  border-radius: 8px;
  background: rgba(128, 128, 128, .06);
  border: 1px solid rgba(128, 128, 128, .14);
}
.qwd-warn-row {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12px; line-height: 1.6;
  color: #e0b054;
}
.qwd-warn-tag {
  flex: none;
  padding: 0 6px; border-radius: 4px;
  font-size: 11px; line-height: 17px;
  border: 1px solid currentColor;
  opacity: .85;
}
.qwd-save-hint { font-size: 11px; color: var(--dsw-alias-text-secondary, #8b8f96); }
/* 出图进行中保存的提示：和参数预警同色，一眼能看到 */
.qwd-save-hint-busy { color: #e0b054; }
.qwd-save-hint-warn { color: #e0b054; }

.qwd-lead { margin: 0 0 20px; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-conn {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  /* 间距和下面各设置项之间保持一致（.qwd-fold 也是 10px），整列节奏统一 */
  margin: 0 0 10px; padding: 12px 14px; border-radius: 9px;
  background: rgba(128, 128, 128, .09);
  border: 1px solid rgba(128, 128, 128, .18);
}
/* 控制条：左状态灯 + 文字 + 右侧按钮 */
.qwd-bar {
  display: flex; align-items: center; gap: 10px; width: 100%;
}
/* 标题和版本地址上下堆叠，左边不再拆成两列 */
.qwd-bar-info {
  /* gap 和下面设置项副标题的 margin-top: 2px 对齐，两栏总高度才会一样 */
  display: flex; flex-direction: column; gap: 2px;
  min-width: 0; flex: 1 1 auto;
}
.qwd-bar-title {
  /* 和设置项标题（.qwd-fold-title）保持同一套字号和字重 */
  font-size: 14px; font-weight: 600;
  color: var(--dsw-alias-text-primary, #ededed);
}
.qwd-bar-meta {
  /* 和 .qwd-fold-sub 同字号，两栏行高一致 */
  font-size: 12px; color: var(--dsw-alias-text-secondary, #8b8f96);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* 胶囊推到最右，宽度不参与 meta 的伸缩 */
.qwd-bar-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; flex: none; }
.qwd-bar > .qwd-seat { flex: none; }
/* ComfyUI 状态：颜色/字号/截断全部复用 .qwd-hint + .qwd-hint-one-line，
   这里只补一个收缩规则，长地址不会把按钮挤出去 */
.qwd-bar-comfy { min-width: 0; flex: 1 1 auto; }
/* 【选择 ComfyUI 路径】按钮 */
.qwd-bar-connect {
  /* 高度写死 26px，和右边的状态胶囊完全等高 */
  box-sizing: border-box;
  height: 26px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  border-radius: 7px;
  border: 1.5px solid rgba(128, 128, 128, .3);
  background: transparent;
  color: #a8adb8;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background .2s ease, color .15s ease, border-color .15s ease;
}
/* 悬停：底色淡蓝填充 + 边框文字转主色。
   和「保存设置」按钮、状态胶囊是同一种手感——填充只加一点，不抢眼。 */
.qwd-bar-connect:hover:not(:disabled) {
  background: rgba(107, 164, 255, .14);
  border-color: rgba(107, 164, 255, .9);
  color: #8bbcff;
}
.qwd-bar-connect:active:not(:disabled) {
  background: rgba(107, 164, 255, .22);
}
.qwd-bar-connect:disabled { opacity: .5; cursor: default; }
/* 与状态座同一条呼吸动画；设置页的样式表是独立的，必须自己再声明一次 */
@keyframes qwd-seat-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.qwd-group { margin: 0 0 26px; }
.qwd-group-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin: 0 0 8px;
}
.qwd-mini {
  padding: 3px 9px; font: inherit; font-size: 11px; cursor: pointer;
  color: var(--dsw-alias-text-secondary, #8b8f96);
  background: transparent; border: 1.5px solid rgba(128, 128, 128, .28); border-radius: 5px;
  transition: background .2s ease, color .15s ease, border-color .15s ease;
}
.qwd-mini:hover:not(:disabled) { background: rgba(128, 128, 128, .14); color: var(--dsw-alias-text-primary, #ededed); border-color: var(--dsw-alias-accent, #4a7bd0); }
.qwd-mini:active:not(:disabled) { background: rgba(128, 128, 128, .22); }
.qwd-mini:disabled { opacity: .45; cursor: default; }
.qwd-field {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 10px 0; border-bottom: 1px solid rgba(128, 128, 128, .12);
}
.qwd-field:last-child { border-bottom: none; }
/* 输入行 + 提示行组成一个字段组：分隔线画在 .qwd-field-column 上，
   内部 .qwd-field 不再画线，避免提示行出现在两条线之间。 */
.qwd-field-column {
  display: flex; flex-direction: column;
  border-bottom: 1px solid rgba(128, 128, 128, .12);
}
.qwd-field-column:last-child { border-bottom: none; }
.qwd-field-column > .qwd-field { border-bottom: none; }
.qwd-field-column > .qwd-field-note {
  margin: -8px 0 6px; padding-right: 8px;
  font-size: 12px; line-height: 1.55;
}
.qwd-field-note-warn { color: #e0b054; }
/* 可折叠分组（手风琴） */
.qwd-fold {
  margin: 0 0 10px; border-radius: 10px; overflow: hidden;
  background: rgba(128, 128, 128, .06);
  border: 1px solid rgba(128, 128, 128, .16);
}
.qwd-fold-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; cursor: pointer; user-select: none;
}
.qwd-fold-head:hover { background: rgba(128, 128, 128, .07); }
.qwd-fold-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-text-primary, #ededed); }
.qwd-fold-sub { margin-top: 2px; font-size: 12px; color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-fold-arrow {
  flex: none; font-size: 16px; line-height: 1;
  color: var(--dsw-alias-text-primary, #ededed);
  opacity: .8;
  transition: transform 160ms cubic-bezier(.22, 1, .36, 1);
}
.qwd-fold-open .qwd-fold-arrow { transform: rotate(90deg); }
/* 折叠体：grid-template-rows 0fr→1fr 动画高度，不需要估算内容高度。
   三层结构：body 做 grid 行、clip 负责 overflow 裁剪、pad 才带 padding。
   padding 若放在被压缩那一层，收起到 0fr 时仍会撑出它的高度，
   所以必须再往里放一层。 */
.qwd-fold-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 240ms cubic-bezier(.22, 1, .36, 1);
}
.qwd-fold-open .qwd-fold-body { grid-template-rows: 1fr; }
.qwd-fold-body-clip { overflow: hidden; min-height: 0; }
.qwd-fold-body-pad {
  padding: 12px 14px 10px;
  /* 用 inset 阴影代替 border-top：border 会占 1px 布局高度，
 压到 0fr 时仍会露出一小条；阴影不参与布局。 */
  box-shadow: inset 0 1px 0 rgba(128, 128, 128, .12);
}
.qwd-fold-body .qwd-group { border-bottom: none; }
/* 折叠面板头部和「可复制模型名」都是 div 模拟的按钮。
   不定义 :focus-visible 时，按 Shift 进入键盘导航模式会套浏览器默认的黑色焦点框，
   和整体配色冲突。这里统一成和输入框一致的蓝色描边。
   用 outline-offset 负值让描边画在元素内侧，不会撑破圆角。 */
.qwd-fold-head:focus-visible {
  outline: 2px solid var(--dsw-alias-accent, #4a7bd0);
  outline-offset: -2px;
  border-radius: 8px;
}
/* 鼠标点击不要出现焦点框，只有键盘导航才显示 */
.qwd-fold-head:focus:not(:focus-visible) { outline: none; }

.qwd-field-text { min-width: 0; flex: 1 1 auto; }
.qwd-label { font-size: 14px; line-height: 1.45; color: var(--dsw-alias-text-primary, #ededed); }
.qwd-hint { margin-top: 3px; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-text-secondary, #8b8f96); }
/* 模型选择那一行的说明：空间不够就省略，不折成两行 */
.qwd-hint-one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.qwd-input {
  flex: 0 0 auto; width: 260px; box-sizing: border-box;
  padding: 6px 9px; font: inherit; font-size: 13px; line-height: 1.4;
  color: var(--dsw-alias-text-primary, #ededed);
  background: rgba(128, 128, 128, .10);
  border: 1px solid rgba(128, 128, 128, .28); border-radius: 6px;
}
.qwd-input:focus { outline: 2px solid var(--dsw-alias-accent, #4a7bd0); outline-offset: 1px; border-color: transparent; }
.qwd-input:disabled { opacity: .55; cursor: not-allowed; }
/* 超出硬件能力上限时的红框 */
.qwd-input-invalid { border-color: #cf6a5f; background: rgba(207, 106, 95, .08); }
.qwd-input-invalid:focus { outline-color: #cf6a5f; }
.qwd-input-narrow { width: 100px; }
/* 下拉展开后的选项由浏览器绘制，不继承主题色；深色主题下会变成浅字浅底看不见，
   所以给选项固定一套深字浅底。 */
.qwd-input option { color: #1b1d21; background: #f4f5f7; }
/* 下拉框：浏览器原生箭头贴着右边画，位置改不了，所以关掉原生外观、自绘一个，
   这样箭头与右边界、文字与箭头之间的间距都能控制。 */
.qwd-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 30px;   /* 给自绘箭头留出位置 */
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1.2l4 3.6 4-3.6' stroke='%238b8f96' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 10px 6px;
}
/* 下拉框禁用时箭头也淡化 */
.qwd-select:disabled { opacity: .55; }
.qwd-select-wide { width: 260px; }
/* 视觉自检的费用警示 */
.qwd-cost-warn {
  margin: 2px 0 10px; padding: 8px 10px;
  font-size: 12px; line-height: 1.6;
  color: #e0b054;
  background: rgba(224, 176, 84, .1);
  border: 1px solid rgba(224, 176, 84, .3);
  border-radius: 7px;
}
/* 推荐模型清单 */
.qwd-recommend {
  margin-top: 12px; padding: 10px 12px;
  border-radius: 8px;
  background: rgba(128, 128, 128, .06);
  border: 1px solid rgba(128, 128, 128, .16);
}
.qwd-recommend-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  font-size: 12px; color: var(--dsw-alias-text-secondary, #8b8f96); margin-bottom: 8px;
}
/* 推荐模型表格：真表格，列宽全局共享，竖线才对得齐 */
.qwd-recommend-table {
  width: 100%;
  table-layout: fixed;
  /* 外框：和内部网格线同色，形成一个完整的框。
 用 separate + spacing 0 而不是 collapse——collapse 下圆角不生效。 */
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(128, 128, 128, .16);
  border-radius: 6px;
  overflow: hidden;
  font-size: 11px;
}
.qwd-recommend-table th,
.qwd-recommend-table td {
  padding: 4px 8px;
  text-align: left;
  vertical-align: middle;
  line-height: 1.5;
  border-right: 1px solid rgba(128, 128, 128, .16);
}
/* 有外框了，第一列和最后一列也要留出内边距，不然文字贴着框线 */
.qwd-recommend-table th:last-child,
.qwd-recommend-table td:last-child { border-right: none; }
.qwd-recommend-table th {
  font-weight: 400;
  font-size: 11px;
  color: var(--dsw-alias-text-secondary, #8b8f96);
  border-bottom: 1px solid rgba(128, 128, 128, .16);
}
/* 行与行之间都有横线，和三条竖线一起构成完整网格 */
.qwd-recommend-table tbody td {
  border-bottom: 1px solid rgba(128, 128, 128, .16);
}
.qwd-recommend-table tbody tr:last-child td { padding-bottom: 7px; }
/* 类型列按最长的「文本编码器」定宽，状态列固定，中间吃满剩余 */
.qwd-recommend-table th:nth-child(1),
.qwd-recommend-table td:nth-child(1) { width: 100px; }
.qwd-recommend-table th:nth-child(3),
.qwd-recommend-table td:nth-child(3) { width: 62px; }
/* 类型/模型名列：允许换行，SDXL 那种长模型名（Pony Diffusion V6 XL）才不会撑破单元格 */
.qwd-recommend-kind {
  white-space: normal;
  word-break: break-word;
  color: var(--dsw-alias-text-primary, #ededed);
}
.qwd-recommend-file {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}
.qwd-recommend-tag {
  display: inline-block;
  white-space: nowrap;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
}
.qwd-tag-ok { color: #7fbf7f; background: rgba(127, 191, 127, .14); }
.qwd-tag-miss { color: #e0867c; background: rgba(224, 134, 124, .14); }
/* 输入框内嵌按钮（安装位置那行）：按钮绝对定位贴在输入框右端 */
.qwd-input-embedded { position: relative; width: 260px; flex: none; }
.qwd-input-embedded .qwd-input { width: 100%; padding-right: 54px; }
.qwd-input-btn {
  position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
  height: 24px; padding: 0 9px;
  font: inherit; font-size: 12px; line-height: 1; white-space: nowrap;
  color: var(--dsw-alias-text-primary, #ededed);
  background: rgba(128, 128, 128, .18);
  border: 1px solid rgba(128, 128, 128, .26); border-radius: 5px;
  cursor: pointer;
  transition: background .18s ease, border-color .15s ease;
}
.qwd-input-btn:hover:not(:disabled) { background: rgba(128, 128, 128, .3); }
.qwd-input-btn:disabled { opacity: .5; cursor: not-allowed; }
/* 扫描候选列表 */
.qwd-candidates { display: flex; flex-direction: column; gap: 6px; margin: 0 0 10px; }
.qwd-candidate {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  width: 100%; padding: 8px 10px; font: inherit; font-size: 12px; text-align: left;
  color: var(--dsw-alias-text-primary, #ededed); cursor: pointer;
  background: rgba(128, 128, 128, .08);
  border: 1.5px solid rgba(128, 128, 128, .22); border-radius: 7px;
}
.qwd-candidate:hover { border-color: var(--dsw-alias-accent, #4a7bd0); }
.qwd-candidate-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qwd-candidate-meta { flex: none; font-size: 11px; color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-switch {
  position: relative; flex: none; width: 38px; height: 22px; padding: 0;
  border: none; border-radius: 11px; cursor: pointer;
  background: rgba(128, 128, 128, .38);
  transition: background 160ms cubic-bezier(.22, 1, .36, 1);
}
.qwd-switch[aria-checked="true"] { background: var(--dsw-alias-accent, #4a7bd0); }
/* 开关悬停：整颗提亮一点，表示可点 */
.qwd-switch:hover:not(:disabled) { filter: brightness(1.25); }
.qwd-switch[aria-checked="true"]:hover:not(:disabled) { filter: brightness(1.18); }
.qwd-switch:focus-visible { outline: 2px solid var(--dsw-alias-accent, #4a7bd0); outline-offset: 2px; }
.qwd-switch:disabled { opacity: .5; cursor: not-allowed; }
.qwd-switch-knob {
  position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, .35);
  transition: transform 160ms cubic-bezier(.22, 1, .36, 1);
}
.qwd-switch[aria-checked="true"] .qwd-switch-knob { transform: translateX(16px); }
.qwd-status { margin-top: 6px; font-size: 12px; min-height: 16px; color: var(--dsw-alias-text-secondary, #8b8f96); }
.qwd-status-ok { color: #4ea36b; }
.qwd-status-bad { color: #d4695f; }
`

async function apiGet(path) {
  const res = await fetch(path, { cache: 'no-store' })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`)
  return data
}

async function apiPost(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`)
  return data
}

function Fold(props) {
  const { title, sub, open, onToggle, children, dirty, warn } = props
  // 内容始终留在 DOM 里，用 grid-template-rows 0fr→1fr 做高度动画。
  // 收起时给 aria-hidden 和 inert，避免键盘焦点跑进看不见的字段。
  return h('div', { className: `qwd-fold${open ? ' qwd-fold-open' : ''}${dirty ? ' qwd-fold-dirty' : ''}${warn ? ' qwd-fold-param-warn' : ''}` },
    h('div', {
      className: 'qwd-fold-head',
      role: 'button',
      tabIndex: 0,
      'aria-expanded': open === true,
      onClick: onToggle,
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onToggle()
        }
      },
    },
    h('div', { style: { minWidth: 0 } },
      h('div', { className: 'qwd-fold-title' }, title),
      sub ? h('div', { className: 'qwd-fold-sub' }, sub) : null,
    ),
    h('span', { className: 'qwd-fold-arrow', 'aria-hidden': true }, '▸'),
    ),
    h('div', { className: 'qwd-fold-body', 'aria-hidden': open !== true },
      h('div', { className: 'qwd-fold-body-clip' },
        h('div', { className: 'qwd-fold-body-pad' }, children),
      ),
    ),
  )
}

function Field(props) {
  const { label, hint, value, onChange, onBlur, disabled, narrow, type, invalid, warn, warnText, placeholder } = props
  /**
   * 结构必须恒定：外层永远是 .qwd-field-column，里面永远是「输入行 + 提示行」。
   *
   * 之前是「有提示就多包一层、没提示就不包」，结果 warnText 一出现/消失，
   * input 的父节点就变了，React 会卸载重建 DOM，光标直接丢失，没法连续输入。
   * 现在提示行用 display:none 占位，节点结构不动。
   */
  return h('div', { className: 'qwd-field-column' },
    h('div', { className: 'qwd-field' },
      h('div', { className: 'qwd-field-text' },
        h('div', { className: 'qwd-label' }, label),
        hint ? h('div', { className: 'qwd-hint qwd-hint-one-line', title: hint }, hint) : null,
      ),
      h('input', {
        className: `qwd-input${narrow ? ' qwd-input-narrow' : ''}${invalid === true ? ' qwd-input-invalid' : ''}${warn === true ? ' qwd-input-warn' : ''}`,
        type: type ?? 'text',
        value: value ?? '',
        placeholder: placeholder ?? '',
        disabled: disabled === true,
        onChange: (event) => onChange(event.target.value),
        onBlur: () => { if (typeof onBlur === 'function') onBlur() },
      }),
    ),
    h('div', {
      className: 'qwd-field-note qwd-field-note-warn',
      style: warnText ? undefined : { display: 'none' },
    }, warnText ?? ''),
  )
}

function SelectField(props) {
  const { label, hint, value, options, onChange, disabled } = props
  // 选项既可以是字符串，也可以是 { value, label }（label 已本地化）
  const normalized = (Array.isArray(options) ? options : []).map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ))
  return h('div', { className: 'qwd-field' },
    h('div', { className: 'qwd-field-text' },
      h('div', { className: 'qwd-label' }, label),
      hint ? h('div', { className: 'qwd-hint qwd-hint-one-line', title: hint }, hint) : null,
    ),
    h('select', {
      className: 'qwd-input qwd-input-narrow qwd-select',
      value: value ?? '',
      disabled: disabled === true,
      onChange: (event) => onChange(event.target.value),
    }, normalized.map((option) => h('option', { key: option.value, value: option.value }, option.label))),
  )
}

function Switch(props) {
  const { label, hint, checked, onChange, disabled } = props
  return h('div', { className: 'qwd-field' },
    h('div', { className: 'qwd-field-text' },
      h('div', { className: 'qwd-label' }, label),
      hint ? h('div', { className: 'qwd-hint qwd-hint-one-line', title: hint }, hint) : null,
    ),
    h('button', {
      type: 'button',
      className: 'qwd-switch',
      role: 'switch',
      'aria-checked': checked === true,
      disabled: disabled === true,
      onClick: () => onChange(checked !== true),
    }, h('span', { className: 'qwd-switch-knob' })),
  )
}

/**
 * Z-Image 面板的模型下拉要排除 Qwen-Image 专属的文件。
 * 用排除法而不是白名单：以后新增的其它模型（Flux、SD3 等）也不会被误藏。
 * 注意不能笼统排除 "qwen" —— Z-Image 的文本编码器就叫 qwen_3_4b。
 */
function ModelField(props) {
  const { label, hint, value, options, onChange, disabled, fallbackHint, t, compatiblePattern } = props
  const list = Array.isArray(options) ? options : []
  if (list.length === 0) {
    return h(Field, { label, hint: `${hint} ${fallbackHint}`, value, onChange, disabled })
  }
  // 当前值是列表外的文件（比如刚被删掉）时也保留它，避免下拉显示成空白
  const merged = value && !list.includes(value) ? [value, ...list] : list
  /**
   * 兼容性判断。
   *
   * 不把别的架构的文件过滤掉——用户需要看到「本机装了哪些」，
   * 否则误判时会以为插件根本没识别到。
   *
   * 也不阻止选择：文件名判断不一定准（比如 ae.safetensors 是通用名），
   * 让一个可能错的判断拥有一票否决权，风险比让用户自己决定更大。
   * 做法是「可选 + 选到不兼容的就标红」，真要用的话保存时会再确认一次。
   */
  const isCompatible = compatiblePattern
    ? (name) => compatiblePattern.test(name)
    : () => true
  const currentBad = typeof value === 'string' && value !== '' && !isCompatible(value)
  // 结构恒定：外层永远是 .qwd-field-column，提示行用 display:none 占位，
  // 避免 currentBad 翻转时 select 因父节点变化被卸载重建。
  return h('div', { className: 'qwd-field-column' },
    h('div', { className: 'qwd-field' },
      h('div', { className: 'qwd-field-text' },
        h('div', { className: 'qwd-label' }, label),
        hint ? h('div', { className: 'qwd-hint qwd-hint-one-line', title: hint }, hint) : null,
      ),
      h('select', {
        className: 'qwd-input qwd-select-wide qwd-select'
          + (currentBad ? ' qwd-input-warn' : ''),
        value: value ?? '',
        disabled: disabled === true,
        onChange: (event) => onChange(event.target.value),
      },
      // 没有选中值时必须显式给一个占位项：否则浏览器会默认显示第一个选项，
      // 但 state 里仍是空字符串，造成「看起来选了、其实没选」。
      merged.includes(value ?? '') ? null : h('option', { value: '' }, t('modelNotPicked')),
      merged.map((option) => {
        const ok = isCompatible(option)
        return h('option', { key: option, value: option },
          ok ? option : `${option}　⚠ ${t('modelIncompatible')}`)
      })),
    ),
    h('div', {
      className: 'qwd-field-note qwd-field-note-warn',
      style: currentBad ? undefined : { display: 'none' },
    }, t('modelIncompatibleWarn')),
  )
}

function EasyPaintSettings(props) {
  const t = props.t
  const [config, setConfig] = React.useState(null)
  const [draft, setDraft] = React.useState({})
  const [sizes, setSizes] = React.useState(['1:1'])
  const [loadError, setLoadError] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [bad, setBad] = React.useState(false)
  const [checking, setChecking] = React.useState(false)
  // 全局保存按钮的进行中标记
  const [saving, setSaving] = React.useState(false)
  // 保存前的二次确认：有预警时第一次点击只把按钮文字换成「确认保存？」
  const [saveArmed, setSaveArmed] = React.useState(false)
  const saveArmTimer = React.useRef(null)
  // 后端下发的默认值，「恢复默认」用它整体覆盖
  const [defaults, setDefaults] = React.useState({})
  // 恢复默认的长按进度（0-100）与是否已就绪
  const [resetArmed, setResetArmed] = React.useState(false)

  const resetArmTimer = React.useRef(null)

  const [hw, setHw] = React.useState({ hardware: null, refLimit: null })
  const [visionModels, setVisionModels] = React.useState([])
  const [loadingVision, setLoadingVision] = React.useState(false)
// 「连接到 ComfyUI」打开的目录树是否显示
const [pickerOpen, setPickerOpen] = React.useState(false)
// 每写一次 ComfyUI 路径就 +1，用来踢顶部状态栏立刻重探
const [statusTick, setStatusTick] = React.useState(0)
// ComfyUI 有没有任务在跑：出图中保存设置时，提示改动要等这一轮出完才生效
const [comfyBusy, setComfyBusy] = React.useState(false)
  // 刚复制过的模型名（「已复制」提示，1.5 秒后自动消失）
  /** 把某个候选写进配置 */


  // 折叠面板：默认全部收起，进来先看目录，按需展开
  const [openFolds, setOpenFolds] = React.useState({ basic: false, quick: false, qwen: false, sdxl: false, params: false, advanced: false, appearance: false, zimage: false })
const [openingOutput, setOpeningOutput] = React.useState(false)
/**
 * 打开配置里的输出目录。
 *
 * 不等后端响应：explorer 冷启动要几百毫秒，等它会让按钮一直转圈。
 * 请求发出去就算完事，按钮 200ms 后恢复——窗口该弹的时候自己会弹。
 */
const openOutputDir = React.useCallback(() => {
  setOpeningOutput(true)
  void fetch(API_OPEN_OUTPUT, { method: 'POST' }).catch(() => {})
  window.setTimeout(() => setOpeningOutput(false), 200)
}, [])

// 输出目录是只读展示：图片由 ComfyUI 直接存到 <ComfyUI>/output/Easy Paint/，
// 路径从已配置的 ComfyUI 根目录推出来，插件不参与决定。
const outputDirShown = React.useMemo(() => {
  const root = typeof draft.comfyWorkdir === 'string' ? draft.comfyWorkdir.trim() : ''
  return root === '' ? t('outputDirUnset') : `${root}\\output\\Easy Paint`
}, [draft.comfyWorkdir, t])
  const toggleFold = React.useCallback((key) => {
    setOpenFolds((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // 视觉自检可用的模型来自 DSH 的 llm 服务（只取声明 image 输入的）
  const loadVisionModels = React.useCallback(async () => {
    setLoadingVision(true)
    try {
      const data = await apiGet(API_VISION_MODELS)
      setVisionModels(data?.ok && Array.isArray(data.models) ? data.models : [])
    } catch (error) {
      setVisionModels([])
    } finally {
      setLoadingVision(false)
    }
  }, [])

  React.useEffect(() => { void loadVisionModels() }, [loadVisionModels])
  const [models, setModels] = React.useState({ unet: [], clip: [], vae: [], checkpoints: [], loras: [], loraMeta: {} })
  const [modelsStale, setModelsStale] = React.useState(false)
  const [refreshingModels, setRefreshingModels] = React.useState(false)
  // Host 下发的推荐模型清单（新用户不知道该装什么时看这里）
  const [recommended, setRecommended] = React.useState(null)
  const [recommendedZImage, setRecommendedZImage] = React.useState(null)

  // 模型候选来自 ComfyUI 的加载器节点，和磁盘实际文件保持一致。
  // ComfyUI 离线时 Host 会返回上次缓存的列表（stale），照样能选。
  const refreshModels = React.useCallback(async () => {
    try {
      const data = await apiGet(API_MODELS)
      if (data?.recommended) setRecommended(data.recommended)
      if (data?.recommendedZImage) setRecommendedZImage(data.recommendedZImage)
      if (data?.ok) {
        setModels({
        unet: data.unet ?? [],
        clip: data.clip ?? [],
        vae: data.vae ?? [],
        checkpoints: data.checkpoints ?? [],
        loras: data.loras ?? [],
        loraMeta: data.loraMeta ?? {},
      })
        setModelsStale(data.stale === true)
      } else {
        setModels({ unet: [], clip: [], vae: [], checkpoints: [], loras: [], loraMeta: {} })
        setModelsStale(false)
      }
    } catch (error) {
      // 网络异常时保留已有列表，不清空下拉
      setModelsStale(false)
    }
  }, [])

  // LoRA 文件被改名 / 删掉后，配置里记的名字在可用列表里就找不到了。
  // 统一在这里检查并清空，避免界面上留着一个永远选不中的死值。
  // 依赖只放 models.loras，所以不会和自己写入的 draft 形成循环。
  React.useEffect(() => {
    if (!Array.isArray(models.loras) || models.loras.length === 0) return
    const available = new Set(models.loras)
    setDraft((prev) => {
      const list = Array.isArray(prev.sdxlLoras) ? prev.sdxlLoras : []
      if (list.length === 0) return prev
      let changed = false
      const next = list.map((l) => {
        if (l && typeof l.name === 'string' && l.name !== '' && !available.has(l.name)) {
          changed = true
          return { ...l, name: '' }
        }
        return l
      })
      return changed ? { ...prev, sdxlLoras: next } : prev
    })
  }, [models.loras])


  const refreshStatus = React.useCallback(async () => {
    setChecking(true)
    try {
      const data = await apiGet(API_STATUS)
      // 硬件快照与参考图上限（连接状态本身由 ComfyStatusSeat 自己轮询）
      setHw({ hardware: data?.hardware ?? null, refLimit: data?.refLimit ?? null })
    } catch (error) {
      // 取不到就保留上次的快照，避免设置页闪成空
    } finally {
      setChecking(false)
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    apiGet(API_CONFIG)
      .then((data) => {
        if (cancelled) return
        setConfig(data?.config ?? {})
        setDraft({ ...(data?.config ?? {}) })
        // 后端的默认值：恢复默认按钮要用
        setDefaults(data?.defaults ?? {})
        // 自动推导的 models 目录：作为输入框占位提示
              if (Array.isArray(data?.sizes) && data.sizes.length > 0) setSizes(data.sizes)
        setLoadError('')
      })
      .catch((error) => { if (!cancelled) setLoadError(error?.message ?? String(error)) })
    void refreshStatus()
    void refreshModels()
    return () => { cancelled = true }
  }, [refreshStatus, refreshModels])

  const patch = (field, raw) => setDraft((prev) => ({ ...prev, [field]: raw }))

  /**
   * 按主模型文件名给出推荐采样参数。只在「这个模型没有保存过的记忆」时用。
   * 与后端 DEFAULTS 保持一致：turbo 版 10 步 / CFG 1，原生版 25 步 / CFG 2.5。
   */
  const recommendedSampling = (file, kind) => {
    if (kind === 'sdxl') return { steps: 28, cfg: 7.5 }
    if (kind === 'zimage') return { steps: 8, cfg: 1 }
    const turbo = String(file ?? '').toLowerCase().includes('turbo')
    return turbo ? { steps: 10, cfg: 1 } : { steps: 25, cfg: 2.5 }
  }

  /**
   * 切换主模型：优先恢复「这个模型上次保存时的参数」，没有记忆才用推荐值。
   *
   * 记忆存在 modelParams 里（{ 文件名: { steps, cfg } }），保存设置时写入。
   * 用户点「恢复默认」会把它清空，之后所有切换都回到推荐值。
   */
  const switchMainModel = (field, filename, kind) => {
    const memoMap = draft.modelParams && typeof draft.modelParams === 'object' && !Array.isArray(draft.modelParams)
      ? draft.modelParams
      : {}
    const memo = memoMap[filename]
    const usable = memo
      && Number.isFinite(Number(memo.steps)) && Number(memo.steps) > 0
      && Number.isFinite(Number(memo.cfg))
    const params = usable
      ? { steps: Number(memo.steps), cfg: Number(memo.cfg) }
      : recommendedSampling(filename, kind)
    const stepField = kind === 'sdxl' ? 'sdxlSteps' : kind === 'zimage' ? 'zImageSteps' : 'qwenSteps'
    const cfgField = kind === 'sdxl' ? 'sdxlCfg' : kind === 'zimage' ? 'zImageCfg' : 'qwenCfg'
    const picked = String(filename ?? '').trim() !== ''
    setDraft((prev) => {
      const next = { ...prev, [field]: filename }
      // 选「（未选择）」时只清空模型，不动采样参数——
      // 这时候按推荐值改写步数反而莫名其妙。
      if (picked) {
        next[stepField] = params.steps
        next[cfgField] = params.cfg
      }
      return next
    })
  }

  /** 保存成功后统一同步 state：config 存服务端返回值，draft 重新拉平 */
  const applySavedConfig = (data, fallback) => {
    setConfig(data?.config ?? fallback)
    setDraft({ ...(data?.config ?? {}) })
    setBad(false)
    setMessage(t('saved'))
  }

  const save = async (field, cast, explicit) => {
    if (config === null) return
    // 下拉的 onChange 和保存发生在同一拍，draft 还没提交，所以显式传值。
    const raw = explicit !== undefined ? explicit : draft[field]
    const next = cast ? cast(raw) : raw
    if (next === config[field]) { setMessage(''); return }
    try {
      const data = await apiPost(API_CONFIG, { config: { [field]: next } })
      applySavedConfig(data, { ...config, [field]: next })
      setStatusTick((n) => n + 1)
    } catch (error) {
      setBad(true)
      setMessage(`${t('saveFailed')}: ${error?.message ?? error}`)
    }
  }


  /**
   * 把自动探测到的 ComfyUI 位置写进配置。
   *
   * 不能走 save()：save 开头有 `if (config === null) return`，
   * 而自动探测在挂载时（config 还没加载完）就跑了，此时 config 仍是 null，
   * save 静默返回——探测明明找到了，却一个字都没写进去，
   * 新用户看到的就是「请选择 ComfyUI 路径」。
   *
   * 改成一次 POST 带齐字段，不依赖 config 是否就绪。
   */
  const applyCandidate = React.useCallback(async (candidate) => {
    const fields = {
      comfyWorkdir: candidate.workdir,
      comfyMainPy: candidate.mainPy,
    }
    if (candidate.python) fields.comfyPython = candidate.python
    patch('comfyWorkdir', candidate.workdir)
    patch('comfyMainPy', candidate.mainPy)
    if (candidate.python) patch('comfyPython', candidate.python)
    try {
      const data = await apiPost(API_CONFIG, { config: fields })
      applySavedConfig(data, { ...(config ?? {}), ...fields })
      setStatusTick((n) => n + 1)
    } catch {
      // 自动探测失败不打扰用户：路径留空，让他自己选
    }
  }, [config])

  /**
   * 选定一个目录作为 ComfyUI 安装位置：写进配置并立即保存。
   * 目录树确认后走这里，用户不用再碰任何路径输入框。
   */
  /**
   * 目录树自动探测到 ComfyUI 时走这里：写进配置、关掉面板、立刻探一次
   * /status 验证能不能连上（ComfyUI 可能没开，连不上就等自动启动）。
   */

  /**
   * 一次提交多个字段。
   *
   * 不能并行调三次 save：save 每次回包都会 setDraft({ ...data.config })
   * 覆盖整个 draft，并发时后回来的把先回来的冲掉，最后只剩一个字段生效；
   * 而且 save 内部用闭包里的旧 config 判断「值没变就跳过」，并发时全部误判。
   * 这里一次 POST 带齐所有字段，后端合并后回包，再整体替换 draft。
   */
  const saveBatch = React.useCallback(async (fields) => {
    if (config === null) return false
    const changed = {}
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue
      if (value === config[key]) continue
      changed[key] = value
    }
    // 全部和现有配置一样：只更新界面，不用发请求
    if (Object.keys(changed).length === 0) {
      setDraft((prev) => ({ ...prev, ...fields }))
      return true
    }
    try {
      const data = await apiPost(API_CONFIG, { config: changed })
      applySavedConfig(data, { ...config, ...changed })
      // 同 saveAll：配置变了就把状态栏刷新一次，别等轮询
      setStatusTick((n) => n + 1)
      return true
    } catch (error) {
      setBad(true)
      setMessage(`${t('saveFailed')}: ${error?.message ?? error}`)
      return false
    }
  }, [config, t])

  const pickCandidate = React.useCallback(async (candidate) => {
    // 只有用户点了「用这个目录」才会走到这里。
    // 这里只负责写配置——关面板交给 DirPicker：它要在写完后先播渐隐再卸载。
    const ok = await saveBatch({
      comfyWorkdir: candidate.workdir,
      comfyMainPy: candidate.mainPy,
      comfyPython: candidate.python || undefined,
    })
    if (ok) {
      // 踢状态栏立刻按新路径重探（递增 key 会重挂 ComfyControlBar 的探测）
      setStatusTick((n) => n + 1)
    }
  }, [saveBatch])

  const pickComfyDir = React.useCallback(async (dir) => {
    // 同上：只管写配置，关面板由 DirPicker 播完渐隐后做
    await saveBatch({
      comfyWorkdir: dir,
      comfyMainPy: joinLike(dir, 'main.py'),
    })
    setStatusTick((n) => n + 1)
  }, [saveBatch])

  // 打开设置页自动探一次常见位置：用户什么都不用做，路径自己就填好了
  React.useEffect(() => {
    let cancelled = false
    const auto = async () => {
      try {
        const res = await fetch(API_DETECT, { method: 'POST' })
        const data = await res.json().catch(() => null)
        if (cancelled || data?.ok !== true) return
        const list = Array.isArray(data.candidates) ? data.candidates : []
        // 只有一个候选就直接用；多个不替用户决定，留给候选列表或目录树
        if (list.length === 1) await applyCandidate(list[0])
      } catch { /* 自动探测失败不打扰用户 */ }
    }
    void auto()
    return () => { cancelled = true }
  }, [])

  const disabled = config === null

  /** 某个折叠面板里有没有未保存改动 */
  const panelDirty = React.useCallback((panel) => {
    if (config === null) return false
    const fields = PANEL_FIELDS[panel] ?? []
    return fields.some((k) => {
      const v = draft[k]
      if (v === undefined) return false
      return v !== config[k]
    })
  }, [config, draft])

  /** 长按开始：1.2 秒内把红色填充推到 100%，到顶就 armed */
  /** 已 armed 后再点一次：把所有设置写回默认值 */
  const doReset = React.useCallback(async () => {
    if (!resetArmed || config === null) return
    setSaving(true)
    try {
      const data = await apiPost(API_CONFIG, { config: defaults })
      setConfig(data?.config ?? { ...defaults })
      setDraft({ ...(data?.config ?? {}) })
      setBad(false)
      setMessage(t('resetDone'))
    } catch (error) {
      setBad(true)
      setMessage(`${t('saveFailed')}: ${error?.message ?? error}`)
    } finally {
      setSaving(false)
      setResetArmed(false)
    }
  }, [resetArmed, config, defaults, t])

  /**
   * 恢复默认的点击入口：和保存按钮一样两步确认。
   * 第一次点只把按钮换成「确定恢复？」并开始 5 秒倒计时，再点一次才执行。
   */
  const requestReset = React.useCallback(() => {
    if (saving || disabled || config === null) return
    if (!resetArmed) {
      setResetArmed(true)
      if (resetArmTimer.current !== null) window.clearTimeout(resetArmTimer.current)
      resetArmTimer.current = window.setTimeout(() => {
        setResetArmed(false)
        resetArmTimer.current = null
      }, 3000)
      return
    }
    if (resetArmTimer.current !== null) {
      window.clearTimeout(resetArmTimer.current)
      resetArmTimer.current = null
    }
    void doReset()
  }, [saving, disabled, config, resetArmed, doReset])

  // 卸载时清计时器，避免对已卸载的组件 setState
  React.useEffect(() => () => {
    if (resetArmTimer.current !== null) window.clearTimeout(resetArmTimer.current)
  }, [])

  /** 有改动但还没保存的字段（draft 与已存值不同的键） */
  const dirtyFields = React.useMemo(() => {
    if (config === null) return []
    return Object.keys(draft).filter((k) => {
      const v = draft[k]
      if (v === undefined) return false
      return v !== config[k]
    })
  }, [draft, config])


  /**
   * 当前架构下，选中的模型里有没有不兼容的。
   *
   * 判断依据只是文件名，不一定准（ae.safetensors 这种通用名尤其容易误判），
   * 所以不阻止选择、也不直接拦保存，只在保存时弹一次确认让用户自己定。
   */
  const incompatibleFields = (() => {
    const arch = String(draft.arch ?? 'qwen-image')
    const checks = []
    if (arch === 'qwen-image') {
      checks.push(['unet', /^qwen_image|^qwen3vl/iu])
      checks.push(['clip', /^qwen_image|^qwen3vl/iu])
      checks.push(['vae', /^qwen_image|^qwen3vl/iu])
    } else if (arch === 'z-image') {
      checks.push(['zImageUnet', /^z_image|^zimage/iu])
      checks.push(['zImageClip', /^qwen_3_4b/iu])
      checks.push(['zImageVae', /^ae\.safetensors$/iu])
    }
    return checks
      .filter(([key, re]) => {
        const val = String(draft[key] ?? '').trim()
        return val !== '' && !re.test(val)
      })
      .map(([key]) => key)
  })()
  const hasIncompatible = incompatibleFields.length > 0

  /** 一次性保存所有改动：底部那颗「保存设置」按钮调它 */
  const saveAll = React.useCallback(async () => {
    if (config === null) return
    const patch = {}
    for (const k of dirtyFields) patch[k] = draft[k]
    if (Object.keys(patch).length === 0) {
      setMessage(t('noChanges'))
      return
    }
    // 顺手记住三个架构「当前主模型 → 当前采样参数」的对应关系，
    // 下次切回同一个模型时能把用户调过的值恢复出来。
    {
      const memo = draft.modelParams && typeof draft.modelParams === 'object' && !Array.isArray(draft.modelParams)
        ? { ...draft.modelParams }
        : {}
      const remember = (file, steps, cfg) => {
        const key = String(file ?? '').trim()
        if (key === '') return
        const s = Number(steps)
        const c = Number(cfg)
        if (!Number.isFinite(s) || s <= 0 || !Number.isFinite(c)) return
        memo[key] = { steps: s, cfg: c }
      }
      remember(draft.unet, draft.qwenSteps, draft.qwenCfg)
      remember(draft.checkpoint, draft.sdxlSteps, draft.sdxlCfg)
      remember(draft.zImageUnet, draft.zImageSteps, draft.zImageCfg)
      patch.modelParams = memo
    }
    // 有预警时的二次确认放在按钮上（第一次点击变「确认保存？」），
    // 这里不再弹 window.confirm——弹窗会打断输入，也挡不住误触。
    setSaving(true)
    try {
      const data = await apiPost(API_CONFIG, { config: patch })
      applySavedConfig(data, { ...config, ...patch })
      // 配置变了，「配置待优化」的判定也跟着变：立刻踢状态栏重探。
      // 否则要等下一个 6 秒空闲轮询周期才更新，用户会以为没保存成功。
      setStatusTick((n) => n + 1)
    } catch (error) {
      setBad(true)
      setMessage(`${t('saveFailed')}: ${error?.message ?? error}`)
    } finally {
      setSaving(false)
    }
  }, [config, draft, dirtyFields, t])

  // 采样步数的推荐区间跟着当前模型走：turbo 8–12，原生 20–30
  // ⚠ 这里必须读 qwenSteps 而不是 steps——配置里没有 steps 这个字段，
  //   读不到会让下面的越界判断永远为 false，等于没有预警。
  const turboSelected = String(draft.unet ?? '').toLowerCase().includes('turbo')
  const recommendLow = turboSelected ? 8 : 20
  const recommendHigh = turboSelected ? 12 : 30
  const stepsValue = Number(draft.qwenSteps)
  const stepsOutOfRange = Number.isFinite(stepsValue) && stepsValue > 0
    && (stepsValue < recommendLow || stepsValue > recommendHigh)
  const stepsHintText = (turboSelected ? t('stepsHintTurbo') : t('stepsHintNative'))
    + (stepsOutOfRange ? `　⚠ ${t('stepsOutOfRange')}` : '')


  // 单个输入框的标黄标记：让用户一眼看出该改哪一格。
  // 具体文案在各自 Field 的 warnText 里拼，不再集中攒一个数组。
  const qwenCfgWarn = (() => {
    if (String(draft.unet ?? '').trim() === '') return false
    const v = Number(draft.qwenCfg)
    if (!Number.isFinite(v)) return false
    // turbo 版文案说「建议改回 1」，非 turbo 说「建议 2.5–4」，都按文案来
    return turboSelected ? v > 1 : (v < 2.5 || v > 4)
  })()
  // 和后端保持一致：Qwen 没选模型时既不判 CFG 也不判步数
  // （空 unet 会被当成「非 turbo」，按原生区间判步数会误报）
  const qwenStepsWarn = String(draft.unet ?? '').trim() !== '' && stepsOutOfRange
  // 折叠标题要不要标黄：两格里任一出问题就标
  const qwenPanelWarn = qwenStepsWarn || qwenCfgWarn

  // SDXL 的参数区间和 Qwen 完全不同，单独算
  const sdxlStepsValue = Number(draft.sdxlSteps)
  const sdxlCfgValue = Number(draft.sdxlCfg)
  // 文案说「通常 25–30 步」，预警就按这个区间
  const sdxlStepsWarn = Number.isFinite(sdxlStepsValue) && sdxlStepsValue > 0
    && (sdxlStepsValue < 25 || sdxlStepsValue > 30)
  // 预警范围 = 文案里的推荐范围（7–8），两边必须一致，否则用户看到「建议 7–8」
  // 却把 6 当合法值填进去，就自相矛盾了。
  const sdxlCfgWarn = Number.isFinite(sdxlCfgValue) && (sdxlCfgValue < 7 || sdxlCfgValue > 8)
  const sdxlPanelWarn = sdxlStepsWarn || sdxlCfgWarn

  // Z-Image-Turbo 按 CFG 1 训练，步数 8 是官方甜点
  const zStepsValue = Number(draft.zImageSteps)
  const zCfgValue = Number(draft.zImageCfg)
  const zStepsWarn = Number.isFinite(zStepsValue) && zStepsValue > 0
    && (zStepsValue < 6 || zStepsValue > 12)
  // 文案说「固定 1.0」，超过 1 就算偏离
  const zCfgWarn = Number.isFinite(zCfgValue) && zCfgValue > 1
  const zPanelWarn = zStepsWarn || zCfgWarn

  // 参数预警文案：每种问题只拼一次，输入框下面的说明和最下方清单一齐用，
  // 避免同一件事在界面上出现两种措辞。空字符串表示该项没问题。
  const qwenCfgValue = Number(draft.qwenCfg)
  const qwenStepsWarnText = qwenStepsWarn
    ? t('paramStepsOutOfRange')
      .replace(/\{v\}/gu, String(stepsValue))
      .replace(/\{low\}/gu, String(recommendLow))
      .replace(/\{high\}/gu, String(recommendHigh))
    : ''
  const qwenCfgWarnText = qwenCfgWarn
    ? (turboSelected
      ? t('paramCfgTooHighForTurbo').replace(/\{v\}/gu, String(qwenCfgValue))
      : (qwenCfgValue > 4
        ? t('paramCfgTooHighForNative')
          .replace(/\{v\}/gu, String(qwenCfgValue))
          .replace(/\{low\}/gu, '2.5')
          .replace(/\{high\}/gu, '4')
        : t('paramCfgTooLowForNative')
          .replace(/\{v\}/gu, String(qwenCfgValue))
          .replace(/\{low\}/gu, '2.5')
          .replace(/\{high\}/gu, '4')))
    : ''
  const sdxlStepsWarnText = sdxlStepsWarn
    ? t('sdxlStepsOutOfRange')
      .replace(/\{v\}/gu, String(sdxlStepsValue))
      .replace(/\{low\}/gu, '25')
      .replace(/\{high\}/gu, '30')
    : ''
  const sdxlCfgWarnText = sdxlCfgWarn
    ? (sdxlCfgValue < 7 ? t('sdxlCfgLow') : t('sdxlCfgHigh'))
      .replace(/\{v\}/gu, String(sdxlCfgValue))
    : ''
  const zStepsWarnText = zStepsWarn
    ? t('zimageStepsOutOfRange')
      .replace(/\{v\}/gu, String(zStepsValue))
      .replace(/\{low\}/gu, '6')
      .replace(/\{high\}/gu, '12')
    : ''
  const zCfgWarnText = zCfgWarn
    ? t('zimageCfgHigh').replace(/\{v\}/gu, String(zCfgValue))
    : ''
  const paramWarnings = [
    qwenStepsWarnText,
    qwenCfgWarnText,
    sdxlStepsWarnText,
    sdxlCfgWarnText,
    zStepsWarnText,
    zCfgWarnText,
  ].filter((text) => text !== '')
  const hasParamWarn = paramWarnings.length > 0

  /**
   * 保存按钮的点击入口：始终两步确认。
   *
   * 第一次点击不写盘，只把按钮文字换成「确认保存？」并开始倒计时；
   * 5 秒内再点一次才真保存。误触不会直接把配置存进去，也不会像
   * window.confirm 那样打断输入或挡住页面。
   */
  const requestSave = () => {
    if (saving || disabled || dirtyFields.length === 0) return
    if (!saveArmed) {
      setSaveArmed(true)
      if (saveArmTimer.current !== null) window.clearTimeout(saveArmTimer.current)
      saveArmTimer.current = window.setTimeout(() => setSaveArmed(false), 3000)
      return
    }
    if (saveArmTimer.current !== null) {
      window.clearTimeout(saveArmTimer.current)
      saveArmTimer.current = null
    }
    setSaveArmed(false)
    void saveAll()
  }

  // 用户一改值就退出「待确认」态，避免旧状态残留到下一次点击
  React.useEffect(() => {
    setSaveArmed(false)
    if (saveArmTimer.current !== null) {
      window.clearTimeout(saveArmTimer.current)
      saveArmTimer.current = null
    }
  }, [dirtyFields.length])

  // 卸载时清计时器，避免对已卸载组件 setState
  React.useEffect(() => () => {
    if (saveArmTimer.current !== null) window.clearTimeout(saveArmTimer.current)
  }, [])

  // 参考图上限：拿硬件推荐值和用户填的值比，超了就把输入框标红
  const hwRefLimit = typeof hw.refLimit?.auto === 'number' ? hw.refLimit.auto : null
  const refValueNum = Number(draft.maxRefImages)
  const refLimitTooHigh = Number.isFinite(refValueNum) && hwRefLimit !== null && refValueNum > hwRefLimit
  const refLimitHintText = (() => {
    if (hwRefLimit === null) return t('maxRefImagesHint')
    const base = t('maxRefImagesHintAuto')
      .replace('{n}', String(hwRefLimit))
      .replace('{vram}', String(hw.hardware?.vramTotalMb ?? '?'))
    return refLimitTooHigh
      ? `${base}　${t('maxRefImagesOver').replace(/\{n\}/gu, String(hwRefLimit))}`
      : base
  })()

  if (loadError !== '') {
    return h('div', { className: 'qwd-root' },
      h('style', null, STYLE),
      h('p', { className: 'qwd-lead' }, `${t('loadFailed')}：${loadError}`),
    )
  }

  return h('div', { className: 'qwd-root' },
    h('style', null, STYLE),
    // 「连接到 ComfyUI」打开的自绘目录树
    pickerOpen
      ? h(DirPicker, {
        t,
        current: typeof draft.comfyWorkdir === 'string' ? draft.comfyWorkdir : '',
        onPick: (dir) => { void pickComfyDir(dir) },
        // 用户点「用这个目录」：写配置、关面板、立刻重探状态
        onAutoPick: (candidate) => { void pickCandidate(candidate) },
        onClose: () => setPickerOpen(false),
      })
      : null,
    h('p', { className: 'qwd-lead' }, config === null ? t('loading') : t('lead')),

    // 本机参数：一行紧凑显示，只读
    h('div', { className: 'qwd-machine' },
      h('span', { className: 'qwd-machine-k' }, t('gpu')),
      h('span', { className: 'qwd-machine-v' }, hw.hardware?.gpuName || t('hwUnknown')),
      h('span', { className: 'qwd-machine-sep' }, '·'),
      h('span', { className: 'qwd-machine-k' }, t('vram')),
      h('span', { className: 'qwd-machine-v' },
        typeof hw.hardware?.vramTotalMb === 'number'
          ? `${hw.hardware.vramTotalMb} MB` + (typeof hw.hardware?.vramFreeMb === 'number' ? `（空闲 ${hw.hardware.vramFreeMb} MB）` : '')
          : t('hwUnknown')),
    ),

    h('div', { className: 'qwd-conn' },
      // 左状态灯 + 中间说明 + 右侧操作按钮（离线=启动 / 在线=终止 / 生图中=禁用）
      h(ComfyControlBar, { t, disabled, refreshKey: statusTick, onBusyChange: setComfyBusy, onPick: () => setPickerOpen(true) }),
    ),

    h(Fold, {
      title: t('foldQuickDraw'), sub: t('foldQuickDrawHint'),
      open: openFolds.quick === true, onToggle: () => toggleFold('quick'),
    },
      h(QuickDraw, { t, disabled }),
    ),


    h(Fold, {
      title: t('foldParams'), sub: t('foldParamsHint'),
      open: openFolds.params === true, onToggle: () => toggleFold('params'), dirty: panelDirty('params'),
    },
    h('div', { className: 'qwd-field' },
      h('div', { className: 'qwd-field-text' },
        h('div', { className: 'qwd-label' }, t('outputDir')),
        h('div', { className: 'qwd-hint qwd-hint-one-line', title: t('outputDirHint') }, t('outputDirHint')),
      ),
      h('div', { className: 'qwd-input-embedded' },
        // 只读：图片存在 ComfyUI 自己的 output\Easy Paint\ 下，由工作流决定，
        // 不在这里改。显示出来只是让用户知道去哪找。
        h('input', {
          className: 'qwd-input',
          type: 'text',
          readOnly: true,
          value: outputDirShown,
          title: outputDirShown,
        }),
        h('button', {
          type: 'button',
          className: 'qwd-input-btn',
          disabled: openingOutput,
          onClick: () => { void openOutputDir() },
        }, openingOutput ? '…' : t('openOutputDir')),
      ),
    ),
    // 「连不上时自动启动」原来在 ComfyUI 设置里，路径全自动化后挪到这里
    h(Switch, {
      label: t('autoStart'), hint: t('autoStartHint'),
      checked: draft.autoStart !== false, disabled,
      onChange: (v) => { patch('autoStart', v) },
    }),
    h(SelectField, {
      label: t('archLabel'),
      hint: t('archHint'),
      value: draft.arch ?? 'qwen-image',
      options: [
        { value: 'qwen-image', label: t('archQwen') },
        { value: 'sdxl', label: t('archSdxl') },
        { value: 'z-image', label: t('archZimage') },
      ],
      disabled,
      onChange: (v) => { patch('arch', v)},
    }),

    h(SelectField, {
      label: t('size'), value: draft.size ?? '1:1', options: sizes, disabled,
      onChange: (v) => { patch('size', v)},
    }),

    h(Field, {
      label: t('autoRetry'), hint: t('autoRetryHint'), type: 'number', narrow: true,
      value: draft.autoRetry ?? 0, disabled,
      onChange: (v) => patch('autoRetry', v),
    }),
    h(SelectField, {
      label: t('selfCheckMode'), hint: t('selfCheckHint'),
      value: draft.selfCheck ?? 'off',
      options: [
        { value: 'off', label: t('selfCheckOff') },
        { value: 'vision', label: t('selfCheckVision') },
      ],
      disabled,
      onChange: (v) => { patch('selfCheck', v)},
    }),
    draft.selfCheck === 'vision'
      ? (visionModels.length > 0
        ? h(SelectField, {
          label: t('visionModel'), hint: t('visionModelHint'),
          value: `${draft.selfCheckProvider ?? ''}|${draft.selfCheckModel ?? ''}`,
          options: visionModels.map((m) => ({
            value: `${m.provider}|${m.model}`,
            label: `${m.name || m.model}（${m.provider}）`,
          })),
          disabled,
          onChange: (v) => {
            const cut = v.indexOf('|')
            const provider = v.slice(0, cut)
            const model = v.slice(cut + 1)
            patch('selfCheckProvider', provider)
            patch('selfCheckModel', model)
            void (async () => {
              await save('selfCheckProvider', null, provider)
              await save('selfCheckModel', null, model)
            })()
          },
        })
        : h('div', { className: 'qwd-field' },
          h('div', { className: 'qwd-field-text' },
            h('div', {
              className: 'qwd-hint qwd-hint-one-line',
              title: loadingVision ? t('visionModelLoading') : t('visionModelNone'),
            }, loadingVision ? t('visionModelLoading') : t('visionModelNone')),
          ),
        ))
      : null,
    // 视觉自检会调用真实模型：云端按次计费，本地免费。必须让用户看见。
    draft.selfCheck === 'vision'
      ? h('p', { className: 'qwd-cost-warn' }, t('visionCostWarning'))
      : null,

    ),

    h(Fold, {
      title: t('foldSdxl'), sub: t('foldSdxlHint'),
      open: openFolds.sdxl === true, onToggle: () => toggleFold('sdxl'), dirty: panelDirty('sdxl'),
      warn: sdxlPanelWarn,
    },
    h('p', { className: 'qwd-cost-warn', style: { margin: '0 0 10px' } }, t('sdxlEditNote')),
    h('div', { className: 'qwd-group-head' },
      h('button', {
        type: 'button', className: 'qwd-mini', disabled: disabled || refreshingModels,
        onClick: async () => {
          setRefreshingModels(true)
          try { await refreshModels() } finally { setRefreshingModels(false) }
        },
      }, refreshingModels ? t('reloading') : t('reload')),
    ),

    h(ModelField, {
      label: t('checkpoint'),
      hint: t('checkpointHint'),
      value: draft.checkpoint ?? '',
      options: models.checkpoints ?? [],
      disabled,
      fallbackHint: t('modelFallback'),
      t,
      onChange: (v) => { switchMainModel('checkpoint', v, 'sdxl')},
    }),
    // LoRA 1–5：和 Checkpoint 并列的独立设置行，留空即不用
    Array.from({ length: 5 }).map((_, index) => {
      const list = Array.isArray(draft.sdxlLoras) ? draft.sdxlLoras : []
      const lora = list[index] ?? { name: '', strength: 0.8 }
      const inUse = (lora.name ?? '') !== ''
      const update = (patchObj) => {
        const next = Array.from({ length: 5 }).map((__, i) => {
          const cur = list[i] ?? { name: '', strength: 0.8 }
          return i === index ? { ...cur, ...patchObj } : cur
        })
        patch('sdxlLoras', next)
      }
      return h('div', {
        key: index,
        className: `qwd-field qwd-lora-line${inUse ? ' qwd-lora-active' : ''}`,
      },
      (() => {
        // 先算状态，标题和文字共用同一个 tone：ok=蓝 / warn=黄 / bad=红
        let tone = ''
        let noteText = ''
        let noteTitle = ''
        if (inUse) {
          // 文件被改名 / 删掉时，配置里记的名字在可用列表里就找不到了
          const stillExists = (models.loras ?? []).includes(lora.name)
          if (!stillExists) {
            return h('div', { className: 'qwd-lora-label' },
              h('span', { className: 'qwd-lora-name qwd-lora-tone-bad' }, `LoRA ${index + 1}`),
              h('span', {
                className: 'qwd-lora-note qwd-lora-tone-bad',
                title: t('loraMissingTitle'),
              }, t('loraMissing')),
            )
          }
          const meta = (models.loraMeta ?? {})[lora.name]
          const loraFam = meta?.family ?? 'unknown'
          const cpName = String(draft.checkpoint ?? '').toLowerCase()
          const cpFam = cpName === '' ? ''
            : cpName.includes('illustrious') ? 'illustrious'
              : cpName.includes('pony') ? 'pony'
                : cpName.includes('noob') ? 'noob'
                  : 'sdxl'
          if (loraFam === 'sd15') {
            // SD1.5 的 LoRA 在任何一个 SDXL 底模上都跑不了，属于架构级不兼容，
            // 所以即使还没选底模也能下结论。
            tone = 'bad'
            noteText = t('loraIncompatible')
            noteTitle = t('loraSd15Warn')
          } else if (cpFam === '') {
            // 还没选 Checkpoint：无从比较，老老实实说没选，别谎报「已装载」
            // 用 idle 色调，让标题和提示语都是次要灰，保持同色
            tone = 'idle'
            noteText = t('loraNoCkpt')
            noteTitle = t('loraNoCkptTitle')
          } else if (loraFam === 'unknown' || loraFam === cpFam) {
            tone = 'ok'
            noteText = t('loraLoaded')
            noteTitle = loraFam === 'unknown' ? t('loraNoMeta') : ''
          } else if (loraFam === 'sdxl' || loraFam === 'illustrious' || loraFam === 'pony' || loraFam === 'noob') {
            // 跨系：能加载但效果打折
            tone = 'warn'
            noteText = t('loraCross')
            noteTitle = t('loraCrossTitle').replace('{lora}', loraFam).replace('{cp}', cpFam)
          } else {
            tone = 'bad'
            noteText = t('loraIncompatible')
            noteTitle = t('loraMismatchTitle').replace('{lora}', loraFam).replace('{cp}', cpFam)
          }
        }
        const toneClass = tone === '' ? '' : ` qwd-lora-tone-${tone}`
        return h('div', { className: 'qwd-lora-label' },
          h('span', { className: `qwd-lora-name${toneClass}` }, `LoRA ${index + 1}`),
          noteText === ''
            ? null
            : h('span', { className: `qwd-lora-note${toneClass}`, title: noteTitle }, noteText),
        )
      })(),
      h('div', { className: 'qwd-lora-controls' },
        h('select', {
          className: 'qwd-input qwd-select qwd-lora-select',
          value: lora.name ?? '',
          disabled,
          onChange: (event) => update({ name: event.target.value }),
        },
        h('option', { value: '' }, t('loraSlotEmpty')),
        // 已经被其他槽位占用的 LoRA 不再出现在这里，避免同一个文件重复装载
        (models.loras ?? [])
          .filter((file) => file === lora.name || !list.some((other, oi) => oi !== index && other.name === file))
          .map((file) => h('option', { key: file, value: file }, file)),
        ),
        h('input', {
          type: 'number', step: '0.05', min: '0', max: '2',
          className: 'qwd-input qwd-lora-strength',
          title: t('loraStrengthHint'),
          value: lora.strength ?? 0.8,
          disabled: disabled || !inUse,
          onChange: (event) => update({ strength: Number(event.target.value) }),
        }),
      ),
      )
    }),

    // SDXL 的默认提示词（Pony 这类模型要在这里写 score_9 等质量标签）
    h(Field, {
      label: t('positivePrompt'), hint: t('sdxlPositiveHint'), type: 'textarea',
      value: draft.sdxlPositive ?? '', disabled,
      onChange: (v) => patch('sdxlPositive', v),
    }),
    h(Field, {
      label: t('negativePrompt'), hint: t('sdxlNegativeHint'), type: 'textarea',
      value: draft.sdxlNegative ?? '', disabled,
      onChange: (v) => patch('sdxlNegative', v),
    }),

    // SDXL 自己的采样参数
    h(Field, {
      label: t('steps'),
      hint: t('sdxlStepsHint'),
      type: 'number', narrow: true,
      value: draft.sdxlSteps ?? 28, disabled,
      warn: sdxlStepsWarn,
      warnText: sdxlStepsWarnText || undefined,
      onChange: (v) => patch('sdxlSteps', v),
    }),
    h(Field, {
      label: t('cfg'), hint: t('sdxlCfgHint'), type: 'number', narrow: true,
      value: draft.sdxlCfg ?? 7.5, disabled,
      warn: sdxlCfgWarn,
      warnText: sdxlCfgWarnText || undefined,
      onChange: (v) => patch('sdxlCfg', v),
    }),
    h(Field, {
      label: t('editDenoise'), hint: t('sdxlEditDenoiseHint'), type: 'number', narrow: true,
      value: draft.sdxlEditDenoise ?? 0.6, disabled,
      onChange: (v) => patch('sdxlEditDenoise', v),
    }),

    ),

    h(Fold, {
      title: t('foldQwen'), sub: t('foldQwenHint'),
      open: openFolds.qwen === true, onToggle: () => toggleFold('qwen'), dirty: panelDirty('qwen'),
      warn: qwenPanelWarn,
    },
    modelsStale
      ? h('p', { className: 'qwd-hint', style: { margin: '0 0 8px' } }, t('modelStale'))
      : null,
    h('div', { className: 'qwd-group-head' },
      h('button', {
        type: 'button', className: 'qwd-mini', disabled: disabled || refreshingModels,
        onClick: async () => {
          setRefreshingModels(true)
          try { await refreshModels() } finally { setRefreshingModels(false) }
        },
      }, refreshingModels ? t('reloading') : t('reload')),
    ),
    h('p', { className: 'qwd-hint', style: { margin: '0 0 10px' } }, t('qwenNote')),

    // 新用户不知道该装什么模型：列出实测可用的一套，标出本机装了哪些
    recommended
      ? h('div', { className: 'qwd-recommend' },
        h('div', { className: 'qwd-recommend-head' },
          h('span', null, t('recTitle')),
        ),
        h('table', { className: 'qwd-recommend-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, t('recColKind')),
              h('th', null, t('recColFile')),
              h('th', null, t('recColStatus')),
            ),
          ),
          h('tbody', null,
            ['unet', 'clip', 'vae'].map((kind) => {
              const rec = recommended[kind]
              if (!rec) return null
              const installed = (models[kind] ?? []).includes(rec.file)
              return h('tr', {
                key: kind,
                title: `${rec.label}\n放到 ${rec.dir}\n${rec.note}`,
              },
              h('td', { className: 'qwd-recommend-kind' }, t(kind)),
              h('td', { className: 'qwd-recommend-file' }, rec.file),
              h('td', null, h('span', {
                className: `qwd-recommend-tag${installed ? ' qwd-tag-ok' : ' qwd-tag-miss'}`,
              }, installed ? t('recInstalled') : t('recMissing'))),
              )
            }),
          ),
        ),
        h('p', { className: 'qwd-hint', style: { margin: '8px 0 0' } }, t('recHint')),
      )
      : null,
      h(ModelField, {
        label: t('unet'),
        hint: t('unetHint'),
        value: draft.unet ?? '',
        options: models.unet,
        disabled,
        fallbackHint: t('modelFallback'),
        compatiblePattern: /^qwen_image|^qwen3vl/iu,
        t,
        onChange: (v) => { switchMainModel('unet', v, 'qwen')},
      }),
      h(ModelField, {
        label: t('clip'),
        hint: t('clipHint'),
        value: draft.clip ?? '',
        options: models.clip,
        disabled,
        fallbackHint: t('modelFallback'),
        compatiblePattern: /^qwen_image|^qwen3vl/iu,
        t,
        onChange: (v) => { patch('clip', v)},
      }),
      h(ModelField, {
        label: t('vae'),
        hint: t('vaeHint'),
        value: draft.vae ?? '',
        options: models.vae,
        disabled,
        fallbackHint: t('modelFallback'),
        compatiblePattern: /^qwen_image|^qwen3vl/iu,
        t,
        onChange: (v) => { patch('vae', v)},
      }),
    // Qwen 的默认提示词
    h(Field, {
      label: t('positivePrompt'), hint: t('positivePromptHint'), type: 'textarea',
      value: draft.qwenPositive ?? '', disabled,
      onChange: (v) => patch('qwenPositive', v),
    }),
    h(Field, {
      label: t('negativePrompt'), hint: t('negativePromptHint'), type: 'textarea',
      value: draft.qwenNegative ?? '', disabled,
      onChange: (v) => patch('qwenNegative', v),
    }),

    // Qwen-Image 自己的采样参数（和 SDXL 分开存，切换架构互不影响）
    h(Field, {
      label: t('steps'),
      hint: stepsHintText,
      type: 'number', narrow: true,
      value: draft.qwenSteps ?? 25, disabled,
      warn: qwenStepsWarn,
      warnText: qwenStepsWarnText || undefined,
      onChange: (v) => patch('qwenSteps', v),
    }),
    h(Field, {
      label: t('cfg'), hint: t('cfgHint'), type: 'number', narrow: true,
      value: draft.qwenCfg ?? 2.5, disabled,
      warn: qwenCfgWarn,
      warnText: qwenCfgWarnText || undefined,
      onChange: (v) => patch('qwenCfg', v),
    }),
    h(Field, {
      label: t('editDenoise'), hint: t('editDenoiseHint'), type: 'number', narrow: true,
      value: draft.qwenEditDenoise ?? 1, disabled,
      onChange: (v) => patch('qwenEditDenoise', v),
    }),
    h(Field, {
      label: t('maxRefImages'), hint: refLimitHintText, type: 'number', narrow: true,
      value: draft.maxRefImages ?? 2, invalid: refLimitTooHigh, disabled,
      onChange: (v) => patch('maxRefImages', v),
    }),

    ),

    h(Fold, {
      title: t('foldZImage'), sub: t('foldZImageHint'),
      open: openFolds.zimage === true, onToggle: () => toggleFold('zimage'), dirty: panelDirty('zimage'),
      warn: zPanelWarn,
    },
    modelsStale
      ? h('p', { className: 'qwd-hint', style: { margin: '0 0 8px' } }, t('modelStale'))
      : null,
    h('div', { className: 'qwd-group-head' },
      h('button', {
        type: 'button', className: 'qwd-mini', disabled: disabled || refreshingModels,
        onClick: async () => {
          setRefreshingModels(true)
          try { await refreshModels() } finally { setRefreshingModels(false) }
        },
      }, refreshingModels ? t('reloading') : t('reload')),
    ),
    h('p', { className: 'qwd-hint', style: { margin: '0 0 10px' } }, t('zimageNote')),

    // 推荐模型表格：和 Qwen 面板同一套结构，只是数据换成 Z-Image 的三件套
    recommendedZImage
      ? h('div', { className: 'qwd-recommend' },
        h('div', { className: 'qwd-recommend-head' },
          h('span', null, t('recTitle')),
        ),
        h('table', { className: 'qwd-recommend-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, t('recColKind')),
              h('th', null, t('recColFile')),
              h('th', null, t('recColStatus')),
            ),
          ),
          h('tbody', null,
            ['unet', 'clip', 'vae'].map((kind) => {
              const rec = recommendedZImage[kind]
              if (!rec) return null
              const installed = (models[kind] ?? []).includes(rec.file)
              return h('tr', {
                key: kind,
                title: `${rec.label}\n放到 ${rec.dir}\n${rec.note}`,
              },
              h('td', { className: 'qwd-recommend-kind' }, t(kind)),
              h('td', { className: 'qwd-recommend-file' }, rec.file),
              h('td', null, h('span', {
                className: `qwd-recommend-tag${installed ? ' qwd-tag-ok' : ' qwd-tag-miss'}`,
              }, installed ? t('recInstalled') : t('recMissing'))),
              )
            }),
          ),
        ),
        h('p', { className: 'qwd-hint', style: { margin: '8px 0 0' } }, t('zimageRecHint')),
      )
      : null,

    h(ModelField, {
      label: t('unet'),
      hint: t('unetHint'),
      value: draft.zImageUnet ?? '',
      options: models.unet,
      disabled,
      fallbackHint: t('modelFallback'),
      compatiblePattern: /^z_image|^zimage/iu,
      t,
      onChange: (v) => { switchMainModel('zImageUnet', v, 'zimage')},
    }),
    h(ModelField, {
      label: t('clip'),
      hint: t('clipHint'),
      value: draft.zImageClip ?? '',
      options: models.clip,
      disabled,
      fallbackHint: t('modelFallback'),
      compatiblePattern: /^qwen_3_4b/iu,
      t,
      onChange: (v) => { patch('zImageClip', v)},
    }),
    h(ModelField, {
      label: t('vae'),
      hint: t('vaeHint'),
      value: draft.zImageVae ?? '',
      options: models.vae,
      disabled,
      fallbackHint: t('modelFallback'),
      compatiblePattern: /^ae\.safetensors$/iu,
      t,
      onChange: (v) => { patch('zImageVae', v)},
    }),

    h(Field, {
      label: t('positivePrompt'), hint: t('zimagePositiveHint'), type: 'textarea',
      value: draft.zImagePositive ?? '', disabled,
      onChange: (v) => patch('zImagePositive', v),
    }),
    h(Field, {
      label: t('negativePrompt'), hint: t('negativePromptHint'), type: 'textarea',
      value: draft.zImageNegative ?? '', disabled,
      onChange: (v) => patch('zImageNegative', v),
    }),

    h(Field, {
      label: t('steps'),
      hint: t('zimageStepsHint'),
      type: 'number', narrow: true,
      value: draft.zImageSteps ?? 8, disabled,
      warn: zStepsWarn,
      warnText: zStepsWarnText || undefined,
      onChange: (v) => patch('zImageSteps', v),
    }),
    h(Field, {
      label: t('cfg'), hint: t('zimageCfgHint'), type: 'number', narrow: true,
      value: draft.zImageCfg ?? 1, disabled,
      warn: zCfgWarn,
      warnText: zCfgWarnText || undefined,
      onChange: (v) => patch('zImageCfg', v),
    }),
    h(Field, {
      label: t('editDenoise'), hint: t('zimageEditDenoiseHint'), type: 'number', narrow: true,
      value: draft.zImageEditDenoise ?? 0.6, disabled,
      onChange: (v) => patch('zImageEditDenoise', v),
    }),

    ),

    h(Fold, {
      title: t('foldAppearance'), sub: t('foldAppearanceHint'),
      open: openFolds.appearance === true, onToggle: () => toggleFold('appearance'), dirty: panelDirty('appearance'),
    },
    h(Switch, {
      label: t('showStatusSeat'), hint: t('showStatusSeatHint'),
      checked: draft.showStatusSeat !== false, disabled,
      onChange: (v) => { patch('showStatusSeat', v)},
    }),
    ),

    // 全局保存：所有字段先改 draft，点这里才真正写盘
    h('div', { className: 'qwd-savebar' },
      h('button', {
        type: 'button',
        className: 'qwd-save-btn'
          + (dirtyFields.length > 0 ? ' qwd-save-dirty' : '')
          // 有预警（参数越界或模型不兼容）就转黄，点击会先确认一次
          + ((hasIncompatible || hasParamWarn) ? ' qwd-save-warn' : '')
          // 待确认态：整块黄底，和「确定恢复」的整块红底对应
          + (saveArmed ? ' qwd-save-armed' : ''),
        disabled: disabled || saving || dirtyFields.length === 0,
        onClick: requestSave,
      }, saving ? t('saving') : (saveArmed ? t('saveConfirm') : t('saveSettings'))),

      h('button', {
        type: 'button',
        className: resetArmed ? 'qwd-reset-btn qwd-reset-armed' : 'qwd-reset-btn',
        disabled: disabled || saving,
        onClick: () => { requestReset() },
      }, resetArmed ? t('resetConfirm') : t('resetDefault')),
      hasIncompatible
        ? h('span', { className: 'qwd-save-hint qwd-save-hint-warn' },
          t('incompatibleCount').replace('{n}', String(incompatibleFields.length)))
        : hasParamWarn
          ? h('span', { className: 'qwd-save-hint qwd-save-hint-warn' },
            t('paramWarnCount').replace('{n}', String(paramWarnings.length)))
          : null,
      dirtyFields.length > 0
        ? h('span', { className: 'qwd-save-hint' }, t('unsavedCount').replace('{n}', String(dirtyFields.length)))
        : null,
      // 出图进行中：提醒改动要等这一轮跑完才生效
      comfyBusy
        ? h('span', { className: 'qwd-save-hint qwd-save-hint-busy' }, t('saveWhileBusy'))
        : null,
    ),

    // 最下方的预警清单：统一黄色，用标签区分「不兼容」和「预警」
    (hasIncompatible || hasParamWarn)
      ? h('div', { className: 'qwd-warn-list' },
        hasIncompatible
          ? h('div', { className: 'qwd-warn-row qwd-warn-row-warn' },
            h('span', { className: 'qwd-warn-tag' }, t('warnTagBad')),
            h('span', null, t('incompatibleSummary').replace('{n}', String(incompatibleFields.length))))
          : null,
        paramWarnings.map((line, index) => h('div', {
          key: `pw${index}`,
          className: 'qwd-warn-row qwd-warn-row-warn',
        },
        h('span', { className: 'qwd-warn-tag' }, t('warnTagWarn')),
        h('span', null, line),
        )),
      )
      : null,

    h('div', { className: bad ? 'qwd-status qwd-status-bad' : 'qwd-status qwd-status-ok', role: 'status' }, message),
  )
}

/* 每个折叠面板负责的字段：用于判断「这一栏有没有未保存改动」 */
const PANEL_FIELDS = {
  basic: ['autoStart'],
  params: ['arch', 'size', 'outputDir', 'autoRetry', 'selfCheck', 'selfCheckProvider', 'selfCheckModel'],
  qwen: ['unet', 'clip', 'vae', 'qwenPositive', 'qwenNegative', 'qwenSteps', 'qwenCfg', 'qwenEditDenoise', 'maxRefImages'],
  sdxl: ['checkpoint', 'sdxlPositive', 'sdxlNegative', 'sdxlSteps', 'sdxlCfg', 'sdxlEditDenoise', 'sdxlLoras'],
  zimage: ['zImageUnet', 'zImageClip', 'zImageVae', 'zImagePositive', 'zImageNegative', 'zImageSteps', 'zImageCfg', 'zImageEditDenoise'],
  appearance: ['showStatusSeat'],
}

const SEAT_STYLE = `
.qwd-seat {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  /* 固定最小宽度：待确认时文案会换，宽度一变胶囊就会左右抽动。
 96px 能装下「终止进程？」这类短文案，切换时宽度保持不变。 */
  /* 固定宽度，按最长的「端口被占用 · 点击释放」量出来是 150px。
 这样切换状态时胶囊不会忽宽忽窄，对话框右侧那块不会跟着抖。
 出图中和准备中的文字长度会变（步数、秒数），单独给它 width: auto。 */
  box-sizing: border-box;
  width: 150px;
  height: 26px; padding: 0 9px; border-radius: 7px;
  /* 11.5px：Z-Image 满步数「Z-Image 出图中 12/12」在 12px 下量到 150.8px，
 刚好超一点点；缩半号之后能装进 150px，其它状态也更从容 */
  font-size: 11.5px; line-height: 1; white-space: nowrap;
  color: var(--dsw-alias-text-secondary, #8b8f96);
  background: rgba(128, 128, 128, .10);
  /* 边框取自 --qwd-seat-dot：灯是什么颜色，边框就是同色的半透明版。
 不支持 color-mix 的内核会保留上一行的灰边框。 */
  border: 1.5px solid rgba(128, 128, 128, .18);
  border-color: color-mix(in srgb, var(--qwd-seat-dot, #808080) 45%, transparent);
  cursor: pointer; user-select: none;
  /* 状态切换时底色 / 边框 / 文字一起淡入，不是硬切 */
  transition: background .25s ease, border-color .25s ease, color .25s ease;
}
/* 悬停：底色用状态灯的同色系微微加深，边框同时提亮。
   和「保存设置」按钮 hover 时填充变实是同一种手感——只加一点，不抢眼。 */
.qwd-seat:hover {
  background: color-mix(in srgb, var(--qwd-seat-dot, #808080) 16%, transparent);
  border-color: color-mix(in srgb, var(--qwd-seat-dot, #808080) 75%, transparent);
}
/* 不支持 color-mix 的内核：退回中性灰，同样只是微微加深 */
@supports not (background: color-mix(in srgb, red 50%, transparent)) {
  .qwd-seat:hover { background: rgba(128, 128, 128, .18); }
}
.qwd-seat-dot {
  /* 圆角方形的小方块，和胶囊的圆角语言一致；6px 的正圆在屏幕上其实也分不出来 */
  width: 6px; height: 6px; border-radius: 2px; flex: none;
  background: var(--qwd-seat-dot, #9aa0a6);
}
/* 待确认态：原标签继续占位（隐身），「终止进程？」绝对定位盖在它正中间。
   绝对定位不参与布局，所以既不撑宽也不改变行高；配合胶囊的 min-width，
   切换时宽高都不动。 */
.qwd-seat-stack {
  position: relative;
  display: inline-block;
}
.qwd-seat-stack-keep { visibility: hidden; }
.qwd-seat-stack-over {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
/* 设置页顶部那颗：和右侧「选择 ComfyUI 路径」按钮同高（26px），
   两个控件并排时不会一高一矮。宽度仍统一 150px，装得下最长文案。 */
.qwd-seat-panel { width: 150px; height: 26px; padding: 0 10px; border-radius: 7px; font-size: 11.5px; gap: 6px; }
/* 填充模式：整颗胶囊从左往右被进度填满，内容压在填充层之上 */
.qwd-seat-fill { position: relative; overflow: hidden; }
.qwd-seat-fill::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: var(--qwd-fill, 0%);
  /* 和「出图中」的状态色 #e0b054 同系，半透明铺底 */
  background: rgba(224, 176, 84, .32);
  transition: width 450ms cubic-bezier(.22, 1, .36, 1);
  pointer-events: none;
}
.qwd-seat-fill > * { position: relative; z-index: 1; }
/* 状态色只在这里定义一次：灯用纯色，边框用同色半透明，两者不会脱节。
   下面五个状态都是灯和文字一起上色，文字不再留在默认灰上——
   否则「准备中 3s」「出图中 4/10」这种正在干活的胶囊会和灯色对不上。
   检测中（unknown）本来就是中性灰，文字也用同色，读起来更统一。 */
.qwd-seat-on { --qwd-seat-dot: #4ea36b; color: #4ea36b; }
.qwd-seat-busy { --qwd-seat-dot: #e0b054; color: #e0b054; }
.qwd-seat-starting { --qwd-seat-dot: #4a7bd0; color: #4a7bd0; }
.qwd-seat-off { --qwd-seat-dot: #cf6a5f; color: #cf6a5f; }
.qwd-seat-unknown { --qwd-seat-dot: #9aa0a6; color: #9aa0a6; }
/* 待确认态：整块红底 + 白字，和「确定恢复」的确定态一致。
   灯也转白，边框跟灯走（边框颜色统一由 --qwd-seat-dot 派生）。 */
.qwd-seat-stop-confirm {
  /* 边框和灯的基色仍是红：hover 时边框由 --qwd-seat-dot 派生，
 一旦设成白色，鼠标放上去就会变成白框。 */
  --qwd-seat-dot: #e05a50;
  /* 半透明暗红填充：能透出胶囊原本的灰底，边框仍然清晰、
 而且边框比填充亮一档，整块看着像「描红填色」而不是实心块。 */
  background: rgba(176, 82, 74, .42);
  border-color: rgba(224, 90, 80, .95);
  /* 文字用状态红的亮版，不是纯白 */
  color: #ffb8ad;
}
/* 胶囊的通用 hover 会把边框拉到 75% 透明度，对确认态来说反而更淡。
   这里单独给一条更亮的，保持「鼠标放上去边框更明显」的一致手感。 */
.qwd-seat-stop-confirm:hover { border-color: rgba(245, 132, 122, .98); }
/* 出图中点胶囊时胶囊带进度填充层，待确认态要让位给整块红底 */
.qwd-seat-stop-confirm::before { display: none; }
/* 全插件的警告色只有一种：#e0b054。
   配置待优化、端口被占用、出图中、准备中，以及设置页里所有预警文字，
   用的是同一个黄；出图的进度填充也取它的半透明版。 */
.qwd-seat-zombie { --qwd-seat-dot: #e0b054; color: #e0b054; }
.qwd-seat-checking { --qwd-seat-dot: #8b6fd0; color: #a08fe0; }
/* 「配置待优化」不再单独铺黄色底：胶囊里唯一该有填充的是出图进度条，
   否则用户分不清这层底色是进度还是状态。状态靠灯色 / 文字色 / 边框色表达。 */
.qwd-seat-param-warn { --qwd-seat-dot: #e0b054; color: #e0b054; }
/* 需要呼吸的状态：颜色来自变量，这里只管动画 */
.qwd-seat-busy .qwd-seat-dot,
.qwd-seat-starting .qwd-seat-dot,
.qwd-seat-zombie .qwd-seat-dot,
.qwd-seat-checking .qwd-seat-dot,
.qwd-seat-param-warn .qwd-seat-dot { animation: qwd-seat-pulse 1.2s ease-in-out infinite; }
/* 配置待优化：和「有未保存改动」同样的整圈外框效果，颜色换成黄 */
.qwd-fold-param-warn {
  border-color: rgba(224, 176, 84, .62) !important;
  box-shadow: 0 0 0 1px rgba(224, 176, 84, .22);
}
.qwd-fold-param-warn > .qwd-fold-head .qwd-fold-title { color: #e0b054; }
.qwd-fold-param-warn > .qwd-fold-head .qwd-fold-arrow { color: #e0b054; }
/* 两种提示同时存在时让黄色盖过蓝色：配置要改比「还没保存」更该被看见 */
.qwd-fold-param-warn.qwd-fold-dirty {
  border-color: rgba(224, 176, 84, .68) !important;
  box-shadow: 0 0 0 1px rgba(224, 176, 84, .24);
}
/* 出问题的输入框：黄色描边 + 淡黄底（区别于红色错误态的 qwd-input-invalid） */
.qwd-input-warn,
.qwd-input-warn:focus {
  border-color: rgba(224, 176, 84, .7) !important;
  background: rgba(224, 176, 84, .07) !important;
}
@keyframes qwd-seat-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
`

/** 输入框右侧 / 设置页顶部的 ComfyUI 状态座：点击可拉起、终止、修复。
 * variant='panel' 时放大一号并附带版本与地址，用于设置页。 */
/**
 * ComfyUI 状态轮询 + 启停操作，供状态胶囊和设置页控制条共用。
 * 只负责「状态」和「动作」，二次确认这类交互留在各自的组件里。
 */
function useComfyControl() {
  const [state, setState] = React.useState('unknown')
  const [meta, setMeta] = React.useState({
    progress: null, busySince: null, lastError: '', version: '', endpoint: '', archLabel: '',
    paramIssues: [], comfy: null, online: false, busy: false,
  })
  const [zombie, setZombie] = React.useState(null)
  const [working, setWorking] = React.useState(false)
  const [, forceTick] = React.useReducer((x) => x + 1, 0)
  const inflight = React.useRef(false)

  const check = React.useCallback(async () => {
    if (inflight.current) return null
    inflight.current = true
    try {
      const res = await fetch(API_STATUS, { cache: 'no-store' })
      const data = await res.json()
      const next = !data?.online
        ? (data?.starting ? 'starting' : 'off')
        : (data?.busy ? 'busy' : (data?.checking ? 'checking' : 'on'))
      setState(next)
      setMeta({
        progress: data?.progress ?? null,
        busySince: data?.busySince ?? null,
        lastError: typeof data?.lastError === 'string' ? data.lastError : '',
        version: typeof data?.version === 'string' ? data.version : '',
        // ComfyUI 地址与在线状态：顶部状态栏第二行要用
        endpoint: typeof data?.endpoint === 'string' ? data.endpoint : '',
        online: data?.online === true,
        // ComfyUI 队列里有没有任务：设置页保存时要提示「改动等出图结束再生效」
      busy: data?.busy === true,
      // 正在跑的架构短名（Qwen / SDXL），状态座显示「Qwen 出图中 4/10」
        archLabel: typeof data?.archLabel === 'string' ? data.archLabel : '',
        // 配置待优化项：非空就让状态座变黄并提示
        paramIssues: Array.isArray(data?.paramIssues) ? data.paramIssues.filter((x) => typeof x === 'string') : [],
        // 自动探测到的 ComfyUI 安装位置，设置页顶部状态栏显示
        comfy: data?.comfy && typeof data.comfy === 'object'
          ? {
            workdir: typeof data.comfy.workdir === 'string' ? data.comfy.workdir : '',
            mainPy: typeof data.comfy.mainPy === 'string' ? data.comfy.mainPy : '',
            python: typeof data.comfy.python === 'string' ? data.comfy.python : '',
            modelsDir: typeof data.comfy.modelsDir === 'string' ? data.comfy.modelsDir : '',
            // 这个目录里到底有没有 ComfyUI：状态栏据此区分「等待启动」和「请重新选择」
            valid: data.comfy.valid === true,
          }
          : null,
      })
      return next
    } catch {
      setState('off')
      setMeta((prev) => ({ ...prev, progress: null, busySince: null }))
      return 'off'
    } finally {
      inflight.current = false
    }
  }, [])

  const launch = React.useCallback(async (force) => {
    setWorking(true)
    setMeta((prev) => ({ ...prev, lastError: '' }))
    try {
      const init = force
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force: true }) }
        : { method: 'POST' }
      const res = await fetch(API_LAUNCH, init)
      const data = await res.json().catch(() => null)
      if (data?.zombie) {
        // 端口被非 ComfyUI 进程占着：记下来，UI 上切成需要二次确认的强制重启
        setZombie({ pid: data.pid, processName: data.processName })
        setMeta((prev) => ({ ...prev, lastError: data.error ?? '' }))
        return
      }
      if (data && data.ok !== true) {
        setMeta((prev) => ({ ...prev, lastError: data?.error ?? '启动失败' }))
        return
      }
      setZombie(null)
    } catch (error) {
      setMeta((prev) => ({ ...prev, lastError: error?.message ?? '启动失败' }))
    } finally {
      setWorking(false)
    }
  }, [])

  const stop = React.useCallback(async () => {
    setWorking(true)
    setMeta((prev) => ({ ...prev, lastError: '' }))
    try {
      const res = await fetch(API_STOP, { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (data && data.ok !== true) {
        setMeta((prev) => ({ ...prev, lastError: data?.error ?? '终止失败' }))
      }
    } catch (error) {
      setMeta((prev) => ({ ...prev, lastError: error?.message ?? '终止失败' }))
    } finally {
      setWorking(false)
    }
  }, [])

  // 轮询：出图 / 启动 / 操作进行中 2 秒一轮，空闲 6 秒一轮省请求
  React.useEffect(() => {
    let stopped = false
    let timer = null
    const loop = async () => {
      if (stopped) return
      const next = await check()
      if (stopped) return
      const fast = next === 'busy' || next === 'starting' || next === 'checking' || working
      timer = window.setTimeout(loop, fast ? 2000 : 6000)
    }
    void loop()
    return () => { stopped = true; if (timer !== null) window.clearTimeout(timer) }
  }, [check, working])

  // 出图期间每秒重渲染一次，让「准备中 3s」「出图中 32s」的秒数在走
  React.useEffect(() => {
    if (state !== 'busy') return undefined
    const timer = window.setInterval(() => forceTick(), 1000)
    return () => window.clearInterval(timer)
  }, [state])

  return { state, meta, zombie, working, check, launch, stop }
}

function ComfyStatusSeat(props) {
  const t = props.t
  const variant = props.variant === 'panel' ? 'panel' : 'seat'
  const { state, meta, zombie, check, launch, stop } = useComfyControl()
  // 终止改成两步确认：第一次点把文字换成「终止进程？」并开始 5 秒倒计时，
  // 再点一次才真的终止。和设置页的「保存 / 恢复默认」保持同一套交互。
  const [confirming, setConfirming] = React.useState(false)
  const confirmTimer = React.useRef(null)
  // 是否显示状态胶囊由「外观设置 → 对话框显示 ComfyUI 状态」决定
  const [seatEnabled, setSeatEnabled] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    fetch(API_CONFIG, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (alive && data?.config) setSeatEnabled(data.config.showStatusSeat !== false)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // 卸载时清掉确认计时器，避免对已移除的组件 setState
  React.useEffect(() => () => {
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current)
  }, [])

  let label
  let fillPercent = null
  // 配置待优化：非空就变黄。出图中 / 启动中优先显示进程状态，
  // 其余情况（就绪、离线）都让位给「配置待优化」，否则用户根本注意不到。
  const paramIssues = Array.isArray(meta.paramIssues) ? meta.paramIssues : []
  const paramWarn = paramIssues.length > 0
  // 离线（含僵尸态）：胶囊的作用是「启动」；在线/出图中才是「终止」
  const offline = state === 'off' || state === 'unknown'
  // 待确认态只在「非离线」时成立：离线点胶囊是启动，没有可终止的进程。
  // 必须在下面算 label 之前定义——const 有暂时性死区，先用后定义会让整个
  // 组件抛 ReferenceError 直接不渲染。
  const confirmingActive = confirming && !offline

  if (confirmingActive) {
    label = t('seatConfirmStop')
  } else if (state === 'busy') {
    const p = meta.progress
    const hasSteps = p && typeof p.value === 'number' && typeof p.max === 'number' && p.max > 0
    if (hasSteps) {
      // 固定表现：整颗胶囊从左到右被进度填满，文字显示步数便于读值
      fillPercent = Math.min(100, Math.max(0, (p.value / p.max) * 100))
      label = `${t('seatBusy')} ${p.value}/${p.max}`
    } else if (typeof meta.busySince === 'number') {
      // 队列已接管但采样进度还没来（模型加载/编码阶段）。保留秒数：
      // 准备阶段偶尔会卡死，能看到已经等了多久才好判断。
      const seconds = Math.max(0, Math.round((Date.now() - meta.busySince) / 1000))
      label = `${t('seatPreparing')} ${seconds}s`
    } else {
      label = `${t('seatBusy')}…`
    }
  } else if (zombie) {
    label = t('seatZombie')
  } else if (paramWarn && state !== 'starting') {
    // 配置该调了就提示，跟 ComfyUI 在不在线无关——
    // 离线时用户更需要知道「就算启动了，这组参数也出不好图」。
    // 只有「启动中」让位：那个过程是暂时的，且用户需要看到进度。
    label = t('seatParamWarn')
  } else {
    label = state === 'on' ? t('seatOnline')
      : state === 'starting' ? t('seatStarting')
        : state === 'checking' ? t('seatChecking')
          : state === 'off' ? t('seatOffline') : t('seatUnknown')
  }

  // 圆点在前、文字在后（「● 出图中 4/10」）
  // 出图时把架构短名放在最前（「Qwen 出图中 4/10」）：状态座描述的是正在跑什么
  if (state === 'busy' && typeof meta.archLabel === 'string' && meta.archLabel !== '') {
    label = `${meta.archLabel} ${label}`
  }


  // 确认态：把「原标签」和「终止进程」叠在同一个网格单元里。
  // 容器宽度取两者较大值，所以从正常态切到待确认态时胶囊不会变宽或变窄——
  // 原标签继续占位（隐身），确认文字盖在上面。
  const labelNode = confirmingActive
    ? h('span', { key: 'label', className: 'qwd-seat-stack' }, [
      h('span', { key: 'keep', className: 'qwd-seat-stack-keep' }, label),
      h('span', { key: 'over', className: 'qwd-seat-stack-over' }, t('seatConfirmStop')),
    ])
    : h('span', { key: 'label' }, label)
  const body = [h('span', { key: 'dot', className: 'qwd-seat-dot', 'aria-hidden': true }), labelNode]

  // 填充模式：把进度百分比交给 CSS 变量，由 ::before 铺底色
  const fillActive = fillPercent !== null
  const fillStyle = fillActive ? { '--qwd-fill': `${fillPercent}%` } : undefined

  // 离线点胶囊 = 启动（含清僵尸）；在线/出图中点两次 = 终止。标题跟着动作走。
  const title = confirmingActive
    ? t('seatTitleConfirm')
    : offline
      ? (meta.lastError === '' ? t('seatTitleLaunch') : `${t('seatTitleLaunch')}\n${meta.lastError}`)
      : (meta.lastError === '' ? t('seatTitleStop') : `${t('seatTitleStop')}\n${meta.lastError}`)

  const stopComfy = async () => {
    setConfirming(false)
    await stop()
    void check()
  }

  /**
   * 离线（含僵尸态）点胶囊 = 启动 ComfyUI，一次点击即可。
   *   Host 会先探 15 秒判断是「正在启动」还是「卡死的僵尸」，是僵尸就清掉
   *   再拉起，所以不用额外确认。
   *
   * 在线 / 出图中要终止 ComfyUI 得点两次：第一次只换文字并开始 5 秒倒计时，
   * 再点一次才真的终止，避免误触把正在跑的任务关掉。
   */
  const handleClick = async () => {
    if (offline) {
      await launch(false)
      void check()
      return
    }
    if (!confirming) {
      setConfirming(true)
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current)
      confirmTimer.current = window.setTimeout(() => {
        setConfirming(false)
        confirmTimer.current = null
      }, 3000)
      return
    }
    await stopComfy()
  }

  // 设置里关掉了状态胶囊就整个不渲染（设置页顶部控制条仍可用）
  if (!seatEnabled) return null

  const visualState = confirmingActive ? 'stop-confirm' : (zombie ? 'zombie' : state)
  // 配置待优化：整颗胶囊变黄。启动中/僵尸态/终止确认态不抢，其余一律标黄，
  // 包括离线——离线时更该知道这组参数有问题。
  const showParamWarn = paramWarn && state !== 'starting' && !zombie && !confirmingActive
  const className = `qwd-seat qwd-seat-${visualState}`
    + (variant === 'panel' ? ' qwd-seat-panel' : '')
    + (fillActive ? ' qwd-seat-fill' : '')
    + (showParamWarn ? ' qwd-seat-param-warn' : '')

  return h('span', {
    className,
    style: fillStyle,
    role: 'status',
    title,
    onClick: () => { void handleClick() },
  },
  h('style', null, SEAT_STYLE),
  body,
  )
}

/**
 * 设置页顶部的 ComfyUI 控制条：左边标题、中间版本和地址、右边直接复用
 * 对话框那个状态胶囊。启停都由胶囊负责，这里不再重复放按钮——
 * 两处的交互（离线点一下启动、在线点两次终止）保持完全一致。
 */
/**
 * 快速出图：不经过对话，直接在这个面板里贴提示词出图。
 *
 * 走的是和对话工具同一条链路（POST /api/easy-paint/draw → generateImage），
 * 所以并发锁、自动拉起 ComfyUI、状态座进度、存到桌面 Easy Paint 全都一致。
 * 唯一的区别：提示词只活在这个组件的 state 里，不写配置、不进 locale。
 */
/**
 * 目录树：让用户自己找到 ComfyUI 安装目录。
 *
 * 不用系统文件夹对话框——那要后端另起一个进程，而且会被 DSH 的攻击面
 * 检查拦下。全部走 /api/easy-paint/browse 逐层列子目录：
 *   path 为空 → 列出盘符；给路径 → 列出直接子目录。
 * ComfyUI 目录（含 main.py + comfy/custom_nodes 之类）会被后端标出来，
 * 这里排到最前、染成绿色，用户一眼能点到。
 */
function DirPicker(props) {
  const t = props.t
  const current = props.current ?? ''
  const onPick = props.onPick
  const onClose = props.onClose
  const [path, setPath] = React.useState('')
  const [parent, setParent] = React.useState('')
  const [dirs, setDirs] = React.useState([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  // 用户点中的目录（还没确认）
  const [selected, setSelected] = React.useState('')
  // 选中目录后自动探测的结果：{ state: 'idle'|'scanning'|'found'|'none', found: [], info }
  const [probe, setProbe] = React.useState({ state: 'idle', found: [], info: '' })
  // 点了「用这个目录」之后的连接中状态
  const [confirming, setConfirming] = React.useState(false)
  // 渐隐中：先把动画播完，再真正卸载
  const [closing, setClosing] = React.useState(false)
  const closeTimer = React.useRef(null)
  React.useEffect(() => () => { if (closeTimer.current !== null) window.clearTimeout(closeTimer.current) }, [])

  /**
   * 关闭要先播完渐隐动画。
   * 直接调 onClose 会让 React 立刻卸载节点，动画根本没机会跑。
   */
  const beginClose = React.useCallback((after) => {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null
      if (after) after()
      onClose()
    }, 160)
  }, [closing, onClose])
  const alive = React.useRef(true)
  React.useEffect(() => () => { alive.current = false }, [])

  /**
   * 点目录 = 只选中 + 探一下这里有没有 ComfyUI，仅此而已。
   * 不写配置、不关面板、不连 ComfyUI——那些都等用户点「用这个目录」。
   * 探测结果只是给用户看的提示，帮他判断这个目录选得对不对。
   */
  const probeDir = React.useCallback(async (dir) => {
    setSelected(dir)
    setProbe({ state: 'scanning', found: [], info: '' })
    try {
      const res = await fetch(API_DETECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root: dir, shallow: true }),
      })
      const data = await res.json().catch(() => null)
      if (!alive.current) return
      const found = Array.isArray(data?.candidates) ? data.candidates : []
      if (found.length === 0) {
        setProbe({ state: 'none', found: [], info: '' })
        return
      }
      // 记下探测到的安装目录，点「用这个目录」时直接用它
      setProbe({ state: 'found', found, info: found.length === 1 ? found[0].workdir : '' })
    } catch (err) {
      if (alive.current) setProbe({ state: 'none', found: [], info: '' })
    }
  }, [])

  /**
   * 用户点了「用这个目录」：这才真正写配置、关面板、连 ComfyUI。
   * candidate 可以是从探测结果来的完整安装信息，也可以是用户手选的目录。
   */
  const confirmPick = React.useCallback(async (candidate) => {
    setConfirming(true)
    try {
      // 先把路径写进配置，期间按钮显示「连接中…」
      await props.onAutoPick(candidate)
    } finally {
      if (alive.current) setConfirming(false)
    }
    // 写完了再播渐隐，然后卸载
    beginClose()
  }, [beginClose])

  /**
   * 切换目录。
   *
   * 这里刻意不在开头 setDirs([])：一清空列表就会闪一下「读取中…」再填回来。
   * 改成保留旧列表 + 半透明遮罩，等新数据回来一次性替换。
   * loading 只用于首次加载/首次切目录（列表还是空的）时占位。
   */
  const load = React.useCallback(async (target) => {
    setLoading(true)
    setError('')
    setSelected('')
    setProbe({ state: 'idle', found: [], info: '' })
    try {
      const res = await fetch(API_BROWSE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: target }),
      })
      const data = await res.json().catch(() => null)
      if (data?.ok !== true) throw new Error(data?.error ?? `HTTP ${res.status}`)
      if (!alive.current) return
      // 一次性替换列表（不先清空），复用已有 DOM 就不会闪
      setPath(data.path ?? '')
      setParent(data.parent ?? '')
      setDirs(Array.isArray(data.dirs) ? data.dirs : [])
    } catch (err) {
      if (alive.current) {
        setError(err?.message ?? '')
        setDirs([])
      }
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [])

  // 打开时的起始目录：
  //   已配置 → 从那个目录起步（方便原地改）
  //   没配置 → 固定从 C 盘根开始。
  //     不能用「盘符列表」当起点：用户第一次打开看到一堆盘符不知道点哪，
  //     也不该默认落在任何具体路径上（那是开发机的目录，用户机器上没有）。
  React.useEffect(() => {
    void load(current !== '' ? current : 'C:\\')
    // 只在挂载时跑一次
  }, [])

  const crumbs = []
  if (path !== '') {
    // Windows 盘符路径：C:\a\b → [C:] [a] [b]
    const parts = path.split(/[\\/]+/u).filter((x) => x !== '')
    let acc = ''
    for (const part of parts) {
      acc = acc === '' ? `${part}\\` : `${acc}${part}`
      crumbs.push({ label: part, path: acc })
      acc = `${acc}\\`
    }
  }

  return h('div', {
    className: 'qwd-picker-mask' + (closing ? ' qwd-picker-out' : ''),
    // 点遮罩空白处 = 取消，同样要播完渐隐
    onClick: () => beginClose(),
  },
    h('div', {
      className: 'qwd-picker',
      onClick: (event) => event.stopPropagation(),
    },
      h('div', { className: 'qwd-picker-head' },
        h('span', { className: 'qwd-picker-title' }, t('pickerTitle')),
        h('button', {
          type: 'button', className: 'qwd-picker-close', title: t('pickerCancel'),
          onClick: () => beginClose(),
        }, '×'),
      ),

      // 面包屑：点哪一级跳哪一级
      h('div', { className: 'qwd-picker-crumbs' },
        h('button', {
          type: 'button', className: 'qwd-crumb',
          onClick: () => { void load('') },
        }, t('pickerRoot')),
        crumbs.map((crumb) => h('button', {
          key: crumb.path,
          type: 'button',
          className: 'qwd-crumb',
          onClick: () => { void load(crumb.path) },
        }, crumb.label)),
      ),

      h('div', { className: 'qwd-picker-list' + (loading && dirs.length > 0 ? ' qwd-picker-loading' : '') },
        loading && dirs.length === 0
          ? h('div', { className: 'qwd-picker-empty' }, t('pickerLoading'))
          : error !== ''
            ? h('div', { className: 'qwd-picker-empty qwd-picker-err' }, error)
            : dirs.length === 0
              ? h('div', { className: 'qwd-picker-empty' }, t('pickerEmpty'))
              : dirs.map((item) => h('button', {
                key: item.path,
                type: 'button',
                className: 'qwd-dir-row'
                  + (item.isComfy ? ' qwd-dir-comfy' : '')
                  + (selected === item.path ? ' qwd-dir-selected' : ''),
                title: item.path,
                onClick: () => { void probeDir(item.path) },
                onDoubleClick: () => { void load(item.path) },
              },
              h('span', { className: 'qwd-dir-icon' }, item.isComfy ? '★' : '▸'),
              h('span', { className: 'qwd-dir-name' }, item.name),
              item.isComfy
                ? h('span', { className: 'qwd-dir-tag' }, t('pickerComfyTag'))
                : null,
              )),
      ),

      // 自动探测结果：点了目录立刻告诉用户这里有没有 ComfyUI（仅提示，不写入）
      probe.state !== 'idle'
        ? h('div', {
          className: 'qwd-probe'
            + (probe.state === 'found' ? ' qwd-probe-ok' : '')
            + (probe.state === 'none' ? ' qwd-probe-none' : ''),
        },
        probe.state === 'scanning'
          ? t('pickerScanning')
          : probe.state === 'found'
            ? (probe.info !== ''
              ? `${t('pickerProbeFound')}　${t('pickerProbeHint')}`
              : t('pickerProbeMulti').replace('{n}', String(probe.found.length)))
            : `${t('pickerProbeNone')}　${t('pickerProbeHint')}`,
        )
        : null,

      // 多个候选时列出来给用户点
      probe.state === 'found' && probe.found.length > 1
        ? h('div', { className: 'qwd-probe-list' },
          probe.found.map((c) => h('button', {
            key: c.workdir,
            type: 'button',
            className: 'qwd-probe-item' + (selected === c.workdir ? ' qwd-probe-item-on' : ''),
            title: c.workdir,
            onClick: () => {
              // 点候选只是选中它，仍然要按「用这个目录」才生效
              setSelected(c.workdir)
              setProbe({ state: 'found', found: probe.found, info: c.workdir })
            },
          }, c.workdir)))
        : null,

      h('div', { className: 'qwd-picker-foot' },
        h('div', { className: 'qwd-picker-sel', title: selected || path },
          selected !== '' ? selected : (path === '' ? t('pickerNoPick') : path)),
        h('button', {
          type: 'button', className: 'qwd-confirm-btn',
          onClick: () => { void load(parent) },
          disabled: parent === '' || loading,
        }, t('pickerUp')),
        h('button', {
          type: 'button', className: 'qwd-confirm-btn qwd-confirm-accent',
          disabled: selected === '' || confirming,
          onClick: () => {
            if (selected === '') return
            // 选中目录里已经探到 ComfyUI 就直接用它，否则按选中的目录本身处理
            const hit = probe.state === 'found' ? probe.found[0] : null
            void confirmPick(hit ?? { workdir: selected, mainPy: joinLike(selected, 'main.py'), python: '' })
          },
        }, confirming ? t('pickerConnecting') : t('pickerConfirm')),
      ),
    ),
  )
}
/**
 * 快速出图的临时状态，故意放在模块级。
 *
 * 关掉插件界面（组件卸载）时 React 的 state 会没，用户再打开就看不到刚才的
 * 提示词和出好的图。放在模块作用域里就能跨卸载保留，DSH 重启才会清。
 * 不用 localStorage：提示词是临时内容，没必要落盘留痕。
 * 清空时机只有一个——用户点「打开所在文件夹」，表示这一张他收下了。
 */
let quickCache = { prompt: '', refs: '', busy: false, result: null, error: '' }

function QuickDraw(props) {
  const t = props.t
  const disabled = props.disabled === true
  const { state, meta } = useComfyControl()
  const [prompt, setPrompt] = React.useState(quickCache.prompt)
  const [refs, setRefs] = React.useState(quickCache.refs)
  const [busy, setBusy] = React.useState(quickCache.busy)
  const [result, setResult] = React.useState(quickCache.result)
  const [error, setError] = React.useState(quickCache.error)
  const alive = React.useRef(true)
  React.useEffect(() => () => { alive.current = false }, [])

  // 任何一项变化都同步回模块缓存，卸载时值已经写出去了
  React.useEffect(() => {
    quickCache.prompt = prompt
    quickCache.refs = refs
    quickCache.busy = busy
    quickCache.result = result
    quickCache.error = error
  }, [prompt, refs, busy, result, error])

  // 出图中途关掉设置页、再打开时：原来那次 fetch 还在跑，但它的 setState
  // 只对旧实例有效（旧实例的 alive 已经是 false），不会更新这个新实例的界面。
  // 这里轮询模块缓存，等它落定后再把结果同步进来，否则界面会一直卡在「出图中」。
  React.useEffect(() => {
    if (!quickCache.busy) return undefined
    const timer = window.setInterval(() => {
      if (quickCache.busy) return
      window.clearInterval(timer)
      if (!alive.current) return
      setBusy(false)
      setResult(quickCache.result)
      setError(quickCache.error)
    }, 500)
    return () => window.clearInterval(timer)
  }, [])

  const canSubmit = !busy && !disabled && prompt.trim() !== ''

  const submit = React.useCallback(async () => {
    if (busy || disabled) return
    const text = prompt.trim()
    if (text === '') {
      setError(t('quickEmptyPrompt'))
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    quickCache.busy = true
    quickCache.error = ''
    quickCache.result = null
    try {
      const payload = { prompt: text }
      const list = refs.split(/\r?\n/u).map((x) => x.trim()).filter((x) => x !== '')
      if (list.length > 0) payload.images = list
      const res = await fetch(API_DRAW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!data || data.ok !== true) throw new Error(data?.error ?? `HTTP ${res.status}`)
      // 先无条件写缓存：正在出图时关了界面，回来也要能看到这张结果
      quickCache.result = data
      quickCache.error = ''
      if (!alive.current) return
      // 提示词和参考图都留着，方便改一改再出一张；清空只发生在点「打开所在文件夹」时
      setResult(data)
    } catch (err) {
      const message = err?.message ?? t('quickFailed')
      quickCache.error = message
      if (alive.current) setError(message)
    } finally {
      quickCache.busy = false
      if (alive.current) setBusy(false)
    }
  }, [busy, disabled, prompt, refs, t])


  /** 左键点缩略图：打开所在文件夹并选中这张图，然后清掉预览（提示词和参考图留着）。 */
  const revealResult = React.useCallback(async (filePath) => {
    try {
      const res = await fetch(API_REVEAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath }),
      })
      const data = await res.json().catch(() => null)
      if (!data || data.ok !== true) throw new Error(data?.error ?? `HTTP ${res.status}`)
    } catch (err) {
      if (alive.current) setError(err?.message ?? t('quickRevealFailed'))
    }
  }, [t])

  /** 缩略图右上角的叉号：只清掉预览，不动磁盘上的文件、也不清提示词。 */
  const clearPreview = React.useCallback(() => {
    quickCache.result = null
    setResult(null)
    setError('')
  }, [])

  return h('div', { className: 'qwd-quick' },
    h('div', { className: 'qwd-field-column' },
      h('div', { className: 'qwd-label' }, t('quickPromptLabel')),
      h('textarea', {
        className: 'qwd-quick-prompt',
        rows: 3,
        placeholder: t('quickPromptPlaceholder'),
        value: prompt,
        disabled: disabled || busy,
        onChange: (event) => setPrompt(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            void submit()
          }
        },
      }),
    ),
    h('div', { className: 'qwd-field-column' },
      h('div', { className: 'qwd-label' }, t('quickRefsLabel')),
      h('textarea', {
        className: 'qwd-quick-refs',
        rows: 2,
        placeholder: t('quickRefsPlaceholder'),
        value: refs,
        disabled: disabled || busy,
        onChange: (event) => setRefs(event.target.value),
      }),
    ),
    h('div', { className: 'qwd-quick-actions' },
      h('button', {
        type: 'button',
        className: 'qwd-save-btn qwd-quick-btn',
        disabled: !canSubmit,
        onClick: () => { void submit() },
      }, busy ? t('quickDrawing') : t('quickDrawBtn')),
    ),
    error !== '' ? h('div', { className: 'qwd-quick-error' }, error) : null,
    result
      ? h('div', { className: 'qwd-quick-result' },
        h('div', { className: 'qwd-quick-thumb-wrap' },
          h('img', {
            className: 'qwd-quick-thumb',
            src: `${API_IMAGE}?path=${encodeURIComponent(result.path)}`,
            alt: '',
            title: t('quickThumbHint'),
            onClick: () => { void revealResult(result.path) },
          }),
          h('button', {
            type: 'button',
            className: 'qwd-quick-close',
            title: t('quickClosePreview'),
            onClick: () => { clearPreview() },
          }, '×'),
        ),
        h('div', { className: 'qwd-quick-meta' },
          h('div', { className: 'qwd-quick-done' }, t('quickResultTitle')),
          h('div', { className: 'qwd-hint' },
            `${result.width}×${result.height} · ${result.steps} 步 · CFG ${result.cfg} · ${result.seconds}s`),
          h('div', { className: 'qwd-quick-path', title: result.path }, result.path),
        ),
      )
      : null,

  )
}
function ComfyControlBar(props) {
  const t = props.t
  const { meta, check } = useComfyControl()
  const onPick = props.onPick
  const workdir = typeof meta.comfy?.workdir === 'string' ? meta.comfy.workdir : ''

  // 状态只占一行，统一灰色（和别的设置项说明同色）
  const online = meta.online === true
  const endpoint = typeof meta.endpoint === 'string' ? meta.endpoint : ''
  const version = typeof meta.version === 'string' ? meta.version : ''
  const verText = version !== '' ? `v${version}` : ''
  const metaText = [verText, endpoint].filter((x) => x !== '').join(' · ')

  // 状态只有一行，统一用灰色（和别的设置项说明同一个颜色）。四种情况：
  //   已启动                → 「版本号 · 地址」
  //   已设置但没启动          → 「已关联 ComfyUI，等待启动」
  //   设置了但目录里没 ComfyUI → 「请重新选择 ComfyUI 路径」
  //   完全没设置             → 「请选择 ComfyUI 路径」
  const pathValid = meta.comfy?.valid === true
  let statusText = ''
  let statusTitle = ''
  if (online) {
    statusText = metaText !== '' ? metaText : t('comfyOnline')
    statusTitle = workdir !== '' ? workdir : endpoint
  } else if (workdir !== '' && pathValid) {
    statusText = t('comfyLinked')
    statusTitle = workdir
  } else if (workdir !== '') {
    statusText = t('comfyInvalid')
    statusTitle = workdir
  } else {
    statusText = t('comfyNeedPick')
  }

  // 设置页写进新路径后会递增 refreshKey；变化了立刻重探一次，
  // 用户不用等下一个 6 秒轮询周期才看到路径更新。
  // 把「出图中」状态回传给设置页：保存时要提示改动何时生效
  const onBusyChange = props.onBusyChange
  React.useEffect(() => {
    if (typeof onBusyChange === 'function') onBusyChange(meta.busy === true)
  }, [meta.busy, onBusyChange])

  const refreshKey = props.refreshKey ?? 0
  const lastKey = React.useRef(refreshKey)
  const retryTimer = React.useRef(null)
  React.useEffect(() => () => {
    if (retryTimer.current !== null) window.clearTimeout(retryTimer.current)
  }, [])
  React.useEffect(() => {
    if (lastKey.current === refreshKey) return
    lastKey.current = refreshKey
    // check() 有并发保护：上一轮还没回来时直接返回 null。
    // 那种情况下改完配置立刻刷是刷不上的，所以拿到 null 就稍后再试一次，
    // 保证「配置待优化」这类判定不用等下一个 6 秒轮询。
    const run = async () => {
      const result = await check()
      if (result === null) {
        if (retryTimer.current !== null) window.clearTimeout(retryTimer.current)
        retryTimer.current = window.setTimeout(() => {
          retryTimer.current = null
          void check()
        }, 350)
      }
    }
    void run()
  }, [refreshKey, check])

  return h('div', { className: 'qwd-bar' },
    h('div', { className: 'qwd-bar-info' },
      h('div', { className: 'qwd-bar-title' }, t('barTitle')),
      // 状态只占一行，灰色说明文字，不随状态变色
      h('div', {
        className: 'qwd-hint qwd-hint-one-line qwd-bar-comfy',
        title: statusTitle,
      }, statusText),
    ),
    h('div', { className: 'qwd-bar-actions' },
      h('button', {
        type: 'button',
        className: 'qwd-bar-connect',
        disabled: props.disabled === true,
        onClick: () => { onPick() },
      }, t('connectComfy')),
      h(ComfyStatusSeat, { t, variant: 'panel' }),
    ),
  )
}


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
