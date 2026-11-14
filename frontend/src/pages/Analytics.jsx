
import "./Analytics.css";
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Target,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from "lucide-react";

import WorkspaceLayout from "../components/WorkspaceLayout";

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
          throw new Error(data.detail || "Failed to load analytics.");
        }

        setAnalytics(data.overview);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <WorkspaceLayout title="Analytics" activePage="/analytics">
        <div className="analytics-page">
          <div className="analytics-state">
            <div className="analytics-loader" />
            <p>Loading your performance data...</p>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  if (error || !analytics) {
    return (
      <WorkspaceLayout title="Analytics" activePage="/analytics">
        <div className="analytics-page">
          <div className="analytics-state analytics-error">
            <Activity size={26} />
            <h3>Unable to load analytics</h3>
            <p>{error || "No analytics data is available."}</p>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  const {
    total_interviews = 0,
    evaluated_answers = 0,
    overall_average = 0,
    score_trend = [],
    skill_performance = [],
    weakest_skill = null
  } = analytics;

  const latestScore = score_trend.length
    ? score_trend[score_trend.length - 1].score
    : null;

  const previousScore = score_trend.length > 1
    ? score_trend[score_trend.length - 2].score
    : null;

  const improvement =
    latestScore !== null && previousScore !== null
      ? Number((latestScore - previousScore).toFixed(1))
      : null;

  const getScoreWidth = (score) =>
    `${Math.max(0, Math.min(100, Number(score || 0) * 10))}%`;

  return (
    <WorkspaceLayout title="Analytics" activePage="/analytics">
      <div className="analytics-page">
        <div className="analytics-heading">
          <div>
            <span className="analytics-eyebrow">
              <BrainCircuit size={14} />
              PERFORMANCE INTELLIGENCE
            </span>
            <h1>Your <span>Analytics</span></h1>
            <p>
              Understand your interview performance, identify weaknesses
              and track your progress over time.
            </p>
          </div>
        </div>

        <section className="analytics-stats">
          <div className="analytics-card">
            <div className="analytics-card-top">
              <div className="analytics-card-icon">
                <MessageSquare size={20} />
              </div>
              <span className="analytics-card-label">01</span>
            </div>
            <span className="analytics-card-title">Total Interviews</span>
            <h2>{total_interviews}</h2>
            <p>Interview sessions completed</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-top">
              <div className="analytics-card-icon">
                <Target size={20} />
              </div>
              <span className="analytics-card-label">02</span>
            </div>
            <span className="analytics-card-title">Evaluated Answers</span>
            <h2>{evaluated_answers}</h2>
            <p>Answers assessed by ProbeReady</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-top">
              <div className="analytics-card-icon">
                <BarChart3 size={20} />
              </div>
              <span className="analytics-card-label">03</span>
            </div>
            <span className="analytics-card-title">Overall Average</span>
            <h2>{Number(overall_average).toFixed(1)}<small>/10</small></h2>
            <p>Average across evaluated answers</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-top">
              <div className="analytics-card-icon">
                <Activity size={20} />
              </div>
              <span className="analytics-card-label">04</span>
            </div>
            <span className="analytics-card-title">Latest Performance</span>
            <h2>
              {latestScore === null
                ? "N/A"
                : <>{Number(latestScore).toFixed(1)}<small>/10</small></>}
            </h2>

            {improvement !== null ? (
              <div className={`analytics-change ${improvement >= 0 ? "positive" : "negative"}`}>
                {improvement >= 0
                  ? <TrendingUp size={14} />
                  : <TrendingDown size={14} />}
                <span>
                  {improvement > 0 ? "+" : ""}{improvement} points
                </span>
              </div>
            ) : (
              <p>Complete another interview to compare</p>
            )}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-eyebrow">PERFORMANCE HISTORY</span>
              <h2>Interview Score Trend</h2>
              <p>Track your scores across completed interviews.</p>
            </div>
            <div className="analytics-panel-icon">
              <TrendingUp size={21} />
            </div>
          </div>

          {score_trend.length === 0 ? (
            <div className="analytics-empty">
              No completed interviews available yet.
            </div>
          ) : (
            <div className="trend-list">
              {score_trend.map((item) => (
                <div className="trend-item" key={item.session_id}>
                  <div className="trend-label">
                    <span>Interview #{item.session_id}</span>
                    <strong>{Number(item.score).toFixed(1)}/10</strong>
                  </div>

                  <div className="trend-track">
                    <div
                      className="trend-fill"
                      style={{ width: getScoreWidth(item.score) }}
                    />
                  </div>

                  <small>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "Date unavailable"}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="analytics-panel weakness-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-eyebrow">PERSONALIZED DIAGNOSIS</span>
              <h2>Weakness Detection</h2>
              <p>Find the skill area that needs the most attention.</p>
            </div>
            <div className="analytics-panel-icon">
              <Target size={21} />
            </div>
          </div>

          {!weakest_skill ? (
            <div className="analytics-empty">
              Complete and evaluate an interview to identify your weakest skill.
            </div>
          ) : (
            <div className="weakness-content">
              <div className="weakness-highlight">
                <span className="analytics-eyebrow">YOUR WEAKEST SKILL</span>
                <h3>{weakest_skill.skill}</h3>
                <strong>
                  {Number(weakest_skill.average_score).toFixed(1)}
                  <small>/10</small>
                </strong>
                <span className="weakness-status">
                  {weakest_skill.status}
                </span>
              </div>

              <div className="weakness-recommendation">
                <span className="analytics-eyebrow">RECOMMENDED ACTION</span>
                <h3>Where to focus next</h3>
                <p>{weakest_skill.recommendation}</p>
              </div>
            </div>
          )}
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-eyebrow">KNOWLEDGE BREAKDOWN</span>
              <h2>Category Performance</h2>
              <p>See how your evaluated answers perform by skill.</p>
            </div>
            <div className="analytics-panel-icon">
              <BrainCircuit size={21} />
            </div>
          </div>

          {skill_performance.length === 0 ? (
            <div className="analytics-empty">
              No category performance data available yet.
            </div>
          ) : (
            <div className="category-list">
              {skill_performance.map((skill) => (
                <div className="category-item" key={skill.skill}>
                  <div className="category-info">
                    <div className="skill-title">
                      <strong>{skill.skill}</strong>
                      <span
                        className={`proficiency-badge ${(skill.proficiency || "").toLowerCase()}`}
                      >
                        {skill.proficiency || "Unrated"}
                      </span>
                    </div>
                    <span>
                      {Number(skill.average_score).toFixed(1)}/10
                    </span>
                  </div>

                  <div className="trend-track">
                    <div
                      className="trend-fill"
                      style={{ width: getScoreWidth(skill.average_score) }}
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
      </div>
    </WorkspaceLayout>
  );
}

export default Analytics;
