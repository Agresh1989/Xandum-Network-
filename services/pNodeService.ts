
import { PNode, NodeStatus, NetworkStats, HistoricalMetric, JsonRpcResponse, RpcClusterNode, RpcEpochInfo, RealtimeUpdate, ValidatorGrade, ResilienceStats } from '../types';
import { GoogleGenAI } from "@google/genai";

/**
 * Xandeum pNode RPC (pRPC) Service Adapter
 * 
 * Configured to attempt real RPC calls first, then fall back to mock data
 * if the endpoint is unreachable (common in demo environments).
 * 
 * Now includes WebSocket/Simulation support for Real-Time updates.
 */

let RPC_ENDPOINT = localStorage.getItem('xandeum_rpc_endpoint') || process.env.REACT_APP_RPC_ENDPOINT || 'https://rpc.xandeum.network';
const DEFAULT_TIMEOUT = 5000;

// --- MOCK DATA GENERATION HELPERS ---
const REGIONS = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'Asia-Pacific', 'SA-East', 'Oceania'];
const VERSIONS = ['v1.4.12', 'v1.5.0-beta', 'v1.4.11', 'v1.5.1-rc'];

const generateMockNodes = (count: number): PNode[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isDelinquent = Math.random() < 0.05;
    const isSyncing = Math.random() < 0.05 && !isDelinquent;
    
    let status = NodeStatus.ACTIVE;
    if (isDelinquent) status = NodeStatus.DELINQUENT;
    else if (isSyncing) status = NodeStatus.SYNCING;

    return {
      id: `xand${Math.random().toString(36).substring(2, 10).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: `Validator-${i + 100}`,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      version: VERSIONS[Math.floor(Math.random() * VERSIONS.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      country: 'N/A',
      status: status,
      uptime_percentage: isDelinquent ? Math.random() * 60 : 95 + (Math.random() * 5),
      latency_ms: Math.floor(Math.random() * 150) + 10,
      stake_weight: Math.floor(Math.random() * 1000000),
      last_vote_slot: 12345678 + i,
      gossip_peers: Math.floor(Math.random() * 50) + 10,
      software_version: 'Xandeum-Go 1.2.0',
      joined_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    };
  });
};

// Singleton Mock Data to allow "Live" updates to persist
let MOCK_NODES = generateMockNodes(124);
let MOCK_STATS: NetworkStats = {
  total_nodes: 124,
  active_nodes: 118,
  delinquent_nodes: 6,
  average_uptime: 99.1,
  current_epoch: 421,
  total_stake: 50000000,
  last_updated: new Date().toISOString(),
  tps: 4200
};

// --- RPC CLIENT IMPLEMENTATION ---

async function fetchRpc<T>(method: string, params: any[] = []): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    try {
        new URL(RPC_ENDPOINT);
    } catch (e) {
        throw new Error("Invalid RPC URL Configured");
    }

    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`RPC Error: ${response.statusText}`);
    }

    const data: JsonRpcResponse<T> = await response.json();
    
    if (data.error) {
      throw new Error(`RPC API Error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// --- REALTIME & SUBSCRIPTION SYSTEM ---

type DataListener = (data: RealtimeUpdate) => void;
let listeners: DataListener[] = [];
// Fixed: Cannot find namespace 'NodeJS'. Using ReturnType<typeof setInterval> is safer for cross-environment compatibility (Browser vs Node).
let updateInterval: ReturnType<typeof setInterval> | null = null;
let ws: WebSocket | null = null;

// Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pNodeService = {
  isUsingLive: false,

  // --- Configuration ---
  setRpcEndpoint: (url: string) => {
    RPC_ENDPOINT = url;
    localStorage.setItem('xandeum_rpc_endpoint', url);
    // Reconnect logic would go here in a full app
  },

  getRpcEndpoint: () => RPC_ENDPOINT,

  testConnection: async (): Promise<{ success: boolean; message: string; version?: string }> => {
    try {
        const result = await fetchRpc<any>('getVersion');
        return { 
            success: true, 
            message: "Successfully connected to pNode RPC",
            version: result ? (result['solana-core'] || result.version) : 'Unknown'
        };
    } catch (e: any) {
        return { success: false, message: e.message || "Connection failed" };
    }
  },

  // --- Core Data Fetching ---

  getAllNodes: async (): Promise<PNode[]> => {
    try {
      const clusterNodes = await fetchRpc<RpcClusterNode[]>('getClusterNodes');
      pNodeService.isUsingLive = true;

      return clusterNodes.map((node, index) => ({
        id: node.pubkey,
        name: `Node-${node.pubkey.substring(0, 4)}`,
        ip: node.gossip || 'Unknown',
        version: node.version || 'Unknown',
        region: 'Unknown', 
        country: 'Unknown',
        status: NodeStatus.ACTIVE, 
        uptime_percentage: 100,
        latency_ms: Math.floor(Math.random() * 50),
        stake_weight: 0,
        last_vote_slot: 0,
        gossip_peers: 0,
        software_version: node.version || 'Unknown',
        joined_at: new Date().toISOString()
      }));

    } catch (error) {
      // console.warn("RPC connection failed, falling back to simulation.", error);
      pNodeService.isUsingLive = false;
      await delay(400); 
      return MOCK_NODES;
    }
  },

  getNodeDetails: async (id: string): Promise<PNode | undefined> => {
    const allNodes = await pNodeService.getAllNodes();
    return allNodes.find(n => n.id === id);
  },

  getNetworkStats: async (): Promise<NetworkStats> => {
    try {
      const epochInfo = await fetchRpc<RpcEpochInfo>('getEpochInfo');
      const nodes = await pNodeService.getAllNodes();
      
      return {
        total_nodes: nodes.length,
        active_nodes: nodes.length,
        delinquent_nodes: 0,
        average_uptime: 99.9,
        current_epoch: epochInfo.epoch,
        total_stake: 0,
        last_updated: new Date().toISOString(),
        tps: epochInfo.transactionCount ? Math.floor(epochInfo.transactionCount / 1000) : 1500
      };

    } catch (error) {
      pNodeService.isUsingLive = false;
      await delay(400);
      return MOCK_STATS;
    }
  },

  getHistoricalPerformance: async (id: string): Promise<HistoricalMetric[]> => {
    await delay(500);
    const metrics: HistoricalMetric[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
        metrics.push({
            timestamp: new Date(now - i * 3600000).toISOString(),
            value: 90 + Math.random() * 10
        })
    }
    return metrics;
  },

  // --- Real-Time Update System ---

  /**
   * Subscribes to network updates.
   * If live RPC is available, it attempts WebSocket.
   * Otherwise, it starts a simulation loop to push "live" feeling data.
   */
  subscribeToUpdates: (listener: DataListener) => {
    listeners.push(listener);
    
    // Start the engine if not running
    if (!updateInterval && !ws) {
        pNodeService.startRealtimeEngine();
    }

    // Return unsubscribe function
    return () => {
        listeners = listeners.filter(l => l !== listener);
        if (listeners.length === 0) {
            pNodeService.stopRealtimeEngine();
        }
    };
  },

  startRealtimeEngine: async () => {
    // 1. Attempt Real WebSocket
    if (pNodeService.isUsingLive && RPC_ENDPOINT.startsWith('http')) {
        const wsUrl = RPC_ENDPOINT.replace('http', 'ws');
        try {
            ws = new WebSocket(wsUrl);
            ws.onopen = () => {
                console.log('WS Connected');
                ws?.send(JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "slotSubscribe" }));
            };
            ws.onmessage = (event) => {
                // Parse real message, for now we just log it as standard RPCs vary slightly
                // console.log('WS Message', event.data);
                // In a real impl, we'd map this to a RealtimeUpdate
            };
            ws.onerror = () => {
                console.warn('WS Error, switching to simulation');
                ws = null;
                pNodeService.startSimulationLoop();
            };
        } catch (e) {
            pNodeService.startSimulationLoop();
        }
    } else {
        pNodeService.startSimulationLoop();
    }
  },

  startSimulationLoop: () => {
    if (updateInterval) clearInterval(updateInterval);
    
    // Simulate data changes every 2 seconds
    updateInterval = setInterval(() => {
        // 1. Update Stats
        const newTps = Math.max(1000, MOCK_STATS.tps + Math.floor((Math.random() - 0.5) * 500));
        MOCK_STATS = {
            ...MOCK_STATS,
            tps: newTps,
            last_updated: new Date().toISOString(),
            // Simulate slow epoch progression
            current_epoch: Math.random() > 0.95 ? MOCK_STATS.current_epoch + 1 : MOCK_STATS.current_epoch
        };

        // 2. Update Random Nodes (Latency/Uptime jitter)
        MOCK_NODES = MOCK_NODES.map(node => {
            if (Math.random() > 0.8) {
                return {
                    ...node,
                    latency_ms: Math.max(5, node.latency_ms + Math.floor((Math.random() - 0.5) * 20)),
                    uptime_percentage: Math.min(100, Math.max(0, node.uptime_percentage + (Math.random() - 0.5) * 0.1))
                };
            }
            return node;
        });

        // 3. Notify Listeners
        const update: RealtimeUpdate = {
            type: 'full',
            stats: MOCK_STATS,
            nodes: MOCK_NODES // In a real app we might only send diffs
        };

        listeners.forEach(l => l(update));

    }, 2000); // 2-second heartbeat
  },

  stopRealtimeEngine: () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
  },

  // --- Analytics & Tools ---

  calculateNakamotoCoefficient: (nodes: PNode[]): number => {
    if (!nodes || nodes.length === 0) return 0;
    const sortedNodes = [...nodes].sort((a, b) => b.stake_weight - a.stake_weight);
    const totalStake = sortedNodes.reduce((acc, node) => acc + node.stake_weight, 0);
    if (totalStake === 0) return 0;
    let cumulativeStake = 0;
    const threshold = totalStake / 3;
    for (let i = 0; i < sortedNodes.length; i++) {
        cumulativeStake += sortedNodes[i].stake_weight;
        if (cumulativeStake > threshold) {
            return i + 1;
        }
    }
    return sortedNodes.length;
  },
  
  generateNetworkReport: async (stats: NetworkStats, topNodes: PNode[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key missing. Cannot generate AI report.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash';
        
        const prompt = `
        Analyze the following blockchain network statistics for the Xandeum network pNodes.
        Provide a concise, professional executive summary (max 3 sentences) suitable for a dashboard.
        Focus on network health, decentralization implication based on node count/distribution, and performance.
        
        Stats:
        - Total Nodes: ${stats.total_nodes}
        - Active: ${stats.active_nodes}
        - Delinquent: ${stats.delinquent_nodes}
        - Avg Uptime: ${stats.average_uptime.toFixed(2)}%
        - Current TPS: ${stats.tps}
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        return response.text || "Analysis complete but no text returned.";
    } catch (error) {
        // console.error("AI Generation Error", error);
        return "Unable to generate AI report at this time.";
    }
  },

  getValidatorGrade: (node: PNode): ValidatorGrade => {
      // Logic to calculate grade based on uptime, latency, etc.
      let score = 0;
      score += node.uptime_percentage; // Max 100
      score += (1000 - Math.min(node.latency_ms, 1000)) / 20; // Max 50 (if 0ms) -> usually 40ish
      
      // Normalize roughly to 100 base
      const finalScore = Math.min(100, (score / 150) * 100 + 10);
      
      let grade: ValidatorGrade['grade'] = 'F';
      if (finalScore >= 97) grade = 'A+';
      else if (finalScore >= 93) grade = 'A';
      else if (finalScore >= 85) grade = 'B';
      else if (finalScore >= 75) grade = 'C';
      else if (finalScore >= 60) grade = 'D';

      return {
          grade,
          score: Math.floor(finalScore),
          metrics: {
              uptimeScore: Math.floor(node.uptime_percentage),
              latencyScore: Math.floor((1000 - Math.min(node.latency_ms, 1000)) / 10),
              consistencyScore: 90 // Mocked for now
          }
      };
  },

  runResilienceSimulation: async (targetRegion: string, allNodes: PNode[]): Promise<ResilienceStats> => {
      await delay(800); // Simulate processing
      
      const affectedNodes = allNodes.filter(n => n.region === targetRegion);
      const affectedStake = affectedNodes.reduce((acc, n) => acc + n.stake_weight, 0);
      const totalStake = allNodes.reduce((acc, n) => acc + n.stake_weight, 0);
      
      const impactRatio = totalStake > 0 ? affectedStake / totalStake : 0;
      
      return {
          region: targetRegion,
          impactScore: Math.floor(impactRatio * 100),
          nodesAffected: affectedNodes.length,
          stakeAffected: affectedStake
      };
  }
};
