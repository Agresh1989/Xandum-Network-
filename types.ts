
export enum NodeStatus {
  ACTIVE = 'Active',
  DELINQUENT = 'Delinquent',
  OFFLINE = 'Offline',
  SYNCING = 'Syncing'
}

export interface PNode {
  id: string; // Public Key
  name?: string; // Moniker
  ip: string;
  version: string;
  region: string;
  country: string;
  status: NodeStatus;
  uptime_percentage: number; // 0-100
  latency_ms: number;
  stake_weight: number; // Simulated stake amount
  last_vote_slot: number;
  gossip_peers: number;
  software_version: string;
  joined_at: string;
}

export interface NetworkStats {
  total_nodes: number;
  active_nodes: number;
  delinquent_nodes: number;
  average_uptime: number;
  current_epoch: number;
  total_stake: number;
  last_updated: string;
  tps: number;
}

export interface HistoricalMetric {
  timestamp: string;
  value: number;
}

// JSON-RPC Response Types
export interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  result: T;
  id: string | number;
  error?: {
    code: number;
    message: string;
  };
}

export interface RpcClusterNode {
  pubkey: string;
  gossip?: string;
  tpu?: string;
  rpc?: string;
  version?: string;
  featureSet?: number;
  shredVersion?: number;
}

export interface RpcEpochInfo {
  absoluteSlot: number;
  blockHeight: number;
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  transactionCount?: number;
}

// Real-time Data Push
export interface RealtimeUpdate {
  type: 'full' | 'stats_only' | 'node_update';
  stats: NetworkStats;
  nodes?: PNode[];
}

export interface ValidatorGrade {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  metrics: {
      uptimeScore: number;
      latencyScore: number;
      consistencyScore: number;
      voteDistanceScore: number;
      participationScore: number;
  }
}

export interface ResilienceStats {
  region: string;
  impactScore: number; // 0-100, higher is worse impact if region goes down
  nodesAffected: number;
  stakeAffected: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
