
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

let RPC_ENDPOINT = localStorage.getItem('xandeum_rpc_endpoint') || (typeof process !== 'undefined' ? process.env.REACT_APP_RPC_ENDPOINT : undefined) || 'https://rpc.xandeum.network';
// Reduced default timeout to 5s for better UX during connection testing
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

async function fetchRpc<T>(method: string, params: any[] = [], timeoutOverride?: number): Promise<T> {
  const timeoutMs = timeoutOverride || DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

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
      throw new Error(`RPC Error: ${response.status} ${response.statusText}`);
    }

    const data: JsonRpcResponse<T> = await response.json();
    
    if (data.error) {
      throw new Error(`RPC API Error: ${data.error.message}`);
    }

    return data.result;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs/1000}s. The endpoint might be unreachable or blocked by CORS.`);
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        // Enhance generic fetch error to explain CORS
        throw new Error("Connection Blocked: The browser could not connect to the RPC endpoint. This is typically due to CORS (Cross-Origin Resource Sharing) restrictions on public nodes. Please switch to Simulation Mode or use a proxy.");
    }
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
  
  // Set explicit flag for simulation mode vs live mode
  setUseLive: (useLive: boolean) => {
      pNodeService.isUsingLive = useLive;
  },

  // Use a shorter timeout for testing connection to provide quick feedback
  testConnection: async (): Promise<{ success: boolean; message: string; version?: string }> => {
    try {
        const result = await fetchRpc<any>('getVersion', [], 5000); 
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
    // If explicitly set to simulation mode (e.g. after a CORS failure), skip the network request
    if (!pNodeService.isUsingLive) {
        await delay(400); 
        return MOCK_NODES;
    }

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
    // Skip if simulation is forced
    if (!pNodeService.isUsingLive) {
        await delay(400);
        return MOCK_STATS;
    }

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
        // 1. Update Stats - TPS Fluctuation
        const newTps = Math.max(1000, MOCK_STATS.tps + Math.floor((Math.random() - 0.5) * 500));
        
        // 2. Simulate Node Count Fluctuation (To trigger "Active Nodes" animation in UI)
        let activeNodes = MOCK_STATS.active_nodes;
        // 20% chance to change active node count
        if (Math.random() > 0.8) {
            const change = Math.random() > 0.5 ? 1 : -1;
            activeNodes = Math.max(10, Math.min(MOCK_STATS.total_nodes, activeNodes + change));
        }

        MOCK_STATS = {
            ...MOCK_STATS,
            tps: newTps,
            active_nodes: activeNodes,
            last_updated: new Date().toISOString(),
            // Simulate slow epoch progression
            current_epoch: Math.random() > 0.98 ? MOCK_STATS.current_epoch + 1 : MOCK_STATS.current_epoch
        };

        // 3. Update Random Nodes (Latency/Uptime jitter)
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

        // 4. Notify Listeners
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
      
      // Latency scoring: Lower is better. 0ms = 50 pts, 1000ms = 0 pts.
      const latencyScoreRaw = (1000 - Math.min(node.latency_ms, 1000)) / 20; 
      score += latencyScoreRaw;
      
      // Normalize roughly to 100 base
      // Max raw score is approx 150. (100 uptime + 50 latency)
      // We map 150 -> 100, 75 -> 50
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
              // Convert latency to a 0-100 scale for consistency in UI progress bars
              latencyScore: Math.floor((1000 - Math.min(node.latency_ms, 1000)) / 10),
              consistencyScore: 90 // Mocked for now, assumes good block production
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
  },

  // --- Chat Bot Feature ---

  chatWithAI: async (message: string, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is missing. Please configure it to use the chatbot.";
    }

    try {
        // Fetch fresh stats for context
        const stats = await pNodeService.getNetworkStats();
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-preview';

        const statsContext = `
        [SYSTEM CONTEXT - CURRENT NETWORK STATE]
        - Network: Xandeum Network (Mainnet Beta)
        - Total Nodes: ${stats.total_nodes}
        - Active Nodes: ${stats.active_nodes}
        - Delinquent Nodes: ${stats.delinquent_nodes}
        - Current TPS: ${stats.tps}
        - Current Epoch: ${stats.current_epoch}
        - Average Uptime: ${stats.average_uptime.toFixed(2)}%
        - Last Updated: ${stats.last_updated}
        `;

        const systemInstruction = `You are "XandBot", an intelligent assistant for the Xandeum Network Analytics Dashboard. 
        Your goal is to help users understand the Xandeum blockchain network, interpret validator statistics, and troubleshoot node issues.
        
        Guidelines:
        1. Use the provided [SYSTEM CONTEXT] to answer questions about the current network state accurately.
        2. If asked about specific validators, explain that you can guide them to the "Validators" page but cannot see specific node details in this chat window unless provided.
        3. Keep answers concise, professional, and helpful.
        4. Use bold text for key metrics.
        5. You are equipped with a thinking process for complex queries. Use it to reason through network scenarios if asked complex questions about consensus or outages.
        `;

        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: systemInstruction + statsContext,
                thinkingConfig: { thinkingBudget: 32768 }
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: message });
        return result.text;
    } catch (error) {
        console.error("Chat Error", error);
        return "I apologize, but I'm having trouble connecting to the network intelligence at the moment. Please try again later.";
    }
  }
};
