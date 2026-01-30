import { useState } from "react";
import { GraduationCap } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

export function Professor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKey();

  const handleExplain = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
    try {
      const prompt = PROMPTS.professor(input);
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to explain. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Voice typing append
  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  return (
    <ToolLayout
      title="Professor"
      description="Explain anything like I'm 5 (or a university student)."
      icon={GraduationCap}
      color="text-indigo-500"
    >
      <div className="space-y-6">
        {/* Textarea + Voice */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you want explained? (e.g., Quantum Physics, How to make a sandwich)"
            className="h-24"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleVoiceText}
              lang="en-IN"
              className="border-indigo-200 dark:border-indigo-800"
            />

            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm px-3 py-2 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        <Button
          onClick={handleExplain}
          disabled={loading || !input.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20"
          isLoading={loading}
        >
          Explain it
        </Button>

        {output && (
          <div className="animate-fade-in prose dark:prose-invert max-w-none p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
