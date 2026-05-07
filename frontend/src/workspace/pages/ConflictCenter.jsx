import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hash,
  X,
  Repeat,
  ExternalLink,
  Eye,
  GitBranch,
  Shield,
  FileText,
  ArrowDown,
  Activity,
  ShieldAlert,
  TrendingUp,
  Building2,
  Server,
  Zap,
  BarChart3,
  CircleDot,
  PauseCircle,
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const SYSTEM_META = {
  sws: { label: 'SWS', color: '#60a5fa', icon: Building2 },
  bescom: { label: 'BESCOM', color: '#F59E0B', icon: Zap },
  kspcb: { label: 'KSPCB', color: '#14B8A6', icon: Server },
  labour: { label: 'Labour', color: '#a78bfa', icon: Server },
};

const SEVERITY_META = {
  low: { color: '#14B8A6', label: 'LOW' },
  medium: { color: '#F59E0B', label: 'MEDIUM' },
  high: { color: '#EF4444', label: 'HIGH' },
};

const STATUS_META = {
  pending: { label: 'Pending Resolution', color: '#F59E0B', icon: Clock },
  resolved: { label: 'Resolved', color: '#14B8A6', icon: CheckCircle2 },
  manual_review: { label: 'Manual Review Required', color: '#EF4444', icon: ShieldAlert },
};

