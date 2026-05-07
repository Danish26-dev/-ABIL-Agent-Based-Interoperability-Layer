import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  GitBranch,
  RefreshCw,
  Zap,
  Shield,
  FileText,
  X,
  Activity,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Operational3D from '../Operational3D';
import { useWorkspace } from '../WorkspaceContext';

const AGENT_ICONS = {
  listener: Eye,
  decision: GitBranch,
  translation: RefreshCw,
  sync: Zap,
  conflict: Shield,
  audit: FileText,
};

const STATUS_COLOR = {
  active: '#14B8A6',
  processing: '#2563EB',
  running: '#2563EB',
  warning: '#F59E0B',
  idle: '#9CA3AF',
};

const AgentCard = ({ agent, onClick }) => {
  const Icon = AGENT_ICONS[agent.id] || Activity;
  const color = STATUS_COLOR[agent.status] || '#9CA3AF';
  return (
    <motion.button
      onClick={() => onClick(agent)}
      whileHover={{ y: -2 }}
      className="w-full text-left bg-[#111827] hover:bg-[#15203a] border border-white/5 hover:border-white/10 rounded-lg p-3 transition-all group"
      data-testid={`agent-card-${agent.id}`}
      style={{
        boxShadow:
          agent.status !== 'idle' ? `0 0 0 1px ${color}33, 0 0 24px ${color}22` : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${color}1f`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white truncate">{agent.name}</div>
            <ChevronRight className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-white transition" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: color,
                boxShadow: agent.status !== 'idle' ? `0 0 8px ${color}` : 'none',
              }}
            />
            <span
              className="text-[10px] mono uppercase tracking-widest"
              style={{ color }}
            >
              {agent.status}
            </span>
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-1 truncate">{agent.message}</div>
        </div>
      </div>
    </motion.button>
  );
};

const AgentModal = ({ agent, onClose }) => {
  const { activeConflict, policy } = useWorkspace();
  if (!agent) return null;
  const Icon = AGENT_ICONS[agent.id] || Activity;
  const color = STATUS_COLOR[agent.status] || '#9CA3AF';

  const renderBody = () => {
    if (agent.id === 'conflict') {
      return (
        <div className="space-y-4">
          <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
            Current Conflict
          </div>
          {activeConflict ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {activeConflict.field.toUpperCase()} mismatch detected
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(activeConflict.sources).map(([sys, val]) => (
                  <div
                    key={sys}
                    className="flex items-center justify-between bg-[#0B1220] border border-white/5 rounded-md px-3 py-2"
                  >
                    <span className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                      {sys}
                    </span>
                    <span className="text-sm text-white mono">{val}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-3">
                <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-2">
                  Resolution Policy
                </div>
                <div className="text-sm text-[#14B8A6] mono">
                  {(activeConflict.authoritative || policy[activeConflict.field] || 'sws').toUpperCase()}{' '}
                  authoritative for {activeConflict.field} fields
                </div>
                {activeConflict.resolved && (
                  <div className="mt-2 text-xs text-[#14B8A6] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolution applied · golden record updated
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#9CA3AF]">
              No active conflicts. The conflict resolution agent is monitoring for divergences
              between authoritative and replica systems.
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-1">
            Role
          </div>
          <p className="text-sm text-[#E5E7EB]">{agent.role}</p>
        </div>
        <div>
          <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-1">
            Current Activity
          </div>
          <p className="text-sm text-white">{agent.message}</p>
        </div>
        <div>
          <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-2">
            Operating Channels
          </div>
          <div className="flex flex-wrap gap-2">
            {['SWS', 'BESCOM', 'KSPCB', 'Labour'].map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded bg-[#0B1220] border border-white/5 text-[11px] mono text-[#9CA3AF]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
        data-testid="agent-modal-backdrop"
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg overflow-hidden"
          data-testid="agent-modal"
          style={{ boxShadow: `0 0 0 1px ${color}33, 0 30px 80px rgba(0,0,0,0.6)` }}
        >
          <div
            className="px-6 py-5 border-b border-white/5 flex items-center gap-4"
            style={{ background: `linear-gradient(90deg, ${color}1a, transparent)` }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ background: `${color}25`, color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                Inspecting Operator
              </div>
              <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] mono uppercase tracking-widest" style={{ color }}>
                  {agent.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white/5 text-[#9CA3AF]"
              data-testid="agent-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">{renderBody()}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EVENT_KIND_COLOR = {
  info: '#60a5fa',
  sync: '#14B8A6',
  warning: '#F59E0B',
  error: '#EF4444',
};

const EventTimeline = () => {
  const { events } = useWorkspace();
  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl flex flex-col h-full">
      <header className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#14B8A6]" />
        <h3 className="text-sm font-semibold text-white">Live Event Timeline</h3>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
        <span className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
          STREAMING
        </span>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-4 py-10">
            <div className="text-[#6b7280]">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#2563EB]" />
              <div className="text-xs">
                No events yet. Trigger an update from{' '}
                <span className="text-[#60a5fa]">SWS Portal</span> or{' '}
                <span className="text-[#F59E0B]">Legacy Systems</span> to watch the pipeline.
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {events.map((ev) => {
                const color = EVENT_KIND_COLOR[ev.kind] || '#9CA3AF';
                return (
                  <motion.li
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#0B1220] border border-white/5"
                  >
                    <span className="text-[10px] mono text-[#6b7280] w-16 shrink-0">
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
        )}
      </div>
    </div>
  );
};

const ConflictBanner = () => {
  const { activeConflict, dismissConflict } = useWorkspace();
  if (!activeConflict) return null;
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-6 mt-4 px-4 py-3 rounded-lg border bg-[#F59E0B]/10 border-[#F59E0B]/30 flex items-center gap-3"
      data-testid="conflict-banner"
    >
      <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
      <div className="flex-1 text-sm text-white">
        <span className="font-semibold">Conflict on {activeConflict.field}:</span>{' '}
        {Object.entries(activeConflict.sources)
          .map(([s, v]) => `${s.toUpperCase()} → ${v}`)
          .join(' · ')}
      </div>
      {activeConflict.resolved && (
        <span className="text-[11px] mono text-[#14B8A6] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolved via {activeConflict.authoritative?.toUpperCase()}
        </span>
      )}
      <button
        onClick={dismissConflict}
        className="p-1 rounded hover:bg-white/5 text-[#9CA3AF]"
        data-testid="conflict-dismiss-btn"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const ABILWorkspace = () => {
  const { agents, triggerDemoConflict, policy } = useWorkspace();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const onAgentClick = (id) => {
    const a = agents.find((x) => x.id === id);
    if (a) setSelectedAgent(a);
  };

  return (
    <div className="h-full flex flex-col" data-testid="abil-workspace-page">
      <ConflictBanner />

      {/* Top: 3D + Agent panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 px-6 pt-4 flex-1 min-h-0">
        <div className="relative bg-[#111827] border border-white/5 rounded-xl overflow-hidden min-h-[420px]">
          <Operational3D onAgentClick={onAgentClick} />

          {/* Floating header */}
          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
            <div className="text-[10px] mono uppercase tracking-widest text-[#9CA3AF]">
              Operational 3D Workspace
            </div>
          </div>
          <div className="absolute top-4 right-4 text-[10px] mono uppercase tracking-widest text-[#6b7280] pointer-events-none">
            Click any workstation to inspect
          </div>

          {/* Trigger demo conflict button */}
          <button
            onClick={triggerDemoConflict}
            className="absolute bottom-4 left-4 px-3 py-2 rounded-md bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-medium transition flex items-center gap-2"
            data-testid="trigger-conflict-btn"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate Conflict
          </button>

          {/* Golden record policy panel */}
          <div className="absolute bottom-4 right-4 bg-[#0B1220]/85 backdrop-blur border border-white/10 rounded-lg p-3 max-w-[230px]">
            <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-2">
              Golden Record Policy
            </div>
            <ul className="space-y-1 text-[11px]">
              {Object.entries(policy)
                .slice(0, 4)
                .map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <span className="text-[#9CA3AF] truncate">{k}</span>
                    <span className="mono font-semibold text-[#14B8A6] uppercase">{v}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Right panel: Agent activity */}
        <div className="bg-[#111827] border border-white/5 rounded-xl flex flex-col min-h-0">
          <header className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#60a5fa]" />
            <h3 className="text-sm font-semibold text-white">Agent Activity</h3>
            <span className="ml-auto text-[10px] mono uppercase tracking-widest text-[#6b7280]">
              6 OPERATORS
            </span>
          </header>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} onClick={setSelectedAgent} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: timeline */}
      <div className="px-6 py-4 h-[260px]">
        <EventTimeline />
      </div>

      <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  );
};

export default ABILWorkspace;
