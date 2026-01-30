import { useEffect, useMemo, useRef, useState } from "react";
import { Focus, Play, Pause, RotateCcw, Quote, Music } from "lucide-react";
import { ToolLayout } from "../components/layout/ToolLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function FocusTimer() {
  const QUOTES = useMemo(
    () => [
      "Start small. Stay consistent.",
      "One task. One breath. One minute at a time.",
      "Your future self will thank you.",
      "Focus is a superpower in a distracted world.",
      "Progress > perfection.",
      "Do it messy, but do it.",
      "You don’t need more time. You need more focus.",
      "Tiny steps create big results.",
      "Deep work now, freedom later.",
    ],
    []
  );

  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);

  // 🎵 Music state
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  const tickRef = useRef(null);
  const quoteRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/focus.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setMusicOn(!musicOn);
  };

  useEffect(() => {
    if (!isRunning) {
      const m = Number(minutes);
      const safeMinutes = Number.isFinite(m) ? Math.min(Math.max(m, 1), 240) : 25;
      setSecondsLeft(safeMinutes * 60);
    }
  }, [minutes, isRunning]);

  const pickRandomQuote = () => {
    const next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(next);
  };

  const start = () => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    const m = Number(minutes);
    const safeMinutes = Number.isFinite(m) ? Math.min(Math.max(m, 1), 240) : 25;
    setSecondsLeft(safeMinutes * 60);
    pickRandomQuote();
  };

  useEffect(() => {
    if (!isRunning) return;

    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      pickRandomQuote();
    }
  }, [secondsLeft, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    pickRandomQuote();
    quoteRef.current = setInterval(pickRandomQuote, 5 * 60 * 1000);

    return () => clearInterval(quoteRef.current);
  }, [isRunning]);

  const progress = useMemo(() => {
    const total = Math.max(1, Number(minutes) * 60);
    return Math.min(100, Math.max(0, (secondsLeft / total) * 100));
  }, [minutes, secondsLeft]);

  return (
    <ToolLayout
      title="Focus Timer"
      description="Set a timer, pause when needed, and stay locked in."
      icon={Focus}
      color="text-cyan-500"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Set minutes</label>
            <Input
              type="number"
              min={1}
              max={240}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              disabled={isRunning}
              className="h-12 text-lg"
            />
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={start}
                disabled={secondsLeft <= 0}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={pause}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            {/* 🎵 Music Button */}
            <Button
              variant="ghost"
              onClick={toggleMusic}
              title="Toggle relaxing music"
              className={musicOn ? "text-cyan-500" : ""}
            >
              <Music className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Timer Card */}
        <div className="rounded-2xl border p-8 relative">
          <div className="absolute left-0 top-0 h-1 w-full bg-slate-100">
            <div
              className="h-full bg-cyan-500/80"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 min-h-[220px]">
            <div className="text-6xl font-extrabold tracking-widest">FOCUS</div>
            <div className="text-5xl font-bold text-cyan-500">
              {formatTime(secondsLeft)}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 text-slate-600">
            <Quote className="w-4 h-4 mt-0.5" />
            <p className="text-sm">{quote}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
