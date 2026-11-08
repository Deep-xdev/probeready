import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  Clock3,
  Target,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  Upload,
  FileCheck2
} from "lucide-react";

import "./Dashboard.css";



const activities = [
  { title: "JavaScript Fundamentals", date: "Today", score: "8.5/10", color: "good" },
  { title: "React Technical Round", date: "Yesterday", score: "7.2/10", color: "average" },
  { title: "Node.js Concepts", date: "2 days ago", score: "5.4/10", color: "weak" }
];

function Sidebar() {
  const navigation = [
    { icon: LayoutDashboard, label: "Dashboard", active: true, link: "/dashboard" },
    { icon: FileText, label: "My Resume", link: "/resume" },
    { icon: MessageSquare, label: "Mock Interview", link: "/interview" },
    { icon: ChartNoAxesCombined, label: "Analytics", link: "/analytics" }
  ];

  return (
    <aside className="sidebar">
      <a href="/" className="dashboard-brand">
        <BrainCircuit size={27} />
        <span>Probe<span>Ready</span></span>
      </a>

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        {navigation.map(({ icon: Icon, label, active, link }) => (
          <a
            href={link}
            key={label}
            className={`sidebar-link ${active ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <a href="/" className="sidebar-link">
          <Settings size={19} />
          <span>Settings</span>
        </a>

        <div className="profile">
          <div className="avatar">DS</div>
          <div>
            <h4>Candidate</h4>
            <p>Free Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>
        <ArrowUpRight size={17} className="stat-arrow" />
      </div>

      <p>{label}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [savedResume, setSavedResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

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
      const resumeData = await resumeResponse.json();

if (!resumeResponse.ok) {
  throw new Error("Failed to load saved resume.");
}

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
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="breadcrumb">WORKSPACE / DASHBOARD</span>
            <h2>Dashboard</h2>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="avatar">DS</div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <div className="welcome-tag">
              <Sparkles size={14} /> YOUR INTERVIEW JOURNEY
            </div>

            <h1>
              Welcome back, <span>Candidate.</span>
            </h1>

            <p>
              Every interview is an opportunity to prove what you know.
              Let's make your next one count.
            </p>
          </div>

          <a href="/interview" className="start-button">
            <Plus size={19} /> Start Interview
          </a>
        </section>

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
    value={analytics ? analytics.skill_performance.length : "—"}
    note="Skills from evaluated interviews"
  />

  <StatCard
    icon={Clock3}
    label="Practice time"
    value="Not tracked"
    note="Time tracking not implemented"
  />
</section>

        <section className="dashboard-content-grid">

          <div className="dashboard-panel confidence-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-eyebrow">YOUR SKILL PROFILE</span>
                <h3>Claim Confidence Map</h3>
              </div>
              <button className="text-button">
                View all <ChevronRight size={16} />
              </button>
            </div>

            <p className="panel-description">
              An overview of how well you've demonstrated your technical knowledge.
            </p>

            <div className="skills-list">
  {!analytics || analytics.skill_performance.length === 0 ? (
    <p>Complete and evaluate interviews to build your skill profile.</p>
  ) : (
    analytics.skill_performance.map((skill) => {
      const score = skill.average_score;

      const color =
        score >= 9 ? "#22D3EE" :
        score >= 7 ? "#8B5CF6" :
        score >= 4 ? "#F59E0B" :
        "#FF7777";

      return (
        <div className="skill-item" key={skill.skill}>
          <div className="skill-info">
            <span>{skill.skill}</span>
            <span>{score.toFixed(1)}/10</span>
          </div>

          <div className="skill-track">
            <div
              className="skill-progress"
              style={{
                width: `${score * 10}%`,
                background: color
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

          <div className="dashboard-panel resume-panel">
  <div className="panel-heading">
    <div>
      <span className="panel-eyebrow">YOUR PROFILE</span>
      <h3>Resume Intelligence</h3>
    </div>
    <FileText size={21} className="panel-icon" />
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
        View Resume <ArrowUpRight size={16} />
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
        Upload Resume <Plus size={16} />
      </Link>
    </div>
  )}
</div>

        </section>

        
<section className="dashboard-panel activity-panel">
  <div className="panel-heading">
    <div>
      <span className="panel-eyebrow">YOUR HISTORY</span>
      <h3>Recent Interviews</h3>
    </div>

    <span className="text-button">
      {interviews.length} sessions
    </span>
  </div>

  <div className="activity-list">
    {loading ? (
      <p>Loading interview history...</p>
    ) : historyError ? (
      <p>{historyError}</p>
    ) : interviews.length === 0 ? (
      <p>No interviews yet. Start your first interview!</p>
    ) : (
      interviews.map((interview) => {
        const score = interview.overall_score;

        return (
          <Link
  to={`/interview-report/${interview.session_id}`}
  className="activity-item"
  key={interview.session_id}
  style={{ textDecoration: "none", color: "inherit" }}
>
            <div className="activity-icon">
              <MessageSquare size={19} />
            </div>

            <div className="activity-details">
              <h4>{interview.title}</h4>
              <p>
                {new Date(interview.created_at).toLocaleDateString()}
                {" · "}
                {interview.evaluated_count}/{interview.question_count} evaluated
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
              {score === null ? "Pending" : `${score.toFixed(1)}/10`}
            </span>

            <ChevronRight size={17} className="activity-arrow" />
          </Link>
        );
      })
    )}
  </div>
</section>


        <section className="recommendation-panel">
          <div className="recommendation-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <span className="panel-eyebrow">SUGGESTED FOCUS</span>
            <h3>Strengthen your Node.js fundamentals</h3>
            <p>
              Your sample profile indicates this is an area
              worth practising next.
            </p>
          </div>

          <a href="/interview" className="recommendation-button">
            Practice now <ArrowUpRight size={17} />
          </a>
        </section>

        <footer className="dashboard-footer">
          ProbeReady © 2026
          <span>Built to test what you actually know.</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
