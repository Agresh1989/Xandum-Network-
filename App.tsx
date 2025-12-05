import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { NodeDetail } from './pages/NodeDetail';
import { Settings } from './pages/Settings';
import { Simulation } from './pages/Simulation';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        
        {/* Mobile Header - Visible only on small screens */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-xand-500 to-xand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                  X
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800">Xandeum</span>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(true)} 
             className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
           >
              <i className="fas fa-bars text-xl"></i>
           </button>
        </div>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content - Adjust margin for desktop sidebar */}
        <main className="lg:ml-64 p-4 lg:p-8 min-h-screen transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/validators" element={<Navigate to="/" replace />} />
              <Route path="/node/:id" element={<NodeDetail />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;