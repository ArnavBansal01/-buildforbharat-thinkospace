import { useState } from "react";
import { Brain, ListTodo } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { PROMPTS } from "../services/prompts";

export function Compiler() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiKey } = useApiKey();

  const handleCompile = async () => {
    if (!apiKey) {
      alert("Please set your Gemini API Key in the settings first.");
      return;
    }
    if (!input.trim()) return;

    setLoading(true);
    try {
      const prompt = PROMPTS.compiler(input);
      const response = await generateText(prompt, apiKey);
      setOutput(response);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to compile tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendToMagicTodo = () => {
    const currentTasks = localStorage.getItem("magic_todo_tasks");
    const parsedTasks = currentTasks ? JSON.parse(currentTasks) : [];

    const lines = output
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((l) => l.replace(/^[-*]\s*/, ""));

    const newTasks = lines.map((text) => ({
      id: crypto.randomUUID(),
      text,
      completed: false,
      subtasks: [],
    }));

    localStorage.setItem(
      "magic_todo_tasks",
      JSON.stringify([...parsedTasks, ...newTasks])
    );

    alert("Tasks added to Magic ToDo!");
  };

  // Voice typing append
  const handleVoiceText = (spokenText) => {
    if (!spokenText) return;
    setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  return (
    <ToolLayout
      title="Compiler"
      description="Turn your brain dump into actionable tasks."
      icon={Brain}
      color="text-pink-500"
    >
      <div className="space-y-6">
        {/* Textarea + Voice */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dump your thoughts here..."
            className="h-40"
          />

          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleVoiceText}
              lang="en-IN"
              className="border-pink-200 dark:border-pink-800"
            />

            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm px-3 py-2 rounded border border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20"
            >
              Clear
            </button>
          </div>
        </div>

        <Button
          onClick={handleCompile}
          disabled={loading || !input.trim()}
          className="bg-pink-500 hover:bg-pink-600 shadow-pink-500/20"
          isLoading={loading}
        >
          Compile into Tasks
        </Button>

        {output && (
          <div className="animate-fade-in space-y-4">
            <div className="p-6 rounded-2xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>

            <Button
              onClick={sendToMagicTodo}
              variant="secondary"
              className="w-full"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Send to Magic ToDo
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
