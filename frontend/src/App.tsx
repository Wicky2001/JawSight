import { Route, Routes, Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

// pages
import { InferenceComponent } from './pages/inference/Inference';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import ProtectedRoute from './helpers/ProtectedRoute';

//css
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Global Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full text-left">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-teal-700">
            <Activity className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">JawSight</span>
          </Link>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link 
              to="/inference" 
              className={`${location.pathname === '/inference' ? 'text-teal-600 border-b-2 border-teal-600' : 'hover:text-slate-800 transition-colors'} pb-1`}
            >
              Inference
            </Link>
            <Link to="#" className="hover:text-slate-800 transition-colors pb-1">History</Link>
            <Link to="#" className="hover:text-slate-800 transition-colors pb-1">About Us</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inference" element={<InferenceComponent />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
