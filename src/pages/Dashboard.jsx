import { Link } from "react-router-dom";
import { 
  ListTodo, 
  PenTool, 
  Scale, 
  GraduationCap, 
  Lightbulb, 
  Timer, 
  Brain, 
  ChefHat, 
  BookOpen,
  Focus        // ✅ ADD
} from "lucide-react";
import { Card } from "../components/ui/Card";

const TOOLS = [
  {
    id: "todo",
    name: "Magic ToDo",
    description: "Break down to-do items",
    icon: ListTodo,
    color: "text-emerald-500",
    path: "/todo"
  },
   {
    id: "teacher",
    name: "Visual Learner",
    description: "Lesson planning and more",
    icon: BookOpen,
    color: "text-blue-500",
    path: "/teacher"
  },{
    id: "compiler",
    name: "Compiler",
    description: "Turn a braindump into actions",
    icon: Brain,
    color: "text-pink-500",
    path: "/compiler"
  },
  {
    id: "focus",
    name: "Focus Timer",
    description: "Stay focused with a countdown timer and motivation",
    icon: Focus,
    color: "text-cyan-500",
    path: "/focus"
  },
  {
    id: "formalizer",
    name: "Formalizer",
    description: "Text transformers for tone",
    icon: PenTool,
    color: "text-rose-500",
    path: "/formalizer"
  },
  
  
  {
    id: "consultant",
    name: "Consultant",
    description: "Help me decide",
    icon: Lightbulb,
    color: "text-yellow-500",
    path: "/consultant"
  },
  {
    id: "estimator",
    name: "Estimator",
    description: "Guess an activity's timeframe",
    icon: Timer,
    color: "text-purple-500",
    path: "/estimator"
  },
  
  {
    id: "chef",
    name: "Chef",
    description: "Create a recipe from ingredients",
    icon: ChefHat,
    color: "text-orange-500",
    path: "/chef"
  },
 

];

export function Dashboard() {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-4">
          thinko.space
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          A collection of small, simple, single-task AI tools designed to help neurodivergent people (and everyone else) with tasks they find overwhelming or difficult.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.path} className="group">
            <Card className="h-full p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform duration-300">
                  <tool.icon className={`w-10 h-10 ${tool.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
