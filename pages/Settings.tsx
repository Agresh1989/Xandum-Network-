
import React, { useState, useEffect } from 'react';
import { pNodeService } from '../services/pNodeService';
import { ICONS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  // Initialize from service directly (which reads localStorage) to prevent empty flash
  const [endpoint, setEndpoint] = useState(pNodeService.getRpcEndpoint());
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [nodeVersion, setNodeVersion] = useState<string | null>(null);
  
  // Debugger State
  const [debugMethod, setDebugMethod] = useState('getEpochInfo');
  const [debugResult, setDebugResult] = useState<string>('');
  const [debugLoading, setDebugLoading] = useState(false);

  // Sync state if external changes happen (unlikely in single session, but good practice)
  useEffect(() => {
    setEndpoint(pNodeService.getRpcEndpoint());
  }, []);

  const handleSave = () => {
    pNodeService.setRpcEndpoint(endpoint);
    testConnection();
  };

  const testConnection = async () => {
    setStatus('testing');
    setStatusMsg('Connecting...');
    const result = await pNodeService.testConnection();
    if (result.success) {
        setStatus('success');
        setStatusMsg(result.message);
        setNodeVersion(result.version || 'Unknown');
    } else {
        setStatus('error');
        setStatusMsg(result.message);
        setNodeVersion(null);
    }
  };

  const handleDebugRun = async () => {
    setDebugLoading(true);
    setDebugResult('');
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: debugMethod,
                params: []
            }),
            signal: controller.signal
        });
        clearTimeout(id);
        const data = await response.json();
        setDebugResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
        if (e.name === 'AbortError') {
             setDebugResult(`Error: Request timed out. The endpoint '${endpoint}' may be unreachable or blocking cross-origin (CORS) requests.`);
        } else if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
             setDebugResult(`Error: Connection blocked by browser (CORS). Public RPC nodes typically block requests from web applications.\n\nWorkaround: Use a backend proxy or switch to Simulation Mode.`);
        } else {
             setDebugResult(`Error: ${e.message}`);
        }
    } finally {
        setDebugLoading(false);
    }
  };

  const handleReset = () => {
      // In a real app, this might reset a flag, but here we just clear the error state UI
      setStatus('idle');
      setStatusMsg('');
      navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings & Connection</h1>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">RPC Configuration</h2>
            <p className="text-slate-500 text-sm mb-4">
                Configure the pRPC endpoint used to fetch validator data. Your setting is saved automatically.
            </p>

            <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase">RPC Endpoint URL</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-4 py-2 focus:ring-1 focus:ring-xand-500 focus:border-xand-500 outline-none"
                        placeholder="https://rpc.xandeum.network"
                    />
                    <button 
                        onClick={handleSave}
                        className="bg-xand-600 hover:bg-xand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Save & Test
                    </button>
                </div>
            </div>

            {status !== 'idle' && (
                <div className={`p-4 rounded-lg border flex flex-col gap-2 ${
                    status === 'testing' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                    status === 'success' ? 'bg-green-50 border-green-200 text-green-600' :
                    'bg-red-50 border-red-200 text-red-600'
                }`}>
                    <div className="flex items-center gap-3">
                        {status === 'testing' && <i className="fas fa-circle-notch fa-spin"></i>}
                        {status === 'success' && <i className="fas fa-check-circle"></i>}
                        {status === 'error' && <i className="fas fa-exclamation-triangle"></i>}
                        <div>
                            <div className="font-medium text-sm">{statusMsg}</div>
                            {nodeVersion && <div className="text-xs opacity-75 mt-1">Node Version: {nodeVersion}</div>}
                        </div>
                    </div>

                    {status === 'error' && statusMsg.includes("CORS") && (
                        <div className="mt-2 pl-8">
                            <div className="text-xs text-slate-700 bg-white p-3 rounded border border-red-100">
                                <strong>Why is this happening?</strong><br/>
                                Browsers block requests to external servers that don't explicitly allow it (CORS). Public RPC nodes usually don't allow this for security.
                                <br/><br/>
                                <strong>Recommendation:</strong><br/>
                                Since you are viewing this in a browser without a backend proxy, please use <strong>Simulation Mode</strong> to fully explore the dashboard features.
                            </div>
                            <button 
                                onClick={handleReset}
                                className="mt-3 text-xs bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                            >
                                Continue in Simulation Mode
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">RPC Method Debugger</h2>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">DevTools</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button 
                    onClick={() => setDebugMethod('getClusterNodes')}
                    className={`px-3 py-2 rounded border text-sm text-left ${debugMethod === 'getClusterNodes' ? 'border-xand-500 bg-xand-50 text-xand-700' : 'border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                    getClusterNodes
                </button>
                <button 
                    onClick={() => setDebugMethod('getEpochInfo')}
                    className={`px-3 py-2 rounded border text-sm text-left ${debugMethod === 'getEpochInfo' ? 'border-xand-500 bg-xand-50 text-xand-700' : 'border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                    getEpochInfo
                </button>
                <button 
                    onClick={() => setDebugMethod('getVersion')}
                    className={`px-3 py-2 rounded border text-sm text-left ${debugMethod === 'getVersion' ? 'border-xand-500 bg-xand-50 text-xand-700' : 'border-slate-300 hover:bg-slate-50 text-slate-600'}`}
                >
                    getVersion
                </button>
            </div>

            <div className="mb-4">
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={debugMethod}
                        onChange={(e) => setDebugMethod(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-4 py-2 font-mono"
                        placeholder="Method Name"
                    />
                    <button 
                        onClick={handleDebugRun}
                        disabled={debugLoading}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {debugLoading ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 h-64 overflow-auto custom-scrollbar">
                {debugResult ? (
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{debugResult}</pre>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        Response output will appear here...
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
