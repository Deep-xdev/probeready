
import "./InterviewReport.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from "lucide-react";

function InterviewReport() {
  const { sessionId } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(
          `/api/interviews/${sessionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load interview report."
          );
        }

        setInterview(data.interview);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (loading) {
    return <div className="report-page">Loading interview report...</div>;
  }

  if (error) {
    return (
      <div className="report-page">
        <p>{error}</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="report-page">
      <header className="report-header">
        <Link to="/dashboard" className="report-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <div className="report-brand">
          <BrainCircuit size={24} />
          ProbeReady
        </div>
      </header>

      <main className="report-container">
        <span className="report-eyebrow">INTERVIEW REPORT</span>

        <h1>{interview.title}</h1>

        <p>
          {new Date(interview.created_at).toLocaleString()}
        </p>

        <div className="report-summary">
          <div>
            <span>Overall Score</span>
            <h2>
              {interview.overall_score === null
                ? "Pending"
                : `${interview.overall_score.toFixed(1)}/10`}
            </h2>
          </div>

          <div>
            <span>Questions</span>
            <h2>{interview.questions.length}</h2>
          </div>

          <div>
            <span>Evaluated</span>
            <h2>
              {interview.questions.filter(q => q.answer !== null).length}
            </h2>
          </div>
        </div>

        <h2 className="report-section-title">Question Breakdown</h2>

        {interview.questions.map((question, index) => (
          <article className="report-question" key={question.question_id}>
            <div className="report-question-heading">
              <span>QUESTION {index + 1}</span>

              <span className="report-question-score">
                {question.overall_score === null
                  ? "Not evaluated"
                  : `${question.overall_score}/10`}
              </span>
            </div>

            <h3>{question.question}</h3>

            <p className="report-meta">
              {question.category} · {question.difficulty}
            </p>

            <div className="report-answer">
              <h4>
                <MessageSquare size={16} /> Your Answer
              </h4>
              <p>{question.answer || "No answer submitted."}</p>
            </div>

            {question.overall_score !== null && (
              <>
                <div className="report-scores">
                  <span>Technical accuracy: {question.technical_accuracy}/10</span>
                  <span>Depth: {question.depth}/10</span>
                  <span>Clarity: {question.clarity}/10</span>
                  <span>Evidence: {question.evidence}/10</span>
                </div>

                <div className="report-feedback">
                  <h4>AI Feedback</h4>
                  <p>{question.feedback}</p>
                </div>

                <div className="report-strengths">
                  <h4><CheckCircle2 size={16} /> Strengths</h4>
                  {question.strengths.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>

                <div className="report-gaps">
                  <h4><AlertCircle size={16} /> Areas to improve</h4>
                  {question.gaps.map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>

                <details className="report-ideal-answer">
                  <summary>View ideal answer</summary>
                  <p>{question.ideal_answer}</p>
                </details>
              </>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}

export default InterviewReport;
