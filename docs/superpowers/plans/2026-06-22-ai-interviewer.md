# AI 面试官 实现计划

> **给执行 agent：** 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 来逐任务执行。步骤使用 checkbox (`- [ ]`) 语法跟踪。

**目标：** 构建一个语音 + 虚拟形象实时交互的 AI 面试官 MVP，支持技术面和行为面，产出 7 维评估报告。

**架构：** React/Next.js 前端（准备页/面试页/报告页）通过 REST + WebSocket 与 Python/FastAPI 后端通信，后端编排 STT -> LLM 流式生成 -> TTS 分段合成管道（边生成边播放），采用混合记忆策略。

**技术栈：** React 18 / Next.js 14 / TypeScript / Tailwind / Python 3.11+ / FastAPI / faster-whisper / Ollama / Edge-TTS

---

## 实现阶段

| 阶段 | 任务 | 描述 |
|------|------|------|
| 0 | 0.1-0.2 | 项目脚手架（前后端初始化） |
| 1 | 1.1-1.2 | 后端核心：数据模型 + 状态机 |
| 2 | 2.1-2.4 | AI 管道：Prompt、STT、LLM（含流式）、TTS（含分段合成） |
| 3 | 3.1 | 记忆管理（混合策略） |
| 4 | 4.1-4.2 | REST API + WebSocket |
| 5 | 5.1-5.10 | 前端：类型、hooks、组件、页面 |

---

## 文件结构

backend/ (FastAPI): main.py, config.py, models/interview.py, routes/report.py
services/: stt.py, llm.py, tts.py, memory.py, state_machine.py, report.py
utils/prompts.py, tests/

frontend/ (Next.js): src/app/{page,interview,report}/, components/{Avatar,SubtitleDisplay,AudioRecorder,AudioPlayer,PrepForm},
hooks/{useWebSocket,useAudioCapture,useAudioPlayback}, lib/api.ts, types/index.ts

---

## 任务 0.1：后端项目初始化

**创建文件：** `backend/requirements.txt`、`backend/app/__init__.py`、`backend/app/config.py`、`backend/tests/__init__.py`

- [ ] 创建 requirements.txt：fastapi, uvicorn, websockets, faster-whisper, edge-tts, httpx, pydantic, pydantic-settings, pytest, pytest-asyncio
- [ ] 创建 config.py：Settings 类，含 ollama_host、whisper_model/device/compute_type、tts_voice、max_interview_minutes=30、max_followups=2、sliding_window_rounds=8
- [ ] 安装依赖并在 git 提交："chore: 初始化后端项目，添加配置与依赖"

---

## 任务 0.2：前端项目初始化

**创建文件：** package.json、next.config.js、tsconfig.json、tailwind.config.ts、postcss.config.js、layout.tsx、globals.css

