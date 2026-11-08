from question_service import generate_questions
from pydantic import BaseModel, Field
from ai_service import analyze_resume
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
from io import BytesIO
from evaluation_service import evaluate_answer
import fitz
from database import Base, engine
import models
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
import json


app = FastAPI(title="ProbeReady API")
Base.metadata.create_all(bind=engine)

# Development configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024


@app.get("/")
def home():
    return {
        "message": "Welcome to ProbeReady API",
        "status": "running"
    }

class ResumeAnalysisRequest(BaseModel):
    extracted_text: str = Field(
        min_length=1,
        max_length=15000
    )

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    filename = file.filename or ""
    extension = filename.lower().rsplit(".", 1)[-1]

    if extension not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5 MB."
        )

    try:
        if extension == "pdf":
            pdf = fitz.open(stream=content, filetype="pdf")
            extracted_text = "\n".join(
                page.get_text() for page in pdf
            )
            pdf.close()

        else:
            document = Document(BytesIO(content))
            extracted_text = "\n".join(
                paragraph.text for paragraph in document.paragraphs
            )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this document. Please upload a valid file."
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the document."
        )

    return {
        "success": True,
        "filename": filename,
        "character_count": len(extracted_text),
        "extracted_text": extracted_text
    }

@app.post("/api/resume/analyze")
async def resume_analysis(
    request: ResumeAnalysisRequest,
    filename: str,
    db: Session = Depends(get_db)
):
    try:
        result = await analyze_resume(request.extracted_text)

        resume = models.ResumeProfile(
            filename=filename,
            analysis=json.dumps(result)
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "success": True,
            "analysis": result,
            "resume_id": resume.id,
            "filename": resume.filename
        }

    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        import traceback

        db.rollback()

        print("RESUME ANALYSIS ERROR:")
        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail="Resume analysis or database saving failed."
    )

@app.get("/api/resume/latest")
def get_latest_resume(db: Session = Depends(get_db)):

    resume = db.query(models.ResumeProfile).order_by(
        models.ResumeProfile.created_at.desc()
    ).first()

    if not resume:
        return {
            "success": True,
            "resume": None
        }

    return {
        "success": True,
        "resume": {
            "id": resume.id,
            "filename": resume.filename,
            "analysis": json.loads(resume.analysis),
            "created_at": resume.created_at
        }
    }

@app.get("/api/interviews")
def get_interview_history(db: Session = Depends(get_db)):

    sessions = db.query(models.InterviewSession).order_by(
        models.InterviewSession.created_at.desc()
    ).all()

    return {
        "success": True,
        "interviews": [
            {
                "session_id": session.id,
                "title": session.title,
                "created_at": session.created_at,
                "overall_score": session.overall_score,
                "question_count": len(session.questions),
                "evaluated_count": sum(
                    1 for question in session.questions
                    if question.answer is not None
                )
            }
            for session in sessions
        ]
    }


@app.get("/api/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):

    sessions = db.query(models.InterviewSession).order_by(
        models.InterviewSession.created_at.asc()
    ).all()

    questions = db.query(models.InterviewQuestion).filter(
        models.InterviewQuestion.overall_score.isnot(None)
    ).all()

    total_interviews = len(sessions)
    total_evaluated = len(questions)

    overall_average = (
        sum(q.overall_score for q in questions) / total_evaluated
        if total_evaluated else 0
    )

    score_trend = [
        {
            "session_id": session.id,
            "date": session.created_at,
            "score": session.overall_score
        }
        for session in sessions
        if session.overall_score is not None
    ]

    # Group performance by actual skill
    skill_data = {}

    for question in questions:
        skill = question.skill or "Uncategorized"

        if skill not in skill_data:
            skill_data[skill] = []

        skill_data[skill].append(question.overall_score)

    skill_performance = [
        {
            "skill": skill,
            "average_score": round(sum(scores) / len(scores), 2),
            "evaluated_questions": len(scores)
        }
        for skill, scores in skill_data.items()
    ]

    skill_performance.sort(
        key=lambda item: item["average_score"]
    )

    
    # Identify weak and strong skills
    for item in skill_performance:
        score = item["average_score"]

        if score < 4:
            item["status"] = "Weak"
            item["proficiency"] = "Beginner"
            item["recommendation"] = (
                "Revise fundamentals and practice basic questions."
            )

        elif score < 7:
            item["status"] = "Needs Improvement"
            item["proficiency"] = "Intermediate"
            item["recommendation"] = (
                "Practice implementation and solve practical problems."
            )

        elif score < 9:
            item["status"] = "Strong"
            item["proficiency"] = "Advanced"
            item["recommendation"] = (
                "Practice advanced problems and explore deeper concepts."
            )

        else:
            item["status"] = "Excellent"
            item["proficiency"] = "Expert"
            item["recommendation"] = (
                "Maintain mastery through complex projects and challenges."
            )

    # Identify the weakest skill
    weakest_skill = (
        skill_performance[0]
        if skill_performance
        else None
    )

    return {
        "success": True,
        "overview": {
            "total_interviews": total_interviews,
            "evaluated_answers": total_evaluated,
            "overall_average": round(overall_average, 2),
            "score_trend": score_trend,
            "skill_performance": skill_performance,
            "weakest_skill": weakest_skill
        }
    }

class InterviewCreateRequest(BaseModel):
    title: str = "Technical Interview"
    questions: list[dict]



@app.get("/api/interviews/{session_id}")
def get_interview_details(
    session_id: int,
    db: Session = Depends(get_db)
):
    interview = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == session_id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found."
        )

    return {
        "success": True,
        "interview": {
            "session_id": interview.id,
            "title": interview.title,
            "created_at": interview.created_at,
            "overall_score": interview.overall_score,
            "questions": [
                {
                    "question_id": question.id,
                    "question": question.question_text,
                    "category": question.category,
                    "difficulty": question.difficulty,
                    "reason": question.reason,
                    "follow_up": question.follow_up,
                    "answer": question.answer,
                    "technical_accuracy": question.technical_accuracy,
                    "depth": question.depth,
                    "clarity": question.clarity,
                    "evidence": question.evidence,
                    "overall_score": question.overall_score,
                    "verdict": question.verdict,
                    "feedback": question.feedback,
                    "strengths": json.loads(question.strengths) if question.strengths else [],
                    "gaps": json.loads(question.gaps) if question.gaps else [],
                    "ideal_answer": question.ideal_answer
                }
                for question in interview.questions
            ]
        }
    }

