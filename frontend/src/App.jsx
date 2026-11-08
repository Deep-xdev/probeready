
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
  Menu
} from "lucide-react";

import { InterviewProvider } from "./context/InterviewContext";
import Interview from "./pages/Interview";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import InterviewReport from "./pages/InterviewReport";
import Analytics from "./pages/Analytics";

const features = [
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    description:
      "Extract skills, projects and technical claims directly from your resume."
  },
  {
    icon: BrainCircuit,
    title: "Personalized Questions",
    description:
      "Generate interview questions based on what you actually claim to know."
  },
  {
    icon: MessageSquareText,
    title: "AI Mock Interviews",
    description:
      "Experience realistic interviews with questions that adapt to your answers."
  },
  {
    icon: Target,
    title: "Intelligent Evaluation",
    description:
      "Get meaningful feedback on technical correctness, coverage and clarity."
  },
  {
    icon: Mic,
    title: "Communication Analytics",
    description:
      "Understand your communication through planned voice-based feedback."
  },
  {
    icon: ChartNoAxesCombined,
    title: "Career Intelligence",
    description:
      "Identify knowledge gaps and discover what you should improve next."
  }
];

const steps = [
  "Upload your resume",
  "Let AI identify your claims",
  "Face personalized questions",
  "Get evaluated and improve"
];

function Navbar() {
  return (
    <nav className="navbar">
      <a href="#" className="brand">
        <span className="brand-icon">
          <BrainCircuit size={23} />
        </span>
        Probe<span>Ready</span>
      </a>

      <div className="nav-links">
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
      </div>

      <a href="/dashboard" className="nav-button">
        Get Started <ArrowRight size={16} />
      </a>

      <button className="mobile-menu" aria-label="Open menu">
        <Menu />
      </button>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" id="about">
      <div className="hero-content">
        <div className="announcement">
          <Zap size={14} />
          <span>INTERVIEW PREPARATION, REIMAGINED</span>
        </div>

        <h1>
          Don't just claim it.
          <br />
          <span>Prove you know it.</span>
        </h1>

        <p className="hero-description">
          Your resume tells the interviewer what you know.
          ProbeReady finds out whether you can actually prove it.
          Practice smarter with personalized AI interviews.
        </p>

        <div className="hero-actions">
          <a href="/dashboard" className="primary-button">
            Start your preparation <ArrowRight size={18} />
          </a>

          <a href="#how-it-works" className="secondary-button">
            Explore how it works
          </a>
        </div>

        <div className="hero-trust">
          <ShieldCheck size={17} />
          <span>Built around your skills, projects and real understanding.</span>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-glow"></div>

        <div className="preview-card">
          <div className="preview-header">
            <div>
              <span className="preview-label">LIVE INTERVIEW</span>
              <h3>Technical Assessment</h3>
            </div>
            <span className="live-indicator">● LIVE</span>
          </div>

          <div className="question-box">
            <span className="question-label">QUESTION 04</span>
            <h3>
              Why did you choose FAISS for vector similarity search
              in your RAG application?
            </h3>
            <div className="question-tags">
              <span>RAG</span>
              <span>FAISS</span>
              <span>Intermediate</span>
            </div>
          </div>

          <div className="evaluation">
            <div className="evaluation-top">
              <span>YOUR PERFORMANCE</span>
              <span className="score">7.5/10</span>
            </div>

            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>

            <div className="evaluation-feedback">
              <CheckCircle2 size={16} />
              <span>
                Good understanding. Let's explore your technical reasoning.
              </span>
            </div>
          </div>

          <div className="next-question">
            <span>ADAPTIVE FOLLOW-UP</span>
            <ArrowRight size={18} />
          </div>
        </div>

        <div className="floating-tag">
          <BrainCircuit size={17} />
          <span>AI-powered evaluation</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="section-heading">
        <span className="eyebrow">THE PROCESS</span>
        <h2>
          Your preparation.
          <span> A smarter approach.</span>
        </h2>
        <p>
          From your resume to your next interview, every step
          is designed around your actual knowledge.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <div className="step-card" key={step}>
            <span className="step-number">0{index + 1}</span>
            <h3>{step}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="section-heading">
        <span className="eyebrow">WHAT WE OFFER</span>
        <h2>
          Everything you need to
          <span> prove your skills.</span>
        </h2>
        <p>
          An intelligent interview preparation ecosystem,
          built around you.
        </p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon">
              <Icon size={23} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <ArrowRight className="feature-arrow" size={18} />
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta-section" id="start">
      <div className="cta-content">
        <span className="eyebrow">YOUR NEXT INTERVIEW STARTS HERE</span>
        <h2>
          Ready to put your
          <span> knowledge to the test?</span>
        </h2>
        <p>
          Stop memorizing generic answers. Start understanding
          what you really know.
        </p>
        <button className="primary-button">
          Start preparing <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <a href="#" className="brand">
        <span className="brand-icon">
          <BrainCircuit size={21} />
        </span>
        Probe<span>Ready</span>
      </a>

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
