
import { useEffect, useRef, useState } from "react";

export function useSpeech() {
  const recognitionRef = useRef(null);
  const shouldKeepListening = useRef(false);
  const finalTranscriptRef = useRef("");
  const voicesRef = useRef([]);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  const isSpeechRecognitionSupported = Boolean(SpeechRecognition);

  // Load available browser voices.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }

    loadVoices();

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, []);

  // Select the best available female English voice.
  function getPreferredVoice() {
    const voices = voicesRef.current;

    if (!voices.length) return null;

    const femaleNameHints = [
      "female",
      "woman",
      "neerja",
      "raveena",
      "heera",
      "priya",
      "veena",
      "lekha",
      "sangeeta",
      "swara",
      "aditi"
    ];

    const isFemaleVoice = (voice) => {
      const name = voice.name.toLowerCase();
      return femaleNameHints.some((hint) => name.includes(hint));
    };

    const indianEnglishVoices = voices.filter(
      (voice) => voice.lang.toLowerCase() === "en-in"
    );

    // First preference: female Indian English voice.
    const femaleIndianVoice = indianEnglishVoices.find(
      isFemaleVoice
    );

    if (femaleIndianVoice) return femaleIndianVoice;

    // Second preference: any Indian English voice.
    if (indianEnglishVoices.length > 0) {
      return indianEnglishVoices[0];
    }

    // Third preference: female voice from another English locale.
    const femaleEnglishVoice = voices.find(
      (voice) =>
        voice.lang.toLowerCase().startsWith("en") &&
        isFemaleVoice(voice)
    );

    if (femaleEnglishVoice) return femaleEnglishVoice;

    // Final fallback: any available English voice.
    return voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("en")
    ) || null;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      setSpeechError("Text-to-speech is not supported.");
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError("");

    const utterance = new SpeechSynthesisUtterance(text);

    const preferredVoice = getPreferredVoice();

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechError("Unable to speak the question.");
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  function createRecognition() {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      setTranscript(
        (finalTranscriptRef.current + interimTranscript).trim()
      );
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        return;
      }

      setSpeechError(`Speech recognition error: ${event.error}`);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldKeepListening.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (shouldKeepListening.current) {
        try {
          recognitionRef.current = createRecognition();
          recognitionRef.current.start();
        } catch (error) {
          console.error("Recognition restart failed:", error);
          shouldKeepListening.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }

  function startListening() {
    if (!isSpeechRecognitionSupported) {
      setSpeechError(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    setSpeechError("");
    finalTranscriptRef.current = "";
    setTranscript("");

    shouldKeepListening.current = true;
    setIsListening(true);

    try {
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();
    } catch (error) {
      console.error("Recognition start failed:", error);
      shouldKeepListening.current = false;
      setIsListening(false);
      setSpeechError("Unable to start microphone recording.");
    }
  }

  function stopListening() {
    shouldKeepListening.current = false;

    recognitionRef.current?.stop();
    setIsListening(false);
  }

  useEffect(() => {
    return () => {
      shouldKeepListening.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
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
  };
}
