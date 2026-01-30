  import { useState } from "react";
  import { Scale } from "lucide-react";
  import ReactMarkdown from "react-markdown";

  import { ToolLayout } from "../components/layout/ToolLayout";
  import { Button } from "../components/ui/Button";
  import { Textarea } from "../components/ui/Input";
  import VoiceTypingButton from "../components/ui/VoiceTypingButton";

  import { useApiKey } from "../hooks/useApiKey";
  import { generateText } from "../services/gemini";
  import { PROMPTS } from "../services/prompts";

  export function Judge() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const { apiKey } = useApiKey();

    const handleJudge = async () => {
      if (!apiKey) {
        alert("Please set your Gemini API Key in the settings first.");
        return;
      }
      if (!input.trim()) return;

      setLoading(true);
      try {
        const prompt = PROMPTS.judge(input);
        const response = await generateText(prompt, apiKey);
        setOutput(response);
      } catch (error) {
        console.error(error);
        alert(error.message || "Failed to process text. Please try again.");
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
        title="Judge"
        description="Am I misinterpreting this text? Let the AI judge the tone."
        icon={Scale}
        color="text-amber-500"
      >
        <div className="space-y-6">
          {/* Textarea + Voice */}
          <div className="space-y-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the text you're unsure about here..."
              className="h-32"
            />

            <div className="flex items-center gap-2">
              <VoiceTypingButton
                onText={handleVoiceText}
                lang="en-IN"
                className="border-amber-200 dark:border-amber-800"
              />

              <button
                type="button"
                onClick={() => setInput("")}
                className="text-sm px-3 py-2 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                Clear
              </button>
            </div>
          </div>

          <Button
            onClick={handleJudge}
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
            isLoading={loading}
          >
            Judge it
          </Button>

          {output && (
            <div className="animate-fade-in p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                Verdict:
              </h3>
              <div className="prose dark:prose-invert max-w-none text-amber-800 dark:text-amber-100">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </ToolLayout>
    );
  }
