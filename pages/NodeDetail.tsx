
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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 px-1 no-print">
        <Link to="/dashboard" className="hover:text-xand-600 transition-colors">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs text-slate-300"></i>
        <span className="text-slate-800 font-medium truncate">Validator Details</span>
      </div>

      {/* Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="fas fa-server text-9xl text-slate-300 transform rotate-12"></i>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 border border-slate-300 shadow-inner shrink-0">
                    {node.name?.substring(0, 2).toUpperCase() || 'ID'}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 truncate tracking-tight">{node.name || 'Unknown Validator'}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 group cursor-pointer hover:bg-slate-200 transition-colors" title="Copy ID">
                            <i className="fas fa-fingerprint text-slate-400"></i>
                            <code className="text-xs text-slate-600 font-mono truncate max-w-[150px] sm:max-w-[240px]">
                                {node.id}
                            </code>
                            <i className="far fa-copy text-slate-400 text-xs group-hover:text-slate-600"></i>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                            ${node.status === NodeStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {node.status === NodeStatus.ACTIVE && <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>}
                            {node.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                <div className="text-center px-4">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Version</div>
                    <div className="text-lg font-bold text-slate-800">{node.version}</div>
                </div>
                <div className="w-px bg-slate-200 h-10 self-center hidden sm:block"></div>
                <div className="text-center px-4">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Latency</div>
                    <div className="text-lg font-bold text-slate-800">{node.latency_ms} <span className="text-xs text-slate-500 font-normal">ms</span></div>
                </div>
            </div>
        </div>
      </div>

      {/* Validator Health Report Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                   <i className="fas fa-heartbeat"></i>
               </div>
               <h3 className="text-xl font-bold text-slate-800">Health & Grading</h3>
           </div>
           <button 
             className="text-sm text-slate-600 hover:text-xand-600 font-medium flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-xand-200 transition-all shadow-sm w-full sm:w-auto justify-center print:hidden no-print" 
             onClick={() => window.print()}
           >
              <i className="fas fa-print"></i> Print Report
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           {/* Grade Column */}
           <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 relative h-full">
              <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase">Overall Grade</div>
              <div className={`text-7xl font-black mb-1 drop-shadow-sm ${
                  grade.grade.startsWith('A') ? 'text-green-500' : 
                  grade.grade.startsWith('B') ? 'text-blue-500' : 
                  grade.grade.startsWith('C') ? 'text-yellow-500' : 'text-red-500'
              }`}>
                  {grade.grade}
              </div>
              <div className="mt-2 text-center bg-white px-4 py-1 rounded-full border border-slate-200 shadow-sm">
                  <span className="text-slate-500 text-xs font-bold uppercase mr-2">Score</span>
                  <span className="text-xl font-bold text-slate-800">{grade.score}</span>
                  <span className="text-slate-400 text-xs"> / 100</span>
              </div>
           </div>
           
           {/* Metrics Chart */}
           <div className="flex items-center justify-center h-[240px]">
               <ReportRadarChart metrics={grade.metrics} />
           </div>

           {/* Detailed Information Column */}
           <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Metric Breakdown</h4>
              
              <div className="space-y-4">
                  <div className="group">
                     <div className="flex justify-between items-center mb-1.5">
                         <span className="text-slate-700 font-medium text-sm flex items-center gap-2">
                             <i className="fas fa-server text-xand-500 text-xs"></i> Uptime Reliability
                         </span>
                         <span className="text-slate-900 font-bold text-sm bg-slate-50 px-2 rounded">{grade.metrics.uptimeScore}/100</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-xand-500 rounded-full transition-all duration-1000" style={{ width: `${grade.metrics.uptimeScore}%` }}></div>
                     </div>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-center mb-1.5">
                         <span className="text-slate-700 font-medium text-sm flex items-center gap-2">
                             <i className="fas fa-bolt text-indigo-500 text-xs"></i> Vote Latency
                         </span>
                         <span className="text-slate-900 font-bold text-sm bg-slate-50 px-2 rounded">{grade.metrics.latencyScore}/100</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${grade.metrics.latencyScore}%` }}></div>
                     </div>
                  </div>

                  <div className="group">
                     <div className="flex justify-between items-center mb-1.5">
                         <span className="text-slate-700 font-medium text-sm flex items-center gap-2">
                             <i className="fas fa-cubes text-emerald-500 text-xs"></i> Block Consistency
                         </span>
                         <span className="text-slate-900 font-bold text-sm bg-slate-50 px-2 rounded">{grade.metrics.consistencyScore}/100</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${grade.metrics.consistencyScore}%` }}></div>
                     </div>
                  </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 leading-snug">
                  * Metrics are weighted averages calculated over the last 1000 slots from the current epoch.
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stats & History */}
          <div className="lg:col-span-2 space-y-6">
             {/* Uptime History Card */}
             <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                             <i className="fas fa-chart-area"></i>
                         </div>
                         <h3 className="text-lg font-bold text-slate-800">24-Hour Uptime</h3>
                    </div>
                    <button 
                        onClick={handleExportHistory}
                        disabled={history.length === 0}
                        className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 print:hidden no-print"
                    >
                        <i className="fas fa-download"></i> <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
                <UptimeChart data={history} />
             </div>

             {/* Technical Specifications Card - Refactored */}
             <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-cogs text-slate-400 text-sm"></i> Validator Specifications
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                            <i className="fas fa-network-wired"></i>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Network Address</span>
                            <div className="font-mono text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block mb-1">
                                {node.ip}
                            </div>
                            <div className="text-xs text-slate-400">Gossip Port: 8001</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
                            <i className="fas fa-code-branch"></i>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Software Version</span>
                            <div className="text-sm text-slate-900 font-bold">{node.software_version}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Protocol Feature Set v{node.version}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shrink-0">
                            <i className="fas fa-globe-americas"></i>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Data Center</span>
                            <div className="text-sm text-slate-900 font-bold flex items-center gap-1">
                                {ICONS.Globe} {node.region}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Timezone: UTC {new Date().getTimezoneOffset() / -60 > 0 ? '+' : ''}{new Date().getTimezoneOffset() / -60}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Since</span>
                            <div className="text-sm text-slate-900 font-bold">{new Date(node.joined_at).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Duration: {Math.floor((Date.now() - new Date(node.joined_at).getTime()) / (1000 * 60 * 60 * 24))} Days</div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Right Column: Score & Logs */}
          <div className="space-y-6">
             {/* Performance Score Card */}
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="fas fa-tachometer-alt text-slate-400 text-sm"></i> Reliability Score
                </h3>
                <div className="flex items-center justify-center py-4 relative mb-6">
                     <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                        <circle cx="80" cy="80" r="70" stroke="#0ea5e9" strokeWidth="10" fill="none" strokeDasharray={440} strokeDashoffset={440 - (440 * node.uptime_percentage) / 100} className="transition-all duration-1000 ease-out" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{Math.floor(node.uptime_percentage)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">POINTS</span>
                     </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Skip Rate</span>
                        <span className="text-slate-900 font-mono font-bold">{(100 - node.uptime_percentage).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Vote Distance</span>
                        <span className="text-slate-900 font-mono font-bold">1 Slot</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Credits Earned</span>
                        <span className="text-slate-900 font-mono font-bold">245,123</span>
                    </div>
                </div>
             </div>

             {/* Logs Card */}
             <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-lg border border-slate-800">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                         <i className="fas fa-terminal text-green-400"></i> Node Logs
                     </h3>
                     <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">Live</span>
                 </div>
                 <div className="font-mono text-xs space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar opacity-90">
                     <div className="flex gap-2">
                         <span className="text-slate-500">[10:00:21]</span> 
                         <span className="text-slate-300">Gossip active, peers: {node.gossip_peers}</span>
                     </div>
                     <div className="flex gap-2">
                         <span className="text-slate-500">[10:00:15]</span> 
                         <span className="text-slate-300">Voted on slot <span className="text-blue-400">{node.last_vote_slot}</span></span>
                     </div>
                     <div className="flex gap-2">
                         <span className="text-slate-500">[09:59:58]</span> 
                         <span className="text-slate-300">Snapshot loaded successfully</span>
                     </div>
                     <div className="flex gap-2">
                         <span className="text-slate-500">[09:59:45]</span> 
                         <span className="text-green-400 font-bold">Sync complete</span>
                     </div>
                     <div className="flex gap-2">
                         <span className="text-slate-500">[09:55:12]</span> 
                         <span className="text-slate-300">Connecting to cluster entrypoint...</span>
                     </div>
                     <div className="flex gap-2">
                         <span className="text-slate-500">[09:55:10]</span> 
                         <span className="text-yellow-400">WARN: High latency detected on port 8001</span>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
