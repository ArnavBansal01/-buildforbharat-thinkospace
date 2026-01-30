import { useState, useEffect } from "react";
import {
  ListTodo,
  Plus,
  Trash2,
  Wand2,
  Check,
  ChevronDown,
  Loader2,
  Youtube
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ToolLayout } from "../components/layout/ToolLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import VoiceTypingButton from "../components/ui/VoiceTypingButton";
import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini"; // (named gemini.js, but you’re using Grok)
import { PROMPTS } from "../services/prompts";
import { cn } from "../utils/cn";
import { useToast } from "../components/ui/Toast";

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // ✅ put in .env
const YT_REGION = import.meta.env.VITE_YOUTUBE_REGION || "IN"; // optional
const YT_SAFESEARCH = import.meta.env.VITE_YOUTUBE_SAFESEARCH || "moderate"; // optional

export function MagicToDo() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("magic_todo_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTask, setNewTask] = useState("");
  const { apiKey, model } = useApiKey();
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem("magic_todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        text: newTask,
        completed: false,
        subtasks: [],
        videoUrl: null // ✅ store best youtube link per task
      }
    ]);
    setNewTask("");
  };

  // 🎤 Voice typing append
  const handleNewTaskVoice = (spokenText) => {
    if (!spokenText) return;
    setNewTask((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  const updateTask = (taskId, updates) => {
    const updateRecursive = (list) => {
      return list.map((t) => {
        if (t.id === taskId) return { ...t, ...updates };
        if (t.subtasks?.length > 0)
          return { ...t, subtasks: updateRecursive(t.subtasks) };
        return t;
      });
    };
    setTasks(updateRecursive(tasks));
  };

  const removeTask = (taskId) => {
    const removeRecursive = (list) => {
      return list
        .filter((t) => t.id !== taskId)
        .map((t) => ({
          ...t,
          subtasks: removeRecursive(t.subtasks || [])
        }));
    };
    setTasks(removeRecursive(tasks));
  };

  const addSubtasks = (parentId, newSubtasks) => {
    const addRecursive = (list) => {
      return list.map((t) => {
        if (t.id === parentId) {
          return {
            ...t,
            subtasks: [
              ...(t.subtasks || []),
              ...newSubtasks.map((text) => ({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2),
                text,
                completed: false,
                subtasks: [],
                videoUrl: null
              }))
            ]
          };
        }
        if (t.subtasks?.length > 0) {
          return { ...t, subtasks: addRecursive(t.subtasks) };
        }
        return t;
      });
    };
    setTasks(addRecursive(tasks));
  };

  return (
    <ToolLayout
      title="Magic ToDo"
      description="Break down complex tasks into manageable steps automatically."
      icon={ListTodo}
      color="text-emerald-500"
    >
      <form onSubmit={addTask} className="relative mb-12 group">
        <div className="space-y-2">
          <div className="relative">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full h-14 pl-6 pr-16 text-lg rounded-2xl border-transparent bg-white dark:bg-slate-800/50 shadow-sm focus:shadow-md focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 placeholder:text-slate-400"
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button
                type="submit"
                disabled={!newTask.trim()}
                className={cn(
                  "h-full aspect-square rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300",
                  !newTask.trim() && "opacity-50 grayscale"
                )}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* ✅ Voice controls */}
          <div className="flex items-center gap-2">
            <VoiceTypingButton
              onText={handleNewTaskVoice}
              lang="en-IN"
              className="border-emerald-200 dark:border-emerald-800"
            />

            <button
              type="button"
              onClick={() => setNewTask("")}
              className="text-sm px-3 py-2 rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4"
            >
              <ListTodo className="w-8 h-8 opacity-50" />
            </motion.div>
            <p>No tasks yet. Add one to get started!</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <TodoItem
                task={task}
                onUpdate={updateTask}
                onRemove={removeTask}
                onAddSubtasks={addSubtasks}
                apiKey={apiKey}
                model={model}
                addToast={addToast}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}

function TodoItem({
  task,
  onUpdate,
  onRemove,
  onAddSubtasks,
  apiKey,
  model,
  addToast,
  depth = 0
}) {
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = (task.subtasks || []).filter((t) => t.completed).length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const parseListFromLLM = (text) => {
    return (text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^(\d+[\).\s]+|[-*•]\s+)/, "").trim())
      .filter(Boolean);
  };

  const handleBreakdown = async () => {
    if (!apiKey) {
      addToast("Please set your Grok API Key in settings first.", "error");
      return;
    }
    if (!task?.text?.trim()) return;

    setLoading(true);
    setIsOpen(true);

    try {
      const prompt = PROMPTS.magicToDo(task.text);
      const response = await generateText(prompt, apiKey, model);
      const items = parseListFromLLM(response);

      if (!items.length) {
        addToast("I couldn't generate subtasks for this. Try rephrasing.", "error", 6000);
        return;
      }

      onAddSubtasks(task.id, items);
    } catch (error) {
      addToast(error?.message || "Breakdown failed", "error", 8000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Find most relevant YouTube video and redirect
  const searchYouTube = async (query) => {
    if (!YT_API_KEY) {
      throw new Error("Missing VITE_YOUTUBE_API_KEY in your .env");
    }

    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      `?part=snippet` +
      `&type=video` +
      `&maxResults=1` +
      `&q=${encodeURIComponent(query)}` +
      `&key=${encodeURIComponent(YT_API_KEY)}` +
      `&regionCode=${encodeURIComponent(YT_REGION)}` +
      `&safeSearch=${encodeURIComponent(YT_SAFESEARCH)}` +
      `&relevanceLanguage=en`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data?.error) {
      throw new Error(data?.error?.message || "YouTube search failed");
    }

    const vid = data?.items?.[0]?.id?.videoId;
    if (!vid) throw new Error("No relevant YouTube video found.");

    return `https://www.youtube.com/watch?v=${vid}`;
  };

  const handleOpenYoutube = async () => {
    try {
      // If already saved for this task, open immediately
      if (task.videoUrl) {
        window.open(task.videoUrl, "_blank", "noopener,noreferrer");
        return;
      }

      setVideoLoading(true);

      const q = task.text;
      // You can tune this query to be more "learning" oriented
      const bestUrl = await searchYouTube(`${q} tutorial`);

      onUpdate(task.id, { videoUrl: bestUrl });

      window.open(bestUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      addToast(err?.message || "Could not open YouTube video", "error", 7000);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <motion.div className="w-full relative group/item">
      <div
        className={cn(
          "relative flex flex-col gap-1 p-3 rounded-xl transition-all duration-300",
          task.completed ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
      >
        <div className="flex items-start gap-3 z-10">
          <button
            onClick={() => onUpdate(task.id, { completed: !task.completed })}
            className={cn(
              "relative flex-shrink-0 mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
              task.completed
                ? "bg-slate-400 border-slate-400 text-white dark:bg-slate-600 dark:border-slate-600"
                : "border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400"
            )}
          >
            <motion.div initial={false} animate={{ scale: task.completed ? 1 : 0 }}>
              <Check className="w-3 h-3" />
            </motion.div>
          </button>

          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span
              className={cn(
                "text-base font-medium text-slate-700 dark:text-slate-200 transition-all leading-normal",
                task.completed && "line-through text-slate-400 dark:text-slate-500"
              )}
            >
              {task.text}
            </span>

            {totalSubtasks > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
            {totalSubtasks > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={isOpen ? "Collapse" : "Expand"}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </Button>
            )}

            {/* ✅ NEW: YouTube button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenYoutube}
              disabled={videoLoading}
              title="Watch on YouTube"
              className={cn(
                "h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                videoLoading && "text-red-500"
              )}
            >
              {videoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Youtube className="w-3.5 h-3.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBreakdown}
              disabled={loading || task.completed}
              title="Break down"
              className={cn(
                "h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors",
                loading && "text-indigo-500"
              )}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(task.id)}
              className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-5 pl-4 border-l border-indigo-100 dark:border-indigo-900/30 mt-1 overflow-hidden"
          >
            <div className="flex items-center space-x-2 text-indigo-500/70 text-xs py-2 px-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {totalSubtasks > 0 && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-6 mt-1 space-y-1 overflow-hidden"
          >
            {(task.subtasks || []).map((subtask) => (
              <TodoItem
                key={subtask.id}
                task={subtask}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddSubtasks={onAddSubtasks}
                apiKey={apiKey}
                model={model}
                addToast={addToast}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
