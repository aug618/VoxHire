# VoxHire 技术方案调研报告

> **调研时间**: 2026年6月24日
> **调研目的**: 为 AI 面试官系统（VoxHire）选择最优技术方案
> **调研方法**: 深度网络调研 + GitHub 项目分析 + 对抗性验证

---

## 📋 目录

1. [执行摘要](#执行摘要)
2. [语音识别（STT）方案](#语音识别stt方案)
3. [语音合成（TTS）方案](#语音合成tts方案)
4. [LLM 集成方案](#llm-集成方案)
5. [实时语音交互架构](#实时语音交互架构)
6. [虚拟形象/数字人方案](#虚拟形象数字人方案)
7. [GitHub 开源项目参考](#github-开源项目参考)
8. [技术栈推荐](#技术栈推荐)
9. [待验证问题](#待验证问题)
10. [参考资源](#参考资源)

---

## 执行摘要

### 核心发现

| 维度 | 推荐方案 | 置信度 | 理由 |
|------|---------|--------|------|
| **LLM 推理** | vLLM | ⭐⭐⭐ 高 | OpenAI 兼容 API，流式输出，集成简单 |
| **实时语音框架** | Pipecat 或 LiveKit Agents | ⭐⭐⭐ 高 | 成熟开源，活跃维护 |
| **浏览器传输** | WebRTC | ⭐⭐ 中 | UDP 传输，低延迟，内置音频处理 |
| **语音合成** | Kokoro-82M | ⭐⭐ 中 | 82M 参数，轻量级，54 种语音 |
| **虚拟形象** | TalkingHead / MuseTalk | ⭐⭐⭐ 高 | 浏览器 3D / 服务端视频合成 |

### 关键缺口

⚠️ **STT 方案缺乏经过验证的对比数据** — Whisper、Vosk、DeepSpeech 等方案的性能对比全部被驳回，需要在实现阶段单独调研。

---

## 语音识别（STT）方案

### 主流开源方案

| 方案 | 模型大小 | 多语言 | 延迟 | 准确率 | 适用场景 |
|------|---------|--------|------|--------|---------|
| **Whisper Large V3** | 1.5B | 99+ 语言 | 中等 | 高 | 多语言通用 |
| **Whisper Large V3 Turbo** | 809M | 99+ 语言 | 快（6x） | 高 | 实时场景 |
| **Distil-Whisper** | 756M | 英语为主 | 快（6.3x） | 高 | 英语实时 |
| **Vosk** | 50MB-1.8G | 20+ 语言 | 极快 | 中 | 轻量级/离线 |
| **DeepSpeech** | ~1GB | 英语 | 快 | 中 | 历史项目 |
| **Canary Qwen 2.5B** | 2.5B | 多语言 | 快 | 高 | 最新模型 |
| **FunASR (阿里)** | 可变 | 中英 | 快 | 高 | 中文优化 |

### 云端 STT 服务

| 服务 | 延迟 | 准确率 | 价格 | 特点 |
|------|------|--------|------|------|
| **Deepgram Nova-3** | 极低 | 极高 | $0.0043/min | 实时流式 |
| **AssemblyAI Universal-3** | 低 | 极高 | $0.015/min | 高准确率 |
| **OpenAI Whisper API** | 中等 | 高 | $0.006/min | 简单易用 |
| **Azure Speech** | 低 | 高 | $1/hour | 企业级 |

### 调研结论

⚠️ **重要发现**: STT 方案的性能对比数据在验证中全部被驳回，无法给出经过验证的推荐。

**建议策略**:
1. **MVP 阶段**: 使用 **Whisper Large V3 Turbo**（平衡速度和准确率）
2. **中文优化**: 考虑 **FunASR**（阿里开源，中文优化）
3. **实时场景**: 使用 **Deepgram** 或 **AssemblyAI** 云端服务
4. **本地离线**: 使用 **Vosk**（轻量级）或 **Whisper**（高准确率）

---

## 语音合成（TTS）方案

### 主流开源方案

| 方案 | 参数量 | 语言数 | 许可证 | GPU 需求 | 实时因子 | 特点 |
|------|--------|--------|--------|---------|---------|------|
| **Kokoro-82M** | 82M | 8 种（54 语音） | Apache 2.0 | 2-3 GB | 0.03 | ⭐ 推荐默认 |
| **Edge-TTS** | N/A | 40+ 语言 | MIT | 无（云端） | 极快 | 免费微软语音 |
| **Coqui TTS** | 可变 | 多语言 | MPL-2.0 | 2-4 GB | 0.1-0.5 | 声音克隆 |
| **Bark** | 350M | 多语言 | MIT | 4+ GB | 0.5-1.0 | 高质量，慢 |
| **Piper** | 10-100M | 30+ 语言 | MIT | CPU 友好 | 极快 | 轻量级 |
| **Fish-Speech** | 可变 | 中英日 | Apache 2.0 | 2-4 GB | 0.1 | 声音克隆 |
| **GPT-SoVITS** | 可变 | 中英日 | MIT | 4+ GB | 0.2 | 声音克隆 |

### 云端 TTS 服务

| 服务 | 语言数 | 价格 | 特点 |
|------|--------|------|------|
| **Edge-TTS** | 40+ | 免费 | 微软语音，质量高 |
| **ElevenLabs** | 29 | $5/100K chars | 最高质量，声音克隆 |
| **OpenAI TTS** | 57 | $15/1M chars | 简单易用 |
| **Azure Speech** | 100+ | $16/1M chars | 企业级 |
| **Cartesia Sonic** | 多语言 | 联系销售 | 最低延迟 |

### 调研结论

✅ **推荐方案**: **Kokoro-82M**

**理由**:
- 仅 82M 参数，轻量级
- Apache 2.0 许可证，商用友好
- 支持 54 种语音，8 种语言
- GPU 显存需求仅 2-3 GB
- 实时因子 0.03（极快）
- 支持 CPU 运行

**备选方案**:
- **Edge-TTS**: 免费、高质量，但需要网络
- **Piper**: CPU 友好，适合边缘部署
- **Fish-Speech**: 中文优化，支持声音克隆

---

## LLM 集成方案

### 本地部署方案

| 方案 | 特点 | GPU 需求 | API 兼容 | 适用场景 |
|------|------|---------|---------|---------|
| **vLLM** | 高性能推理，流式输出 | 7.5+ (T4/A100) | ✅ OpenAI 兼容 | ⭐ 推荐 |
| **Ollama** | 简单易用，一键部署 | CPU/GPU | ✅ OpenAI 兼容 | 快速原型 |
| **llama.cpp** | 极致优化，CPU 友好 | CPU/GPU | ✅ OpenAI 兼容 | 边缘部署 |
| **TGI** | HuggingFace 官方 | GPU | ✅ OpenAI 兼容 | 生产环境 |
| **SGLang** | 高性能，结构化输出 | GPU | ✅ OpenAI 兼容 | 复杂推理 |

### 云端 API 服务

| 服务 | 模型 | 价格（输入/输出） | 特点 |
|------|------|------------------|------|
| **OpenAI** | GPT-4o, GPT-4o-mini | $5/$15, $0.15/$0.60 | 最成熟 |
| **Anthropic** | Claude 3.5 Sonnet | $3/$15 | 长上下文 |
| **Google** | Gemini 1.5 Pro | $3.5/$10.5 | 多模态 |
| **Groq** | Llama 3, Mixtral | 极低 | 最快推理 |
| **DeepSeek** | DeepSeek-V2 | ¥1/¥2 | 中文优化 |

### 调研结论

✅ **推荐方案**: **vLLM**

**理由**:
- 提供完整的 OpenAI 兼容 API
- 支持流式输出（面试对话必须）
- 支持 Docker 和 Python 直接部署
- 硬件要求：GPU 7.5+（T4、RTX20xx、A100 等）
- 后端可通过标准 OpenAI SDK 无缝对接

**MVP 阶段备选**: **Ollama**
- 更简单，一键部署
- 支持 CPU 运行
- 适合快速原型验证

---

## 实时语音交互架构

### 传输协议对比

| 协议 | 传输方式 | 延迟 | 复杂度 | 适用场景 |
|------|---------|------|--------|---------|
| **WebSocket** | TCP | 低 | 低 | 简单实时通信 |
| **WebRTC** | UDP | 极低 | 中 | 实时音视频 |
| **SSE** | TCP | 低 | 极低 | 服务端推送 |

### 实时语音框架

#### 方案 1: Pipecat

| 特性 | 详情 |
|------|------|
| **GitHub** | [pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat) |
| **语言** | Python |
| **传输** | WebSocket + WebRTC |
| **集成** | 20+ STT, 30+ TTS, 20+ LLM |
| **特点** | 插件化架构，多协议支持 |

#### 方案 2: LiveKit Agents

| 特性 | 详情 |
|------|------|
| **GitHub** | [livekit/agents](https://github.com/livekit/agents) |
| **语言** | Python |
| **传输** | WebRTC |
| **集成** | STT-LLM-TTS 管道编排 |
| **特点** | 专注语音 AI，内置轮次检测 |

#### 方案 3: 自建方案

```
浏览器 (WebRTC/WebSocket)
    ↓ 音频流
FastAPI WebSocket Server
    ↓ 音频数据
STT (Whisper/Deepgram)
    ↓ 文本
LLM (vLLM/Ollama)
    ↓ 回复
TTS (Kokoro/Edge-TTS)
    ↓ 音频
浏览器播放
```

### 调研结论

✅ **推荐方案**: **Pipecat** 或 **LiveKit Agents**

**理由**:
- 两者均为成熟开源项目，活跃维护
- 内置 STT-LLM-TTS 管道编轮次检测、中断处理
- 避免自己造轮子

**选择建议**:
- **Pipecat**: 更灵活，支持多种传输协议，插件丰富
- **LiveKit Agents**: 更专注，WebRTC 原生支持，延迟更低

---

## 虚拟形象/数字人方案

### 方案对比

| 方案 | 类型 | 渲染位置 | 特点 | 适用场景 |
|------|------|---------|------|---------|
| **TalkingHead** | 3D 模型 | 浏览器 | ThreeJS/WebGL，全身动画 | Web 应用 |
| **MuseTalk** | 视频合成 | 服务端 | 唇形同步，高质量 | 高质量需求 |
| **Duix-Avatar** | 视频合成 | 服务端 | 完全离线，Docker 部署 | 离线场景 |
| **Live2D** | 2D 模型 | 浏览器 | 轻量级，二次元风格 | 轻量应用 |
| **Ready Player Me** | 3D 模型 | 浏览器 | 快速创建，跨平台 | 快速原型 |

### 详细分析

#### TalkingHead（推荐用于 Web）

| 特性 | 详情 |
|------|------|
| **GitHub** | [met4citizen/talkinghead](https://github.com/met4citizen/talkinghead) |
| **技术** | ThreeJS + WebGL |
| **模型格式** | GLB（全身模型） |
| **动画** | Mixamo 动画 + ARKit/Oculus blend shapes |
| **优点** | 浏览器端渲染，无需服务端 GPU |
| **缺点** | 模型质量受限于 WebGL |

#### MuseTalk（推荐用于高质量）

| 特性 | 详情 |
|------|------|
| **GitHub** | [TMElyralab/MuseTalk](https://github.com/TMElyralab/MuseTalk) |
| **技术** | Whisper-tiny + Stable Diffusion UNet |
| **原理** | cross-attention 融合音频与图像嵌入 |
| **优点** | 高质量唇形同步 |
| **缺点** | 需要服务端 GPU |

#### Duix-Avatar（推荐用于离线）

| 特性 | 详情 |
|------|------|
| **GitHub** | [duixcom/Duix-Avatar](https://github.com/duixcom/Duix-Avatar) |
| **技术** | Docker 集成 |
| **组件** | Fish-Speech + Fun-ASR + Duix Avatar |
| **优点** | 完全离线，无需联网 |
| **缺点** | 需要较大 GPU 资源 |

### 调研结论

✅ **推荐方案**:

| 阶段 | 方案 | 理由 |
|------|------|------|
| **MVP** | TalkingHead | 浏览器端渲染，无需 GPU |
| **V1.0** | MuseTalk | 高质量唇形同步 |
| **离线版** | Duix-Avatar | 完全离线，隐私保护 |

---

## GitHub 开源项目参考

### 高参考价值项目

#### 1. InterviewLab ⭐⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [StephaneWamba/InterviewLab](https://github.com/StephaneWamba/InterviewLab) |
| **技术栈** | LangGraph + LiveKit + FastAPI + Next.js + PostgreSQL + Redis |
| **功能** | 实时语音对话、代码执行沙箱、简历定制问题、综合反馈 |
| **特点** | 架构完整，技术栈先进，支持代码在线执行 |
| **参考价值** | 架构设计、状态机管理、技术栈选型 |

#### 2. Seekr ⭐⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [mdjamilkashemporosh/Seekr](https://github.com/mdjamilkashemporosh/Seekr) |
| **技术栈** | Ollama + 开源 LLM（本地运行） |
| **功能** | AI 驱动面试、10+ 角色、60+ 主题、难度选择、评分反馈 |
| **特点** | 完全本地运行，无需 API 密钥，数据隐私保护 |
| **参考价值** | 本地优先理念，Ollama 集成 |

#### 3. Prepwise ⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [adrianhajdin/ai_mock_interviews](https://github.com/adrianhajdin/ai_mock_interviews) |
| **技术栈** | Next.js + Vapi AI + Firebase + TailwindCSS + Google Gemini |
| **功能** | 语音 AI 面试、实时反馈、面试转录 |
| **特点** | 有完整 YouTube 教程（1.2M+ 播放量） |
| **参考价值** | 前端实现、用户体验、教程质量 |

#### 4. FoloUp ⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [FoloUp/FoloUp](https://github.com/FoloUp/FoloUp) |
| **技术栈** | Next.js + Clerk + Supabase + Retell AI + OpenAI |
| **功能** | 企业级 AI 语音面试、候选人管理、录音存储 |
| **特点** | 面向企业招聘场景，有完整商业产品 |
| **参考价值** | 企业级功能、候选人管理 |

#### 5. Interviewer ⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [IliaLarchenko/Interviewer](https://github.com/IliaLarchenko/Interviewer) |
| **技术栈** | Python + Gradio + LLM + STT + TTS |
| **功能** | 模拟技术面试、支持 Coding/System Design |
| **特点** | 支持多种 LLM，可本地运行 |
| **参考价值** | Python 实现、Gradio UI |

### 中文项目参考

#### Agentic_Interviewer (问镜) ⭐⭐

| 项目信息 | 详情 |
|---------|------|
| **GitHub** | [liuhan-agent/Agentic_Interviewer](https://github.com/liuhan-agent/Agentic_Interviewer) |
| **技术栈** | LangGraph |
| **功能** | 可追责 AI 模拟面试、复盘训练、评分合同 |
| **特点** | 中文项目，强调可追溯性和责任归属 |
| **参考价值** | 中文场景、可追溯性设计 |

### 技术栈分布总结

| 技术方向 | 常用技术 |
|---------|---------|
| **前端** | Next.js, React, TailwindCSS |
| **后端** | FastAPI, Python, Node.js |
| **AI/LLM** | OpenAI GPT, Google Gemini, Claude, Ollama |
| **语音** | Vapi AI, LiveKit, Deepgram, Whisper, Edge-TTS |
| **数据库** | Firebase, Supabase, PostgreSQL, Redis |
| **认证** | Clerk, Firebase Auth |
| **部署** | Docker, Vercel, Railway |

---

## 技术栈推荐

### 推荐方案 A：云端优先（快速迭代）

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│      Next.js + React + TailwindCSS + WebRTC     │
└───────────────────────┬─────────────────────────┘
                        │ WebRTC/WebSocket
┌───────────────────────┴─────────────────────────┐
│                   Backend                       │
│            Python FastAPI + WebSocket            │
├─────────────────────────────────────────────────┤
│  STT: Deepgram/Whisper API  │  TTS: Edge-TTS   │
│  LLM: OpenAI GPT-4o-mini   │  Avatar: TalkingHead│
└─────────────────────────────────────────────────┘
```

**优点**:
- 快速开发，无需管理 GPU
- 成本可控（按使用付费）
- 稳定性高

**缺点**:
- 依赖外部服务
- 数据隐私风险

### 推荐方案 B：本地优先（隐私保护）

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│      Next.js + React + TailwindCSS + WebRTC     │
└───────────────────────┬─────────────────────────┘
                        │ WebRTC/WebSocket
┌───────────────────────┴─────────────────────────┐
│                   Backend                       │
│            Python FastAPI + WebSocket            │
├─────────────────────────────────────────────────┤
│  STT: Whisper (本地)       │  TTS: Kokoro-82M   │
│  LLM: vLLM/Ollama (本地)  │  Avatar: MuseTalk   │
└─────────────────────────────────────────────────┘
```

**优点**:
- 数据完全本地化
- 无外部依赖
- 隐私保护

**缺点**:
- 需要 GPU 资源
- 部署复杂

### 推荐方案 C：混合方案（平衡）

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│      Next.js + React + TailwindCSS + WebRTC     │
└───────────────────────┬─────────────────────────┘
                        │ WebRTC/WebSocket
┌───────────────────────┴─────────────────────────┐
│                   Backend                       │
│            Python FastAPI + WebSocket            │
├─────────────────────────────────────────────────┤
│  STT: Whisper (本地) + Deepgram (云端备用)       │
│  TTS: Kokoro-82M (本地) + Edge-TTS (云端备用)   │
│  LLM: Ollama (本地) + OpenAI (云端备用)         │
│  Avatar: TalkingHead (轻量) + MuseTalk (高质量) │
└─────────────────────────────────────────────────┘
```

**优点**:
- 平衡隐私和便利性
- 灵活切换
- 渐进式迁移

**缺点**:
- 架构复杂度高

### 与 VoxHire 现有设计的对比

| 维度 | VoxHire 现有设计 | 调研推荐 | 建议 |
|------|-----------------|---------|------|
| **前端** | React/Next.js | Next.js + React | ✅ 保持 |
| **后端** | Python FastAPI | Python FastAPI | ✅ 保持 |
| **STT** | Whisper | Whisper + Deepgram | ⚠️ 考虑云端备用 |
| **TTS** | Edge-TTS / Coqui | Kokoro-82M | ⚠️ 更新为 Kokoro |
| **LLM** | Ollama / API | vLLM / Ollama | ⚠️ 考虑 vLLM |
| **实时通信** | WebSocket | WebRTC | ⚠️ 考虑 WebRTC |
| **虚拟形象** | 未定 | TalkingHead / MuseTalk | 🆕 新增 |

---

## 待验证问题

### 高优先级

1. **STT 方案选型**: 需要本地实测 Whisper、Vosk、FunASR 等方案的准确率和延迟
2. **Pipecat vs LiveKit**: 需要在面试场景下对比延迟、资源占用、易用性
3. **vLLM vs Ollama**: 需要在 MVP 阶段的典型并发量（1-5 用户）下对比

### 中优先级

4. **虚拟形象性能**: 需要本地实测 TalkingHead、MuseTalk 的帧率和延迟
5. **Kokoro-82M 质量**: 需要实际测试中文语音合成质量
6. **WebRTC vs WebSocket**: 需要在实际网络环境下对比延迟和稳定性

### 低优先级

7. **声音克隆方案**: 是否需要支持自定义面试官声音
8. **多语言支持**: 是否需要支持中英混合面试

---

## 参考资源

### 官方文档

- [vLLM 文档](https://docs.vllm.ai/)
- [Pipecat GitHub](https://github.com/pipecat-ai/pipecat)
- [LiveKit Agents GitHub](https://github.com/livekit/agents)
- [Kokoro-82M HuggingFace](https://huggingface.co/hexgrad/Kokoro-82M)
- [TalkingHead GitHub](https://github.com/met4citizen/talkinghead)
- [MuseTalk GitHub](https://github.com/TMElyralab/MuseTalk)

### 基准测试

- [2026 年最佳开源 STT 模型](https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks)
- [2026 年最佳 TTS 模型](https://localaimaster.com/blog/best-local-tts-models)
- [STT 服务独立基准测试](https://www.coval.ai/blog/best-speech-to-text-providers-in-2026-independent-benchmarks-and-how-to-choose)

### 开源项目

- [InterviewLab](https://github.com/StephaneWamba/InterviewLab) - 架构参考
- [Seekr](https://github.com/mdjamilkashemporosh/Seekr) - 本地优先参考
- [Prepwise](https://github.com/adrianhajdin/ai_mock_interviews) - 前端参考
- [FoloUp](https://github.com/FoloUp/FoloUp) - 企业级参考

---

## 总结

### 核心建议

1. **LLM 推理**: 优先使用 **Ollama**（MVP），后续迁移到 **vLLM**（生产）
2. **实时语音框架**: 选择 **Pipecat** 或 **LiveKit Agents**，避免自己造轮子
3. **TTS 方案**: 更新为 **Kokoro-82M**（本地）+ **Edge-TTS**（云端备用）
4. **STT 方案**: 保持 **Whisper**，增加 **Deepgram** 作为云端备用
5. **虚拟形象**: MVP 使用 **TalkingHead**，V1.0 考虑 **MuseTalk**
6. **传输协议**: 从 WebSocket 迁移到 **WebRTC**

### 下一步行动

1. [ ] 本地实测 STT 方案（Whisper vs Vosk vs FunASR）
2. [ ] 对比 Pipecat 和 LiveKit Agents
3. [ ] 测试 Kokoro-82M 中文语音质量
4. [ ] 更新设计文档，反映技术选型变化
5. [ ] 开始 MVP 原型开发

---

**文档版本**: v1.0
**最后更新**: 2026-06-24
**维护者**: VoxHire Team
