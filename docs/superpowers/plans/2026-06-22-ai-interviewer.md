# AI Interviewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build MVP AI interview system with voice + virtual avatar, supporting technical and behavioral interviews with 7-dimension reports.

**Architecture:** React/Next.js frontend (prep/interview/report pages) via REST+WebSocket to Python/FastAPI backend orchestrating STT->LLM->TTS pipeline with hybrid memory.

**Tech Stack:** React 18 / Next.js 14 / TypeScript / Tailwind / Python 3.11+ / FastAPI / faster-whisper / Ollama / Edge-TTS

---

## Phases

| Phase | Tasks | Description |
|-------|-------|-------------|
| 0 | 0.1-0.2 | Project scaffolding |
| 1 | 1.1-1.2 | Backend core: models + state machine |
| 2 | 2.1-2.4 | AI pipeline: prompts, STT, LLM, TTS |
| 3 | 3.1 | Memory management |
| 4 | 4.1-4.2 | REST API + WebSocket |
| 5 | 5.1-5.10 | Frontend: types, hooks, components, pages |

---

## File Structure

backend/ (FastAPI): main.py, config.py, models/interview.py, routes/report.py
services/: stt.py, llm.py, tts.py, memory.py, state_machine.py, report.py
utils/prompts.py, tests/

frontend/ (Next.js): src/app/{page,interview,report}/, components/{Avatar,SubtitleDisplay,AudioRecorder,AudioPlayer,PrepForm},
hooks/{useWebSocket,useAudioCapture,useAudioPlayback}, lib/api.ts, types/index.ts

---

## Task 0.1: Backend scaffolding

Create backend/requirements.txt (fastapi, uvicorn, websockets, faster-whisper, edge-tts, httpx, pydantic, pydantic-settings, pytest, pytest-asyncio).
Create backend/app/config.py with Settings class (ollama_host, whisper_model/device/compute_type, tts_voice, max_interview_minutes=30, max_followups=2, sliding_window_rounds=8).
Commit: "chore: scaffold backend project"

---

## Task 0.2: Frontend scaffolding

