
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pNodeService } from '../services/pNodeService';
import { PNode, HistoricalMetric, NodeStatus, ValidatorGrade } from '../types';
import { ICONS } from '../constants';
import { UptimeChart, ReportRadarChart } from '../components/Charts';

export const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [node, setNode] = useState<PNode | undefined>(undefined);
  const [history, setHistory] = useState<HistoricalMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nodeData, historyData] = await Promise.all([
          pNodeService.getNodeDetails(id),
          pNodeService.getHistoricalPerformance(id)
        ]);
        setNode(nodeData);
        setHistory(historyData);
      } catch (err) {
        console.error("Error fetching node detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportHistory = () => {
    if (!history.length || !node) return;

    const headers = ['Timestamp', 'Uptime Percentage'];
    const rows = history.map(h => [h.timestamp, h.value.toFixed(2)]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `validator_${node.id}_history.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-4xl text-xand-500 mb-4"></i>
                <p className="text-slate-500">Loading validator details...</p>
            </div>
        </div>
    );
  }

  if (!node) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Validator Not Found</h2>
            <Link to="/dashboard" className="text-xand-600 hover:underline">Return to Dashboard</Link>
        </div>
    );
  }

  const grade: ValidatorGrade = pNodeService.getValidatorGrade(node);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 sm:mb-4 px-1">
        <Link to="/dashboard" className="hover:text-xand-600 transition-colors">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs text-slate-300"></i>
        <span className="text-slate-800 font-medium truncate">Validator Details</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 border-2 border-slate-200 shrink-0">
                    {node.name?.substring(0, 2).toUpperCase() || 'ID'}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 truncate">{node.name || 'Unknown Validator'}</h1>
                    <div className="flex items-center gap-2">
                        <code className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 font-mono truncate max-w-[200px] sm:max-w-none">
                            {node.id}
                        </code>
                        <button className="text-slate-400 hover:text-slate-600 p-1" title="Copy ID">
                            <i className="far fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                <div className={`px-4 py-2 rounded-lg border flex flex-col items-center justify-center flex-1 sm:flex-none min-w-[100px]
                    ${node.status === NodeStatus.ACTIVE ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="text-xs uppercase text-slate-500 font-bold mb-1">Status</span>
                    <span className={`text-sm font-bold ${node.status === NodeStatus.ACTIVE ? 'text-green-600' : 'text-red-600'}`}>
                        {node.status}
                    </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center flex-1 sm:flex-none min-w-[100px] shadow-sm">
                    <span className="text-xs uppercase text-slate-400 font-bold mb-1">Version</span>
                    <span className="text-sm font-bold text-slate-800">{node.version}</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center flex-1 sm:flex-none min-w-[100px] shadow-sm">
                    <span className="text-xs uppercase text-slate-400 font-bold mb-1">Vote Latency</span>
                    <span className="text-sm font-bold text-slate-800">{node.latency_ms} ms</span>
                </div>
            </div>
        </div>
      </div>

      {/* Validator Health Report Section with Grade Calculation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
           <h3 className="text-lg font-bold text-slate-800">Validator Health Report</h3>
           <button 
             className="text-sm text-xand-600 hover:text-xand-700 font-medium flex items-center gap-2 px-3 py-1.5 bg-xand-50 rounded-lg hover:bg-xand-100 transition-colors w-full sm:w-auto justify-center" 
             onClick={() => window.print()}
           >
              <i className="fas fa-print"></i> Print Report
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
           {/* Grade Column */}
           <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 relative order-1">
              <div className={`text-6xl font-black mb-2 ${
                  grade.grade.startsWith('A') ? 'text-green-500' : 
                  grade.grade.startsWith('B') ? 'text-blue-500' : 
                  grade.grade.startsWith('C') ? 'text-yellow-500' : 'text-red-500'
              }`}>
                  {grade.grade}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Overall Grade</div>
              <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-slate-800">{grade.score}</span>
                  <span className="text-slate-400 text-sm"> / 100</span>
              </div>
           </div>
           
           {/* Metrics Chart */}
           <div className="flex items-center justify-center min-h-[200px] order-2">
               <ReportRadarChart metrics={grade.metrics} />
           </div>

           {/* Detailed Information Column -> Scoring Breakdown */}
           <div className="space-y-5 flex flex-col justify-center order-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Performance Breakdown</h4>
              
              <div>
                 <div className="flex justify-between items-end mb-1">
                     <span className="text-slate-700 font-medium text-sm">Uptime Reliability</span>
                     <span className="text-slate-900 font-bold text-sm">{grade.metrics.uptimeScore}/100</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-xand-500 rounded-full" style={{ width: `${grade.metrics.uptimeScore}%` }}></div>
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-end mb-1">
                     <span className="text-slate-700 font-medium text-sm">Vote Latency</span>
                     <span className="text-slate-900 font-bold text-sm">{grade.metrics.latencyScore}/100</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${grade.metrics.latencyScore}%` }}></div>
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-end mb-1">
                     <span className="text-slate-700 font-medium text-sm">Block Consistency</span>
                     <span className="text-slate-900 font-bold text-sm">{grade.metrics.consistencyScore}/100</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${grade.metrics.consistencyScore}%` }}></div>
                 </div>
              </div>

              <div className="pt-2">
                 <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                    Grade is calculated based on weighted average of the above metrics over the last 1000 slots.
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Uptime History (24h)</h3>
                    <button 
                        onClick={handleExportHistory}
                        disabled={history.length === 0}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>
                <UptimeChart data={history} />
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Technical Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Network Address (Gossip)</span>
                        <div className="font-mono text-slate-800 break-all">{node.ip}</div>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Software Implementation</span>
                        <div className="text-slate-800">{node.software_version}</div>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase block mb-1">Data Center Region</span>
                        <div className="text-slate-800 flex items-center gap-2">
                            {ICONS.Globe} {node.region}
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 uppercase block mb-1">First Seen</span>
                        <div className="text-slate-800">{new Date(node.joined_at).toLocaleDateString()}</div>
                    </div>
                </div>
             </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Score</h3>
                <div className="flex items-center justify-center py-6 relative">
                     <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                        <circle cx="64" cy="64" r="60" stroke="#0ea5e9" strokeWidth="8" fill="none" strokeDasharray={377} strokeDashoffset={377 - (377 * node.uptime_percentage) / 100} />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800">{Math.floor(node.uptime_percentage)}</span>
                        <span className="text-xs text-slate-500">SCORE</span>
                     </div>
                </div>
                <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Skip Rate</span>
                        <span className="text-slate-800 font-mono">{(100 - node.uptime_percentage).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Vote Distance</span>
                        <span className="text-slate-800 font-mono">1</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Credits Earned</span>
                        <span className="text-slate-800 font-mono">245,123</span>
                    </div>
                </div>
             </div>

             <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner">
                 <h3 className="text-sm font-bold text-slate-600 uppercase mb-2">Technical Logs (Simulated)</h3>
                 <div className="font-mono text-xs text-slate-500 space-y-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                     <p><span className="text-slate-400">[10:00:21]</span> Gossip active, peers: {node.gossip_peers}</p>
                     <p><span className="text-slate-400">[10:00:15]</span> Voted on slot {node.last_vote_slot}</p>
                     <p><span className="text-slate-400">[09:59:58]</span> Snapshot loaded</p>
                     <p><span className="text-slate-400">[09:59:45]</span> <span className="text-green-600">Sync complete</span></p>
                     <p><span className="text-slate-400">[09:55:12]</span> Connecting to cluster...</p>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
