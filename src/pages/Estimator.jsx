import { useState, useEffect } from "react"; // Added useEffect
import { Timer, Volume2, StopCircle, Settings2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";
import useBrowserTTS from "../hooks/useBrowserTTS"; 

export function Estimator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Voice Settings State
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [pitch, setPitch] = useState(1); // 0.5 to 2
  const [rate, setRate] = useState(1);   // 0.5 to 2

  const { apiKey } = useApiKey();
  
  // 1. Destructure 'updateSettings' and 'cancel'
  const { speak, cancel, isSpeaking, updateSettings } = useBrowserTTS();

  // 2. REAL-TIME UPDATE EFFECT
  // This watches the sliders. If the voice is playing, it updates instantly.
  useEffect(() => {
    if (isSpeaking) {
      updateSettings({ pitch, rate });
    }
  }, [pitch, rate]); 

  const handleEstimate = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
    if (isSpeaking) cancel(); 

    try {
      const prompt = PROMPTS.estimator(input);
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to estimate. Please try again.");
    } finally {
      setLoading(false);
    }
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
      title="Estimator"
      description="How long is this actually going to take?"
      icon={Timer}
      color="text-purple-500"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the activity..."
            className="h-12 text-lg"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleVoiceText}
              lang="en-IN"
              className="border-purple-200 dark:border-purple-800"
            />
            <button
              type="button"
              onClick={() => {
                setInput("");
                if(isSpeaking) cancel();
              }}
              className="text-sm px-3 py-2 rounded border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        <Button
          onClick={handleEstimate}
          disabled={loading || !input.trim()}
          className="bg-purple-500 hover:bg-purple-600 shadow-purple-500/20"
          isLoading={loading}
        >
          Estimate Time
        </Button>

        {output && (
          <div className="relative animate-fade-in flex flex-col items-center justify-center p-8 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-center">
            
            {/* --- Voice Controls Section --- */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              
              <button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-2 rounded-full transition-colors ${
                  showVoiceSettings ? "bg-purple-100 text-purple-600" : "text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800"
                }`}
                title="Voice Settings"
              >
                <Settings2 size={18} />
              </button>

              <button
                // Updated to use 'cancel' instead of 'stop'
                onClick={() => isSpeaking ? cancel() : handleSpeak()}
                className={`p-2 rounded-full transition-all ${
                  isSpeaking 
                    ? "bg-red-100 text-red-600 animate-pulse hover:bg-red-200" 
                    : "bg-white dark:bg-purple-800 text-purple-500 hover:bg-purple-100 shadow-sm"
                }`}
                title={isSpeaking ? "Stop" : "Read Aloud"}
              >
                {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* Settings Panel */}
            {showVoiceSettings && (
              <div className="absolute top-14 right-3 z-10 p-4 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Speed</span>
                      <span>{rate}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1" 
                      value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500 dark:bg-gray-600"
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
                      className="w-full h-1 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500 dark:bg-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <Timer className="w-12 h-12 text-purple-500 mb-4" />
            <div className="text-lg font-medium text-purple-900 dark:text-purple-100 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}