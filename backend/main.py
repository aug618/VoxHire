from __future__ import annotations

from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader

from .models import InterviewReport, SessionCreate, SessionCreated, TranscriptBatch
from .service import InterviewService

app = FastAPI(title="VoxHire API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
service = InterviewService()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/sessions", response_model=SessionCreated)
def create_session(payload: SessionCreate) -> SessionCreated:
    return service.create_session(payload)


@app.post("/api/sessions/{session_id}/transcript")
def mirror_transcript(session_id: str, payload: TranscriptBatch) -> dict[str, bool]:
    try:
        service.add_entries(session_id, payload.entries)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="会话不存在或已结束") from exc
    return {"accepted": True}


@app.post("/api/sessions/{session_id}/report", response_model=InterviewReport)
def report(session_id: str, payload: TranscriptBatch | None = None) -> InterviewReport:
    try:
        return service.build_report(session_id, payload.entries if payload else None)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="会话不存在或已结束") from exc


@app.post("/api/resume/extract")
async def extract_resume(file: UploadFile = File(...)) -> dict[str, str]:
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=415, detail="仅支持 PDF 简历")
    content = await file.read()
    if len(content) > 6 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF 不能超过 6MB")
    try:
        reader = PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise HTTPException(status_code=422, detail="无法读取该 PDF") from exc
    if not text:
        raise HTTPException(status_code=422, detail="PDF 中未提取到文本，请改用文本粘贴")
    return {"text": text[:12000]}
