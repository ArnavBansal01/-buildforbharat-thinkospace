import { useState, useRef, useEffect, memo } from "react";
import {
  BookOpen,
  Send,
  MessageCircle,
  X,
  Volume2,
  StopCircle, // Added Stop Icon
  Settings2,  // Added Settings Icon
  Loader2,
} from "lucide-react";
import mermaid from "mermaid";
import axios from "axios";
import ReactMarkdown from "react-markdown";

import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";

import { useApiKey } from "../hooks/useApiKey";
import { generateText } from "../services/gemini";
import { fetchWebImage } from "../services/webSearch";
import { PROMPTS } from "../services/prompts";
import useBrowserTTS from "../hooks/useBrowserTTS"; // Import TTS Hook

/* -------------------- MERMAID -------------------- */
const MermaidChart = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!chart || !ref.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          htmlLabels: false,
          flowchart: { htmlLabels: false }
        });

        ref.current.innerHTML = "";
        await new Promise(requestAnimationFrame);
        if (cancelled) return;

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        console.warn("Mermaid skipped:", e);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-6 p-6 bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-blue-100 dark:border-blue-900/30 shadow-inner overflow-x-auto"
    />
  );
};

/* -------------------- VISUALS -------------------- */
const VisualBlock = ({ visuals }) => {
  if (!visuals) return null;
  const imagesOnly = visuals.filter((v) => v.type === "image");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {imagesOnly.map((v, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-3 border border-gray-100 dark:border-gray-700"
        >
          {v.url ? (
            <img
              src={v.url}
              alt={v.keyword}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="rounded-xl mx-auto object-cover aspect-square shadow-sm"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400x400?text=Image+Not+Found";
              }}
            />
          ) : (
            <div className="h-32 w-full bg-blue-50 dark:bg-gray-700 animate-pulse rounded-xl flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={20} />
              <span className="text-[10px] text-blue-400 font-bold uppercase">Searching...</span>
            </div>
          )}
          <p className="text-center mt-2 text-xs text-gray-800 dark:text-gray-200 font-bold uppercase">
            {v.keyword}
          </p>
        </div>
      ))}
    </div>
  );
};

