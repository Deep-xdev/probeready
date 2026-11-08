
import { createContext, useContext, useState } from "react";

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  function startInterview(generatedQuestions, analysis, id) {
  setQuestions(generatedQuestions);
  setResumeAnalysis(analysis);
  setSessionId(id);
  setCurrentIndex(0);
  setAnswers([]);
  setEvaluations([]);
}

  function saveAnswer(index, answer) {
    setAnswers((previous) => {
      const updated = [...previous];
      updated[index] = answer;
      return updated;
    });
  }

  function saveEvaluation(index, evaluation) {
    setEvaluations((previous) => {
      const updated = [...previous];
      updated[index] = evaluation;
      return updated;
    });
  }

  function resetInterview() {
    setQuestions([]);
    setResumeAnalysis(null);
    setCurrentIndex(0);
    setAnswers([]);
    setEvaluations([]);
    setSessionId(null);
  }

  return (
    <InterviewContext.Provider
      value={{
        questions,
        sessionId,
        resumeAnalysis,
        currentIndex,
        setCurrentIndex,
        answers,
        evaluations,
        startInterview,
        saveAnswer,
        saveEvaluation,
        resetInterview
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error(
      "useInterview must be used inside InterviewProvider"
    );
  }

  return context;
}
