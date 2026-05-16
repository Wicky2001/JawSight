import { Route, Routes, Link, useLocation } from "react-router-dom";
import { Activity, Moon, Sun } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./context/ThemeContext";

// pages
import Inference from "./pages/inference/Inference";
import InferenceHistory from "./pages/inferenceHistory/InferenceHistory";
import InferenceHistoryDetailView from "./pages/inferenceHistory/inferenceHistoryDetailView/InferenceHistoryDetailView";
import Patients from "./pages/patients/Patients";
import PatientsDetailView from "./pages/patients/PatientsDetailView/PatientsDetailView";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import ProtectedRoute from "./helpers/ProtectedRoute";

//css
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col bg-app font-sans text-primary">
      {/* Global Navigation */}
      <nav className="navbar-bg border-b border-primary sticky top-0 z-10 w-full text-left">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 brand-text" />
            <span className="text-xl font-bold tracking-tight text-primary">
              JawSight
            </span>
          </Link>
          <div className="flex gap-8 items-center">
            <div className="flex gap-8 text-sm font-medium text-secondary">
              <Link
                to="/inference"
                className={`${location.pathname === "/inference" ? "text-primary border-b-2 border-primary" : "hover:text-primary transition-colors"} pb-1`}
              >
                Inference
              </Link>
              <Link
                to="/inference-history"
                className={`${location.pathname === "/inference-history" ? "text-primary border-b-2 border-primary" : "hover:text-primary transition-colors"} pb-1`}
              >
                History
              </Link>
              <Link
                to="/patients"
                className={`${location.pathname === "/patients" ? "text-primary border-b-2 border-primary" : "hover:text-primary transition-colors"} pb-1`}
              >
                Patients
              </Link>
              <Link
                to="#"
                className="hover:text-primary transition-colors pb-1"
              >
                About Us
              </Link>
            </div>
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 min-h-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/inference" element={<Inference />} />
            <Route path="/inference-history" element={<InferenceHistory />} />
            <Route
              path="/inference-history-detail-view/:patient_id/:patient_name/:inference_id"
              element={<InferenceHistoryDetailView />}
            />
            <Route
              path="/patients-detail-view"
              element={<PatientsDetailView />}
            />
            <Route path="/patients" element={<Patients />} />
          </Route>
        </Routes>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg surface-elevated hover-bg transition-colors"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-secondary" />
      ) : (
        <Sun className="w-5 h-5 text-info" />
      )}
    </button>
  );
}