- [ ] 创建 package.json：next, react, recharts 依赖，tailwindcss, typescript 开发依赖
- [ ] 配置 next.config.js：rewrites 代理 /api/* -> localhost:8000
- [ ] 创建 tsconfig.json、tailwind.config.ts、postcss.config.js
- [ ] 创建 layout.tsx（zh-CN 语言，深色主题 #0f1117/#e4e4e7）和 globals.css
- [ ] git 提交："chore: 初始化前端项目，使用 Next.js + Tailwind + TypeScript"

---

## 任务 1.1：Pydantic 数据模型

**创建文件：** `backend/app/models/interview.py`、`backend/tests/test_models.py`

- [ ] 枚举：InterviewType（technical/behavioral/mixed）、Difficulty（junior/intermediate/senior）、InterviewState（init/opening/qa_loop/closing/report/done）
- [ ] 模型：InterviewConfig（岗位/技术栈/难度/面试类型/模型配置）、QuestionRecord（题目/回答/追问/评分）、InterviewSession（ID/配置/状态/问题列表）
- [ ] 先写测试：配置默认值（MIXED/INTERMEDIATE）、会话初始状态（INIT/空问题列表）
- [ ] 实现模型，验证 2 个测试通过
- [ ] git 提交："feat: 添加 Pydantic 面试会话数据模型"

---

## 任务 1.2：面试状态机

**创建文件：** `backend/app/services/state_machine.py`、`backend/tests/test_state_machine.py`

- [ ] VALID_TRANSITIONS 字典：INIT->OPENING, OPENING->QA_LOOP, QA_LOOP->{QA_LOOP, CLOSING}, CLOSING->REPORT, REPORT->DONE
- [ ] InterviewStateMachine 类：transition_to() 校验转换合法性，非法抛出 StateTransitionError
- [ ] 测试：初始状态、合法跳转、非法跳转抛异常、完整流程（INIT->OPENING->QA_LOOP->CLOSING->REPORT->DONE）
- [ ] git 提交："feat: 添加面试状态机，含合法转换校验"

---

## 任务 2.1：Prompt 模板

**创建文件：** `backend/app/utils/prompts.py`

- [ ] SYSTEM_PROMPT_TEMPLATE：面试信息区 + 职责说明（开场白/核心问答/追问策略/结束语）+ 行为准则 + 当前记忆区
- [ ] build_system_prompt(config, memory_context)：填充岗位、技术栈、难度、面试类型、简历等字段
- [ ] REPORT_PROMPT_TEMPLATE：要求 LLM 对 7 个维度打分（4 技术 + 3 行为），含行为锚定描述，返回 JSON
- [ ] build_report_prompt(config, qa_records)：填充面试信息与对话记录
- [ ] git 提交："feat: 添加面试系统和报告生成的 Prompt 模板"

---

## 任务 2.2：STT 语音识别服务

**创建文件：** `backend/app/services/stt.py`、`backend/tests/test_stt.py`

- [ ] STTService 类：惰性加载 faster-whisper 模型（可配置 model/device/compute_type）
- [ ] transcribe(audio_bytes)：写入临时 WAV，调模型转写，返回文本
- [ ] 测试：用静音 WAV 生成函数验证接口正常
- [ ] git 提交："feat: 添加基于 faster-whisper 的句子级语音识别服务"

---

## 任务 2.3：LLM 大模型服务（含流式输出）

**创建文件：** `backend/app/services/llm.py`、`backend/tests/test_llm.py`

- [ ] LLMService(provider, api_key)：支持 Ollama（/api/chat）和 OpenAI 兼容（/chat/completions）两种后端
- [ ] async chat(system_prompt, messages, temperature, max_tokens)：非流式接口，返回完整文本（用于报告生成等场景）
- [ ] async chat_stream(system_prompt, messages, temperature, max_tokens)：流式接口，async generator 逐 token 产出文本（用于实时对话管道）
- [ ] 流式实现：Ollama 使用 stream=True 参数，OpenAI 兼容 API 使用 stream=True + SSE 解析
- [ ] 测试：初始化默认值、_build_chat_request 消息结构、chat_stream 返回 async generator
- [ ] git 提交："feat: 添加 LLM 服务，支持 Ollama/OpenAI 兼容 API 及流式输出"

---

## 任务 2.4：TTS 语音合成服务（支持分段合成）

**创建文件：** `backend/app/services/tts.py`、`backend/tests/test_tts.py`

- [ ] TTSService 类：使用 Edge-TTS Communicate 流式合成
- [ ] synthesize(text)：空文本返回空 bytes，正常文本返回 MP3 音频 bytes（用于完整文本场景）
- [ ] async synthesize_stream(text_chunks: AsyncIterator[str])：接收文本块异步迭代器，逐块合成并 yield 音频 bytes（用于流式对话管道）
- [ ] 句子边界切分工具函数 split_sentences(text)：按句号/问号/感叹号切分，供 WebSocket 管道调用
- [ ] 测试：有效文本返回 bytes、空文本返回空 bytes、synthesize_stream 返回 async generator
- [ ] git 提交："feat: 添加基于 Edge-TTS 的语音合成服务，支持流式分段合成"

---

## 任务 3.1：混合记忆管理

**创建文件：** `backend/app/services/memory.py`、`backend/tests/test_memory.py`

- [ ] MemoryContext：fixed_header（面试信息）、stage_summaries（阶段摘要）、recent_rounds（最近对话）
- [ ] MemoryManager(config, max_rounds=8)：add_round(q, a) 添加问答、summarize_stage(name) 生成阶段摘要、get_context() 返回带滑动窗口的上下文、format_for_prompt() 构建结构化字符串
- [ ] 测试：初始化、添加问答、滑动窗口（只保留最后 3/5 轮）、阶段摘要
- [ ] git 提交："feat: 添加混合记忆管理器，支持固定头 + 阶段摘要 + 滑动窗口"

---

## 任务 4.1：FastAPI 入口 + WebSocket 面试管道（流式分段合成）

**创建文件：** `backend/app/main.py`

- [ ] POST /interview/start：创建 InterviewSession，存内存字典，返回 session_id
- [ ] GET /interview/{id}/status：返回当前状态和问题数
- [ ] WebSocket /ws/{id}：流式管道
  - 开场白（OPENING）：LLM chat_stream 流式生成自我介绍 -> 按句子切分 -> TTS synthesize_stream 逐段合成 -> 逐段发送文本 + 音频
  - 核心问答循环（QA_LOOP）：接收音频 bytes -> STT 转写 -> 追加聊天历史 -> LLM chat_stream（动态 Prompt + 记忆）-> 按句子边界切分 token 流 -> TTS synthesize_stream 逐段合成 -> 逐段回发文本 + 音频
  - 结束（断连时 CLOSING）：LLM 生成结束语 -> 发送
- [ ] 流式管道核心逻辑：
  - sentence_buffer：累积 LLM token，遇到句号/问号/感叹号时切出一个句子
  - 每个句子立即送入 TTS synthesize_stream，合成完毕即通过 WebSocket 发送 binary 音频帧
  - 同时发送 JSON 文本消息（type: "ai_text", text: 当前句子）供前端显示字幕
- [ ] 使用 InterviewStateMachine 控制阶段、MemoryManager 管理上下文
- [ ] git 提交："feat: 添加 FastAPI 入口和 WebSocket 流式面试管道"

---

## 任务 4.2：报告接口

**创建文件：** `backend/app/routes/report.py`，修改 `backend/app/main.py`

- [ ] GET /report/{session_id}：获取会话，调用 generate_report()，返回 JSON 报告
- [ ] 在 main.py 注册路由
- [ ] git 提交："feat: 添加评估报告 API 接口"

---

## 任务 5.1：TypeScript 类型定义

**创建文件：** `frontend/src/types/index.ts`

- [ ] 类型接口：InterviewType、Difficulty、InterviewConfig、InterviewSession、DimensionScore、PerQuestionReview、ReportData、WSMessage、AvatarState
- [ ] 与 Pydantic 模型对齐
- [ ] git 提交："feat: 添加 TypeScript 类型定义"

---

## 任务 5.2：REST API 客户端

**创建文件：** `frontend/src/lib/api.ts`

- [ ] startInterview(config)：POST /api/interview/start -> InterviewSession
- [ ] getReport(sessionId)：GET /api/report/{id} -> ReportData
- [ ] git 提交："feat: 添加 REST API 客户端"

---

## 任务 5.3：WebSocket Hook（支持流式消息）

**创建文件：** `frontend/src/hooks/useWebSocket.ts`

- [ ] useWebSocket(sessionId)：连接 ws://localhost:8000/ws/{id}
- [ ] 返回 { isConnected, messages, audioQueue, sendAudio, clearMessages }
- [ ] 处理多种 JSON 消息类型：
  - type: "ai_text" — AI 回复文本，逐句追加到 messages
  - type: "user_text" — STT 识别结果，追加到 messages
  - type: "state_change" — 面试状态变更通知
  - type: "error" — 错误信息
- [ ] 处理 binary 音频帧：收到后追加到 audioQueue 数组，触发前端播放
- [ ] 组件卸载时自动关闭连接
- [ ] git 提交："feat: 添加实时通信 WebSocket Hook，支持流式文本和音频"

---

## 任务 5.4：音频采集与播放 Hook（含播放队列）

**创建文件：** `frontend/src/hooks/useAudioCapture.ts`、`frontend/src/hooks/useAudioPlayback.ts`

- [ ] useAudioCapture：getUserMedia + MediaRecorder API，返回 { isRecording, startRecording, stopRecording() -> Blob }
- [ ] useAudioPlayback：维护音频播放队列（FIFO），监听 audioQueue 数组新增
  - 队列机制：新音频块入队，当前无播放则立即解码播放，否则排队等待
  - AudioContext 解码 -> AudioBufferSourceNode 播放 -> onended 回调触发下一段
  - 返回 { isPlaying, playNext, clearQueue }
  - 支持播放状态回调：onPlayStart（切换 avatar 为 speaking）、onPlayEnd（切回 idle）
- [ ] git 提交："feat: 添加音频采集和队列播放 Hook"

---

## 任务 5.5：虚拟形象组件

**创建文件：** `frontend/src/components/Avatar.tsx`

- [ ] 192px 圆形头像，3 种 Tailwind 动画状态：
  - idle：灰色边框、微笑 emoji、"等待中"
  - thinking：蓝色脉动边框、思考 emoji、"思考中"
  - speaking：绿色边框 + ping 光环动画、讲话 emoji、"讲话中"
- [ ] git 提交："feat: 添加虚拟形象组件，含 idle/thinking/speaking 三态"

---

## 任务 5.6：字幕/录音/播放组件

**创建文件：** SubtitleDisplay.tsx、AudioRecorder.tsx、AudioPlayer.tsx

- [ ] SubtitleDisplay：可滚动容器，AI 消息左对齐绿色，用户语音右对齐蓝色气泡，错误居中红色
- [ ] AudioRecorder：圆形按下说话按钮，使用麦克风 SVG 图标，切换录音状态
- [ ] AudioPlayer：隐藏组件，通过 useAudioPlayback 自动播放 TTS 音频
- [ ] git 提交："feat: 添加字幕、录音按钮、音频播放组件"

---

## 任务 5.7：面试准备页

**创建文件：** PrepForm.tsx，修改 page.tsx

- [ ] PrepForm：岗位名称输入、技术栈多选标签（Python/JS/Go/Java/Rust/C++/TS/Ruby/Kotlin/Swift）、难度三段按钮、面试类型选择器、模型下拉框
- [ ] 提交调用 startInterview API，跳转到 /interview?session={id}
- [ ] page.tsx：标题 "AI Interviewer" + 副标题 + PrepForm 组件
- [ ] git 提交："feat: 添加面试准备页，含配置表单"

---

## 任务 5.8：面试进行页

**创建文件：** `frontend/src/app/interview/page.tsx`

- [ ] 从 URL 参数读取 session ID，建立 WebSocket 连接
- [ ] 布局：连接状态指示灯、虚拟形象（Avatar）、字幕区（SubtitleDisplay）、隐藏音频播放器、录音按钮 + "结束面试"链接
- [ ] 管理头像状态：发送音频时 thinking -> 超时恢复 idle
- [ ] git 提交："feat: 添加面试进行页，含虚拟形象、字幕和录音交互"

---

## 任务 5.9：评估报告页

**创建文件：** `backend/app/services/report.py`、`frontend/src/app/report/page.tsx`

- [ ] 报告服务 generate_report(session)：构建 QA 记录，发送 REPORT_PROMPT_TEMPLATE 给 LLM，解析 JSON 响应
- [ ] 报告页：综合评分（大字 /5.0）、7 维 recharts 雷达图、逐维度详情卡片（分数+锚定描述+点评）、逐题回顾（亮点/改进点对比）、总结建议文字
- [ ] git 提交："feat: 添加报告生成服务和评估报告页面，含雷达图"

---

## 任务 5.10：项目 README

**创建文件：** README.md

- [ ] 项目简介、功能列表、架构图、快速启动（后端 + 前端命令）、开源协议（MIT）
- [ ] git 提交："docs: 添加项目 README，含快速启动说明"

---

## 计划自审

**Spec 覆盖：** 设计文档 6 个核心模块全部有对应任务 — 状态机(1.2)、AI 管道含流式(2.1-2.4)、记忆管理(3.1)、REST/WebSocket流式管道(4.1-4.2)、虚拟形象(5.5)、评估报告(5.9)。非功能需求通过 config.py 模块化服务设计和本地优先架构体现。

**流式管道一致性：** LLM chat_stream(2.3) -> TTS synthesize_stream(2.4) -> WebSocket 流式分段发送(4.1) -> 前端 audioQueue 队列播放(5.4)，全链路已对齐。

**占位符检查：** 无 TBD、TODO 或不完整步骤。每个步骤都有精确的文件路径和测试预期。

**类型一致性：** Python Pydantic 模型与 TypeScript 接口对齐。WebSocket 消息格式（JSON type 字段 + binary 音频）在 main.py 和 useWebSocket.ts 之间保持一致。

---

*计划完成，等待执行握手。*
