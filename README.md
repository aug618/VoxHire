# VoxHire

VoxHire 是面向中文软件开发求职者的 AI 语音模拟面试 Demo。网页端支持本地语音网关模式与无需模型的静态演示模式；简历、JD、音频均不在服务端持久化。

## 开发

```powershell
npm install
uv sync
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
npm run dev
```

打开 `http://localhost:5173`。默认进入演示数据模式，不依赖语音模型。

## 本地语音模式

语音网关由项目内 `.venv` 隔离管理。复制 `.env.example` 为根目录 `.env`，填入 OpenAI 兼容的 LLM 地址、密钥和模型名，然后运行：

```powershell
.\scripts\start-gateway.ps1       # CPU 默认路径
.\scripts\start-gateway-gpu.ps1   # RTX 3050 4GB 的试验性 CUDA 路径
```

Paraformer 中文 ASR 已在 Windows CPU 完成真实转写验证，权重隔离在项目 `.cache/`。语音合成使用 `edge-tts` 的中文神经语音，通过本地适配器接入上游网关；它需要网络访问微软 Edge 语音服务，但不下载或保存 TTS 模型。GPU 环境仍可用于后续本地 TTS 实验：

```powershell
.\scripts\setup-gpu.ps1
.\scripts\start-gateway-gpu.ps1
```

该脚本安装 CUDA 12.8 版 PyTorch 到 `.venv-gpu`，不影响 `.venv` 的 CPU 依赖。4GB 显存下仅使用 0.6B 模型；启动时请关闭占用 GPU 的应用。设置 `VITE_SPEECH_GATEWAY_URL` 可覆盖网关地址。

该网关由 Apache-2.0 许可的 `huggingface/speech-to-speech` 提供，当前仅通过其公开 OpenAI Realtime 协议集成，未包含其源码或模型权重。

## 检查

```powershell
npm run build
.\.venv\Scripts\python.exe -m pytest
npm run test:browser
```

`test:browser` 使用 Playwright Chromium 检查默认演示模式、本地语音模式与浏览器控制台错误。

正式提交可运行 `npm run build` 后压缩 `dist/`，作为可交互静态演示包。静态模式使用内置样例数据；真实语音模式用于本地现场演示。
