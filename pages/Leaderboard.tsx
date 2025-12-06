
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pNodeService } from '../services/pNodeService';
import { PNode, ValidatorGrade } from '../types';
import { ICONS } from '../constants';

interface ScoredNode extends PNode {
  gradeInfo: ValidatorGrade;
}

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<ScoredNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'score' | 'uptime_percentage' | 'stake_weight' | 'latency_ms'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await pNodeService.getAllNodes();
        // Enrich nodes with grade data immediately
        const scored = data.map(node => ({
            ...node,
            gradeInfo: pNodeService.getValidatorGrade(node)
        }));
        setNodes(scored);
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortField(field);
        setSortDirection(field === 'latency_ms' ? 'asc' : 'desc'); // Latency default to asc (lower is better)
    }
  };

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
        let valA, valB;
        if (sortField === 'score') {
            valA = a.gradeInfo.score;
            valB = b.gradeInfo.score;
        } else {
            valA = a[sortField];
            valB = b[sortField];
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [nodes, sortField, sortDirection]);

  // Top 3 for Podium
  const top3 = useMemo(() => {
    // Always calculate top 3 by Score for the podium, regardless of table sort
    return [...nodes].sort((a, b) => b.gradeInfo.score - a.gradeInfo.score).slice(0, 3);
  }, [nodes]);

  if (loading) {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-4xl text-xand-500 mb-4"></i>
                <p className="text-slate-500">Calculating Rankings...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Validator Leaderboard</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Recognizing top performing nodes across the Xandeum Network.</p>
        </div>

        {/* Podium Section */}
        {top3.length === 3 && (
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 items-end mb-12 px-2 sm:px-4 md:px-12 relative">
                {/* 1st Place (Mobile: First) */}
                <div className="order-1 md:order-2 flex flex-col items-center z-10 w-full mb-6 md:mb-0">
                    <div className="relative mb-4 group cursor-pointer" onClick={() => navigate(`/node/${top3[0].id}`)}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 text-3xl animate-bounce">
                             <i className="fas fa-crown"></i>
                         </div>
                        <div className="w-28 h-28 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center text-3xl font-bold text-yellow-600 overflow-hidden shadow-xl shadow-yellow-200 group-hover:scale-105 transition-transform">
                            {top3[0].name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            #1
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg text-slate-900 truncate max-w-[180px]">{top3[0].name}</div>
                        <div className="text-xand-600 font-bold">{top3[0].gradeInfo.score} Points</div>
                        <div className="text-xs text-slate-400 mt-1">{top3[0].uptime_percentage.toFixed(2)}% Uptime</div>
                    </div>
                    {/* Desktop only pedestal */}
                    <div className="hidden md:block h-32 w-full bg-gradient-to-t from-xand-50 to-white mt-4 rounded-t-lg border-x border-t border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>
                </div>

                {/* 2nd Place */}
                <div className="order-2 md:order-1 flex flex-col items-center w-full">
                    <div className="relative mb-4 group cursor-pointer" onClick={() => navigate(`/node/${top3[1].id}`)}>
                        <div className="w-20 h-20 rounded-full border-4 border-slate-300 bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                            {top3[1].name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            #2
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-800 truncate max-w-[150px]">{top3[1].name}</div>
                        <div className="text-sm text-slate-500 font-mono text-xs">{top3[1].gradeInfo.score} pts</div>
                    </div>
                    <div className="hidden md:block h-24 w-full bg-slate-100 mt-4 rounded-t-lg border-x border-t border-slate-200"></div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 flex flex-col items-center w-full">
                    <div className="relative mb-4 group cursor-pointer" onClick={() => navigate(`/node/${top3[2].id}`)}>
                        <div className="w-20 h-20 rounded-full border-4 border-orange-300 bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-700 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                            {top3[2].name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            #3
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-800 truncate max-w-[150px]">{top3[2].name}</div>
                        <div className="text-sm text-slate-500 font-mono text-xs">{top3[2].gradeInfo.score} pts</div>
                    </div>
                    <div className="hidden md:block h-16 w-full bg-slate-50 mt-4 rounded-t-lg border-x border-t border-slate-200"></div>
                </div>
            </div>
        )}

        {/* Quick Lists Row - Optimized for Tablet/Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <i className="fas fa-bolt text-xand-500"></i> Best Latency
                </h3>
                <ul className="space-y-2">
                    {[...nodes].sort((a,b) => a.latency_ms - b.latency_ms).slice(0,3).map((n, i) => (
                        <li key={n.id} onClick={() => navigate(`/node/${n.id}`)} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                             <span className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 text-xs w-4">0{i+1}</span>
                                <span className="text-slate-700 font-medium group-hover:text-xand-600">{n.name}</span>
                             </span>
                             <span className="font-mono text-xs font-bold text-slate-900">{n.latency_ms}ms</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <i className="fas fa-server text-green-500"></i> Most Reliable (Uptime)
                </h3>
                <ul className="space-y-2">
                    {[...nodes].sort((a,b) => b.uptime_percentage - a.uptime_percentage).slice(0,3).map((n, i) => (
                        <li key={n.id} onClick={() => navigate(`/node/${n.id}`)} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                             <span className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 text-xs w-4">0{i+1}</span>
                                <span className="text-slate-700 font-medium group-hover:text-xand-600">{n.name}</span>
                             </span>
                             <span className="font-mono text-xs font-bold text-green-600">{n.uptime_percentage.toFixed(2)}%</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <i className="fas fa-coins text-yellow-500"></i> Top Stake Holders
                </h3>
                <ul className="space-y-2">
                    {[...nodes].sort((a,b) => b.stake_weight - a.stake_weight).slice(0,3).map((n, i) => (
                        <li key={n.id} onClick={() => navigate(`/node/${n.id}`)} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                             <span className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 text-xs w-4">0{i+1}</span>
                                <span className="text-slate-700 font-medium group-hover:text-xand-600">{n.name}</span>
                             </span>
                             <span className="font-mono text-xs font-bold text-slate-900">{(n.stake_weight / 1000).toFixed(0)}k</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Full Ranking Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <h2 className="text-lg font-bold text-slate-800">Global Rankings</h2>
                 <span className="text-xs text-slate-500 italic">Showing top 100 nodes</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <th className="px-4 sm:px-6 py-4 font-semibold w-16">Rank</th>
                            <th className="px-4 sm:px-6 py-4 font-semibold">Validator</th>
                            <th className="px-4 sm:px-6 py-4 font-semibold hidden md:table-cell">IP Address</th>
                            <th 
                                className="px-4 sm:px-6 py-4 font-semibold cursor-pointer hover:text-xand-600 transition-colors"
                                onClick={() => handleSort('score')}
                            >
                                <div className="flex items-center gap-1">
                                    Overall Score
                                    {sortField === 'score' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </div>
                            </th>
                            <th 
                                className="px-4 sm:px-6 py-4 font-semibold cursor-pointer hover:text-xand-600 transition-colors"
                                onClick={() => handleSort('uptime_percentage')}
                            >
                                <div className="flex items-center gap-1">
                                    Uptime
                                    {sortField === 'uptime_percentage' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </div>
                            </th>
                            <th 
                                className="px-4 sm:px-6 py-4 font-semibold cursor-pointer hover:text-xand-600 transition-colors"
                                onClick={() => handleSort('stake_weight')}
                            >
                                <div className="flex items-center gap-1">
                                    Stake Weight
                                    {sortField === 'stake_weight' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </div>
                            </th>
                            <th 
                                className="px-4 sm:px-6 py-4 font-semibold cursor-pointer hover:text-xand-600 transition-colors text-right"
                                onClick={() => handleSort('latency_ms')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Latency
                                    {sortField === 'latency_ms' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedNodes.slice(0, 100).map((node, index) => (
                            <tr key={node.id} onClick={() => navigate(`/node/${node.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="px-4 sm:px-6 py-4 font-mono text-slate-400 text-sm">#{index + 1}</td>
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                            {node.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm group-hover:text-xand-600 transition-colors">{node.name}</div>
                                            <div className="text-xs text-slate-400 font-mono hidden md:block">{node.region}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                     <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                        {node.ip}
                                     </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${
                                            node.gradeInfo.score >= 90 ? 'text-green-600' : 
                                            node.gradeInfo.score >= 80 ? 'text-blue-600' : 'text-slate-600'
                                        }`}>
                                            {node.gradeInfo.score}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                             node.gradeInfo.grade.startsWith('A') ? 'bg-green-50 text-green-600 border-green-200' :
                                             node.gradeInfo.grade.startsWith('B') ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                             'bg-yellow-50 text-yellow-600 border-yellow-200'
                                        }`}>
                                            {node.gradeInfo.grade}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                                        <div className="h-full bg-green-500" style={{width: `${node.uptime_percentage}%`}}></div>
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">{node.uptime_percentage.toFixed(2)}%</span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 font-mono text-sm text-slate-600">
                                    {node.stake_weight.toLocaleString()}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-right font-mono text-sm text-slate-600">
                                    {node.latency_ms}ms
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
