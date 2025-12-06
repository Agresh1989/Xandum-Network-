
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-xand-100 to-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-50 to-emerald-50 rounded-full blur-3xl opacity-60 animate-pulse" style={{animationDuration: '10s', animationDelay: '1s'}}></div>
      </div>

      {/* Modern Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-9 h-9 bg-gradient-to-br from-xand-500 to-xand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-xand-500/20">
                    X
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Xandeum <span className="text-xand-600">Network</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-xand-600 transition-colors cursor-pointer">Features</a>
                <a href="#developers" onClick={(e) => scrollToSection(e, 'developers')} className="text-sm font-medium text-slate-600 hover:text-xand-600 transition-colors cursor-pointer">Developers</a>
                <a href="#ecosystem" onClick={(e) => scrollToSection(e, 'ecosystem')} className="text-sm font-medium text-slate-600 hover:text-xand-600 transition-colors cursor-pointer">Ecosystem</a>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                >
                    Launch App
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-xand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-xand-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mainnet Beta Live</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                    Scaling Storage on <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-xand-500 via-indigo-500 to-purple-600">
                        Solana
                    </span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                    Experience the next evolution of blockchain infrastructure. Monitor pNodes, analyze storage metrics, and visualize network consensus in real-time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-xand-600 hover:bg-xand-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-xand-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Explore Network {ICONS.Dashboard}
                    </button>
                    <button 
                        onClick={() => navigate('/simulation')}
                        className="px-8 py-4 bg-white border border-slate-200 hover:border-xand-200 text-slate-700 hover:text-xand-700 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        Run Simulation <span className="group-hover:rotate-12 transition-transform duration-300">{ICONS.Warning}</span>
                    </button>
                </div>

                <div className="pt-8 flex items-center gap-6 text-slate-400 text-sm font-medium">
                    <span>Trusted by leaders in</span>
                    <div className="flex gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="font-bold text-slate-600"><i className="fas fa-cube mr-1"></i> SOLANA</span>
                        <span className="font-bold text-slate-600"><i className="fas fa-layer-group mr-1"></i> ARWEAVE</span>
                        <span className="font-bold text-slate-600"><i className="fas fa-database mr-1"></i> FIELCOIN</span>
                    </div>
                </div>
            </div>

            {/* Hero Visual - Abstract Network */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center animate-fade-in lg:translate-x-12">
                {/* Simulated Network Graph */}
                <div className="relative w-full h-full max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-tr from-xand-50 to-indigo-50 rounded-full blur-2xl opacity-50"></div>
                    
                    {/* Central Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center z-20 border-4 border-slate-50">
                        <div className="w-16 h-16 bg-gradient-to-br from-xand-500 to-indigo-600 rounded-full animate-pulse flex items-center justify-center text-white text-3xl shadow-inner">
                            <i className="fas fa-network-wired"></i>
                        </div>
                    </div>

                    {/* Orbiting Nodes (CSS Animation) */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute top-1/2 left-1/2 w-2 h-2" style={{
                            animation: `spin ${10 + i * 5}s linear infinite`,
                        }}>
                             <div className="absolute top-0 -left-[120px] lg:-left-[180px]" style={{
                                 transform: `rotate(${i * 60}deg)`
                             }}>
                                <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col items-center justify-center p-2 transform hover:scale-110 transition-transform duration-300 z-10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
                                    <div className="h-1 w-6 bg-slate-200 rounded"></div>
                                </div>
                                {/* Connecting Line */}
                                <div className="absolute top-6 left-6 w-[120px] lg:w-[180px] h-[1px] bg-gradient-to-r from-slate-300 to-transparent origin-left rotate-180 -z-10 opacity-30"></div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Live Metrics Ticker */}
      <div className="bg-slate-900 py-4 overflow-hidden relative z-20 border-y border-slate-800">
          <div className="flex gap-12 whitespace-nowrap animate-marquee text-slate-300 text-sm font-mono tracking-wider">
              {/* Duplicated content for seamless loop */}
              {[...Array(10)].map((_, i) => (
                  <React.Fragment key={i}>
                      <span className="flex items-center gap-2"><span className="text-green-400">●</span> TPS: <strong>{4000 + Math.floor(Math.random() * 500)}</strong></span>
                      <span className="flex items-center gap-2"><span className="text-xand-400">#</span> EPOCH: <strong>421</strong></span>
                      <span className="flex items-center gap-2"><i className="fas fa-server text-blue-400"></i> NODES: <strong>124</strong></span>
                      <span className="flex items-center gap-2"><i className="fas fa-database text-purple-400"></i> STORAGE: <strong>12.4 PB</strong></span>
                  </React.Fragment>
              ))}
          </div>
      </div>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Intelligence at Scale</h2>
                  <p className="text-lg text-slate-600">The Xandeum dashboard aggregates millions of data points to provide actionable insights into network performance and decentralized storage reliability.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          {ICONS.Dashboard}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Real-time Telemetry</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Monitor block production, vote latency, and skip rates with millisecond precision. View global node distribution and health.
                      </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-2xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                          {ICONS.AI}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">AI-Powered Insights</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Integrated Gemini 3 Pro reasoning engine analyzes network anomalies and generates natural language health reports.
                      </p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 text-2xl mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                          {ICONS.Warning}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Resilience Simulation</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Stress-test the consensus mechanism. Simulate regional outages to understand the Nakamoto Coefficient impact instantly.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Builders</h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                      Interact with the network programmatically. Our pNode RPCs offer full Solana compatibility with extended storage primitives.
                  </p>
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                              <i className="fas fa-check"></i>
                          </div>
                          <span className="text-lg font-medium">Standard JSON-RPC 2.0</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                              <i className="fas fa-check"></i>
                          </div>
                          <span className="text-lg font-medium">WebSocket Subscriptions</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
                              <i className="fas fa-check"></i>
                          </div>
                          <span className="text-lg font-medium">Historical Storage Proofs</span>
                      </div>
                  </div>
                  <button className="mt-10 px-8 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                      Read Documentation
                  </button>
              </div>

              {/* Code Snippet Visual */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-6 font-mono text-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-slate-500">JSON-RPC</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-1">
                      <p className="text-purple-400">curl <span className="text-white">https://rpc.xandeum.network</span> \</p>
                      <p className="text-white pl-4">-X POST \</p>
                      <p className="text-white pl-4">-H <span className="text-green-400">"Content-Type: application/json"</span> \</p>
                      <p className="text-white pl-4">-d <span className="text-yellow-300">'</span></p>
                      <p className="text-yellow-300 pl-8">{"{"}</p>
                      <p className="text-yellow-300 pl-12">"jsonrpc": "2.0",</p>
                      <p className="text-yellow-300 pl-12">"id": 1,</p>
                      <p className="text-yellow-300 pl-12">"method": "getClusterNodes"</p>
                      <p className="text-yellow-300 pl-8">{"}"}</p>
                      <p className="text-yellow-300 pl-4">'</p>
                      <br/>
                      <p className="text-slate-500">// Response</p>
                      <p className="text-blue-300">{"{"}</p>
                      <p className="text-blue-300 pl-4">"result": <span className="text-white">[...]</span>,</p>
                      <p className="text-blue-300 pl-4">"id": 1</p>
                      <p className="text-blue-300">{"}"}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Ecosystem / Stats Callout */}
      <section id="ecosystem" className="py-20 bg-xand-600 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 text-center text-white relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">Global Network Ecosystem</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                      <div className="text-4xl md:text-5xl font-black mb-2">124</div>
                      <div className="text-xand-200 font-medium uppercase tracking-wide">Active pNodes</div>
                  </div>
                  <div>
                      <div className="text-4xl md:text-5xl font-black mb-2">12PB+</div>
                      <div className="text-xand-200 font-medium uppercase tracking-wide">Storage Capacity</div>
                  </div>
                  <div>
                      <div className="text-4xl md:text-5xl font-black mb-2">400ms</div>
                      <div className="text-xand-200 font-medium uppercase tracking-wide">Block Time</div>
                  </div>
                  <div>
                      <div className="text-4xl md:text-5xl font-black mb-2">$0.0001</div>
                      <div className="text-xand-200 font-medium uppercase tracking-wide">Avg Fee</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">X</div>
                          <span className="text-xl font-bold text-slate-900">Xandeum Network</span>
                      </div>
                      <p className="text-slate-500 max-w-sm">
                          The storage-enabled blockchain layer for the next generation of decentralized applications.
                      </p>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
                      <ul className="space-y-2 text-slate-500 text-sm">
                          <li><a href="#" className="hover:text-xand-600">Dashboard</a></li>
                          <li><a href="#" className="hover:text-xand-600">Validators</a></li>
                          <li><a href="#" className="hover:text-xand-600">Simulation</a></li>
                          <li><a href="#" className="hover:text-xand-600">AI Reports</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
                      <ul className="space-y-2 text-slate-500 text-sm">
                          <li><a href="#" className="hover:text-xand-600">Documentation</a></li>
                          <li><a href="#" className="hover:text-xand-600">GitHub</a></li>
                          <li><a href="#" className="hover:text-xand-600">Discord</a></li>
                          <li><a href="#" className="hover:text-xand-600">Status</a></li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                  <p>© {new Date().getFullYear()} Xandeum Network. All rights reserved.</p>
                  <div className="flex gap-6 mt-4 md:mt-0">
                      <a href="#" className="hover:text-slate-600"><i className="fab fa-twitter"></i></a>
                      <a href="#" className="hover:text-slate-600"><i className="fab fa-github"></i></a>
                      <a href="#" className="hover:text-slate-600"><i className="fab fa-discord"></i></a>
                  </div>
              </div>
          </div>
      </footer>
      
      {/* Styles for animations */}
      <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
