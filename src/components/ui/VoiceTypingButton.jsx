import { useEffect, useRef } from "react";
import useSpeechToText from "../../hooks/useSpeechToText";

export default function VoiceTypingButton({
  onText,
  lang = "en-IN",
  className = "",
}) {
  const { isSupported, isListening, finalText, error, start, stop } =
    useSpeechToText({ lang });

  // Keep track of what we've already sent to parent
  const lastSentRef = useRef("");

  useEffect(() => {
    if (!finalText || !onText) return;

    const lastSent = lastSentRef.current;

    // Compute only the "new" delta part
    let delta = "";
    if (finalText.startsWith(lastSent)) {
      delta = finalText.slice(lastSent.length).trim();
    } else {
      // If mismatch happens, fallback to sending whole finalText once
      delta = finalText.trim();
    }

    if (delta) onText(delta);

    lastSentRef.current = finalText;
  }, [finalText, onText]);

  const handleToggle = () => {
    if (isListening) {
      stop();
    } else {
      // reset what we sent for a new session
      lastSentRef.current = "";
      start();
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`px-3 py-2 rounded border ${className}`}
      title={isListening ? "Stop voice typing" : "Start voice typing"}
    >
      {isListening ? "🛑 Stop" : "🎤 Speak"}
      {error ? <span className="ml-2 text-sm">(error)</span> : null}
    </button>
  );
}
