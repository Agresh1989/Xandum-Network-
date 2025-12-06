
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-xand-500 to-xand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
               X
           </div>
           <span className="text-xl font-bold tracking-tight text-slate-800">Xandeum <span className="text-xand-600">Network</span></span>
        </div>
        <div>
           <a href="https://xandeum.network" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-xand-600 text-sm font-medium transition-colors">Documentation</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
         <div className="max-w-4xl space-y-8 animate-fade-in">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-xand-50 border border-xand-100 rounded-full text-xand-700 text-xs font-semibold tracking-wide uppercase">
                 <span className="w-2 h-2 bg-xand-500 rounded-full animate-pulse"></span>
                 Live Mainnet Beta Analytics
             </div>
             
             <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                 The Intelligent <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-xand-500 to-indigo-600">Blockchain Explorer</span>
             </h1>
             
             <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                 Monitor real-time pNode telemetry, analyze validator performance with AI-driven insights, and simulate network resilience scenarios.
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-xand-600 hover:bg-xand-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                 >
                    Launch Dashboard <i className="fas fa-arrow-right ml-2"></i>
                 </button>
                 <button 
                     onClick={() => navigate('/settings')}
                     className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                 >
                    Configure RPC
                 </button>
             </div>
         </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
                      {ICONS.Nodes}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Real-time Telemetry</h3>
                  <p className="text-slate-500">
                      Live tracking of active pNodes, TPS, block height, and epoch progress via WebSocket or RPC connections.
                  </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4">
                      {ICONS.AI}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">AI Intelligence</h3>
                  <p className="text-slate-500">
                      Powered by Gemini 3 Pro with deep reasoning capabilities to analyze network health and anomaly detection.
                  </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl mb-4">
                      {ICONS.Warning}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Resilience Sim</h3>
                  <p className="text-slate-500">
                      Stress-test the network topology. Simulate regional outages and calculate Nakamoto Coefficients in real-time.
                  </p>
              </div>
          </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-100 py-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Xandeum Network Analytics. Built for the Community.</p>
      </div>
    </div>
  );
};
