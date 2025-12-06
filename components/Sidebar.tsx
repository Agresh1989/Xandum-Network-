
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: ICONS.Dashboard },
    { name: 'Leaderboard', path: '/leaderboard', icon: ICONS.Leaderboard },
    { name: 'Validators', path: '/validators', icon: ICONS.Nodes },
    { name: 'Simulation', path: '/simulation', icon: ICONS.Warning },
    { name: 'Reports', path: '/reports', icon: ICONS.Report },
    { name: 'Settings', path: '/settings', icon: ICONS.Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`sidebar-container fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 print:hidden`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-xand-500 to-xand-600 rounded-lg mr-3 flex items-center justify-center text-white font-bold shadow-sm">
                X
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">Xandeum <span className="text-xand-600">Network</span></span>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Return to Home Button */}
          <NavLink
              to="/"
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all text-slate-600 hover:bg-slate-50 hover:text-xand-600 mb-2 group"
            >
              <span className="w-6 mr-2 text-center group-hover:-translate-x-1 transition-transform duration-200">{ICONS.Home}</span>
              Return to Home
          </NavLink>

          <div className="h-px bg-slate-100 mx-4 mb-4"></div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-xand-50 text-xand-600 border border-xand-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <span className="w-6 mr-2 text-center">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Network Health</h4>
              <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Mainnet Beta</span>
              </div>
              <p className="text-xs text-slate-500">Epoch 421</p>
          </div>
        </div>
      </aside>
    </>
  );
};
