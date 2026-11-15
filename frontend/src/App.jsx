
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BrainCircuit,
  FileSearch,
  MessageSquareText,
  ChartNoAxesCombined,
  Mic,
  Target,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Menu,
  X,
  Sparkles,
  Orbit,
  Activity,
  AudioWaveform,
  ChevronRight
} from "lucide-react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import { InterviewProvider } from "./context/InterviewContext";

import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Interview from "./pages/Interview";
import InterviewReport from "./pages/InterviewReport";
import Analytics from "./pages/Analytics";

import "./App.css";

// Reset scroll position whenever the route changes.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname]);

  return null;
}

const features = [
  {
    icon: FileSearch,
    number: "01",
    title: "Resume Intelligence",
    description:
      "Extract skills, projects and technical claims directly from your resume."
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "Personalized Questions",
    description:
      "Generate interview questions based on what you actually claim to know."
  },
  {
    icon: MessageSquareText,
    number: "03",
    title: "AI Mock Interviews",
    description:
      "Experience realistic interviews with questions that adapt to your answers."
  },
  {
    icon: Target,
    number: "04",
    title: "Intelligent Evaluation",
    description:
      "Get meaningful feedback on technical correctness, coverage and clarity."
  },
  {
    icon: Activity,
    number: "05",
    title: "Answer Analytics",
    description:
      "Track your technical accuracy, answer clarity, depth, and overall interview performance."
  },
  {
    icon: ChartNoAxesCombined,
    number: "06",
    title: "Career Intelligence",
    description:
      "Identify knowledge gaps and discover what you should improve next."
  }
];

const steps = [
  {
    number: "01",
    title: "Upload your resume",
    description: "Give ProbeReady a picture of your experience."
  },
  {
    number: "02",
    title: "Discover your claims",
    description: "AI identifies the skills and projects you mention."
  },
  {
    number: "03",
    title: "Enter the interview",
    description: "Face questions tailored to your actual experience."
  },
  {
    number: "04",
    title: "Understand your gaps",
    description: "Get evaluated and see exactly what to improve."
  }
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        <span className="brand-icon">
          <BrainCircuit size={21} />
        </span>
        <span>
          Probe<span className="brand-accent">Ready</span>
        </span>
      </Link>

      <div
        id="landing-navigation"
        className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
      >
        <a href="#how-it-works" onClick={closeMenu}>
          How it works
        </a>
        <a href="#features" onClick={closeMenu}>
          Features
        </a>
        <a href="#about" onClick={closeMenu}>
          About
        </a>

        <Link
          to="/dashboard"
          className="mobile-nav-link"
          onClick={closeMenu}
        >
          Enter workspace <ArrowRight size={16} />
        </Link>
      </div>

      <Link to="/dashboard" className="nav-button">
        Launch workspace <ArrowRight size={15} />
      </Link>

      <button
        type="button"
        className="mobile-menu"
        onClick={() => setMenuOpen(previous => !previous)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="landing-navigation"
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </nav>
  );
}

