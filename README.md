# VoxHire

VoxHire 是面向中文软件开发求职者的 AI 语音模拟面试 Demo。网页端支持本地语音网关模式与无需模型的静态演示模式；简历、JD、音频均不在服务端持久化。

## 开发

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload
npm run dev
```

打开 `http://localhost:5173`。默认进入演示数据模式，不依赖语音模型。

## 本地语音模式

另开终端启动 Hugging Face `speech-to-speech` 作为语音网关，默认地址为 `ws://127.0.0.1:8765/v1/realtime`。建议先使用上游支持的 Paraformer 中文 ASR；TTS 可使用 Qwen3-TTS 的 CPU/GGML 路径，GPU 环境再升级模型。设置 `VITE_SPEECH_GATEWAY_URL` 可覆盖网关地址。

该网关由 Apache-2.0 许可的 `huggingface/speech-to-speech` 提供，当前仅通过其公开 OpenAI Realtime 协议集成，未包含其源码或模型权重。

## 检查

```powershell
npm run build
python -m pytest
```

正式提交可运行 `npm run build` 后压缩 `dist/`，作为可交互静态演示包。静态模式使用内置样例数据；真实语音模式用于本地现场演示。