class QuestionGenerationRequest(BaseModel):
    resume_analysis: dict
    difficulty: str = "Mixed"
    question_count: int = Field(default=10, ge=1, le=20)


@app.post("/api/questions/generate")
async def generate_interview_questions(
    request: QuestionGenerationRequest
):
    try:
        result = await generate_questions(
            resume_analysis=request.resume_analysis,
            difficulty=request.difficulty,
            question_count=request.question_count
        )

        return {
            "success": True,
            "questions": result["questions"]
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(f"Question generation failed: {error}")

        raise HTTPException(
            status_code=502,
            detail="AI question generation failed. Please try again."
        )

@app.post("/api/interviews")
def create_interview(
    request: InterviewCreateRequest,
    db: Session = Depends(get_db)
):
    # Create a new interview session
    new_session = models.InterviewSession(
        title=request.title
    )

    db.add(new_session)
    db.flush()

    # Save every generated question
    for question in request.questions:
        new_question = models.InterviewQuestion(
            session_id=new_session.id,
            question_text=question.get("question", ""),
            skill=question.get("skill"),
            category=question.get("category"),
            difficulty=question.get("difficulty"),
            reason=question.get("reason"),
            follow_up=question.get("follow_up")
        )

        db.add(new_question)

    # Commit everything to SQLite
    db.commit()
    db.refresh(new_session)

    return {
        "success": True,
        "message": "Interview session saved successfully",
        "session_id": new_session.id,
        "title": new_session.title,
        "question_count": len(request.questions)
    }

class AnswerEvaluationRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    candidate_answer: str = Field(min_length=1, max_length=10000)
    context: str = Field(default="", max_length=5000)
    session_id: int
    question_index: int


@app.post("/api/answers/evaluate")
async def evaluate_interview_answer(
    request: AnswerEvaluationRequest,
    db: Session = Depends(get_db)
):
    try:
        # 1. Find the interview session
        interview = db.query(models.InterviewSession).filter(
            models.InterviewSession.id == request.session_id
        ).first()

        if not interview:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found."
            )

        # 2. Find all questions belonging to this session
        session_questions = db.query(models.InterviewQuestion).filter(
            models.InterviewQuestion.session_id == request.session_id
        ).order_by(models.InterviewQuestion.id).all()

        # 3. Validate the question index
        if request.question_index < 0 or request.question_index >= len(session_questions):
            raise HTTPException(
                status_code=404,
                detail="Interview question not found."
            )

        db_question = session_questions[request.question_index]

        # 4. Generate AI evaluation
        result = await evaluate_answer(
            question=request.question,
            candidate_answer=request.candidate_answer,
            context=request.context
        )

        # 5. Save answer and evaluation
        db_question.answer = request.candidate_answer
        db_question.technical_accuracy = result["technical_accuracy"]
        db_question.depth = result["depth"]
        db_question.clarity = result["clarity"]
        db_question.evidence = result["evidence"]
        db_question.overall_score = result["overall_score"]
        db_question.verdict = result["verdict"]
        db_question.feedback = result["feedback"]
        db_question.strengths = json.dumps(result["strengths"])
        db_question.gaps = json.dumps(result["gaps"])
        db_question.ideal_answer = result["ideal_answer"]

        # 6. Update the session's average score
        db.flush()

        evaluated_scores = [
            question.overall_score
            for question in session_questions
            if question.overall_score is not None
        ]

        if evaluated_scores:
            interview.overall_score = sum(evaluated_scores) / len(evaluated_scores)

        db.commit()

        return {
            "success": True,
            "evaluation": result,
            "saved": True,
            "session_id": interview.id,
            "question_id": db_question.id
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        print(f"Answer evaluation failed: {error}")

        raise HTTPException(
            status_code=502,
            detail="AI answer evaluation or database saving failed."
        )
