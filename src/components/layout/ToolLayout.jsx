import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";

export function ToolLayout({ title, description, icon: Icon, color, children }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={`w-8 h-8 ${color}`} />}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="glass rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl dark:shadow-indigo-900/10">
        {children}
      </div>
    </div>
  );
}
