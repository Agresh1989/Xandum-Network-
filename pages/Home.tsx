
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false); // Close mobile menu on click
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      
      {/* Modern Navbar (Transparent to White on Scroll) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-700 py-3' : 'bg-transparent py-4 lg:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-xand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                    X
                </div>
                <span className={`text-lg lg:text-xl font-bold tracking-tight ${scrolled ? 'text-white' : 'text-white'}`}>Xandeum <span className="text-xand-400">Network</span></span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">Features</a>
                <a href="#developers" onClick={(e) => scrollToSection(e, 'developers')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">Developers</a>
                <a href="#ecosystem" onClick={(e) => scrollToSection(e, 'ecosystem')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">Ecosystem</a>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-cyan-500/20"
                >
                    Launch App
                </button>
            </div>

            {/* Mobile Hamburger */}
            <button 
                className="md:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-2xl animate-fade-in px-6 py-6 flex flex-col gap-4">
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-base font-medium text-slate-300 py-2 border-b border-slate-800">Features</a>
                <a href="#developers" onClick={(e) => scrollToSection(e, 'developers')} className="text-base font-medium text-slate-300 py-2 border-b border-slate-800">Developers</a>
                <a href="#ecosystem" onClick={(e) => scrollToSection(e, 'ecosystem')} className="text-base font-medium text-slate-300 py-2 border-b border-slate-800">Ecosystem</a>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full mt-2 px-5 py-3 bg-xand-600 text-white rounded-lg text-base font-bold shadow-md active:scale-95 transition-transform"
                >
                    Launch Dashboard
                </button>
            </div>
        )}
      </nav>

      {/* STRONG HERO SECTION with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden bg-slate-950">
        
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-60"
                poster="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg" // Fallback image
            >
                {/* Abstract Network/Plexus Video */}
                <source src="https://cdn.coverr.co/videos/coverr-digital-connections-background-5666/1080p.mp4" type="video/mp4" />
                <source src="https://cdn.pixabay.com/video/2023/10/22/186175-877660601_large.mp4" type="video/mp4" />
            </video>
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950"></div>
            {/* Mesh/Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(14,165,233,0.15)] mx-auto lg:mx-0 hover:bg-white/10 transition-colors cursor-default">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Mainnet Beta Live</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] drop-shadow-2xl">
                    Scaling Storage <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                        Beyond Limits
                    </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
                    The next evolution of blockchain infrastructure is here. Monitor pNodes, analyze storage metrics, and visualize network consensus with <span className="text-white font-semibold">Gemini AI</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="group relative px-8 py-4 bg-gradient-to-r from-xand-600 to-indigo-600 hover:from-xand-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative flex items-center justify-center gap-2">
                           Explore Network {ICONS.Dashboard}
                        </span>
                    </button>
                    <button 
                        onClick={() => navigate('/simulation')}
                        className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:border-white/30"
                    >
                        Run Simulation <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium">
                    <div className="flex flex-col items-center lg:items-start">
                        <span className="text-white text-2xl font-bold">12PB+</span>
                        <span className="uppercase tracking-wider text-xs">Storage</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center lg:items-start">
                        <span className="text-white text-2xl font-bold">120+</span>
                        <span className="uppercase tracking-wider text-xs">Nodes</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center lg:items-start">
                        <span className="text-white text-2xl font-bold">4k</span>
                        <span className="uppercase tracking-wider text-xs">TPS</span>
                    </div>
                </div>
            </div>

            {/* Right Content - 3D/Interactive Visual */}
            <div className="relative mt-12 lg:mt-0 perspective-1000 group">
                {/* Glowing Backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
                
                {/* 3D Card Container */}
                <div className="relative w-full max-w-md mx-auto transform transition-transform duration-700 hover:rotate-y-6 hover:rotate-x-6 rotate-y-3 rotate-x-3 preserve-3d">
                    {/* Main Glass Card */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative z-20 overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-xand-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <i className="fas fa-cube text-white"></i>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Block #24,192,501</div>
                                    <div className="text-cyan-400 text-xs font-mono animate-pulse">● Confirmed</div>
                                </div>
                            </div>
                            <div className="text-slate-400 text-xs font-mono">
                                40ms ago
                            </div>
                        </div>

                        {/* Visualizer Mock */}
                        <div className="h-48 bg-black/40 rounded-xl mb-6 relative overflow-hidden border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full flex gap-1 items-end justify-center h-full pb-4 px-4">
                                    {[...Array(20)].map((_,i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500 to-transparent opacity-60 rounded-t-sm" 
                                             style={{
                                                 height: `${20 + Math.random() * 80}%`,
                                                 animation: `equalizer 1s infinite ${i * 0.05}s alternate`
                                             }}>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Overlay Text */}
                            <div className="absolute top-2 left-3">
                                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-cyan-900/30 px-2 py-1 rounded">Consensus Active</span>
                            </div>
                        </div>

                        {/* Feature Teaser */}
                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between group-hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/animator')}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <i className="fas fa-magic"></i>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Veo Neural Animator</div>
                                    <div className="text-slate-400 text-xs">Generate videos from node data</div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-xand-500 transition-colors">
                                <i className="fas fa-arrow-right text-xs"></i>
                            </div>
                        </div>
                    </div>

                    {/* Background Layer Card (Depth) */}
                    <div className="absolute top-4 -right-4 w-full h-full bg-slate-800/40 backdrop-blur-md rounded-3xl -z-10 border border-white/5 transform translate-z-[-20px]"></div>
                </div>
            </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
            <i className="fas fa-chevron-down text-2xl"></i>
        </div>
      </section>

      {/* Live Metrics Ticker - High Contrast */}
      <div className="bg-xand-600 py-3 lg:py-4 overflow-hidden relative z-20 border-t border-b border-xand-500 shadow-lg">
          <div className="flex gap-12 lg:gap-24 whitespace-nowrap animate-marquee text-white text-xs lg:text-sm font-bold font-mono tracking-wider uppercase">
              {/* Duplicated content for seamless loop */}
              {[...Array(10)].map((_, i) => (
                  <React.Fragment key={i}>
                      <span className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-300"></i> TPS: <span className="text-white/80">{4000 + Math.floor(Math.random() * 500)}</span></span>
                      <span className="flex items-center gap-2"><i className="fas fa-cubes text-blue-200"></i> FINALIZED: <span className="text-white/80">#24,192,{500 + i}</span></span>
                      <span className="flex items-center gap-2"><i className="fas fa-globe text-green-300"></i> REGIONS: <span className="text-white/80">7 ACTIVE</span></span>
                      <span className="flex items-center gap-2"><i className="fas fa-hdd text-purple-200"></i> CAPACITY: <span className="text-white/80">12.4 PB</span></span>
                  </React.Fragment>
              ))}
          </div>
      </div>

      {/* Feature Section - Clean Light Mode resumes here */}
      <section id="features" className="py-24 bg-white px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-xand-600 font-bold tracking-wider uppercase text-sm mb-2 block">System Capabilities</span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Intelligence at Scale</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">The Xandeum dashboard aggregates millions of data points to provide actionable insights into network performance and decentralized storage reliability.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-xand-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-xand-600 text-3xl mb-8 shadow-md group-hover:scale-110 transition-transform">
                          {ICONS.Dashboard}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Real-time Telemetry</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Monitor block production, vote latency, and skip rates with millisecond precision. View global node distribution and health status in real-time.
                      </p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-purple-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 text-3xl mb-8 shadow-md group-hover:scale-110 transition-transform">
                          {ICONS.AI}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Insights</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Integrated Gemini reasoning engine analyzes network anomalies, generates natural language health reports, and predicts potential bottlenecks.
                      </p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-600 text-3xl mb-8 shadow-md group-hover:scale-110 transition-transform">
                          {ICONS.Warning}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Resilience Simulation</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Stress-test the consensus mechanism. Simulate regional outages to understand the Nakamoto Coefficient impact instantly and visualize fallback scenarios.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-xand-900/30 rounded-full blur-[128px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Built for Builders,<br/>Designed for Scale</h2>
                  <p className="text-slate-400 text-xl mb-10 leading-relaxed">
                      Interact with the network programmatically. Our pNode RPCs offer full Solana compatibility with extended storage primitives for dApps requiring massive data throughput.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                              <i className="fas fa-check"></i>
                          </div>
                          <span className="font-bold text-slate-200">Standard JSON-RPC 2.0</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                              <i className="fas fa-check"></i>
                          </div>
                          <span className="font-bold text-slate-200">WebSocket PubSub</span>
                      </div>
                  </div>

                  <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors w-full sm:w-auto shadow-lg">
                      Read Documentation
                  </button>
              </div>

              {/* Code Snippet Visual */}
              <div className="bg-[#0d1117] rounded-2xl border border-slate-800 shadow-2xl p-6 font-mono text-sm overflow-hidden relative group transform transition-transform hover:-rotate-1">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                      <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-slate-500">bash — 80x24</div>
                  </div>
                  <div className="space-y-2 whitespace-pre overflow-x-auto pb-4 custom-scrollbar">
                      <div className="flex">
                          <span className="text-green-400 mr-3">➜</span>
                          <span className="text-purple-400">curl</span> <span className="text-slate-300">https://rpc.xandeum.network</span> \
                      </div>
                      <div className="pl-6 text-slate-400">-X POST \</div>
                      <div className="pl-6 text-slate-400">-H <span className="text-green-300">"Content-Type: application/json"</span> \</div>
                      <div className="pl-6 text-slate-400">-d <span className="text-yellow-300">'</span></div>
                      <div className="text-yellow-300 pl-10">{"{"}</div>
                      <div className="text-yellow-300 pl-14">"jsonrpc": "2.0",</div>
                      <div className="text-yellow-300 pl-14">"id": 1,</div>
                      <div className="text-yellow-300 pl-14">"method": "getClusterNodes"</div>
                      <div className="text-yellow-300 pl-10">{"}"}</div>
                      <div className="text-yellow-300 pl-6">'</div>
                      <div className="mt-4 text-slate-500">// Response received (42ms)</div>
                      <div className="text-blue-300">{"{"}</div>
                      <div className="text-blue-300 pl-4">"jsonrpc": "2.0",</div>
                      <div className="text-blue-300 pl-4">"result": <span className="text-slate-400">[...]</span>,</div>
                      <div className="text-blue-300 pl-4">"id": 1</div>
                      <div className="text-blue-300">{"}"}</div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="absolute bottom-6 right-6 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded border border-green-500/30">
                      200 OK
                  </div>
              </div>
          </div>
      </section>

      {/* Ecosystem / Stats Callout */}
      <section id="ecosystem" className="py-24 bg-gradient-to-br from-xand-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 text-center text-white relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-16">Global Ecosystem Impact</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="text-4xl md:text-6xl font-black mb-2 tracking-tight">124</div>
                      <div className="text-xand-200 font-bold uppercase tracking-wider text-xs md:text-sm">Active pNodes</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="text-4xl md:text-6xl font-black mb-2 tracking-tight">12PB</div>
                      <div className="text-xand-200 font-bold uppercase tracking-wider text-xs md:text-sm">Storage Capacity</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="text-4xl md:text-6xl font-black mb-2 tracking-tight">400ms</div>
                      <div className="text-xand-200 font-bold uppercase tracking-wider text-xs md:text-sm">Block Time</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="text-4xl md:text-6xl font-black mb-2 tracking-tight">Zero</div>
                      <div className="text-xand-200 font-bold uppercase tracking-wider text-xs md:text-sm">Downtime (YTD)</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
                  <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
                      <div className="flex items-center gap-2 mb-6">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">X</div>
                          <span className="text-2xl font-bold text-slate-900">Xandeum Network</span>
                      </div>
                      <p className="text-slate-500 max-w-sm text-lg leading-relaxed">
                          The storage-enabled blockchain layer for the next generation of decentralized applications.
                      </p>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Platform</h4>
                      <ul className="space-y-4 text-slate-500 font-medium">
                          <li><a href="#" onClick={() => navigate('/dashboard')} className="hover:text-xand-600 transition-colors">Analytics Dashboard</a></li>
                          <li><a href="#" onClick={() => navigate('/leaderboard')} className="hover:text-xand-600 transition-colors">Validator Leaderboard</a></li>
                          <li><a href="#" onClick={() => navigate('/simulation')} className="hover:text-xand-600 transition-colors">Resilience Sim</a></li>
                          <li><a href="#" onClick={() => navigate('/reports')} className="hover:text-xand-600 transition-colors">AI Reports</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Community</h4>
                      <ul className="space-y-4 text-slate-500 font-medium">
                          <li><a href="#" className="hover:text-xand-600 transition-colors">Documentation</a></li>
                          <li><a href="#" className="hover:text-xand-600 transition-colors">GitHub</a></li>
                          <li><a href="#" className="hover:text-xand-600 transition-colors">Discord</a></li>
                          <li><a href="#" className="hover:text-xand-600 transition-colors">Status Page</a></li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                  <p>© {new Date().getFullYear()} Xandeum Network. All rights reserved.</p>
                  <div className="flex gap-8 mt-6 md:mt-0 text-xl">
                      <a href="#" className="hover:text-slate-800 transition-colors"><i className="fab fa-twitter"></i></a>
                      <a href="#" className="hover:text-slate-800 transition-colors"><i className="fab fa-github"></i></a>
                      <a href="#" className="hover:text-slate-800 transition-colors"><i className="fab fa-discord"></i></a>
                  </div>
              </div>
          </div>
      </footer>
      
      {/* Styles for animations */}
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
        .animate-fade-in-up {
            animation: fadeInUp 1s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradientX 5s ease infinite;
        }
        @keyframes gradientX {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes equalizer {
            0% { height: 10%; }
            100% { height: 90%; }
        }
        .perspective-1000 {
            perspective: 1000px;
        }
        .preserve-3d {
            transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};
