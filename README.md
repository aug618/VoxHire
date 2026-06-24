# 🎙️ VoxHire

**AI 面试官** — 一个支持实时语音+虚拟形象交互的智能面试系统

[![GitHub stars](https://img.shields.io/github/stars/aug618/VoxHire?style=social)](https://github.com/aug618/VoxHire)
[![GitHub license](https://img.shields.io/github/license/aug618/VoxHire)](https://github.com/aug618/VoxHire)

## ✨ 核心特性

- 🎙️ **实时语音交互** - 支持语音输入和输出
- 🤖 **AI 主导面试** - AI 主动引导面试流程
- 👤 **虚拟形象** - 沉浸式面试体验
- 📊 **智能评估** - 面试后生成详细评估报告
- 🎯 **多类型支持** - 技术面、行为面、综合面

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│           React/Next.js + MediaStream           │
└───────────────────────┬─────────────────────────┘
                        │ WebSocket
┌───────────────────────┴─────────────────────────┐
│                   Backend                       │
│            Python/FastAPI + WebSocket            │
├─────────────────────────────────────────────────┤
│  STT (Whisper) │ LLM (Ollama/API) │ TTS (Edge) │
└─────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- uv (Python 包管理)

### 安装

```bash
# 克隆仓库
git clone git@github.com:aug618/VoxHire.git
cd VoxHire

# 前端依赖
npm install

# 后端依赖
cd backend
uv venv
uv pip install -e .
```

### 运行

```bash
# 启动后端
cd backend
uv run uvicorn main:app --reload

# 启动前端
npm run dev
```

## 📁 项目结构

```
VoxHire/
├── frontend/          # React/Next.js 前端
├── backend/           # Python/FastAPI 后端
├── docs/              # 文档
│   ├── superpowers/   # 设计文档
│   └── api/           # API 文档
└── CLAUDE.md          # AI 开发指南
```

## 🎯 面试评分维度

### 技术维度 (4 项)
1. **技术知识** - 专业领域知识掌握程度
2. **问题解决** - 分析和解决问题的能力
3. **代码质量** - 代码编写和设计能力
4. **系统设计** - 架构和系统设计能力

### 行为维度 (3 项)
5. **沟通表达** - 清晰表达和沟通能力
6. **团队协作** - 团队合作和协作精神
7. **学习能力** - 学习新知识和适应能力

## 🔧 配置

### 环境变量

```bash
# 后端
DATABASE_URL=sqlite:///./interview.db
LLM_PROVIDER=ollama  # 或 openai
TTS_PROVIDER=edge    # 或 coqui

# 前端
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📖 文档

- [设计文档](docs/superpowers/specs/2026-06-22-ai-interviewer-design.md)
- [实现计划](docs/superpowers/plans/2026-06-22-ai-interviewer.md)
- [API 文档](docs/api/)

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响代码运行的变动）
refactor: 重构（既不是新增功能，也不是修改 bug 的代码变动）
test: 增加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [OpenAI Whisper](https://github.com/openai/whisper) - 语音识别
- [Edge-TTS](https://github.com/rany2/edge-tts) - 语音合成
- [FastAPI](https://fastapi.tiangolo.com/) - Web 框架
- [Next.js](https://nextjs.org/) - React 框架

---

**VoxHire** - 让 AI 面试更智能、更专业、更人性化 🚀
