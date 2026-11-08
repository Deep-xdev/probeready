
import "./Analytics.css";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Target,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";


function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/overview");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load analytics."
          );
        }

        setAnalytics(data.overview);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-page">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-page">Error: {error}</div>;
  }

  const {
  total_interviews,
  evaluated_answers,
  overall_average,
  score_trend,
  skill_performance,
  weakest_skill
} = analytics;

  const latestScore = score_trend.length
    ? score_trend[score_trend.length - 1].score
    : null;

  const previousScore = score_trend.length > 1
    ? score_trend[score_trend.length - 2].score
    : null;

  const improvement = latestScore !== null && previousScore !== null
    ? Number((latestScore - previousScore).toFixed(1))
    : null;

  return (
    <div className="analytics-page">

      <header className="analytics-header">
        <Link to="/dashboard" className="analytics-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <div className="analytics-brand">
          <BrainCircuit size={24} />
          ProbeReady
        </div>
      </header>

      <main className="analytics-container">

        <div className="analytics-heading">
          <span>PERFORMANCE INTELLIGENCE</span>
          <h1>Your Analytics</h1>
          <p>
            Understand your interview performance,
            identify weaknesses and track your progress.
          </p>
        </div>

        <section className="analytics-stats">

          <div className="analytics-card">
            <div className="analytics-card-icon">
              <MessageSquare />
            </div>
            <span>Total Interviews</span>
            <h2>{total_interviews}</h2>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon">
              <Target />
            </div>
            <span>Evaluated Answers</span>
            <h2>{evaluated_answers}</h2>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon">
              <BarChart3 />
            </div>
            <span>Overall Average</span>
            <h2>{overall_average.toFixed(1)}/10</h2>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon">
              <Activity />
            </div>
            <span>Latest Performance</span>
            <h2>
              {latestScore === null
                ? "N/A"
                : `${latestScore.toFixed(1)}/10`}
            </h2>

            {improvement !== null && (
              <small className={improvement >= 0 ? "positive-change" : "negative-change"}>
                {improvement >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {improvement > 0 ? "+" : ""}{improvement} points
              </small>
            )}
          </div>

        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span>PERFORMANCE HISTORY</span>
              <h2>Interview Score Trend</h2>
            </div>
            <TrendingUp size={22} />
          </div>

          {score_trend.length === 0 ? (
            <p>No completed interviews available yet.</p>
          ) : (
            <div className="trend-list">
              {score_trend.map((item) => (
                <div className="trend-item" key={item.session_id}>
                  <div className="trend-label">
                    <span>Interview #{item.session_id}</span>
                    <strong>{item.score.toFixed(1)}/10</strong>
                  </div>

                  <div className="trend-track">
                    <div
                      className="trend-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, item.score * 10))}%`
                      }}
                    />
                  </div>

                  <small>
                    {new Date(item.date).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>



        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>

<section className="analytics-panel weakness-panel">
  <div className="analytics-panel-heading">
    <div>
      <span>PERSONALIZED DIAGNOSIS</span>
      <h2>Weakness Detection</h2>
    </div>
    <Target size={22} />
  </div>

  {!weakest_skill ? (
    <p>
      Complete and evaluate an interview to identify your weakest skill.
    </p>
  ) : (
    <div className="weakness-content">
      <div className="weakness-highlight">
        <span>YOUR WEAKEST SKILL</span>
        <h3>{weakest_skill.skill}</h3>
        <strong>
          {weakest_skill.average_score.toFixed(1)}/10
        </strong>
        <small>{weakest_skill.status}</small>
      </div>

      <div className="weakness-recommendation">
        <span>RECOMMENDED ACTION</span>
        <p>{weakest_skill.recommendation}</p>
      </div>
    </div>
  )}
</section>

              <span>KNOWLEDGE BREAKDOWN</span>
              <h2>Category Performance</h2>
            </div>
            <BrainCircuit size={22} />
          </div>

          {skill_performance.length === 0 ? (
            <p>No category performance data available yet.</p>
          ) : (
            <div className="category-list">
              {skill_performance.map((skill) => (
                <div className="category-item" key={skill.skill}>
                  <div className="category-info">
  <div className="skill-title">
    <strong>{skill.skill}</strong>

    <span className={`proficiency-badge ${skill.proficiency.toLowerCase()}`}>
      {skill.proficiency}
    </span>
  </div>

  <span>
    {skill.average_score.toFixed(1)}/10
  </span>
</div>

                  <div className="trend-track">
                    <div
                      className="trend-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, skill.average_score * 10))}%`
                      }}
                    />
                  </div>

                  <small>
                    {skill.evaluated_questions} evaluated questions
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Analytics;
