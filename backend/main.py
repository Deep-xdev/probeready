
# from fastapi.responses import Response
# from elevenlabs_service import generate_question_speech
from question_service import generate_questions
from pydantic import BaseModel, Field
from ai_service import analyze_resume
from adaptive_service import generate_adaptive_follow_up
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
from io import BytesIO
from evaluation_service import evaluate_answer
from database import Base, engine, get_db
import models
from sqlalchemy.orm import Session
import json
import base64

from fastapi import Form

from voice_service import (
    transcribe_audio,
    generate_interviewer_reply,
    generate_speech
)


app = FastAPI(title="ProbeReady API")
Base.metadata.create_all(bind=engine)


# CORS configuration
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


# --------------------------------------------------
# RESUME MODELS
# --------------------------------------------------

class ResumeAnalysisRequest(BaseModel):
    extracted_text: str = Field(
        min_length=1,
        max_length=15000
    )



# --------------------------------------------------
# RESUME UPLOAD
# --------------------------------------------------

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
            import fitz

            pdf = fitz.open(
                stream=content,
                filetype="pdf"
            )

            extracted_text = "\n".join(
                page.get_text() for page in pdf
            )

            pdf.close()

        else:
            document = Document(BytesIO(content))

            extracted_text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
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


# --------------------------------------------------
# RESUME ANALYSIS
# --------------------------------------------------

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

    except Exception:
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

    resume = db.query(
        models.ResumeProfile
    ).order_by(
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


# --------------------------------------------------
# INTERVIEW HISTORY
# --------------------------------------------------

@app.get("/api/interviews")
def get_interview_history(db: Session = Depends(get_db)):

    sessions = db.query(
        models.InterviewSession
    ).order_by(
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


# --------------------------------------------------
# ANALYTICS
# --------------------------------------------------

@app.get("/api/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):

    sessions = db.query(
        models.InterviewSession
    ).order_by(
        models.InterviewSession.created_at.asc()
    ).all()

    questions = db.query(
        models.InterviewQuestion
    ).filter(
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

    skill_data = {}

    for question in questions:
        skill = question.skill or "Uncategorized"

        if skill not in skill_data:
            skill_data[skill] = []

        skill_data[skill].append(question.overall_score)

    skill_performance = [
        {
            "skill": skill,
            "average_score": round(
                sum(scores) / len(scores), 2
            ),
            "evaluated_questions": len(scores)
        }
        for skill, scores in skill_data.items()
    ]

    skill_performance.sort(
        key=lambda item: item["average_score"]
    )

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


# --------------------------------------------------
# INTERVIEW REQUEST MODELS
# --------------------------------------------------

class InterviewCreateRequest(BaseModel):
    title: str = "Technical Interview"
    questions: list[dict]


class QuestionGenerationRequest(BaseModel):
    resume_analysis: dict
    difficulty: str = "Mixed"
    question_count: int = Field(
        default=10,
        ge=1,
        le=20
    )


class AnswerEvaluationRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000
    )

    candidate_answer: str = Field(
        min_length=1,
        max_length=10000
    )

    context: str = Field(
        default="",
        max_length=5000
    )

    session_id: int
    question_index: int


# --------------------------------------------------
# INTERVIEW DETAILS
# --------------------------------------------------

@app.get("/api/interviews/{session_id}")
def get_interview_details(
    session_id: int,
    db: Session = Depends(get_db)
):

    interview = db.query(
        models.InterviewSession
    ).filter(
        models.InterviewSession.id == session_id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found."
        )

    ordered_questions = sorted(
        interview.questions,
        key=lambda question: question.id
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
                    "strengths": (
                        json.loads(question.strengths)
                        if question.strengths else []
                    ),
                    "gaps": (
                        json.loads(question.gaps)
                        if question.gaps else []
                    ),
                    "ideal_answer": question.ideal_answer
                }
                for question in ordered_questions
            ]
        }
    }


# --------------------------------------------------
# GENERATE INTERVIEW QUESTIONS
# --------------------------------------------------

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


# --------------------------------------------------
# CREATE INTERVIEW SESSION
# --------------------------------------------------

@app.post("/api/interviews")
def create_interview(
    request: InterviewCreateRequest,
    db: Session = Depends(get_db)
):

    new_session = models.InterviewSession(
        title=request.title
    )

    db.add(new_session)
    db.flush()

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

    db.commit()
    db.refresh(new_session)

    return {
        "success": True,
        "message": "Interview session saved successfully",
        "session_id": new_session.id,
        "title": new_session.title,
        "question_count": len(request.questions)
    }


# --------------------------------------------------
# EVALUATE ANSWER + ADAPTIVE FOLLOW-UP
# --------------------------------------------------

