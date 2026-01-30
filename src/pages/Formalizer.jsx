import { useState } from "react";
import { PenTool, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

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
  const { apiKey } = useApiKey();

  const handleFormalize = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
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

  // 🎤 Voice typing append
  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
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
              onClick={() => setInput("")}
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
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Result
              </label>

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

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-h-[100px] prose dark:prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