/* -------------------- LESSON VIEW -------------------- */
const LessonView = memo(({ lesson, videoId }) => {
  if (!lesson) return null;

  // --- VOICE STATE ---
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const { speak, cancel, isSpeaking, updateSettings } = useBrowserTTS();

  // Update voice in real-time
  useEffect(() => {
    if (isSpeaking) updateSettings({ pitch, rate });
  }, [pitch, rate]);

  // Clean text for reading
  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text.replace(/[*#_`]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/\n/g, ". ");
  };

  const handleSpeak = () => {
    speak(cleanMarkdown(lesson.summary), { pitch, rate });
  };
  // -------------------

  return (
    <div className="relative bg-white dark:bg-gray-900 p-6 rounded-[2rem] border-2 border-gray-100 dark:border-gray-800 shadow-xl mb-12 transition-all">
      
      {/* --- VOICE CONTROLS (Top Right) --- */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
        <button
          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          className={`p-2 rounded-full transition-colors ${
            showVoiceSettings 
              ? "bg-blue-100 text-blue-600" 
              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title="Voice Settings"
        >
          <Settings2 size={20} />
        </button>

        <button
          onClick={() => isSpeaking ? cancel() : handleSpeak()}
          className={`p-2 rounded-full transition-all ${
            isSpeaking 
              ? "bg-red-100 text-red-600 animate-pulse hover:bg-red-200" 
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110"
          }`}
          title={isSpeaking ? "Stop Lesson" : "Read Lesson"}
        >
          {isSpeaking ? <StopCircle size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Settings Panel Popup */}
      {showVoiceSettings && (
        <div className="absolute top-16 right-6 z-20 p-4 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Speed</span>
                <span>{rate}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2" step="0.1" 
                value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------- */}

      <h1 className="text-2xl font-black mb-4 text-gray-900 dark:text-white tracking-tight pr-24">
        {lesson.title}
      </h1>

      <div className="prose prose-blue dark:prose-invert max-w-none mb-6 border-l-4 border-blue-600 pl-4 py-1 text-base leading-relaxed text-gray-700 dark:text-gray-300">
        <ReactMarkdown>{lesson.summary}</ReactMarkdown>
      </div>

      {lesson.visuals && <VisualBlock visuals={lesson.visuals} />}

      {lesson.flow && (
        <div className="mt-10">
          <h3 className="text-xl font-black mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-3">
            ✨ Learning Pathway
          </h3>
          <MermaidChart
            chart={`graph TD\n${lesson.flow
              .map((s, i) =>
                i < lesson.flow.length - 1
                  ? `n${i}[${lesson.flow[i]}] --> n${i + 1}[${lesson.flow[i + 1]}]`
                  : "",
              )
              .join("\n")}`}
          />
        </div>
      )}

      {videoId && (
        <div className="mt-12 pt-8 border-t-2 border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-4">
            <div className="p-2 bg-red-600 rounded-xl shadow-lg">
              <Volume2 className="text-white" size={20} />
            </div>
            Watch & Learn
          </h3>
          <div className="rounded-[1.5rem] overflow-hidden shadow-xl aspect-video max-w-4xl mx-auto border-4 border-white dark:border-gray-800 bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
});

/* -------------------- MAIN CONTROLLER -------------------- */
export function Teacher() {
  const { apiKey } = useApiKey();
  const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const [topic, setTopic] = useState("");
  const [lessonData, setLessonData] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleGenerateLesson = async () => {
    if (!apiKey || !topic.trim()) return;

    setLoading(true);
    setLessonData(null);
    setVideoId(null);
    setIsChatOpen(false);

    try {
      const prompt = PROMPTS.visualLearner(topic);
      const response = await generateText(prompt, apiKey);
      const cleanJson = response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.visuals) {
        parsed.visuals = parsed.visuals.map((v) => ({ ...v, url: null }));
      }
      setLessonData(parsed);

      const imagePromises = parsed.visuals
        .filter((v) => v.type === "image")
        .map((v) => fetchWebImage(v.keyword));

      const webImageResults = await Promise.all(imagePromises);

      setLessonData((prev) => ({
        ...prev,
        visuals: prev.visuals.map((v, index) => {
          if (v.type !== "image") return v;
          const fetched = webImageResults[index];
          return {
            ...v,
            url: fetched?.url || null,
            keyword: fetched?.keyword || v.keyword,
          };
        }),
      }));

      if (YOUTUBE_KEY) {
        axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: parsed.videoSearch,
            maxResults: 1,
            type: "video",
            key: YOUTUBE_KEY,
          },
        }).then((res) => {
          if (res.data.items.length > 0) setVideoId(res.data.items[0].id.videoId);
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error generating lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoubtSend = async () => {
    if (!chatInput.trim() || !apiKey) return;
    const userMsg = chatInput;
    setChatHistory((p) => [...p, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await generateText(PROMPTS.doubtSolver(topic || "General", userMsg), apiKey);
      setChatHistory((p) => [...p, { role: "assistant", content: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen]);

  return (
    <ToolLayout
      title="Visual Classroom"
      description="Learn anything visually and instantly."
      icon={BookOpen}
      color="text-blue-600"
    >
      {/* INPUT SECTION - Scaled to match Judge */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl mb-8">
        <label htmlFor="topic-input" className="text-xs font-black uppercase tracking-widest block mb-3 text-blue-600 ml-2">
          Topic Explorer
        </label>
        <div className="flex flex-col gap-4">
          <Textarea
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How does a jet engine work?"
            className="resize-none h-32 py-4 px-6 text-lg rounded-2xl"
          />

          <Button
            onClick={handleGenerateLesson}
            isLoading={loading}
            className="h-14 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none transition-transform active:scale-95"
          >
            GO 🚀
          </Button>
        </div>
      </div>

      {lessonData && <LessonView lesson={lessonData} videoId={videoId} />}

      {/* CHAT WINDOW - Position and placeholders kept */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-gray-900 border-2 border-blue-50 dark:border-gray-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 bg-blue-600 text-white font-black flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              <span className="text-base tracking-tight">Ask your Teacher</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-gray-950">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <MessageCircle size={48} className="mb-3 text-blue-300" />
                <p className="font-bold text-sm text-gray-400">
                  Any doubts about this lesson? <br /> Just ask me below!
                </p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none font-bold"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700 prose prose-sm prose-blue dark:prose-invert"
                }`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              className="flex-1 text-sm border-2 rounded-xl px-4 py-3 focus:border-black outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white font-medium" 
              placeholder="Ask a doubt..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDoubtSend()}
            />
            <Button onClick={handleDoubtSend} className="h-12 w-12 rounded-xl bg-blue-600 text-white flex-shrink-0">
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </ToolLayout>
  );
}