// ────────────────────────────────────────────────────────────────────────────
// Header metric card
// ────────────────────────────────────────────────────────────────────────────
const MetricTile = ({ label, value, sub, color = '#E5E7EB', icon: Icon }) => (
  <div className="bg-[#111827] border border-white/5 rounded-lg p-3 flex items-center gap-3 min-w-[160px]">
    <div
      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
      style={{ background: `${color}1f`, color }}
    >
      {Icon && <Icon className="w-4 h-4" />}
    </div>
    <div>
      <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">{label}</div>
      <div className="text-base font-semibold text-white mt-0.5" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-[#6b7280] mt-0.5">{sub}</div>}
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// Active conflict card
// ────────────────────────────────────────────────────────────────────────────
const ConflictCard = ({ conflict, onClick }) => {
  const severity = SEVERITY_META[conflict.severity] || SEVERITY_META.medium;
  const status = STATUS_META[conflict.status] || STATUS_META.pending;
  const StatusIcon = status.icon;
  const isPaused = conflict.status === 'manual_review';

  return (
    <motion.button
      layout
      onClick={() => onClick(conflict)}
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-left bg-gradient-to-br from-[#111827] to-[#0f1626] border rounded-xl p-4 transition relative overflow-hidden group"
      style={{
        borderColor:
          conflict.status === 'resolved'
            ? 'rgba(20,184,166,0.25)'
            : conflict.status === 'manual_review'
            ? 'rgba(239,68,68,0.35)'
            : 'rgba(245,158,11,0.35)',
        boxShadow:
          conflict.status === 'pending'
            ? '0 0 0 1px rgba(245,158,11,0.15), 0 0 24px rgba(245,158,11,0.08)'
            : conflict.status === 'manual_review'
            ? '0 0 0 1px rgba(239,68,68,0.2), 0 0 24px rgba(239,68,68,0.1)'
            : 'none',
      }}
      data-testid={`conflict-card-${conflict.id}`}
    >
      {/* Pulsing accent strip */}
      {conflict.status !== 'resolved' && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: severity.color }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: `${severity.color}1f`, color: severity.color }}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white mono">{conflict.id}</span>
              <span
                className="text-[9px] mono uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: severity.color, background: `${severity.color}15` }}
              >
                {severity.label}
              </span>
            </div>
            <div className="text-[10px] mono text-[#6b7280] mt-0.5">
              <Hash className="w-2.5 h-2.5 inline mr-1" />
              {conflict.ubid}
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: `${status.color}15`, color: status.color }}
        >
          <StatusIcon className="w-3 h-3" />
          <span className="text-[10px] mono uppercase tracking-widest">
            {status.label}
          </span>
        </div>
      </div>

      <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-1.5">
        Conflicting Field
      </div>
      <div className="text-sm font-semibold text-white mb-3">{conflict.fieldLabel}</div>

      <div className="flex items-center gap-2 flex-wrap">
        {conflict.systems.map((s, i) => {
          const meta = SYSTEM_META[s] || { label: s.toUpperCase(), color: '#9CA3AF', icon: Server };
          const Icon = meta.icon;
          return (
            <React.Fragment key={s}>
              {i > 0 && <span className="text-[#6b7280] text-xs mono">↔</span>}
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded mono text-[10px] uppercase tracking-widest"
                style={{ background: `${meta.color}10`, color: meta.color, border: `1px solid ${meta.color}33` }}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] mono text-[#6b7280]">
          <Clock className="w-2.5 h-2.5 inline mr-1" />
          {conflict.detectedAt}
        </span>
        {isPaused && (
          <span className="flex items-center gap-1 text-[10px] mono text-[#EF4444]">
            <PauseCircle className="w-3 h-3" />
            SYNC PAUSED
          </span>
        )}
        {conflict.resolved && conflict.authoritative && (
          <span className="text-[10px] mono text-[#14B8A6]">
            → {conflict.authoritative.toUpperCase()} authoritative
          </span>
        )}
      </div>
    </motion.button>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Resolution flow visualisation (animated)
// ────────────────────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { id: 'sws', label: 'SWS Update', icon: Building2, color: '#60a5fa' },
  { id: 'listener', label: 'Listener Detects', icon: Eye, color: '#2563EB' },
  { id: 'conflict', label: 'Conflict Detected', icon: AlertTriangle, color: '#F59E0B' },
  { id: 'decision', label: 'Decision Evaluates', icon: GitBranch, color: '#a78bfa' },
  { id: 'policy', label: 'Policy Applied', icon: Shield, color: '#14B8A6' },
  { id: 'sync', label: 'Systems Reconciled', icon: CheckCircle2, color: '#14B8A6' },
];

const ResolutionFlow = ({ playKey }) => {
  return (
    <div className="space-y-2" key={playKey}>
      {FLOW_STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.id + playKey}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}1f`, color: s.color, border: `1px solid ${s.color}55` }}
                animate={{ boxShadow: [`0 0 0 ${s.color}00`, `0 0 16px ${s.color}88`, `0 0 0 ${s.color}00`] }}
                transition={{ delay: i * 0.4, duration: 1.2 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              {i < FLOW_STEPS.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 16 }}
                  transition={{ delay: i * 0.4 + 0.2, duration: 0.25 }}
                  className="w-px"
                  style={{ background: `${s.color}55` }}
                />
              )}
            </div>
            <div className="flex-1 pt-1.5">
              <div className="text-sm text-white font-medium">{s.label}</div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: s.color }}>
                step {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Conflict analysis modal
// ────────────────────────────────────────────────────────────────────────────
const AGENTS_INVOLVED = [
  { id: 'listener', label: 'Listener Agent', icon: Eye, color: '#2563EB' },
  { id: 'decision', label: 'Decision Agent', icon: GitBranch, color: '#a78bfa' },
  { id: 'conflict', label: 'Conflict Resolution Agent', icon: Shield, color: '#F59E0B' },
  { id: 'audit', label: 'Audit Agent', icon: FileText, color: '#10b981' },
];

const ConflictModal = ({ conflict, onClose }) => {
  const { policy, replayConflict, resolveConflictManually, escalateConflict, agentStates, setActivePage } =
    useWorkspace();
  const [playKey, setPlayKey] = useState(0);

  if (!conflict) return null;

  const authoritative = conflict.authoritative || policy[conflict.field] || 'sws';
  const sysEntries = Object.entries(conflict.sources);
  const status = STATUS_META[conflict.status];
  const StatusIcon = status.icon;

  const replay = () => {
    setPlayKey((k) => k + 1);
    replayConflict(conflict);
  };

  const goToWorkspace = () => {
    setActivePage('abil');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        data-testid="conflict-modal-backdrop"
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0f1626] border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden max-h-[88vh] flex flex-col"
          style={{ boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 30px 80px rgba(0,0,0,0.6)' }}
          data-testid="conflict-modal"
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b border-white/5 flex items-center gap-4"
            style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.12), transparent)' }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.18)', color: '#F59E0B' }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                Reconciliation Workflow
              </div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                Conflict {conflict.id}
                <span
                  className="text-[10px] mono uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: status.color, background: `${status.color}15` }}
                >
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {status.label}
                </span>
              </h3>
              <div className="text-[11px] mono text-[#9CA3AF] mt-0.5">
                UBID {conflict.ubid} · Detected {conflict.detectedAt}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white/5 text-[#9CA3AF]"
              data-testid="conflict-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 overflow-y-auto">
            {/* Left column */}
            <div className="p-6 space-y-6">
              {/* Conflict details */}
              <section>
                <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-3">
                  Conflict Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Detail label="Field" value={conflict.fieldLabel} />
                  <Detail label="Origin System" value={(conflict.origin || '—').toUpperCase()} mono />
                  <Detail
                    label="Timestamp Difference"
                    value={
                      conflict.deltaSeconds < 60
                        ? `${conflict.deltaSeconds} sec`
                        : conflict.deltaSeconds < 3600
                        ? `${Math.round(conflict.deltaSeconds / 60)} min`
                        : `${Math.round(conflict.deltaSeconds / 3600)} hr`
                    }
                    mono
                  />
                  <Detail
                    label="Severity"
                    value={(SEVERITY_META[conflict.severity] || SEVERITY_META.medium).label}
                    color={(SEVERITY_META[conflict.severity] || SEVERITY_META.medium).color}
                    mono
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {sysEntries.map(([sys, val]) => {
                    const meta = SYSTEM_META[sys] || { label: sys.toUpperCase(), color: '#9CA3AF' };
                    return (
                      <div
                        key={sys}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 py-2.5 rounded-md bg-[#0B1220] border border-white/5"
                      >
                        <div className="flex items-center gap-2 sm:w-32 shrink-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: meta.color }}
                          />
                          <span
                            className="text-[10px] mono uppercase tracking-widest"
                            style={{ color: meta.color }}
                          >
                            {meta.label} value
                          </span>
                        </div>
                        <span className="text-sm text-white mono break-all">{val}</span>
                        {conflict.timestamps?.[sys] && (
                          <span className="ml-auto text-[10px] mono text-[#6b7280]">
                            {conflict.timestamps[sys]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {conflict.note && (
                  <div className="mt-3 text-[12px] text-[#9CA3AF] italic border-l-2 border-[#F59E0B]/40 pl-3">
                    {conflict.note}
                  </div>
                )}
              </section>

              {/* Resolution policy */}
              <section className="bg-[#14B8A6]/5 border border-[#14B8A6]/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#14B8A6]" />
                  <span className="text-sm font-semibold text-white">Resolution Policy</span>
                </div>
                <div className="text-[13px] text-[#E5E7EB]">
                  <span className="mono font-bold text-[#14B8A6]">{authoritative.toUpperCase()}</span>{' '}
                  authoritative for{' '}
                  <span className="mono">{conflict.field}</span> fields
                </div>
                <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mt-2">
                  Policy Source · Golden Record Configuration
                </div>
              </section>

              {/* Agents involved */}
              <section>
                <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-3">
                  Agent Participation
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AGENTS_INVOLVED.map((a) => {
                    const Icon = a.icon;
                    const live = agentStates[a.id]?.status || 'idle';
                    const active = live !== 'idle';
                    return (
                      <div
                        key={a.id}
                        className="bg-[#0B1220] border border-white/5 rounded-md p-3"
                        style={{
                          borderColor: active ? `${a.color}55` : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center mb-2"
                          style={{ background: `${a.color}1f`, color: a.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[12px] text-white font-medium leading-tight">
                          {a.label}
                        </div>
                        <div
                          className="text-[10px] mono uppercase tracking-widest mt-1 flex items-center gap-1"
                          style={{ color: active ? a.color : '#6b7280' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: active ? a.color : '#4b5563',
                              boxShadow: active ? `0 0 6px ${a.color}` : 'none',
                            }}
                          />
                          {live}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right column — flow visualization */}
            <div className="border-l border-white/5 bg-[#0B1220]/60 p-6">
              <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-4">
                Reconciliation Flow
              </div>
              <ResolutionFlow playKey={playKey} />
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-2 bg-[#0B1220]/40">
            {conflict.status === 'manual_review' && (
              <span className="flex items-center gap-1.5 text-[11px] mono text-[#EF4444]">
                <PauseCircle className="w-3.5 h-3.5" />
                Sync paused — operator review required
              </span>
            )}
            <div className="sm:ml-auto flex flex-wrap items-center gap-2">
              <button
                onClick={replay}
                className="px-3 py-2 rounded-md bg-[#2563EB]/15 hover:bg-[#2563EB]/25 border border-[#2563EB]/40 text-[#60a5fa] text-xs font-medium transition flex items-center gap-2"
                data-testid="conflict-replay-btn"
              >
                <Repeat className="w-3.5 h-3.5" />
                Replay Conflict
              </button>
              {conflict.status === 'manual_review' && (
                <button
                  onClick={() => {
                    resolveConflictManually(conflict.id, authoritative);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-md bg-[#14B8A6]/15 hover:bg-[#14B8A6]/25 border border-[#14B8A6]/40 text-[#14B8A6] text-xs font-medium transition flex items-center gap-2"
                  data-testid="conflict-resolve-manual-btn"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve {authoritative.toUpperCase()} Value
                </button>
              )}
              {conflict.status === 'pending' && (
                <button
                  onClick={() => {
                    escalateConflict(conflict.id);
                  }}
                  className="px-3 py-2 rounded-md bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-medium transition flex items-center gap-2"
                  data-testid="conflict-escalate-btn"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Escalate to Operator
                </button>
              )}
              <button
                onClick={goToWorkspace}
                className="px-3 py-2 rounded-md bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-medium transition flex items-center gap-2"
                data-testid="conflict-view-workspace-btn"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View in ABIL Workspace
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Detail = ({ label, value, mono = false, color = '#E5E7EB' }) => (
  <div>
    <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">{label}</div>
    <div
      className={`text-sm mt-1 ${mono ? 'mono' : ''}`}
      style={{ color, fontWeight: 500 }}
    >
      {value}
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// Insights panel (analytics)
// ────────────────────────────────────────────────────────────────────────────
const InsightsPanel = ({ conflicts, metrics }) => {
  const fieldFreq = useMemo(() => {
    const m = {};
    conflicts.forEach((c) => {
      m[c.fieldLabel] = (m[c.fieldLabel] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [conflicts]);

  const sysFreq = useMemo(() => {
    const m = {};
    conflicts.forEach((c) =>
      c.systems.forEach((s) => {
        m[s] = (m[s] || 0) + 1;
      })
    );
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [conflicts]);

  const max = Math.max(...fieldFreq.map((f) => f[1]), 1);
  const sysMax = Math.max(...sysFreq.map((f) => f[1]), 1);

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-6 h-full">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[#60a5fa]" />
        <h3 className="text-sm font-semibold text-white">Conflict Insights</h3>
        <span className="ml-auto text-[10px] mono uppercase tracking-widest text-[#6b7280]">
          Last 30 days
        </span>
      </div>

      {/* Latency */}
      <div className="bg-[#0B1220] rounded-lg p-3 border border-white/5">
        <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-1">
          Reconciliation Latency
        </div>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold text-white">{metrics.avgResolutionMs}</div>
          <div className="text-[11px] mono text-[#14B8A6] mb-1">ms avg</div>
        </div>
        <div className="mt-2 flex items-end gap-1 h-10">
          {[820, 1240, 980, 1640, 1320, 1480, 1220, 1180, 1620, 1420, 1280, 1380].map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / 2000) * 100}%` }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 22 }}
              className="flex-1 rounded-sm"
              style={{ background: `linear-gradient(to top, #14B8A6, #14B8A688)` }}
            />
          ))}
        </div>
      </div>

      {/* Most frequent field */}
      <div>
        <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-2">
          Most Frequent Conflict Fields
        </div>
        <div className="space-y-2">
          {fieldFreq.slice(0, 4).map(([field, count]) => (
            <div key={field}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#E5E7EB]">{field}</span>
                <span className="mono text-[#9CA3AF]">{count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / max) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highest mismatch systems */}
      <div>
        <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-2">
          Systems with Highest Mismatches
        </div>
        <div className="space-y-2">
          {sysFreq.map(([sys, count]) => {
            const meta = SYSTEM_META[sys] || { label: sys.toUpperCase(), color: '#9CA3AF' };
            return (
              <div key={sys} className="flex items-center gap-2">
                <span
                  className="text-[10px] mono uppercase tracking-widest w-16"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / sysMax) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                  />
                </div>
                <span className="text-[10px] mono text-[#9CA3AF] w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly trend */}
      <div className="bg-gradient-to-br from-[#2563EB]/8 to-[#14B8A6]/4 border border-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span className="text-[11px] mono text-[#9CA3AF]">Anomaly Trend</span>
        </div>
        <div className="text-[12px] text-white">
          <span className="text-[#14B8A6] font-semibold">↓ 18%</span> conflicts vs. last week —
          policy enforcement is stabilising the golden record.
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Conflict timeline
// ────────────────────────────────────────────────────────────────────────────
const ConflictTimeline = ({ conflicts }) => {
  const items = useMemo(() => {
    const arr = [];
    conflicts.forEach((c) => {
      arr.push({
        id: `${c.id}-detected`,
        time: c.detectedAt,
        kind: 'warning',
        label: `${c.id} · ${c.fieldLabel} mismatch detected (${c.systems.map((s) => s.toUpperCase()).join(' ↔ ')})`,
      });
      if (c.status === 'manual_review') {
        arr.push({
          id: `${c.id}-escalated`,
          time: c.detectedAt,
          kind: 'error',
          label: `${c.id} · Escalated to operator review`,
        });
      }
      if (c.resolved) {
        arr.push({
          id: `${c.id}-resolved`,
          time: c.resolvedAt || c.detectedAt,
          kind: 'sync',
          label: `${c.id} · Reconciled · ${c.authoritative?.toUpperCase()} authoritative`,
        });
      }
    });
    return arr;
  }, [conflicts]);

  const KIND_COLOR = { warning: '#F59E0B', sync: '#14B8A6', error: '#EF4444', info: '#60a5fa' };

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl flex flex-col h-full">
      <header className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#F59E0B]" />
        <h3 className="text-sm font-semibold text-white">Reconciliation Timeline</h3>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        <span className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
          {items.length} EVENTS
        </span>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {items.map((ev) => {
              const color = KIND_COLOR[ev.kind] || '#9CA3AF';
              return (
                <motion.li
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#0B1220] border border-white/5"
                  data-testid="conflict-timeline-item"
                >
                  <span className="text-[10px] mono text-[#6b7280] w-20 shrink-0">
                    {ev.time}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <span className="text-[12px] text-[#E5E7EB] flex-1">{ev.label}</span>
                  <span
                    className="text-[10px] mono uppercase tracking-widest"
                    style={{ color }}
                  >
                    {ev.kind}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Filter bar
// ────────────────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all', label: 'All', color: '#9CA3AF' },
  { id: 'pending', label: 'Pending', color: '#F59E0B' },
  { id: 'manual_review', label: 'Manual Review', color: '#EF4444' },
  { id: 'resolved', label: 'Resolved', color: '#14B8A6' },
];

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
const ConflictCenter = () => {
  const { conflicts, metrics } = useWorkspace();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? conflicts : conflicts.filter((c) => c.status === filter)),
    [conflicts, filter]
  );

  return (
    <div className="p-6 space-y-6" data-testid="conflict-center-page">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
          >
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-3">
              Conflict Resolution Center
              <CircleDot className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
            </h1>
            <div className="text-xs text-[#9CA3AF] mt-0.5">
              Live synchronization anomalies and reconciliation workflows
            </div>
          </div>
        </div>

        <div className="lg:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <MetricTile
            label="Active Conflicts"
            value={metrics.activeConflicts}
            color="#F59E0B"
            icon={AlertTriangle}
          />
          <MetricTile
            label="Resolved Today"
            value={metrics.resolvedToday}
            color="#14B8A6"
            icon={CheckCircle2}
          />
          <MetricTile
            label="Escalated"
            value={metrics.escalated}
            color="#EF4444"
            icon={ShieldAlert}
            sub="Manual review"
          />
          <MetricTile
            label="Avg Resolution"
            value={`${metrics.avgResolutionMs}ms`}
            color="#60a5fa"
            icon={Clock}
          />
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = filter === f.id;
          const count =
            f.id === 'all' ? conflicts.length : conflicts.filter((c) => c.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 border"
              style={
                isActive
                  ? { background: `${f.color}1f`, borderColor: `${f.color}88`, color: f.color }
                  : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }
              }
              data-testid={`conflict-filter-${f.id}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: f.color }}
              />
              {f.label}
              <span className="text-[10px] mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        {/* Active conflicts grid */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">
              {filter === 'all' ? 'All Conflicts' : FILTERS.find((f) => f.id === filter).label}
            </h2>
            <span className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
              {filtered.length} ITEMS
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="bg-[#111827] border border-white/5 rounded-xl p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#14B8A6] mx-auto mb-3" />
              <div className="text-sm text-white font-medium">All clear in this view.</div>
              <div className="text-xs text-[#9CA3AF] mt-1">
                No conflicts match the current filter.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((c) => (
                  <ConflictCard key={c.id} conflict={c} onClick={setSelected} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Insights */}
        <aside>
          <InsightsPanel conflicts={conflicts} metrics={metrics} />
        </aside>
      </div>

      {/* Timeline */}
      <div className="h-[280px]">
        <ConflictTimeline conflicts={conflicts} />
      </div>

      <ConflictModal conflict={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ConflictCenter;
