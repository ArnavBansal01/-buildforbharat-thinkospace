import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>thinko.space - AI Powered Tools</p>
      </footer>
    </div>
  );
}
