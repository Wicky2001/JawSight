import {Route,Routes} from 'react-router-dom';
import { Activity } from 'lucide-react';



// pages
import { InferenceComponent } from './pages/inference/Inference';


//css
import './App.css';

function App() {
  return (
  
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* Global Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full text-left">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700">
            <Activity className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">JawSight</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="/inference" className="text-teal-600 border-b-2 border-teal-600 pb-1">Inference</a>
            <a href="#" className="hover:text-slate-800 transition-colors pb-1">History</a>
            <a href="#" className="hover:text-slate-800 transition-colors pb-1">About Us</a>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<InferenceComponent />} />
         <Route path="/inference" element={<InferenceComponent />} />
      </Routes>
     
      
    </div>

  
  );
}

export default App
