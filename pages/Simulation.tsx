
import React, { useState, useEffect } from 'react';
import { pNodeService } from '../services/pNodeService';
import { PNode, ResilienceStats } from '../types';
import { ICONS } from '../constants';
import { RegionBarChart } from '../components/Charts';

export const Simulation: React.FC = () => {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<ResilienceStats | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const fetchNodes = async () => {
      const data = await pNodeService.getAllNodes();
      setNodes(data);
      setLoading(false);
    };
    fetchNodes();
  }, []);

  const regions = Array.from(new Set(nodes.map(n => n.region))).filter(r => r !== 'Unknown');

  const runSimulation = async () => {
    if (!selectedRegion) return;
    setSimulating(true);
    setSimulationResult(null);
    try {
        const result = await pNodeService.runResilienceSimulation(selectedRegion, nodes);
        setSimulationResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Network Resilience Simulator</h1>
            <p className="text-slate-500 mt-1">Stress-test the network topology by simulating regional outages.</p>
        </div>
        <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase rounded border border-yellow-200">
            Experimental Tool
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Simulation Parameters</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Target Region Failure</label>
                    <select 
                        className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg p-2.5 focus:ring-xand-500 focus:border-xand-500 outline-none"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                        <option value="">Select a region to disable...</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <p className="mb-2"><i className="fas fa-info-circle text-xand-500 mr-1"></i> <strong>Scenario:</strong></p>
                    This simulation calculates the immediate impact on Total Stake and Node Count if the selected region goes completely offline due to a localized internet outage or regulatory action.
                </div>

                <button 
                    onClick={runSimulation}
                    disabled={!selectedRegion || simulating}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all shadow-md active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {simulating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-bolt"></i>}
                    {simulating ? 'Calculating Impact...' : 'Simulate Outage'}
                </button>
            </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Impact Analysis</h3>
            
            {!simulationResult && !simulating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 pb-12">
                    <i className="fas fa-globe-americas text-6xl mb-4 text-slate-200"></i>
                    <p>Select a region and run simulation to view impact analysis.</p>
                </div>
            )}

            {simulating && (
                 <div className="h-full flex flex-col items-center justify-center pb-12">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 animate-pulse">Running consensus simulation...</p>
                </div>
            )}

            {simulationResult && !simulating && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                            <div className="text-xs text-red-500 uppercase font-bold mb-1">Impact Score</div>
                            <div className="text-3xl font-black text-red-600">{simulationResult.impactScore}/100</div>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Nodes Offline</div>
                            <div className="text-3xl font-bold text-slate-800">{simulationResult.nodesAffected}</div>
                            <div className="text-xs text-slate-400">Validators Lost</div>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Stake Offline</div>
                            <div className="text-3xl font-bold text-slate-800">{(simulationResult.stakeAffected / 1000000).toFixed(1)}M</div>
                            <div className="text-xs text-slate-400">XAND Token Weight</div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-2">Network Health Post-Outage</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Remaining Active Stake</span>
                                    <span className="font-mono font-bold text-slate-800">{100 - simulationResult.impactScore}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${simulationResult.impactScore > 33 ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{ width: `${100 - simulationResult.impactScore}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 text-sm">
                                <div className={`flex-1 p-3 rounded border ${simulationResult.impactScore > 33 ? 'bg-red-100 border-red-200 text-red-800' : 'bg-green-100 border-green-200 text-green-800'}`}>
                                    <i className={`fas ${simulationResult.impactScore > 33 ? 'fa-times-circle' : 'fa-check-circle'} mr-2`}></i>
                                    <strong>Consensus Status:</strong> {simulationResult.impactScore > 33 ? 'HALTED (Supermajority Lost)' : 'OPERATIONAL'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Current Topology Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Current Network Topology Reference</h3>
          <RegionBarChart nodes={nodes} />
      </div>
    </div>
  );
};
