import React, { useState, useEffect } from 'react';
import { pNodeService } from '../services/pNodeService';
import { PNode, NetworkStats, ResilienceStats } from '../types';
import { ICONS } from '../constants';
import { VersionDistributionChart, RegionBarChart } from '../components/Charts';

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [riskAnalysis, setRiskAnalysis] = useState<ResilienceStats | null>(null);
  const [reportDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nodesData, statsData] = await Promise.all([
          pNodeService.getAllNodes(),
          pNodeService.getNetworkStats()
        ]);
        
        setNodes(nodesData);
        setStats(statsData);

        // Auto-generate AI Summary
        const summary = await pNodeService.generateNetworkReport(statsData, nodesData.slice(0, 5));
        setAiReport(summary);

        // Auto-calculate "Max Risk" (simulate largest region failure)
        const regions = nodesData.map(n => n.region);
        const regionCounts = regions.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {} as Record<string, number>);
        const largestRegion = Object.keys(regionCounts).reduce((a, b) => regionCounts[a] > regionCounts[b] ? a : b);
        
        const risk = await pNodeService.runResilienceSimulation(largestRegion, nodesData);
        setRiskAnalysis(risk);

        setLoading(false);
      } catch (e) {
        console.error("Report generation failed", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-4xl text-xand-500 mb-4"></i>
                <p className="text-slate-500">Generating report data...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center no-print">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
                <p className="text-slate-500">Generate and download comprehensive network status reports.</p>
            </div>
            <button 
                onClick={handlePrint}
                className="bg-xand-600 hover:bg-xand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
                <i className="fas fa-file-pdf"></i> Print / Save as PDF
            </button>
        </div>

        {/* REPORT CONTAINER (Print Target) */}
        <div className="bg-white p-8 lg:p-12 shadow-lg print:shadow-none print:p-0 rounded-xl border border-slate-200">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-lg">X</div>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">Xandeum Network</span>
                    </div>
                    <h2 className="text-xl font-medium text-slate-600 uppercase tracking-widest">Network Health Report</h2>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 uppercase font-semibold">Report Date</p>
                    <p className="text-lg font-bold text-slate-900">{reportDate}</p>
                </div>
            </div>

            {/* 1. Executive Summary */}
            <div className="mb-10">
                <h3 className="text-sm font-bold text-xand-600 uppercase tracking-wider mb-3 border-l-4 border-xand-500 pl-3">Executive Summary</h3>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-slate-800 leading-relaxed text-justify">
                    {aiReport || "Analysis unavailable."}
                </div>
            </div>

            {/* 2. Key Statistics Grid */}
            <div className="mb-10">
                <h3 className="text-sm font-bold text-xand-600 uppercase tracking-wider mb-4 border-l-4 border-xand-500 pl-3">Network Snapshot</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg text-center bg-white">
                        <div className="text-xs text-slate-500 uppercase mb-1">Active Validators</div>
                        <div className="text-3xl font-bold text-slate-900">{stats?.active_nodes}</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg text-center bg-white">
                        <div className="text-xs text-slate-500 uppercase mb-1">Nakamoto Coeff.</div>
                        <div className="text-3xl font-bold text-slate-900">{pNodeService.calculateNakamotoCoefficient(nodes)}</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg text-center bg-white">
                        <div className="text-xs text-slate-500 uppercase mb-1">Throughput (TPS)</div>
                        <div className="text-3xl font-bold text-slate-900">{stats?.tps.toLocaleString()}</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg text-center bg-white">
                        <div className="text-xs text-slate-500 uppercase mb-1">Avg Uptime</div>
                        <div className="text-3xl font-bold text-slate-900">{stats?.average_uptime.toFixed(2)}%</div>
                    </div>
                </div>
            </div>

            {/* 3. Risk Analysis */}
            <div className="mb-10 page-break-inside-avoid">
                <h3 className="text-sm font-bold text-xand-600 uppercase tracking-wider mb-4 border-l-4 border-xand-500 pl-3">Risk & Resilience Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-slate-200 rounded-lg p-6 bg-white">
                         <h4 className="font-bold text-slate-700 mb-4 text-center">Geographic Concentration Risk</h4>
                         <RegionBarChart nodes={nodes} />
                         <p className="text-xs text-center text-slate-400 mt-2">Distribution of validators across data centers.</p>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col justify-center">
                        <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Single Point of Failure Simulation</h4>
                        {riskAnalysis && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Simulated Outage:</span>
                                    <span className="font-mono font-bold bg-red-50 text-red-600 px-2 py-1 rounded text-xs">{riskAnalysis.region} (Largest)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Network Impact Score:</span>
                                    <span className="font-bold text-slate-900">{riskAnalysis.impactScore}/100</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Stake Offline:</span>
                                    <span className="font-bold text-slate-900">{(riskAnalysis.stakeAffected / 1000000).toFixed(1)}M XAND</span>
                                </div>
                                <div className={`mt-4 p-3 rounded text-center text-sm font-bold border ${riskAnalysis.impactScore > 33 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                    Status: {riskAnalysis.impactScore > 33 ? 'CRITICAL RISK' : 'RESILIENT'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             {/* 4. Version Diversity */}
             <div className="mb-8 page-break-inside-avoid">
                <h3 className="text-sm font-bold text-xand-600 uppercase tracking-wider mb-4 border-l-4 border-xand-500 pl-3">Software Diversity</h3>
                 <div className="border border-slate-200 rounded-lg p-6 bg-white">
                    <VersionDistributionChart nodes={nodes} />
                    <div className="text-center mt-4 text-sm text-slate-600">
                        Top Client Version: <strong>{nodes[0]?.version}</strong>
                    </div>
                 </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-6 mt-12 text-center text-xs text-slate-400">
                <p>Generated automatically by Xandeum Network Analytics Platform.</p>
                <p>This report assumes current slot height and active stake weights at time of generation.</p>
                <p className="mt-2 font-mono">{new Date().toISOString()}</p>
            </div>

        </div>
    </div>
  );
};