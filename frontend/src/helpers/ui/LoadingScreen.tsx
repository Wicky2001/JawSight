import { Activity, Loader2 } from "lucide-react";


const LoadingScreen = () =>{
    return(

 <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-sm w-full animate-in fade-in duration-700">
          
          {/* Animated Icon Container */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Outer expanding/fading ring */}
            <div className="absolute w-24 h-24 bg-teal-200 rounded-full animate-ping opacity-60"></div>
            
            {/* Middle pulsing ring */}
            <div className="absolute w-20 h-20 bg-teal-100 rounded-full animate-pulse"></div>
            
            {/* Inner solid circle with icon */}
            <div className="relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border border-teal-50 z-10">
              <Activity className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-2">
            JawSight
          </h2>
          
          <div className="flex items-center gap-2 text-slate-500 bg-white/60 px-4 py-2 rounded-full shadow-sm border border-slate-200/60 backdrop-blur-sm">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span className="text-sm font-medium">Loading session...</span>
          </div>
          
        </div>
      </div>

    );
}

export default LoadingScreen;