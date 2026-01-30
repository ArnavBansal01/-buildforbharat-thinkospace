import { useState, useEffect, createContext, useContext } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 5000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ id, message, type, duration, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  const styles = {
    info: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    success: "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/50",
    error: "bg-white dark:bg-slate-800 border-red-200 dark:border-red-800/50",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-2xl shadow-black/10 backdrop-blur-xl w-full max-w-sm sm:max-w-md",
        styles[type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
            {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