function SpatialCore() {
  return (
    <div
      className="spatial-scene"
      aria-label="ProbeReady AI intelligence visualization"
    >
      <div className="scene-ambient scene-ambient-one" />
      <div className="scene-ambient scene-ambient-two" />
      <div className="scene-grid" />

      <div className="scene-coordinate coordinate-one">
        INTELLIGENCE / 001
      </div>
      <div className="scene-coordinate coordinate-two">
        SYSTEM ONLINE
      </div>

      <div className="orbit orbit-horizontal" />
      <div className="orbit orbit-vertical" />
      <div className="orbit orbit-diagonal" />

      <div className="orbit-node orbit-node-one"><span /></div>
      <div className="orbit-node orbit-node-two"><span /></div>
      <div className="orbit-node orbit-node-three"><span /></div>
{/* ProbeReady AI Logo */}
<div className="core-logo-visual">
  <div className="core-logo-glow" />

  <img
    src="/images/probeready-symbol.png"
    alt="ProbeReady AI"
    className="core-logo-image"
  />
</div>

      <div className="core-caption">
        <span className="core-caption-dot" />
        <span>PROBEREADY INTELLIGENCE</span>
      </div>

      {/* Floating card 1: Resume */}
      <div className="spatial-panel panel-resume">
        <div className="panel-topline">
          <span className="panel-icon purple-icon">
            <FileSearch size={15} />
          </span>
          <span>RESUME SCAN</span>
          <span className="panel-status">COMPLETE</span>
        </div>

        <div className="panel-main-value">
          12 <small>claims identified</small>
        </div>

        <div className="panel-mini-tags">
          <span>React</span>
          <span>Python</span>
          <span>RAG</span>
        </div>

        <div className="panel-bottom-line">
          <span className="mini-bar"><i /></span>
          <span>PROFILE ANALYZED</span>
        </div>
      </div>

      {/* Floating card 2: Interview */}
      <div className="spatial-panel panel-interview">
        <div className="panel-topline">
          <span className="panel-icon cyan-icon">
            <MessageSquareText size={15} />
          </span>
          <span>LIVE INTERVIEW</span>
          <span className="recording-dot" />
        </div>

        <p className="panel-question">
          Why did you choose FAISS for vector similarity search?
        </p>

        <div className="panel-interview-bottom">
          <span>QUESTION 04</span>
          <span className="difficulty-tag">INTERMEDIATE</span>
        </div>
      </div>

      {/* Floating card 3: Evaluation */}
      <div className="spatial-panel panel-score">
        <div className="panel-topline">
          <span className="panel-icon green-icon">
            <Target size={15} />
          </span>
          <span>ANSWER EVALUATION</span>
        </div>

        <div className="score-display">
          <strong>7.5</strong>
          <span>/ 10</span>
        </div>

        <div className="score-meter">
          <i />
        </div>

        <p className="score-feedback">
          <CheckCircle2 size={13} />
          Strong technical foundation
        </p>
      </div>

      {/* Floating card 4: Adaptive engine */}
      <div className="spatial-panel panel-signal">
        <div className="signal-icon">
          <AudioWaveform size={19} />
        </div>

        <div>
          <span>ADAPTIVE ENGINE</span>
          <strong>Reasoning detected</strong>
        </div>

        <Activity size={16} className="signal-activity" />
      </div>

      <div className="scene-bottom-label">
        <span>01</span>
        <span className="scene-bottom-line" />
        <span>YOUR KNOWLEDGE, UNDER THE LENS</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="about">
      <div className="hero-background">
        <div className="hero-background-glow" />
        <div className="hero-background-grid" />
        <div className="hero-star star-one" />
        <div className="hero-star star-two" />
        <div className="hero-star star-three" />
      </div>

      <div className="hero-copy">
        <div className="announcement">
          <span className="announcement-icon">
            <Sparkles size={13} />
          </span>
          <span>AN INTERVIEW INTELLIGENCE SYSTEM</span>
          <span className="announcement-line" />
        </div>

        <h1>
          Your resume
          <br />
          makes a <span>claim.</span>
          <br />
          We test the
          <br />
          <span className="hero-gradient-text">knowledge.</span>
        </h1>

        <p className="hero-description">
          ProbeReady turns your resume into a personalized interview.
          It challenges your technical claims, examines your reasoning,
          and shows you where your understanding actually stands.
        </p>

        <div className="hero-actions">
          <Link to="/dashboard" className="primary-button hero-primary">
            Enter the workspace <ArrowRight size={17} />
          </Link>

          <a href="#how-it-works" className="hero-secondary">
            Explore the system
            <span><ChevronRight size={16} /></span>
          </a>
        </div>

        <div className="hero-proof">
          <ShieldCheck size={16} />
          <span>
            Built around your skills, projects and real understanding.
          </span>
        </div>

        <div className="hero-index">
          <span className="hero-index-number">01</span>
          <span className="hero-index-line" />
          <span>FROM CLAIM TO CONFIDENCE</span>
        </div>
      </div>

      <SpatialCore />
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section process-section" id="how-it-works">
      <div className="section-kicker">
        <span>THE PROTOCOL</span>
        <span className="kicker-line" />
        <span>01 — 04</span>
      </div>

      <div className="section-heading process-heading">
        <div>
          <h2>
            Four stages.
            <br />
            <span>One honest assessment.</span>
          </h2>
        </div>

        <p>
          No generic question dumps. Your preparation begins with your
          experience and gets more specific with every answer.
        </p>
      </div>

      <div className="process-list">
        {steps.map((step, index) => (
          <article className="process-item" key={step.number}>
            <div className="process-number">{step.number}</div>
            <div className="process-marker"><span /></div>

            <div className="process-copy">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>

            <span className="process-index">
              PHASE {index + 1}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="section-kicker">
        <span>THE INTELLIGENCE LAYER</span>
        <span className="kicker-line" />
        <span>CAPABILITIES</span>
      </div>

      <div className="section-heading features-heading">
        <h2>
          More than a question bank.
          <br />
          <span>A system that understands context.</span>
        </h2>

        <p>
          Every capability works toward one goal: finding the difference
          between what you claim and what you can demonstrate.
        </p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, number, title, description }) => (
          <article className="feature-card" key={title}>
            <div className="feature-card-top">
              <span className="feature-icon">
                <Icon size={21} />
              </span>
              <span className="feature-number">{number}</span>
            </div>

            <h3>{title}</h3>
            <p>{description}</p>

            <div className="feature-card-bottom">
              <span>EXPLORE CAPABILITY</span>
              <ArrowRight size={15} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta-section" id="start">
      <div className="cta-orbit cta-orbit-one" />
      <div className="cta-orbit cta-orbit-two" />

      <div className="cta-content">
        <span className="cta-kicker">
          <Zap size={13} /> YOUR NEXT STEP
        </span>

        <h2>
          Don't prepare to
          <br />
          <span>sound convincing.</span>
          <br />
          Prepare to be convincing.
        </h2>

        <p>
          Put your knowledge under pressure. Find your gaps.
          Build confidence that has evidence behind it.
        </p>

        <Link to="/dashboard" className="primary-button cta-button">
          Start your assessment <ArrowRight size={17} />
        </Link>
      </div>

      <div className="cta-side-note">
        <Orbit size={17} />
        <span>THE PROBEREADY SYSTEM</span>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <BrainCircuit size={19} />
        </span>
        <span>
          Probe<span className="brand-accent">Ready</span>
        </span>
      </Link>

      <p>Built to test what you actually know.</p>

      <span className="copyright">
        © 2026 ProbeReady. All rights reserved.
      </span>
    </footer>
  );
}

function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CTA />
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <InterviewProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview" element={<Interview />} />
          <Route
            path="/interview-report/:sessionId"
            element={<InterviewReport />}
          />
        </Routes>
      </BrowserRouter>
    </InterviewProvider>
  );
}

export default App;
