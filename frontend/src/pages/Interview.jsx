
import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  LoaderCircle,
  Volume2,
  Square,
  Mic,
  MicOff,
  Radio
} from "lucide-react";

import { useNavigate, Link } from "react-router-dom";
import { useInterview } from "../context/InterviewContext";
import { useSpeech } from "../hooks/useSpeech";
import WorkspaceLayout from "../components/WorkspaceLayout";
import "./Interview.css";

function Interview() {
  const navigate = useNavigate();

  const {
    questions,
    sessionId,
    currentIndex,
    setCurrentIndex,
    answers,
    evaluations,
    saveAnswer,
    saveEvaluation,
    addAdaptiveQuestion
  } = useInterview();

  const {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    transcript,
    setTranscript,
    isListening,
    isSpeaking,
    speechError,
    isSpeechRecognitionSupported
  } = useSpeech();

  const [answer, setAnswer] = useState(
    answers[currentIndex] || ""
  );

  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");

  // Live AI interviewer state
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [isLiveProcessing, setIsLiveProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveReply, setLiveReply] = useState("");
  const [liveError, setLiveError] = useState("");
  const [liveHistory, setLiveHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const liveHistoryRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const savedEvaluation = evaluation || evaluations[currentIndex];
  const completedEvaluations = evaluations.filter(Boolean);

  const totalCompleted = completedEvaluations.length;

  const isAdaptiveQuestion =
    currentQuestion?.reason?.startsWith(
      "Adaptive follow-up to question #"
    );

  // Transfer browser-recognized speech into the answer textarea.
  useEffect(() => {
    if (transcript.trim()) {
      setAnswer(transcript);
      saveAnswer(currentIndex, transcript);
    }
  }, [transcript, currentIndex]);

  // Reset live conversation when moving to another question.
  useEffect(() => {
    liveHistoryRef.current = [];
    setLiveHistory([]);
    setLiveTranscript("");
    setLiveReply("");
    setLiveError("");
  }, [currentIndex]);

  // Clean up microphone and audio resources.
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  function calculateAverage(metric) {
    if (totalCompleted === 0) return 0;

    const total = completedEvaluations.reduce(
      (sum, item) => sum + (item[metric] || 0),
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
    {
      label: "Technical Accuracy",
      score: performanceSummary.technicalAccuracy
    },
    {
      label: "Depth",
      score: performanceSummary.depth
    },
    {
      label: "Clarity",
      score: performanceSummary.clarity
    },
    {
      label: "Evidence",
      score: performanceSummary.evidence
    }
  ];

  const strongestArea = [...performanceMetrics].sort(
    (a, b) => b.score - a.score
  )[0];

  const weakestArea = [...performanceMetrics].sort(
    (a, b) => a.score - b.score
  )[0];

  function handleStartRecording() {
    stopSpeaking();
    startListening();
  }

  function handleStopRecording() {
    stopListening();
  }

  function handleSpeakQuestion() {
    if (currentQuestion) {
      stopListening();
      speak(currentQuestion.question);
    }
  }

  // --------------------------------------------------
  // LIVE AI INTERVIEWER
  // --------------------------------------------------

  async function sendLiveAudio(audioBlob) {
    if (!audioBlob || audioBlob.size === 0) {
      setLiveError("No audio was recorded. Please try again.");
      return;
    }

    setIsLiveProcessing(true);
    setLiveError("");
    setLiveTranscript("");
    setLiveReply("");

    try {
      const extension = audioBlob.type.includes("ogg")
        ? "ogg"
        : audioBlob.type.includes("mp4")
          ? "mp4"
          : "webm";

      const audioFile = new File(
        [audioBlob],
        `answer.${extension}`,
        { type: audioBlob.type || "audio/webm" }
      );

      const formData = new FormData();

      formData.append("audio", audioFile);
      formData.append(
        "original_question",
        currentQuestion.question
      );
      formData.append(
        "resume_context",
        currentQuestion.reason || ""
      );
      formData.append(
        "history",
        JSON.stringify(liveHistoryRef.current)
      );

      const response = await fetch("/api/voice/turn", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Live interviewer request failed."
        );
      }

      if (!data.success) {
        throw new Error("Live interviewer returned an invalid response.");
      }

      const candidateText = data.transcript || "";
      const interviewerText = data.reply || "";

      setLiveTranscript(candidateText);
      setLiveReply(interviewerText);

      // Preserve the complete spoken conversation in the answer.
      const updatedAnswer = [
        answer,
        `You: ${candidateText}`,
        `Interviewer: ${interviewerText}`
      ]
        .filter(Boolean)
        .join("\n\n");

      setAnswer(updatedAnswer);
      saveAnswer(currentIndex, updatedAnswer);

      // Save conversation history for the next voice turn.
      const updatedHistory = [
        ...liveHistoryRef.current,
        {
          role: "user",
          content: candidateText
        },
        {
          role: "assistant",
          content: interviewerText
        }
      ];

      liveHistoryRef.current = updatedHistory;
      setLiveHistory(updatedHistory);

      // Play generated interviewer audio.
      if (data.audio_base64) {
        const binary = atob(data.audio_base64);

        const bytes = Uint8Array.from(
          binary,
          (character) => character.charCodeAt(0)
        );

        const audioBlob = new Blob(
          [bytes],
          { type: data.audio_mime_type || "audio/wav" }
        );

        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        try {
          await audio.play();
        } catch (playError) {
          console.error("Audio playback failed:", playError);
          setLiveError(
            "Response generated, but audio playback failed. Check your browser audio permissions."
          );
        }
      }

    } catch (err) {
      console.error("Live interviewer error:", err);

      setLiveError(
        err.message || "Unable to connect to the live interviewer."
      );
    } finally {
      setIsLiveProcessing(false);
    }
  }

  async function handleStartLiveRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setLiveError(
        "Audio recording is not supported in this browser. Try Chrome."
      );
      return;
    }

    try {
      stopListening();
      stopSpeaking();

      setLiveError("");
      setLiveTranscript("");
      setLiveReply("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      mediaStreamRef.current = stream;

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: recorder.mimeType || "audio/webm"
          }
        );

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        mediaStreamRef.current = null;

        await sendLiveAudio(audioBlob);
      };

      recorder.onerror = () => {
        setLiveError("Recording failed. Please try again.");

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        mediaStreamRef.current = null;
        setIsLiveRecording(false);
      };

      recorder.start();

      setIsLiveRecording(true);

    } catch (err) {
      console.error("Microphone error:", err);

      setLiveError(
        err.message || "Microphone permission was denied."
      );
    }
  }

  function handleStopLiveRecording() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setIsLiveRecording(false);
    }
  }

  // --------------------------------------------------
  // ANSWER EVALUATION
  // --------------------------------------------------

  async function handleEvaluate() {
    if (!answer.trim() || !currentQuestion || isEvaluating) return;

    stopListening();
    stopSpeaking();

    if (isLiveRecording) {
      handleStopLiveRecording();
      setError("Wait for the live voice response to finish before evaluating.");
      return;
    }

    if (isLiveProcessing) {
      setError("Wait for the live interviewer to finish before evaluating.");
      return;
    }

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

      if (data.adaptive_follow_up) {
        addAdaptiveQuestion(data.adaptive_follow_up);
      }

    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err.message || "Unable to evaluate your answer.");
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleNextQuestion() {
    if (currentIndex < questions.length - 1) {
      stopSpeaking();
      stopListening();

      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);
      setAnswer(answers[nextIndex] || "");
      setEvaluation(null);
      setTranscript("");
      setError("");
    }
  }

  function handlePreviousQuestion() {
    if (currentIndex > 0) {
      stopSpeaking();
      stopListening();

      const previousIndex = currentIndex - 1;

      setCurrentIndex(previousIndex);
      setAnswer(answers[previousIndex] || "");
      setEvaluation(null);
      setTranscript("");
      setError("");
    }
  }

  return (
    <WorkspaceLayout
      title="Technical Interview"
      activePage="/interview"
    >
      <div className="interview-page">

        {/* PAGE HEADING */}

        <section className="interview-heading">
          <span className="resume-eyebrow">
            <BrainCircuit size={15} />
            PROBEREADY INTERVIEW ENGINE
          </span>

          <h1>
            Prove what you <span>actually know.</span>
          </h1>

          <p>
            Answer personalized questions and receive AI-powered
            feedback on your technical understanding.
          </p>
        </section>

        {/* EMPTY STATE */}

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

          /* COMPLETION SCREEN */

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

              <h1>
                {performanceSummary.overall}
                <small>/10</small>
              </h1>

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
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard <ArrowRight size={17} />
            </button>

          </section>

        ) : (

          /* ACTIVE INTERVIEW */

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

              {isAdaptiveQuestion && (
                <span className="resume-eyebrow">
                  <BrainCircuit size={15} />
                  AI FOLLOW-UP
                </span>
              )}

              <span>{currentQuestion.category}</span>

              <h3>{currentQuestion.question}</h3>

              <p>{currentQuestion.reason}</p>

              {/* QUESTION VOICE CONTROLS */}

              <div className="interview-voice-controls">
                <button
                  type="button"
                  className="interview-voice-button"
                  onClick={handleSpeakQuestion}
                  disabled={isSpeaking || isListening || isLiveRecording}
                >
                  <Volume2 size={17} />
                  {isSpeaking ? "Speaking..." : "Speak Question"}
                </button>

                {isSpeaking && (
                  <button
                    type="button"
                    className="interview-voice-button"
                    onClick={stopSpeaking}
                  >
                    <Square size={16} />
                    Stop Speaking
                  </button>
                )}
              </div>
            </div>

            {/* ANSWER CARD */}

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
                disabled={isEvaluating || isLiveRecording || isLiveProcessing}
              />

              {/* BROWSER SPEECH RECOGNITION */}

              <div className="interview-voice-controls">
                {!isListening ? (
                  <button
                    type="button"
                    className="interview-voice-button"
                    onClick={handleStartRecording}
                    disabled={
                      !isSpeechRecognitionSupported ||
                      isEvaluating ||
                      isSpeaking ||
                      isLiveRecording ||
                      isLiveProcessing
                    }
                  >
                    <Mic size={17} />
                    Record Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    className="interview-voice-button"
                    onClick={handleStopRecording}
                  >
                    <MicOff size={17} />
                    Stop Recording
                  </button>
                )}

                {isListening && (
                  <span className="interview-voice-status">
                    Listening... Speak now
                  </span>
                )}
              </div>

              {!isSpeechRecognitionSupported && (
                <p className="resume-error">
                  Speech recognition is not supported in this browser.
                  Try Chrome.
                </p>
              )}

              {speechError && (
                <p className="resume-error">{speechError}</p>
              )}

              {/* LIVE AI INTERVIEWER */}

              <div className="interview-live-section">
                <div className="interview-live-heading">
                  <span className="resume-eyebrow">
                    <Radio size={15} />
                    LIVE AI INTERVIEWER
                  </span>

                  <p>
                    Speak naturally. The AI will listen, respond,
                    and ask your next question.
                  </p>
                </div>

                <div className="interview-voice-controls">
                  {!isLiveRecording ? (
                    <button
                      type="button"
                      className="interview-voice-button"
                      onClick={handleStartLiveRecording}
                      disabled={
                        isEvaluating ||
                        isLiveProcessing ||
                        isListening ||
                        isSpeaking
                      }
                    >
                      <Mic size={17} />
                      Start Live Turn
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="interview-voice-button"
                      onClick={handleStopLiveRecording}
                    >
                      <Square size={16} />
                      Send Answer
                    </button>
                  )}

                  {isLiveRecording && (
                    <span className="interview-voice-status">
                      Recording... Speak your answer
                    </span>
                  )}

                  {isLiveProcessing && (
                    <span className="interview-voice-status">
                      <LoaderCircle size={15} />
                      AI is thinking and preparing a response...
                    </span>
                  )}
                </div>

                {liveTranscript && (
                  <div className="interview-live-message">
                    <strong>Your spoken answer</strong>
                    <p>{liveTranscript}</p>
                  </div>
                )}

                {liveReply && (
                  <div className="interview-live-message">
                    <strong>AI Interviewer</strong>
                    <p>{liveReply}</p>
                  </div>
                )}

                {liveError && (
                  <div className="resume-error">
                    {liveError}
                  </div>
                )}

                {liveHistory.length > 0 && (
                  <p className="interview-voice-status">
                    {liveHistory.length / 2} voice turns completed
                  </p>
                )}
              </div>

              {/* EVALUATE ANSWER */}

              <button
                type="button"
                className="resume-continue-button"
                onClick={handleEvaluate}
                disabled={
                  !answer.trim() ||
                  isEvaluating ||
                  isLiveRecording ||
                  isLiveProcessing
                }
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
                <div className="resume-error">
                  {error}
                </div>
              )}
            </div>

            {/* EVALUATION RESULTS */}

            {savedEvaluation && (
              <div className="evaluation-results">
                <span className="resume-eyebrow">
                  <CheckCircle2 size={15} />
                  EVALUATION COMPLETE
                </span>

                <h3>
                  Overall Score: {savedEvaluation.overall_score}/10
                </h3>

                <p>
                  Verdict: {savedEvaluation.verdict}
                </p>

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

        {/* FOOTER */}

        <footer className="resume-footer">
          ProbeReady © 2026
          <span>Built to test what you actually know.</span>
        </footer>

      </div>
    </WorkspaceLayout>
  );
}

export default Interview;
