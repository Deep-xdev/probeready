
import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  Upload,
  File,
  FileCheck2,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from "lucide-react";

import { useInterview } from "../context/InterviewContext";
import WorkspaceLayout from "../components/WorkspaceLayout";
import "./Resume.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function Resume() {
  const { startInterview } = useInterview();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoadingSavedResume, setIsLoadingSavedResume] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [questionError, setQuestionError] = useState("");

  // Load the most recently saved resume.
  useEffect(() => {
    async function fetchSavedResume() {
      try {
        const response = await fetch("/api/resume/latest");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load saved resume.");
        }

        if (data.resume) {
          setAnalysisResult({
            filename: data.resume.filename,
            analysis: data.resume.analysis
          });
        }
      } catch (error) {
        console.error("Saved resume loading error:", error);
      } finally {
        setIsLoadingSavedResume(false);
      }
    }

    fetchSavedResume();
  }, []);

  // Validate the selected file.
  function validateFile(file) {
    setError("");
    setMessage("");

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Unsupported file format. Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size === 0) {
      setError("This file is empty. Please select another file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5 MB. Please upload a smaller file.");
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    validateFile(file);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    validateFile(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setError("");
    setMessage("");
  }

  // Upload resume and analyze it.
  async function handleContinue() {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError("");
    setMessage("");
    setAnalysisResult(null);

    try {
      // STEP 1: Upload the resume.
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.detail || "Resume upload failed.");
      }

      // STEP 2: Send extracted text to the AI analysis endpoint.
      const analysisResponse = await fetch(
        `/api/resume/analyze?filename=${encodeURIComponent(selectedFile.name)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            extracted_text: uploadData.extracted_text
          })
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.detail || "AI resume analysis failed."
        );
      }

      // STEP 3: Store extraction and AI analysis results.
      setAnalysisResult({
        ...uploadData,
        analysis: analysisData.analysis
      });

      setMessage("Resume uploaded and AI analysis completed successfully!");
      setSelectedFile(null);

    } catch (err) {
      console.error("Resume analysis error:", err);

      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setIsUploading(false);
    }
  }

  // Generate questions and save the interview session.
  async function handleGenerateQuestions() {
    if (!analysisResult?.analysis || isGenerating) return;

    setIsGenerating(true);
    setQuestionError("");
    setQuestions([]);

    try {
      // STEP 1: Generate interview questions.
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resume_analysis: analysisResult.analysis,
          difficulty,
          question_count: questionCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Question generation failed."
        );
      }

      // STEP 2: Save the interview session in SQLite.
      const saveResponse = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "Technical Interview",
          questions: data.questions
        })
      });

      const savedData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          savedData.detail || "Failed to save interview."
        );
      }

      // STEP 3: Update frontend and interview context.
      setQuestions(data.questions);

      startInterview(
        data.questions,
        analysisResult.analysis,
        savedData.session_id
      );

    } catch (error) {
      console.error("Question generation error:", error);

      setQuestionError(
        error.message || "Unable to generate questions."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const analysis = analysisResult?.analysis;

  return (
    <WorkspaceLayout
      title="Resume Intelligence"
      activePage="/resume"
    >
      {/* PAGE INTRODUCTION */}
      <section className="resume-heading">
        <div>
          <span className="resume-eyebrow">
            <BrainCircuit size={15} />
            UNDERSTAND YOUR PROFILE
          </span>

          <h1>
            Let's start with your <span>resume.</span>
          </h1>

          <p>
            Upload your resume so ProbeReady can identify your
            skills, projects and technical claims.
          </p>
        </div>
      </section>

      {/* RESUME UPLOAD */}
      <section className="resume-upload-section">
        <div className="resume-section-title">
          <div>
            <h3>Upload your resume</h3>
            <p>Choose a document from your device.</p>
          </div>

          <span className="step-badge">STEP 01</span>
        </div>

        {!selectedFile ? (
          <div
            className={`resume-dropzone ${
              isDragging ? "dragging" : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="resume-upload-icon">
              <Upload size={30} />
            </div>

            <h3>Drop your resume here</h3>

            <p>
              or click below to browse files from your device
            </p>

            <button
              type="button"
              className="resume-browse-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files <ArrowRight size={16} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={handleFileChange}
            />

            <div className="resume-file-rules">
              <span>
                <File size={14} /> PDF or DOCX
              </span>
              <span>Maximum size: 5 MB</span>
            </div>
          </div>
        ) : (
          <div className="selected-resume">
            <div className="selected-file-icon">
              <FileCheck2 size={27} />
            </div>

            <div className="selected-file-details">
              <h4>{selectedFile.name}</h4>
              <p>
                {formatFileSize(selectedFile.size)} · Ready to upload
              </p>
            </div>

            <span className="file-ready">
              <CheckCircle2 size={16} />
              Ready
            </span>

            <button
              type="button"
              className="remove-file-button"
              onClick={removeFile}
              aria-label="Remove selected file"
            >
              <X size={19} />
            </button>
          </div>
        )}

        {error && (
          <div className="resume-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="resume-success">
            <CheckCircle2 size={17} />
            <span>{message}</span>
          </div>
        )}

        <div className="resume-actions">
          <button
            type="button"
            className="resume-continue-button"
            disabled={!selectedFile || isUploading}
            onClick={handleContinue}
          >
            {isUploading ? "Analyzing resume..." : "Analyze Resume"}

            {!isUploading && <ArrowRight size={17} />}
          </button>

          <p>
            Your resume is processed for AI-powered profile analysis.
          </p>
        </div>

        {/* AI ANALYSIS RESULTS */}
        {analysis && (
          <div className="ai-analysis-results">
            <div className="extraction-header">
              <div>
                <span className="resume-eyebrow">
                  <BrainCircuit size={15} />
                  AI ANALYSIS COMPLETE
                </span>

                <h3>Your Professional Profile</h3>
              </div>
            </div>

            {/* Summary */}
            <div className="analysis-card">
              <h4>Profile Summary</h4>
              <p>{analysis.summary}</p>
            </div>

            {/* Skills */}
            <div className="analysis-card">
              <h4>Identified Skills</h4>

              <div className="analysis-skills">
                {analysis.skills?.map((skill, index) => (
                  <div className="analysis-skill" key={index}>
                    <strong>{skill.name}</strong>
                    <span>{skill.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="analysis-card">
              <h4>Projects</h4>

              {analysis.projects?.map((project, index) => (
                <div className="analysis-project" key={index}>
                  <h5>{project.name}</h5>
                  <p>{project.description}</p>

                  <div className="analysis-skills">
                    {project.technologies?.map((tech, techIndex) => (
                      <span className="analysis-tag" key={techIndex}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Claims */}
            <div className="analysis-card">
              <h4>Technical Claims</h4>

              {analysis.claims?.map((claim, index) => (
                <div className="analysis-claim" key={index}>
                  <strong>{claim.claim}</strong>
                  <p>Evidence: {claim.evidence}</p>
                  <span>Project: {claim.project}</span>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="analysis-card">
              <h4>Education</h4>

              {analysis.education?.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>

            {/* Experience */}
            <div className="analysis-card">
              <h4>Experience</h4>

              {analysis.experience?.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>
        )}

        {/* QUESTION GENERATOR */}
        {analysis && (
          <div className="question-generator">
            <div className="question-generator-header">
              <span className="resume-eyebrow">
                <BrainCircuit size={15} />
                NEXT STEP
              </span>

              <h3>Test what you actually know.</h3>

              <p>
                Generate personalized interview questions based on
                your skills, projects and technical claims.
              </p>
            </div>

            <div className="question-generator-controls">
              <div className="question-control">
                <label htmlFor="difficulty">Difficulty</label>

                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="question-control">
                <label htmlFor="questionCount">
                  Number of questions
                </label>

                <select
                  id="questionCount"
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(Number(event.target.value))
                  }
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="resume-continue-button"
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating Questions..."
                : "Generate Interview Questions"}

              {!isGenerating && <ArrowRight size={17} />}
            </button>

            {questionError && (
              <div className="resume-error">
                <AlertCircle size={17} />
                <span>{questionError}</span>
              </div>
            )}

            {questions.length > 0 && (
              <div className="generated-questions">
                <h3>Personalized Interview Questions</h3>

                {questions.map((item, index) => (
                  <div
                    className="generated-question-card"
                    key={index}
                  >
                    <div className="generated-question-meta">
                      <span>QUESTION {index + 1}</span>
                      <span>{item.category}</span>
                      <span>{item.difficulty}</span>
                    </div>

                    <h4>{item.question}</h4>

                    <p>
                      <strong>Why this question?</strong>{" "}
                      {item.reason}
                    </p>

                    <div className="question-follow-up">
                      <strong>Follow-up:</strong>
                      <p>{item.follow_up}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* INFORMATION CARDS */}
      <section className="resume-info-grid">
        <div className="resume-info-card">
          <div className="resume-info-icon">
            <ShieldCheck size={21} />
          </div>

          <h4>Your data matters</h4>

          <p>
            Your resume is processed for AI-powered profile analysis
            and interview preparation.
          </p>
        </div>

        <div className="resume-info-card">
          <div className="resume-info-icon">
            <BrainCircuit size={21} />
          </div>

          <h4>Resume intelligence</h4>

          <p>
            ProbeReady identifies your skills, projects, education,
            experience and technical claims.
          </p>
        </div>

        <div className="resume-info-card">
          <div className="resume-info-icon">
            <MessageSquare size={21} />
          </div>

          <h4>Personalized interviews</h4>

          <p>
            Your resume analysis provides context for relevant
            interview questions and follow-ups.
          </p>
        </div>
      </section>

      <footer className="resume-footer">
        ProbeReady © 2026
        <span>Built to test what you actually know.</span>
      </footer>
    </WorkspaceLayout>
  );
}

export default Resume;
