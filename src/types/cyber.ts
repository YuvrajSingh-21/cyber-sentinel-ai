export interface LogEntry {
  id: string;
  timestamp: Date;
  source: 'network' | 'system' | 'file' | 'auth';
  ip?: string;
  eventType: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  hash: string;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  source: string;
  description: string;
  riskScore: number;
  type: 'cpu_spike' | 'network_anomaly' | 'file_change' | 'auth_failure' | 'suspicious_activity';
  xaiReason: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  relatedLogs: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  source: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'incident' | 'alert' | 'change' | 'access';
  details?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  networkConnections: number;
  activeProcesses: number;
  uptime: string;
}

export interface Report {
  id: string;
  name: string;
  date: Date;
  type: 'pdf' | 'csv' | 'json';
  hash: string;
  chainOfCustody: string[];
  status: 'pending' | 'completed' | 'failed';
}

export type PageType = 'dashboard' | 'logs' | 'upload' | 'anomalies' | 'timeline' | 'reports' | 'settings';
