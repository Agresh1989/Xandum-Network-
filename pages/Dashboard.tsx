
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pNodeService } from '../services/pNodeService';
import { PNode, NetworkStats, NodeStatus } from '../types';
import { StatsCard } from '../components/StatsCard';
import { VersionDistributionChart, RegionBarChart } from '../components/Charts';
import { ICONS } from '../constants';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [nakamoto, setNakamoto] = useState(0);

  // Initial Fetch & Subscription Setup
  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      try {
        setLoading(true);
        // 1. Initial Data Load
        const [nodesData, statsData] = await Promise.all([
          pNodeService.getAllNodes(),
          pNodeService.getNetworkStats()
        ]);
        
        setNodes(nodesData);
        setStats(statsData);
        setIsLive(pNodeService.isUsingLive);
        setNakamoto(pNodeService.calculateNakamotoCoefficient(nodesData));
        setLoading(false);

        // 2. Subscribe to Real-time Updates
        unsubscribe = pNodeService.subscribeToUpdates((update) => {
           if (update.stats) {
               setStats(prev => ({...prev, ...update.stats}));
           }
           if (update.nodes) {
               setNodes(update.nodes);
               // Re-calc Nakamoto on node churn
               setNakamoto(pNodeService.calculateNakamotoCoefficient(update.nodes));
           }
        });

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      }
    };

    init();

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAiAnalysis = async () => {
    if (!stats) return;
    setAnalyzing(true);
    try {
        const report = await pNodeService.generateNetworkReport(stats, nodes.slice(0, 5));
        setAiAnalysis(report);
    } catch (e) {
        setAiAnalysis("Analysis failed.");
    } finally {
        setAnalyzing(false);
    }
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => 
      n.name?.toLowerCase().includes(filter.toLowerCase()) || 
      n.id.toLowerCase().includes(filter.toLowerCase()) ||
      n.ip.includes(filter)
    );
  }, [nodes, filter]);

  return (
    <div className="space-y-6">
      {/* Network Status Header */}
      <div 
        onClick={() => navigate('/settings')}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg p-4 border border-slate-200 cursor-pointer hover:border-xand-300 transition-colors group shadow-sm gap-3 sm:gap-0"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-sm font-medium text-slate-700">
                {isLive ? 'Connected to pNode RPC (Live)' : 'Simulation Mode (Mock Data)'}
            </span>
            {!isLive && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 w-fit">RPC Unreachable</span>}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono group-hover:text-slate-600">
               <span className={`inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse`}></span>
               Real-time
            </div>
            <i className="fas fa-chevron-right text-slate-400 text-xs"></i>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Active Nodes" 
          value={stats?.active_nodes || 0} 
          subValue={`Total: ${stats?.total_nodes || 0}`}
          icon={ICONS.Nodes}
          trend="up"
          trendValue="12"
          loading={loading}
        />
        <StatsCard 
          title="Nakamoto Coeff." 
          value={nakamoto} 
          subValue="Decentralization Score"
          icon={ICONS.Warning}
          trend={nakamoto > 15 ? 'up' : 'neutral'}
          trendValue={nakamoto > 15 ? 'Healthy' : 'Stable'}
          loading={loading}
        />
        <StatsCard 
          title="Avg Uptime" 
          value={`${stats?.average_uptime.toFixed(2)}%`} 
          subValue="Network Wide"
          icon={ICONS.Server}
          trend="neutral"
          trendValue="0.1%"
          loading={loading}
        />
        <StatsCard 
          title="TPS (Est)" 
          value={stats?.tps.toLocaleString() || 0} 
          subValue="Transactions Per Second"
          icon={ICONS.Dashboard}
          trend="up"
          trendValue="450"
          loading={loading}
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">AI Network Insight</h3>
              <button 
                onClick={handleAiAnalysis}
                disabled={analyzing}
                className="text-xs bg-xand-600 hover:bg-xand-700 text-white px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {analyzing ? <i className="fas fa-spinner fa-spin"></i> : ICONS.AI}
                {aiAnalysis ? 'Refresh' : 'Analyze'}
              </button>
           </div>
           <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex-1 flex items-center justify-center">
              {analyzing ? (
                  <div className="flex flex-col items-center gap-2">
                     <i className="fas fa-circle-notch fa-spin text-xand-500"></i>
                     <span className="text-slate-500 text-xs">Consulting Gemini...</span>
                  </div>
              ) : aiAnalysis ? (
                  <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis}</p>
              ) : (
                  <p className="text-slate-400 text-sm italic text-center">Click analyze to view an AI-powered summary of network health.</p>
              )}
           </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Client Versions</h3>
          <VersionDistributionChart nodes={nodes} />
        </div>
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Data Center Regions</h3>
          <RegionBarChart nodes={nodes} />
        </div>
      </div>

      {/* Node List Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
             <h3 className="text-lg font-bold text-slate-800">pNode Validators</h3>
             <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500 font-mono border border-slate-200">{nodes.length}</span>
          </div>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search by ID, Name, or IP..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-xand-500 focus:border-xand-500 outline-none placeholder-slate-400 transition-all shadow-sm"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                {ICONS.Search}
            </span>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Validator Identity</th>
                <th className="px-6 py-4 font-semibold">Version</th>
                <th className="px-6 py-4 font-semibold">Region</th>
                <th className="px-6 py-4 font-semibold">Stake Weight</th>
                <th className="px-6 py-4 font-semibold">Uptime</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <i className="fas fa-circle-notch fa-spin mr-2"></i> Loading pNode data...
                  </td>
                </tr>
              ) : filteredNodes.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No validators found matching query.
                    </td>
                </tr>
              ) : (
                filteredNodes.map((node) => (
                  <tr 
                    key={node.id} 
                    onClick={() => navigate(`/node/${node.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                            {node.name?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-xand-600 transition-colors">{node.name || 'Unknown Validator'}</div>
                          <div className="text-xs text-slate-400 font-mono truncate w-24">{node.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 font-mono">{node.version}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                             {ICONS.Globe} {node.region}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {node.stake_weight.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                            <div 
                                className={`h-full rounded-full ${node.uptime_percentage > 98 ? 'bg-green-500' : node.uptime_percentage > 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${node.uptime_percentage}%`}}
                            ></div>
                        </div>
                        <span className="text-xs text-slate-500">{node.uptime_percentage.toFixed(2)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                        ${node.status === NodeStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${node.status === NodeStatus.DELINQUENT ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${node.status === NodeStatus.SYNCING ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      `}>
                        {node.status === NodeStatus.ACTIVE && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
            {loading ? (
                <div className="p-8 text-center text-slate-500">
                    <i className="fas fa-circle-notch fa-spin text-xl mb-2"></i>
                    <p>Loading pNode data...</p>
                </div>
            ) : filteredNodes.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">
                     <p>No validators found.</p>
                 </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filteredNodes.map(node => (
                        <div key={node.id} onClick={() => navigate(`/node/${node.id}`)} className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                        {node.name?.substring(0, 2).toUpperCase() || 'NA'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{node.name || 'Unknown Validator'}</div>
                                        <div className="text-xs text-slate-400 font-mono truncate w-32">{node.id}</div>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    node.status === NodeStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 
                                    node.status === NodeStatus.DELINQUENT ? 'bg-red-50 text-red-700 border-red-200' : 
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {node.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Stake Weight</span>
                                    <span className="font-mono text-slate-700 font-medium">{node.stake_weight.toLocaleString()}</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Region</span>
                                    <span className="text-slate-700 font-medium flex items-center gap-1">
                                        {ICONS.Globe} {node.region}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-slate-400 text-[10px] uppercase font-bold">Uptime Performance</span>
                                        <span className="font-bold text-slate-700">{node.uptime_percentage.toFixed(2)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${node.uptime_percentage > 98 ? 'bg-green-500' : node.uptime_percentage > 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${node.uptime_percentage}%`}}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
