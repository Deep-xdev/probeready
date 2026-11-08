
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False, default="Technical Interview")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    overall_score = Column(Float, nullable=True)

    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("interview_sessions.id"),
        nullable=False
    )

    question_text = Column(Text, nullable=False)
    skill = Column(String(100), nullable=True)
    category = Column(String(100))
    difficulty = Column(String(50))
    reason = Column(Text)
    follow_up = Column(Text)

    answer = Column(Text, nullable=True)

    technical_accuracy = Column(Integer, nullable=True)
    depth = Column(Integer, nullable=True)
    clarity = Column(Integer, nullable=True)
    evidence = Column(Integer, nullable=True)
    overall_score = Column(Integer, nullable=True)

    verdict = Column(String(50), nullable=True)
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    gaps = Column(Text, nullable=True)
    ideal_answer = Column(Text, nullable=True)

    session = relationship(
        "InterviewSession",
        back_populates="questions"
    )

class ResumeProfile(Base):
    __tablename__ = "resume_profiles"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    analysis = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())