@app.post("/api/answers/evaluate")
async def evaluate_interview_answer(
    request: AnswerEvaluationRequest,
    db: Session = Depends(get_db)
):

    try:
        # 1. Find interview session
        interview = db.query(
            models.InterviewSession
        ).filter(
            models.InterviewSession.id == request.session_id
        ).first()

        if not interview:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found."
            )

        # 2. Fetch questions in database order
        session_questions = db.query(
            models.InterviewQuestion
        ).filter(
            models.InterviewQuestion.session_id == request.session_id
        ).order_by(
            models.InterviewQuestion.id
        ).all()

        # 3. Validate question index
        if (
            request.question_index < 0
            or request.question_index >= len(session_questions)
        ):
            raise HTTPException(
                status_code=404,
                detail="Interview question not found."
            )

        db_question = session_questions[
            request.question_index
        ]

        # 4. Verify submitted question
        if db_question.question_text != request.question:
            raise HTTPException(
                status_code=400,
                detail="Question does not match the selected interview question."
            )

        # 5. Evaluate candidate answer
        result = await evaluate_answer(
            question=request.question,
            candidate_answer=request.candidate_answer,
            context=request.context
        )

        # 6. Save answer and evaluation
        db_question.answer = request.candidate_answer

        db_question.technical_accuracy = result["technical_accuracy"]
        db_question.depth = result["depth"]
        db_question.clarity = result["clarity"]
        db_question.evidence = result["evidence"]
        db_question.overall_score = result["overall_score"]
        db_question.verdict = result["verdict"]
        db_question.feedback = result["feedback"]

        db_question.strengths = json.dumps(
            result["strengths"]
        )

        db_question.gaps = json.dumps(
            result["gaps"]
        )

        db_question.ideal_answer = result["ideal_answer"]

        db.flush()

        # 7. Identify whether this is already an adaptive question
        is_adaptive_question = (
            db_question.reason or ""
        ).startswith("Adaptive follow-up to question #")

        adaptive_follow_up = None

        # 8. Generate at most one adaptive follow-up
        # for each original question.
        if not is_adaptive_question:

            adaptive_marker = (
                f"Adaptive follow-up to question #{db_question.id}:"
            )

            existing_follow_up = db.query(
                models.InterviewQuestion
            ).filter(
                models.InterviewQuestion.session_id == request.session_id,
                models.InterviewQuestion.reason.like(
                    f"{adaptive_marker}%"
                )
            ).first()

            if not existing_follow_up:

                try:
                    adaptive_result = await generate_adaptive_follow_up(
                        question=db_question.question_text,
                        candidate_answer=request.candidate_answer,
                        evaluation=result,
                        context=request.context
                    )

                    if adaptive_result["ask_follow_up"]:

                        follow_up_text = adaptive_result[
                            "question"
                        ].strip()

                        follow_up_reason = adaptive_result[
                            "reason"
                        ].strip()

                        # Create actual database question
                        new_question = models.InterviewQuestion(
                            session_id=interview.id,
                            question_text=follow_up_text,
                            skill=db_question.skill,
                            category=db_question.category,
                            difficulty=adaptive_result["difficulty"],
                            reason=(
                                f"{adaptive_marker} "
                                f"{follow_up_reason}"
                            )
                        )

                        # Store follow-up on original question
                        db_question.follow_up = follow_up_text

                        db.add(new_question)
                        db.flush()

                        adaptive_follow_up = {
                            "question_id": new_question.id,
                            "question": new_question.question_text,
                            "category": new_question.category,
                            "difficulty": new_question.difficulty,
                            "reason": new_question.reason
                        }

                except Exception as follow_up_error:
                    # Do not lose a successful evaluation
                    # if follow-up generation fails.
                    print(
                        "Adaptive follow-up generation failed:",
                        str(follow_up_error)
                    )

        # 9. Update interview average score
        db.flush()

        evaluated_scores = [
            question.overall_score
            for question in session_questions
            if question.overall_score is not None
        ]

        if evaluated_scores:
            interview.overall_score = (
                sum(evaluated_scores) / len(evaluated_scores)
            )

        # 10. Commit all changes
        db.commit()

        return {
            "success": True,
            "evaluation": result,
            "adaptive_follow_up": adaptive_follow_up,
            "saved": True,
            "session_id": interview.id,
            "question_id": db_question.id
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        print(
            "Answer evaluation failed:",
            str(error)
        )

        raise HTTPException(
            status_code=502,
            detail="AI answer evaluation or database saving failed."
        )

# --------------------------------------------------
# LIVE AI INTERVIEWER
# --------------------------------------------------

MAX_AUDIO_SIZE = 10 * 1024 * 1024


@app.post("/api/voice/turn")
async def live_interview_turn(
    audio: UploadFile = File(...),
    original_question: str = Form(...),
    resume_context: str = Form(""),
    history: str = Form("[]")
):
    try:
        # 1. Validate the original question
        if not original_question.strip():
            raise HTTPException(
                status_code=400,
                detail="Original interview question is required."
            )

        # 2. Validate conversation history
        try:
            conversation_history = json.loads(history)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid conversation history."
            )

        if not isinstance(conversation_history, list):
            raise HTTPException(
                status_code=400,
                detail="Conversation history must be a list."
            )

        # 3. Read uploaded audio
        audio_bytes = await audio.read()

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Audio recording is empty."
            )

        if len(audio_bytes) > MAX_AUDIO_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Audio recording exceeds 10 MB."
            )

        filename = audio.filename or "answer.webm"

        # 4. Convert speech to text
        transcript = await transcribe_audio(
            audio_bytes=audio_bytes,
            filename=filename
        )

        # 5. Generate the interviewer's next response
        reply = await generate_interviewer_reply(
            transcript=transcript,
            original_question=original_question,
            resume_context=resume_context[:5000],
            history=conversation_history
        )

        # 6. Generate spoken audio for the response
        speech_bytes = await generate_speech(reply)

        # 7. Encode audio for JSON response
        audio_base64 = base64.b64encode(
            speech_bytes
        ).decode("utf-8")

        return {
            "success": True,
            "transcript": transcript,
            "reply": reply,
            "audio_base64": audio_base64,
            "audio_mime_type": "audio/wav"
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print("LIVE INTERVIEW ERROR:", str(error))

        raise HTTPException(
            status_code=502,
            detail="Live AI interviewer failed. Please try again."
        )