Create package.json (next, react, recharts + tailwindcss, typescript dev deps).
next.config.js with rewrites proxy /api/* -> localhost:8000.
Create tsconfig.json, tailwind.config.ts, postcss.config.js.
Create layout.tsx (zh-CN lang, dark theme #0f1117/#e4e4e7) and globals.css.
Commit: "chore: scaffold frontend project"

---

## Task 1.1: Pydantic models

backend/app/models/interview.py: Enums (InterviewType, Difficulty, InterviewState), Models (InterviewConfig, QuestionRecord, InterviewSession).
Test: config defaults (MIXED/INTERMEDIATE), session initial state (INIT, empty questions).
Commit: "feat: add Pydantic data models"

---

## Task 1.2: State machine

backend/app/services/state_machine.py: VALID_TRANSITIONS dict, InterviewStateMachine class with transition_to() raising StateTransitionError.
Test: initial state, valid transition, invalid raises, full flow (INIT->OPENING->QA_LOOP->CLOSING->REPORT->DONE).
Commit: "feat: add interview state machine"

---

## Task 2.1: Prompt templates

backend/app/utils/prompts.py: SYSTEM_PROMPT_TEMPLATE (interview info, responsibilities, behavioral rules, memory context), build_system_prompt(). REPORT_PROMPT_TEMPLATE (7-dimension scoring with anchors, JSON output), build_report_prompt().
Commit: "feat: add prompt templates"

---

## Task 2.2: STT service

backend/app/services/stt.py: STTService with lazy faster-whisper loading, transcribe(audio_bytes) writes temp WAV, transcribes, returns text.
Test: silent WAV helper, transcribe returns str.
Commit: "feat: add STT service"

---

## Task 2.3: LLM service

backend/app/services/llm.py: LLMService(provider, api_key) supporting Ollama /api/chat and OpenAI /chat/completions. async chat(system_prompt, messages, temperature, max_tokens).
Test: init defaults, _build_chat_request structure.
Commit: "feat: add LLM service"

---

## Task 2.4: TTS service

backend/app/services/tts.py: TTSService using Edge-TTS Communicate stream, synthesize(text) returns MP3 bytes.
Test: valid text returns bytes, empty text returns empty.
Commit: "feat: add TTS service"

---

## Task 3.1: Memory manager

backend/app/services/memory.py: MemoryContext (fixed_header, stage_summaries, recent_rounds), MemoryManager with add_round(), summarize_stage(), get_context(), format_for_prompt(). Sliding window keeps last N rounds.
Test: init, add_round, sliding window (3/5 rounds), summarize_stage.
Commit: "feat: add hybrid memory manager"

---

## Task 4.1: FastAPI + WebSocket

backend/app/main.py: POST /interview/start creates session, returns session_id. GET /interview/{id}/status. WebSocket /ws/{id} runs 3-phase pipeline (OPENING -> QA_LOOP -> CLOSING). Uses StateMachine, MemoryManager, dynamic prompt rebuilding. Receives audio bytes -> STT -> LLM -> TTS -> sends text+audio back.
Commit: "feat: add FastAPI entry point with WebSocket pipeline"

---

## Task 4.2: Report endpoint

backend/app/routes/report.py: GET /report/{session_id} calls generate_report(session).
Register route in main.py.
Commit: "feat: add report API endpoint"

---

## Task 5.1: TypeScript types

frontend/src/types/index.ts: InterviewType, Difficulty, InterviewConfig, InterviewSession, DimensionScore, PerQuestionReview, ReportData, WSMessage, AvatarState.
Commit: "feat: add TypeScript type definitions"

---

## Task 5.2: REST API client

frontend/src/lib/api.ts: startInterview(config) -> InterviewSession, getReport(sessionId) -> ReportData.
Commit: "feat: add REST API client"

---

## Task 5.3: WebSocket hook

frontend/src/hooks/useWebSocket.ts: connects ws://localhost:8000/ws/{id}, returns { isConnected, messages, audioChunks, sendAudio, clearMessages }.
Commit: "feat: add WebSocket hook"

---

## Task 5.4: Audio hooks

useAudioCapture: MediaRecorder API, returns { isRecording, startRecording, stopRecording() -> Blob }.
useAudioPlayback: AudioContext decode+play on new chunks.
Commit: "feat: add audio capture and playback hooks"

---

## Task 5.5: Avatar component

frontend/src/components/Avatar.tsx: 192px circular avatar, 3 Tailwind-animated states (idle/thinking/speaking) with emoji + Chinese labels + pulsing borders.
Commit: "feat: add virtual avatar component"

---

## Task 5.6: Subtitle/Recorder/Player

SubtitleDisplay.tsx: scrollable box, AI messages left green, user right blue bubbles, errors centered red.
AudioRecorder.tsx: circular push-to-talk button with mic SVG, toggles recording.
AudioPlayer.tsx: hidden auto-play via useAudioPlayback.
Commit: "feat: add subtitle, recorder, player components"

---

## Task 5.7: Prep page

PrepForm.tsx: position input, tech stack chips, difficulty/type/model selectors. Submits via startInterview API.
page.tsx: title "AI Interviewer" + subtitle + PrepForm, navigates to /interview?session={id}.
Commit: "feat: add interview prep page"

---

## Task 5.8: Interview page

interview/page.tsx: reads session param, WebSocket connection. Shows connection indicator, Avatar, SubtitleDisplay, AudioRecorder, "结束面试" link to report.
Commit: "feat: add interview in-progress page"

---

## Task 5.9: Report page

backend/app/services/report.py: generate_report(session) uses REPORT_PROMPT_TEMPLATE, parses JSON response.
report/page.tsx: recharts RadarChart (7 dims), dimension cards, per-question review, summary.
Commit: "feat: add report generation and page"

---

## Task 5.10: README

README.md: features, architecture diagram, quick start (backend + frontend commands), license (MIT).
Commit: "docs: add project README"

---

## Plan Self-Review

Spec coverage: All 6 core modules covered. No TBD/TODO. Types aligned between Python models and TypeScript interfaces.

---

*Plan complete. Ready for execution handoff.*
