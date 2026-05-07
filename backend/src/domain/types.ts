export type SystemName = 'sws' | 'bescom' | 'kspcb' | 'labour';

export type EventKind = 'info' | 'sync' | 'warning' | 'error';
export type ConflictStatus = 'pending' | 'resolved' | 'manual_review';
export type AgentName = 'listener' | 'decision' | 'translation' | 'conflict' | 'sync' | 'audit';

export interface CanonicalBusinessRecord {
  ubid: string;
  businessName: string;
  address: string;
  owner: string;
  powerLoad: string;
  pollutionCategory: string;
  employeeCount: number;
  phone: string;
  category: string;
  approvalStatus: string;
  updatedAt: string;
  version: number;
  origin: SystemName;
}

export interface SystemSnapshot {
  system: SystemName;
  ubid: string;
  version: number;
  updatedAt: string;
  origin: SystemName;
  data: Record<string, unknown>;
}

export interface SyncEvent {
  eventId: string;
  source: SystemName;
  origin: SystemName;
  target: SystemName[];
  ubid: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: string;
  version: number;
}

export interface AgentLifecycleEvent {
  id: string;
  agent: AgentName;
  stage: string;
  message: string;
  eventId?: string;
  timestamp: string;
}

export interface ConflictRecord {
  id: string;
  eventId: string;
  ubid: string;
  field: string;
  fieldLabel: string;
  source: SystemName;
  target: SystemName[];
  systemValues: Record<string, unknown>;
  timestamps: Record<string, string>;
  severity: 'low' | 'medium' | 'high';
  status: ConflictStatus;
  origin: SystemName;
  authoritative: SystemName;
  resolved: boolean;
  detectedAt: string;
  resolvedAt?: string;
  note: string;
}

export interface AuditLogEntry {
  id: string;
  eventId: string;
  actor: AgentName;
  action: string;
  status: 'started' | 'completed' | 'warning' | 'error';
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ReplaySession {
  id: string;
  eventIds: string[];
  createdAt: string;
  summary: string;
}

export interface PolicyMap {
  [field: string]: SystemName;
}

export interface OrchestrationInput {
  system: SystemName;
  ubid: string;
  patch: Record<string, unknown>;
  origin?: SystemName;
  reason?: string;
}
