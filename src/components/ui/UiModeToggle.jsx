import { LayoutGrid, Rows3 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function UiModeToggle() {
  const { uiMode, toggleUiMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleUiMode}
      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800
                 bg-white/60 dark:bg-slate-900/40 backdrop-blur
                 hover:bg-white dark:hover:bg-slate-900 transition
                 text-slate-700 dark:text-slate-200 text-sm font-medium
                 flex items-center gap-2"
      title={uiMode === "calm" ? "Switch to Compact UI" : "Switch to Calm UI"}
    >
      {uiMode === "calm" ? <Rows3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
      {uiMode === "calm" ? "Calm UI" : "Compact UI"}
    </button>
  );
}
