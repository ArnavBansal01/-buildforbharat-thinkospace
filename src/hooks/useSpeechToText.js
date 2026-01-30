import { useEffect, useRef, useState } from "react";

export default function useSpeechToText({
  continuous = true,
  interimResults = true,
  lang = "en-IN",
} = {}) {
  const recognitionRef = useRef(null);

  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.onerror = (e) => {
      setError(e?.error || "speech_error");
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += transcript;
        else interim += transcript;
      }

      if (finalChunk) setFinalText((prev) => (prev ? prev + " " : "") + finalChunk.trim());
      setInterimText(interim.trim());
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [continuous, interimResults, lang]);

  const start = () => {
    if (!recognitionRef.current) return;
    setFinalText("");
    setInterimText("");
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Chrome throws if start called twice quickly
      setError("start_failed");
    }
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  };

  const reset = () => {
    setFinalText("");
    setInterimText("");
    setError(null);
  };

  return {
    isSupported,
    isListening,
    finalText,
    interimText,
    error,
    start,
    stop,
    reset,
  };
}
