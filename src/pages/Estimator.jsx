import { useState } from "react";
import { Timer } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

export function Estimator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKey();

  const handleEstimate = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
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

  // Voice typing append
  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  return (
    <ToolLayout
      title="Estimator"
      description="How long is this actually going to take?"
      icon={Timer}
      color="text-purple-500"
    >
      <div className="space-y-6">
        {/* Input + Voice */}
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
              onClick={() => setInput("")}
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
          <div className="animate-fade-in flex flex-col items-center justify-center p-8 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-center">
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
