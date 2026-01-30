import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { MagicToDo } from "./pages/MagicToDo";
import { Formalizer } from "./pages/Formalizer";
import { Judge } from "./pages/Judge";
import { Professor } from "./pages/Professor";
import { Consultant } from "./pages/Consultant";
import { Estimator } from "./pages/Estimator";
import { Compiler } from "./pages/Compiler";
import { Chef } from "./pages/Chef";
import { Teacher } from "./pages/Teacher";
import { FocusTimer } from "./pages/FocusTimer"; // ✅ already imported

import { ToastProvider } from "./components/ui/Toast";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="todo" element={<MagicToDo />} />
              <Route path="formalizer" element={<Formalizer />} />
              <Route path="judge" element={<Judge />} />
              <Route path="professor" element={<Professor />} />
              <Route path="consultant" element={<Consultant />} />
              <Route path="estimator" element={<Estimator />} />
              <Route path="compiler" element={<Compiler />} />
              <Route path="chef" element={<Chef />} />
              <Route path="teacher" element={<Teacher />} />

              {/* ✅ NEW Focus Timer route */}
              <Route path="focus" element={<FocusTimer />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
