import { useState, useEffect } from "react";
import { PenTool, Copy, Check, Volume2, StopCircle, Settings2 } from "lucide-react"; // Added Icons
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";
import useBrowserTTS from "../hooks/useBrowserTTS"; // Import TTS Hook

const TONES = [
  "Professional",
  "Polite",
  "Less Snarky",
  "More Snarky",
  "Sarcastic",
  "Aggressive",
  "Easier to read",
  "More formal",
  "More casual",
  "Bullet points",
];

export function Formalizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Voice Settings State
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [pitch, setPitch] = useState(1); // 0.5 to 2
  const [rate, setRate] = useState(1);   // 0.5 to 2

  const { apiKey } = useApiKey();
  
  // Initialize TTS Hook
  const { speak, cancel, isSpeaking, updateSettings } = useBrowserTTS();

  // Real-time Voice Update Effect
  useEffect(() => {
    if (isSpeaking) {
      updateSettings({ pitch, rate });
    }
  }, [pitch, rate]);

  const handleFormalize = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
    if (isSpeaking) cancel(); // Stop previous speech

    try {
      const prompt = PROMPTS.formalizer(input, tone);
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to process text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/[*#_`]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/\n/g, ". "); 
  };

  const handleSpeak = () => {
    speak(cleanMarkdown(output), { pitch, rate });
  };

  return (
    <ToolLayout
      title="Formalizer"
      description="Turn your spicy thoughts into professional/polite text (or vice versa)."
      icon={PenTool}
      color="text-rose-500"
    >
      <div className="space-y-6">
        {/* Input Text + Voice */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Input Text
          </label>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what you want to say here..."
            className="h-32"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleVoiceText}
              lang="en-IN"
              className="border-rose-200 dark:border-rose-800"
            />

            <button
              type="button"
              onClick={() => {
                setInput("");
                if(isSpeaking) cancel();
              }}
              className="text-sm px-3 py-2 rounded border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <Button
            onClick={handleFormalize}
            disabled={loading || !input.trim()}
            className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
            isLoading={loading}
          >
            Convert
          </Button>
        </div>

        {output && (
          <div className="space-y-2 animate-fade-in relative">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Result
              </label>

              <div className="flex items-center gap-2">
                {/* --- Voice Controls --- */}
                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showVoiceSettings ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title="Voice Settings"
                >
                  <Settings2 size={16} />
                </button>

                <button
                  onClick={() => isSpeaking ? cancel() : handleSpeak()}
                  className={`p-1.5 rounded-md transition-colors ${
                    isSpeaking 
                      ? "bg-rose-100 text-rose-600 animate-pulse" 
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={isSpeaking ? "Stop" : "Read Aloud"}
                >
                  {isSpeaking ? <StopCircle size={16} /> : <Volume2 size={16} />}
                </button>
                {/* --------------------- */}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className={copied ? "text-emerald-500" : ""}
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Hidden Settings Panel */}
            {showVoiceSettings && (
              <div className="absolute top-8 right-0 z-10 p-4 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-rose-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Speed</span>
                      <span>{rate}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1" 
                      value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Pitch</span>
                      <span>{pitch}</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1" 
                      value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-h-[100px] prose dark:prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}