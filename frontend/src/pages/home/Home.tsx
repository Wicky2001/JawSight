import { 
  Activity, 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  ScanFace, 
  LineChart, 
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />

      <main className="pb-16">
        
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 z-10">
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Predictive Surgical <br className="hidden lg:block"/>
              Outcomes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Precision AI</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0">
              Empower your orthognathic planning. Upload patient profiles, map clinical landmarks, and generate highly accurate post-operative mandibular predictions in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/inference" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
                Start Inference 
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Hero Visual - Abstract UI Representation */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-blue-50 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-lg"></div>
            <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100/50">
              <div className="bg-slate-900 rounded-[2rem] overflow-hidden p-6 aspect-[4/3] flex flex-col justify-between relative">
                {/* Abstract scanning effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal-500/20 to-transparent animate-pulse rounded-t-[2rem]"></div>
                
                <div className="flex justify-between items-center text-slate-400 mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-5 h-5 text-teal-400" />
                    <span className="text-sm font-medium">Processing Frontal/Lateral</span>
                  </div>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded-md">86% Complete</span>
                </div>
                
                {/* Abstract face tracking dots */}
                <div className="flex-1 relative flex items-center justify-center z-10">
                   <div className="w-32 h-40 border border-slate-700 rounded-[3rem] relative">
                     <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                     <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>
                     <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-teal-500 rounded-b-full"></div>
                     {/* Scanning Line */}
                     <div className="absolute left-[-10%] right-[-10%] h-[1px] bg-teal-400/50 shadow-[0_0_8px_#2dd4bf] top-1/2 animate-[bounce_3s_infinite]"></div>
                   </div>
                </div>

                <div className="mt-4 bg-slate-800 rounded-xl p-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Landmarks Aligned</div>
                      <div className="text-xs text-slate-400">Generating prediction model...</div>
                    </div>
                  </div>
                  <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Clinical Excellence</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Our inference engine combines cutting-edge computer vision with medical-grade security.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: "Advanced Deep Learning",
                  desc: "Utilizes multi-angle spatial awareness to predict complex soft-tissue and skeletal changes accurately."
                },
                {
                  icon: ScanFace,
                  title: "Smart Landmark Detection",
                  desc: "Auto-detects crucial facial landmarks with an interactive editor for pinpoint manual adjustments."
                },
                {
                  icon: ShieldCheck,
                  title: "AWS Secure Storage",
                  desc: "We securely store your patients' images. Data at rest is encrypted. Only you can access your data. Since we use AWS, your data is secure and highly available."
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 text-teal-600">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Seamless Workflow</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              From upload to prediction in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
            
            {[
              { step: 1, icon: UploadCloud, title: "Upload Profiles", desc: "Securely upload standard 90° lateral and frontal patient photographs." },
              { step: 2, icon: Edit3, title: "Verify Landmarks", desc: "Our AI auto-places critical tracking points. You make the final micro-adjustments." },
              { step: 3, icon: LineChart, title: "Generate Prediction", desc: "Receive immediate visual inferences for mandibular positioning outcomes." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
                <div className="w-12 h-12 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400 absolute -top-6 shadow-sm">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 mt-2 text-slate-700 group-hover:text-teal-600 transition-colors">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-teal-500" />
            <span className="text-lg font-bold tracking-tight">JawSight</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <div className="text-sm opacity-60">
            © {new Date().getFullYear()} JawSight AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

// Temporary fallback for icons missing from top import in actual lucide-react versions
function Edit3(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
    </svg>
  );
}

function Loader2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}

export default Home;