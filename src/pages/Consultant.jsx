import { useState } from "react";
import { Lightbulb, Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

export function Consultant() {
  // Mode state: 'consult' or 'judge'
  const [mode, setMode] = useState("consult");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKey();

  // Configuration helpers based on mode
  const isJudge = mode === "judge";
  const themeColor = isJudge ? "amber" : "yellow";
  const CurrentIcon = isJudge ? Scale : Lightbulb;
  
  // Dynamic Styles
  const styles = {
    layoutColor: isJudge ? "text-amber-500" : "text-yellow-500",
    micBorder: isJudge ? "border-amber-200 dark:border-amber-800" : "border-yellow-200 dark:border-yellow-800",
    clearBtn: isJudge 
      ? "border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
      : "border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    mainBtn: isJudge 
      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" 
      : "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20 text-white",
    outputBg: isJudge 
      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" 
      : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800",
    heading: isJudge ? "text-amber-900 dark:text-amber-200" : "text-yellow-900 dark:text-yellow-200",
    prose: isJudge ? "text-amber-800 dark:text-amber-100" : "text-gray-800 dark:text-gray-200"
  };

  const handleAction = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Dynamic Prompt Selection
      const promptGenerator = isJudge ? PROMPTS.judge : PROMPTS.consultant;
      const prompt = promptGenerator(input);
      
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  const toggleMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    setOutput(""); // Clear output when switching contexts
    // Optional: Keep input if user wants to judge the same text they just consulted on
  };

  return (
    <ToolLayout
      title={isJudge ? "Judge" : "Consultant"}
      description={isJudge 
        ? "Am I misinterpreting this text? Let the AI judge the tone." 
        : "I'm stuck. What should I do?"}
      icon={CurrentIcon}
      color={styles.layoutColor}
    >
      <div className="space-y-6">
        
        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <button
            onClick={() => toggleMode("consult")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              !isJudge
                ? "bg-white dark:bg-gray-700 shadow text-yellow-600 dark:text-yellow-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Get Advice
            </div>
          </button>
          <button
            onClick={() => toggleMode("judge")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              isJudge
                ? "bg-white dark:bg-gray-700 shadow text-amber-600 dark:text-amber-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Judge Tone
            </div>
          </button>
        </div>

        {/* Textarea + Voice */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isJudge 
              ? "Paste the text you're unsure about here..." 
              : "Describe the situation..."}
            className="h-32 transition-colors duration-300"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleVoiceText}
              lang="en-IN"
              className={styles.micBorder}
            />

            <button
              type="button"
              onClick={() => setInput("")}
              className={`text-sm px-3 py-2 rounded border transition-colors ${styles.clearBtn}`}
            >
              Clear
            </button>
          </div>
        </div>

        <Button
          onClick={handleAction}
          disabled={loading || !input.trim()}
          className={`transition-colors duration-300 ${styles.mainBtn}`}
          isLoading={loading}
        >
          {isJudge ? "Judge it" : "Get Advice"}
        </Button>

        {output && (
          <div className={`animate-fade-in p-6 rounded-2xl border ${styles.outputBg}`}>
             <h3 className={`font-semibold mb-2 ${styles.heading}`}>
               {isJudge ? "Verdict:" : "Advice:"}
             </h3>
            <div className={`prose dark:prose-invert max-w-none ${styles.prose}`}>
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}