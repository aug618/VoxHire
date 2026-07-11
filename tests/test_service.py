from backend.models import SessionCreate, TranscriptEntry
from backend.service import InterviewService


def test_creates_five_question_interview() -> None:
    service = InterviewService()
    session = service.create_session(
        SessionCreate(role="后端工程师", experience_years=3, skills=["Python"], resume_text="", job_description="")
    )
    assert len(session.questions) == 5
    assert "后端工程师" in session.gateway_instructions


def test_generates_complete_seven_dimension_report() -> None:
    service = InterviewService()
    session = service.create_session(
        SessionCreate(role="前端工程师", experience_years=2, skills=["React"], resume_text="", job_description="")
    )
    service.add_entries(session.session_id, [TranscriptEntry(role="user", text="我会先复现问题并查看监控，再进行假设验证。")])
    report = service.build_report(session.session_id)
    assert len(report.dimensions) == 7
    assert 10 <= report.overall_score <= 100
