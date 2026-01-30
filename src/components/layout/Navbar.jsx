import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Upload, Download, Trash2, Database, Brain } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { exportData, importData } from "../../utils/dataHandler";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      alert("Data imported successfully! The page will refresh.");
      window.location.reload();
    } catch (err) {
      alert("Failed to import data: " + err.message);
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all your tasks and settings (including API Key).")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              thinko.space
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Data Management"
            >
              <Database className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Data Management"
      >
        <div className="space-y-6">
            <div className="pt-2">
                 <p className="text-sm text-slate-500 mb-4">
                  Manage your local data. You can export your tasks to a JSON file or import a previous backup.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json"
                  onChange={handleImport}
                />
                <Button variant="ghost" onClick={handleClearData} className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-2">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
            </div>
        </div>
      </Modal>
    </>
  );
}
