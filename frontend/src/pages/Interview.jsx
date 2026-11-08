
import { useState } from "react";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  MessageSquare,
  ChartNoAxesCombined,
  Settings,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  LoaderCircle
} from "lucide-react";

import { useInterview } from "../context/InterviewContext";
import { Link } from "react-router-dom";
import "./Interview.css";



function Sidebar() {
  const navigation = [
    { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
    { icon: FileText, label: "My Resume", link: "/resume" },
    { icon: MessageSquare, label: "Mock Interview", link: "/interview" },
    { icon: ChartNoAxesCombined, label: "Analytics", link: "/analytics" }
  ];

  return (
    <aside className="interview-sidebar">
      <Link to="/" className="resume-brand">
        <BrainCircuit size={26} />
        <span>Probe<span>Ready</span></span>
      </Link>

      <p className="resume-sidebar-label">WORKSPACE</p>

      <nav className="resume-nav">
        {navigation.map(({ icon: Icon, label, link }) => (
          <Link
            key={label}
            to={link}
            className={`resume-nav-link ${
              label === "Mock Interview" ? "active" : ""
            }`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="resume-sidebar-bottom">
        <div className="resume-nav-link">
          <Settings size={19} />
          <span>Settings</span>
        </div>

        <div className="resume-user">
          <div className="resume-avatar">DS</div>
          <div>
            <h4>Candidate</h4>
            <p>Free Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Interview() {
  const {
  questions,
  sessionId,
  currentIndex,
  setCurrentIndex,
  answers,
  evaluations,
  saveAnswer,
  saveEvaluation
} = useInterview();

const [answer, setAnswer] = useState(
  answers[currentIndex] || ""
);
const [evaluation, setEvaluation] = useState(null);
const [isEvaluating, setIsEvaluating] = useState(false);
const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex];
  const savedEvaluation = evaluation || evaluations[currentIndex];
  const completedEvaluations = evaluations.filter(Boolean);

const totalCompleted = completedEvaluations.length;

function calculateAverage(metric) {
  if (totalCompleted === 0) return 0;

  const total = completedEvaluations.reduce(
    (sum, item) => sum + item[metric],
    0
  );

  return Number((total / totalCompleted).toFixed(1));
}

const performanceSummary = {
  overall: calculateAverage("overall_score"),
  technicalAccuracy: calculateAverage("technical_accuracy"),
  depth: calculateAverage("depth"),
  clarity: calculateAverage("clarity"),
  evidence: calculateAverage("evidence")
};

const performanceMetrics = [
  { label: "Technical Accuracy", score: performanceSummary.technicalAccuracy },
  { label: "Depth", score: performanceSummary.depth },
  { label: "Clarity", score: performanceSummary.clarity },
  { label: "Evidence", score: performanceSummary.evidence }
];

const strongestArea = [...performanceMetrics].sort(
  (a, b) => b.score - a.score
)[0];

const weakestArea = [...performanceMetrics].sort(
  (a, b) => a.score - b.score
)[0];

  async function handleEvaluate() {
    if (!answer.trim() || !currentQuestion || isEvaluating) return;

    setIsEvaluating(true);
    setError("");


    try {
      const response = await fetch("/api/answers/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        question: currentQuestion.question,
        candidate_answer: answer,
        context: currentQuestion.reason,
        session_id: sessionId,
        question_index: currentIndex
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Answer evaluation failed.");
      }

      setEvaluation(data.evaluation);
        saveAnswer(currentIndex, answer);
        saveEvaluation(currentIndex, data.evaluation);

    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err.message || "Unable to evaluate your answer.");
    } finally {
      setIsEvaluating(false);
    }
  }

  
function handleNextQuestion() {
  if (currentIndex < questions.length - 1) {
    const nextIndex = currentIndex + 1;

    setCurrentIndex(nextIndex);
    setAnswer(answers[nextIndex] || "");
    setEvaluation(null);
    setError("");
  }

}
function handlePreviousQuestion() {
  if (currentIndex > 0) {
    const previousIndex = currentIndex - 1;

    setCurrentIndex(previousIndex);
    setAnswer(answers[previousIndex] || "");
    setEvaluation(null);
    setError("");
  }
}
  return (
    <div className="interview-layout">
      <Sidebar />

      <main className="interview-main">

        <header className="resume-topbar">
          <div>
            <span className="resume-breadcrumb">
              WORKSPACE / MOCK INTERVIEW
            </span>
            <h2>Technical Interview</h2>
          </div>

          <div className="resume-top-avatar">DS</div>
        </header>

        <section className="interview-heading">
          <span className="resume-eyebrow">
            <BrainCircuit size={15} />
            PROBEREADY INTERVIEW ENGINE
          </span>

          <h1>Prove what you <span>actually know.</span></h1>

          <p>
            Answer personalized questions and receive AI-powered
            feedback on your technical understanding.
          </p>
        </section>

        {questions.length === 0 ? (
          <div className="interview-empty">
            <MessageSquare size={38} />

            <h3>No interview questions yet</h3>

            <p>
              First upload and analyze your resume, then generate
              personalized interview questions.
            </p>

            <Link to="/resume" className="resume-continue-button">
              Go to My Resume <ArrowRight size={17} />
            </Link>
          </div>
        ) : totalCompleted === questions.length ? (
            
<section className="interview-completion">

  <div className="completion-header">
    <span className="resume-eyebrow">
      <CheckCircle2 size={16} />
      INTERVIEW COMPLETED
    </span>

    <h2>You made it through!</h2>

    <p>
      Here's your performance across all evaluated questions.
    </p>
  </div>

  <div className="completion-score-card">
    <span>OVERALL PERFORMANCE</span>

    <h1>{performanceSummary.overall}<small>/10</small></h1>

    <p>
      {totalCompleted} of {questions.length} questions completed
    </p>
  </div>

  <div className="completion-metrics">
    {performanceMetrics.map((metric) => (
      <div className="completion-metric" key={metric.label}>
        <div className="completion-metric-heading">
          <span>{metric.label}</span>
          <strong>{metric.score}/10</strong>
        </div>

        <div className="completion-progress">
          <div
            style={{ width: `${metric.score * 10}%` }}
          />
        </div>
      </div>
    ))}
  </div>

  <div className="completion-insights">
    <div>
      <h4>Strongest Area</h4>
      <p>{strongestArea.label}</p>
      <strong>{strongestArea.score}/10</strong>
    </div>

    <div>
      <h4>Needs Improvement</h4>
      <p>{weakestArea.label}</p>
      <strong>{weakestArea.score}/10</strong>
    </div>
  </div>

  <button
    type="button"
    className="resume-continue-button"
    onClick={() => window.location.href = "/dashboard"}
  >
    Return to Dashboard <ArrowRight size={17} />
  </button>

</section>
    ) : (
          <section className="interview-workspace">

            <div className="interview-progress">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>

              <span>{currentQuestion.difficulty}</span>
            </div>
            {currentIndex > 0 && (
            <button
                type="button"
                className="interview-previous-button"
                onClick={handlePreviousQuestion}
            >
                <ArrowLeft size={16} />
                Previous Question
            </button>
            )}

            <div className="interview-question-card">
              <span>{currentQuestion.category}</span>
              <h3>{currentQuestion.question}</h3>
              <p>{currentQuestion.reason}</p>
            </div>

            <div className="interview-answer-card">
              <label htmlFor="candidateAnswer">
                YOUR ANSWER
              </label>

              <textarea
                id="candidateAnswer"
                value={answer}
                onChange={(event) => {
                const value = event.target.value;
                setAnswer(value);
                saveAnswer(currentIndex, value);
                }}
                placeholder="Explain your answer with technical details..."
                rows={8}
                disabled={isEvaluating}
              />

              <button
                type="button"
                className="resume-continue-button"
                onClick={handleEvaluate}
                disabled={!answer.trim() || isEvaluating}
              >
                {isEvaluating ? (
                  <>
                    <LoaderCircle size={17} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Evaluate My Answer <Send size={17} />
                  </>
                )}
              </button>

              {error && (
                <div className="resume-error">{error}</div>
              )}
            </div>

            {savedEvaluation  && (
              <div className="evaluation-results">
                <span className="resume-eyebrow">
                  <CheckCircle2 size={15} />
                  EVALUATION COMPLETE
                </span>

                <h3>
                  Overall Score: {savedEvaluation.overall_score}/10
                </h3>

                <p>Verdict: {savedEvaluation.verdict}</p>

                <div className="evaluation-feedback">
                  <h4>Feedback</h4>
                  <p>{savedEvaluation.feedback}</p>

                  <h4>Strengths</h4>
                  {savedEvaluation.strengths.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}

                  <h4>Knowledge Gaps</h4>
                  {savedEvaluation.gaps.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}

                  <h4>Ideal Answer</h4>
                  <p>{savedEvaluation.ideal_answer}</p>
                </div>

                {currentIndex < questions.length - 1 && (
                  <button
                    type="button"
                    className="resume-continue-button"
                    onClick={handleNextQuestion}
                  >
                    Next Question <ArrowRight size={17} />
                  </button>
                )}
              </div>
            )}

          </section>
        )}

        <footer className="resume-footer">
          ProbeReady © 2026
          <span>Built to test what you actually know.</span>
        </footer>

      </main>
    </div>
  );
}

export default Interview;
