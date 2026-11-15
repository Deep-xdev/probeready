
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock3,
  Target,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  Upload,
  FileCheck2,
  FileText
} from "lucide-react";

import WorkspaceLayout from "../components/WorkspaceLayout";
import "./Dashboard.css";

/* STAT CARD */

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} strokeWidth={1.8} />
        </div>

        <ArrowUpRight
          size={17}
          className="stat-arrow"
        />
      </div>

      <p>{label}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

/* DASHBOARD */

function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [savedResume, setSavedResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  /* FETCH DASHBOARD DATA */

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          interviewResponse,
          analyticsResponse,
          resumeResponse
        ] = await Promise.all([
          fetch("/api/interviews"),
          fetch("/api/analytics/overview"),
          fetch("/api/resume/latest")
        ]);

        if (!interviewResponse.ok || !analyticsResponse.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const interviewData = await interviewResponse.json();
        const analyticsData = await analyticsResponse.json();

        setInterviews(interviewData.interviews);
        setAnalytics(analyticsData.overview);

        if (!resumeResponse.ok) {
          throw new Error("Failed to load saved resume.");
        }

        const resumeData = await resumeResponse.json();

        setSavedResume(resumeData.resume);

      } catch (error) {
        console.error("Dashboard loading error:", error);
        setHistoryError(error.message);

      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <WorkspaceLayout
      title="Dashboard"
      activePage="/dashboard"
    >
      <div className="dashboard-page">

        {/* WELCOME SECTION */}

        <section className="welcome-section">
          <div>
            <div className="welcome-tag">
              <Sparkles size={14} />
              YOUR INTERVIEW JOURNEY
            </div>

            <h1>
  Welcome back,{" "}
  <span>
    {savedResume?.analysis?.candidate_name || "Candidate"}.
  </span>
</h1>

            <p>
              Every interview is an opportunity to prove what you know.
              Let's make your next one count.
            </p>
          </div>

          <Link to="/interview" className="start-button">
            <Plus size={19} />
            Start Interview
          </Link>
        </section>

        {/* STATISTICS */}

        <section className="stats-grid">

          <StatCard
            icon={MessageSquare}
            label="Interviews completed"
            value={analytics ? analytics.total_interviews : "—"}
            note="Total interview sessions"
          />

          <StatCard
            icon={Target}
            label="Average score"
            value={
              analytics && analytics.evaluated_answers > 0
                ? `${analytics.overall_average.toFixed(1)}/10`
                : "—"
            }
            note="Across evaluated answers"
          />

          <StatCard
            icon={BrainCircuit}
            label="Skills assessed"
            value={
              analytics
                ? analytics.skill_performance.length
                : "—"
            }
            note="Skills from evaluated interviews"
          />

          <StatCard
            icon={Clock3}
            label="Practice time"
            value="Not tracked"
            note="Time tracking not implemented"
          />

        </section>

        {/* MAIN DASHBOARD GRID */}

        <section className="dashboard-content-grid">

          {/* CLAIM CONFIDENCE MAP */}

          <div className="dashboard-panel confidence-panel">

            <div className="panel-heading">
              <div>
                <span className="panel-eyebrow">
                  YOUR SKILL PROFILE
                </span>

                <h3>Claim Confidence Map</h3>
              </div>

              <button className="text-button" type="button">
                View all
                <ChevronRight size={16} />
              </button>
            </div>

            <p className="panel-description">
              An overview of how well you've demonstrated your technical
              knowledge.
            </p>

            <div className="skills-list">

              {!analytics || analytics.skill_performance.length === 0 ? (

                <p className="empty-state">
                  Complete and evaluate interviews to build your skill profile.
                </p>

              ) : (

                analytics.skill_performance.map((skill) => {
                  const score = skill.average_score;

                  return (
                    <div
                      className="skill-item"
                      key={skill.skill}
                    >
                      <div className="skill-info">
                        <span>{skill.skill}</span>
                        <span>{score.toFixed(1)}/10</span>
                      </div>

                      <div
                        className="skill-track"
                        role="progressbar"
                        aria-label={`${skill.skill} score`}
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-valuenow={score}
                      >
                        <div
                          className="skill-progress"
                          style={{
                            width: `${score * 10}%`
                          }}
                        />
                      </div>

                      <span className="skill-status">
                        {skill.proficiency}
                      </span>
                    </div>
                  );
                })

              )}

            </div>
          </div>

          {/* RESUME INTELLIGENCE */}

          <div className="dashboard-panel resume-panel">

            <div className="panel-heading">
              <div>
                <span className="panel-eyebrow">
                  YOUR PROFILE
                </span>

                <h3>Resume Intelligence</h3>
              </div>

              <FileText
                size={21}
                className="panel-icon"
              />
            </div>

            {savedResume ? (

              <div className="resume-empty">

                <div className="upload-icon">
                  <FileCheck2 size={25} />
                </div>

                <h4>{savedResume.filename}</h4>

                <p>
                  {savedResume.analysis.skills?.length || 0} skills ·{" "}
                  {savedResume.analysis.projects?.length || 0} projects ·{" "}
                  {savedResume.analysis.claims?.length || 0} technical claims
                </p>

                <Link to="/resume" className="upload-button">
                  View Resume
                  <ArrowUpRight size={16} />
                </Link>

              </div>

            ) : (

              <div className="resume-empty">

                <div className="upload-icon">
                  <Upload size={25} />
                </div>

                <h4>No resume uploaded</h4>

                <p>
                  Upload your resume to extract skills,
                  projects and technical claims.
                </p>

                <Link to="/resume" className="upload-button">
                  Upload Resume
                  <Plus size={16} />
                </Link>

              </div>

            )}

          </div>

        </section>

        {/* RECENT INTERVIEWS */}

        <section className="dashboard-panel activity-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                YOUR HISTORY
              </span>

              <h3>Recent Interviews</h3>
            </div>

            <span className="text-button">
              {interviews.length} sessions
            </span>
          </div>

          <div className="activity-list">

            {loading ? (

              <p className="empty-state">
                Loading interview history...
              </p>

            ) : historyError ? (

              <p className="empty-state error-state">
                {historyError}
              </p>

            ) : interviews.length === 0 ? (

              <p className="empty-state">
                No interviews yet. Start your first interview!
              </p>

            ) : (

              interviews.map((interview) => {
                const score = interview.overall_score;

                return (
                  <Link
                    to={`/interview-report/${interview.session_id}`}
                    className="activity-item"
                    key={interview.session_id}
                  >
                    <div className="activity-icon">
                      <MessageSquare size={19} />
                    </div>

                    <div className="activity-details">
                      <h4>{interview.title}</h4>

                      <p>
                        {new Date(
                          interview.created_at
                        ).toLocaleDateString()}

                        {" · "}

                        {interview.evaluated_count}/
                        {interview.question_count} evaluated
                      </p>
                    </div>

                    <span
                      className={`activity-score ${
                        score === null
                          ? "average"
                          : score >= 7
                            ? "good"
                            : score >= 4
                              ? "average"
                              : "weak"
                      }`}
                    >
                      {score === null
                        ? "Pending"
                        : `${score.toFixed(1)}/10`}
                    </span>

                    <ChevronRight
                      size={17}
                      className="activity-arrow"
                    />
                  </Link>
                );
              })

            )}

          </div>
        </section>

        {/* SUGGESTED FOCUS */}

        <section className="recommendation-panel">

          <div className="recommendation-icon">
            <Sparkles size={23} />
          </div>

          <div className="recommendation-copy">
            <span className="panel-eyebrow">
              SUGGESTED FOCUS
            </span>

            <h3>
              {analytics?.weakest_skill
                ? `Strengthen your ${analytics.weakest_skill.skill} skills`
                : "Start your interview practice"}
            </h3>

            <p>
              {analytics?.weakest_skill
                ? analytics.weakest_skill.recommendation
                : "Complete an interview to receive personalized improvement recommendations."}
            </p>
          </div>

          <Link
            to="/interview"
            className="recommendation-button"
          >
            Practice now
            <ArrowUpRight size={17} />
          </Link>

        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">
          ProbeReady © 2026

          <span>
            Built to test what you actually know.
          </span>
        </footer>

      </div>
    </WorkspaceLayout>
  );
}

export default Dashboard;
