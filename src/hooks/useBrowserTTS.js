import { useState, useRef, useEffect } from "react";

const useBrowserTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef([]);
  const queueRef = useRef([]);
  const isCancelledRef = useRef(false);

  // Track the text of the CURRENT sentence being spoken
  const currentSentenceRef = useRef("");
  // Track how much of the current sentence has been spoken
  const charOffsetRef = useRef(0);
  
  // Settings Ref
  const settingsRef = useRef({ pitch: 1, rate: 1 });
  // Timer for debouncing slider drags
  const restartTimeoutRef = useRef(null);

  const loadVoices = () => {
    if (!window.speechSynthesis) return;
    voicesRef.current = window.speechSynthesis.getVoices();
  };

  useEffect(() => {
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => cancel(); // Cleanup on unmount
  }, []);

  const getBestVoice = () => {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    return (
      voices.find(v => (v.name.includes("Google") || v.name.includes("Zira")) && v.lang.includes("en")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0]
    );
  };

  const speakNext = () => {
    if (isCancelledRef.current || queueRef.current.length === 0) {
      setIsSpeaking(false);
      return;
    }

    const sentence = queueRef.current.shift();
    currentSentenceRef.current = sentence; // Remember text
    charOffsetRef.current = 0;             // Reset offset

    const utterance = new SpeechSynthesisUtterance(sentence);
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    // Apply Current Settings
    utterance.rate = settingsRef.current.rate;
    utterance.pitch = settingsRef.current.pitch;
    utterance.volume = 1;

    // TRACKING: Update offset as words are spoken
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        charOffsetRef.current = event.charIndex;
      }
    };

    utterance.onend = () => {
      // Only continue if we weren't cancelled (e.g. by a slider change)
      if (!isCancelledRef.current) {
        speakNext(); // Go to next sentence
      }
    };

    utterance.onerror = (e) => {
      // 'interrupted' is expected when we restart
      if (e.error !== 'interrupted') {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speak = (text, { pitch = 1, rate = 1 } = {}) => {
    cancel(); // Clear everything
    isCancelledRef.current = false;
    setIsSpeaking(true);

    // Init settings
    settingsRef.current = { pitch, rate };

    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    // Split into sentences
    const sentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .filter(Boolean);

    queueRef.current = sentences;
    speakNext();
  };

  // --- NEW: Real-time Update Function ---
  const updateSettings = ({ pitch, rate }) => {
    // 1. Update the ref immediately so new sentences pick it up
    settingsRef.current = { pitch, rate };

    // 2. If currently speaking, we need to restart the current sentence
    if (window.speechSynthesis.speaking) {
      
      // Clear any pending restart to avoid stuttering
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

      // Debounce: Wait 300ms after slider stops moving before restarting audio
      restartTimeoutRef.current = setTimeout(() => {
        // Stop current audio (triggers onerror='interrupted')
        window.speechSynthesis.cancel();
        
        // Calculate remaining text of the current sentence
        const fullSentence = currentSentenceRef.current;
        const remainingText = fullSentence.slice(charOffsetRef.current);

        // Put remaining text back at the START of the queue
        if (remainingText.trim().length > 0) {
          queueRef.current.unshift(remainingText);
        }

        // Resume immediately
        isCancelledRef.current = false; // Reset cancel flag
        speakNext();
      }, 300); // 300ms delay for smoothness
    }
  };

  const cancel = () => {
    isCancelledRef.current = true;
    window.speechSynthesis?.cancel();
    queueRef.current = [];
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    setIsSpeaking(false);
  };

  return { speak, cancel, isSpeaking, updateSettings };
};

export default useBrowserTTS;