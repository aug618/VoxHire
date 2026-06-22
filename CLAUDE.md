# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

每次回复时，先要说一句：奶龙好，然后再继续回复内容。

## 项目概述

AI 面试官 — 一个支持实时语音+虚拟形象交互的 AI 面试系统。AI 根据用户提供的面试范围与辅助资料主导面试，面试结束后生成评估报告。

**当前阶段：** 设计已完成，进入实现计划阶段。

## 核心文档

[DESIGN.md](DESIGN.md) 为设计讨论稿，持续迭代。最终决策以 spec 文档为准。
- 项目愿景与核心原则（本地优先、云端增强、模块化）
- 技术架构方案（React/Next.js + Python/FastAPI + AI 模型）
- LLM 面试策略（状态机、Prompt 结构、多模型混合调度）
- 已决策记录（详见 spec 文档）
- MVP 范围已确认（详见 spec 文档）
- 完整的系统设计 spec：[docs/superpowers/specs/2026-06-22-ai-interviewer-design.md](docs/superpowers/specs/2026-06-22-ai-interviewer-design.md)


## 设计决策（已完成）

所有核心设计决策已在 [2026-06-22 brainstorming spec](docs/superpowers/specs/2026-06-22-ai-interviewer-design.md) 中确认。关键决策摘要：

| 决策点 | 选择 |
|--------|------|
| 交互形态 | 语音 + 虚拟形象 |
| 面试类型 | 技术面 + 行为面为主，综合面支持 |
| 技术栈 | React/Next.js + Python/FastAPI |
| 部署形态 | Web 应用 + 后续 Electron 壳 |
| LLM 策略 | 先单 Agent，后多 Agent |
| 评分维度 | 7 维（4 技术 + 3 行为）|
| 对话记忆 | 混合策略（固定头 + 摘要 + 滑动窗口）|
| STT 方案 | 先句子级，后流式 |
## 技术架构（方案阶段，未定稿）

- **前端：** React/Next.js + MediaStream API（音频）
- **后端：** Python FastAPI + WebSocket + 会话管理
- **AI 技术栈：** STT（Whisper）、LLM（Ollama 本地 / API 云端）、TTS（Edge-TTS / Coqui）
- **核心原则：** 各组件可独立替换（本地方案 ↔ 云端方案）