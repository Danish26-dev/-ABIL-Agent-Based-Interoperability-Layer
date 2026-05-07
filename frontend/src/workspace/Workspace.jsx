import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Brain,
  Server,
  ChevronLeft,
  ArrowLeft,
  CircleDot,
  Settings,
  HelpCircle,
  Swords,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';
import SWSPortal from './pages/SWSPortal';
import ABILWorkspace from './pages/ABILWorkspace';
import LegacySystems from './pages/LegacySystems';
import ConflictCenter from './pages/ConflictCenter';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_simple-hello-1724/artifacts/10czdmkl_abil%20logo.png';

const NAV_ITEMS = [
  { id: 'sws', label: 'SWS Portal', icon: Building2, sub: 'Karnataka Single Window' },
  { id: 'abil', label: 'ABIL Workspace', icon: Brain, sub: 'Orchestration Console' },
  { id: 'legacy', label: 'Legacy Systems', icon: Server, sub: 'BESCOM · KSPCB · Labour' },
  { id: 'conflict', label: 'Conflict Center', icon: Swords, sub: 'Reconciliation Operations', accent: '#F59E0B' },
];

const Sidebar = ({ active, setActive, collapsed, setCollapsed }) => {
  const { metrics } = useWorkspace();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="relative shrink-0 h-screen bg-[#0B1220] border-r border-white/5 flex flex-col"
      data-testid="workspace-sidebar"
    >
      {/* Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 min-w-0" data-testid="sidebar-home-link">
          <img src={LOGO_URL} alt="ABIL" className="w-9 h-9 rounded-lg shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm truncate">ABIL</div>
              <div className="text-[#9CA3AF] text-[10px] mono uppercase tracking-wider truncate">
                Interoperability Layer
              </div>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md hover:bg-white/5 text-[#9CA3AF] hover:text-white transition"
          data-testid="sidebar-toggle-btn"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2 text-[10px] mono uppercase tracking-widest text-[#6b7280]">
          Operations
        </div>
      )}

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const accent = item.accent || '#2563EB';
          const showBadge = item.id === 'conflict' && metrics.activeConflicts > 0;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all
                ${isActive ? 'text-white' : 'text-[#9CA3AF] hover:bg-white/[0.03] hover:text-white'}`}
              style={isActive ? { background: `${accent}1a` } : undefined}
              data-testid={`sidebar-nav-${item.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r-full"
                  style={{ background: accent, boxShadow: `0 0 12px ${accent}cc` }}
                />
              )}
              <div
                className={`relative w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition`}
                style={
                  isActive
                    ? { background: `${accent}33`, color: accent }
                    : item.id === 'conflict'
                    ? { background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }
                    : { background: 'rgba(255,255,255,0.02)', color: '#9CA3AF' }
                }
              >
                <Icon className="w-4 h-4" />
                {showBadge && !collapsed === false && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] mono font-bold flex items-center justify-center"
                    style={{ background: '#F59E0B', color: '#0B1220' }}
                  >
                    {metrics.activeConflicts}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 text-left flex-1">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {item.label}
                    {showBadge && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] mono font-bold"
                        style={{ background: '#F59E0B', color: '#0B1220' }}
                      >
                        {metrics.activeConflicts}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6b7280] truncate">{item.sub}</div>
                </div>
              )}
              {!collapsed && isActive && (
                <CircleDot className="w-3 h-3 shrink-0" style={{ color: accent }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Health card */}
      {!collapsed && (
        <div className="mt-auto p-4">
          <div className="glass rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                System Health
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <Row k="Connected" v={`${metrics.connectedSystems} systems`} />
              <Row k="Sync rate" v={`${metrics.successRate}%`} highlight="#14B8A6" />
              <Row k="Conflicts" v={metrics.activeConflicts} highlight={metrics.activeConflicts ? '#F59E0B' : '#9CA3AF'} />
            </div>
          </div>
          <Link
            to="/"
            className="mt-3 flex items-center gap-2 text-[11px] text-[#9CA3AF] hover:text-white transition px-2"
            data-testid="back-to-landing-link"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to landing
          </Link>
        </div>
      )}
    </motion.aside>
  );
};

const Row = ({ k, v, highlight = '#E5E7EB' }) => (
  <div className="flex items-center justify-between text-[11px]">
    <span className="text-[#9CA3AF]">{k}</span>
    <span className="mono font-medium" style={{ color: highlight }}>
      {v}
    </span>
  </div>
);

const Topbar = ({ title, subtitle, accent }) => {
  const { metrics } = useWorkspace();
  return (
    <div className="h-14 border-b border-white/5 bg-[#0B1220]/80 backdrop-blur flex items-center px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: accent || '#14B8A6' }}
        />
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
            {subtitle}
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-6 text-[11px] mono text-[#9CA3AF]">
        <Pill label="EVENTS" value={metrics.eventsProcessed.toLocaleString()} />
        <Pill label="SYNC RATE" value={`${metrics.successRate}%`} color="#14B8A6" />
        <Pill
          label="CONFLICTS"
          value={metrics.activeConflicts}
          color={metrics.activeConflicts ? '#F59E0B' : '#9CA3AF'}
        />
        <Pill label="AVG LATENCY" value={`${metrics.avgSyncTime}ms`} />
        <button className="p-1.5 rounded hover:bg-white/5 text-[#9CA3AF] hover:text-white">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-white/5 text-[#9CA3AF] hover:text-white">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Pill = ({ label, value, color = '#E5E7EB' }) => (
  <div className="flex items-center gap-2">
    <span className="text-[#6b7280]">{label}</span>
    <span className="font-semibold" style={{ color }}>
      {value}
    </span>
  </div>
);

const Toast = () => {
  const { toast } = useWorkspace();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="fixed bottom-6 right-6 z-50 glass border rounded-xl px-5 py-4 max-w-sm flex items-start gap-3"
          style={{
            borderColor: toast.kind === 'warning' ? 'rgba(245,158,11,0.5)' : 'rgba(20,184,166,0.5)',
            boxShadow:
              toast.kind === 'warning'
                ? '0 0 30px rgba(245,158,11,0.25)'
                : '0 0 30px rgba(20,184,166,0.25)',
          }}
          data-testid="abil-toast"
        >
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{
              background:
                toast.kind === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(20,184,166,0.15)',
            }}
          >
            <Brain
              className="w-5 h-5"
              style={{ color: toast.kind === 'warning' ? '#F59E0B' : '#14B8A6' }}
            />
          </div>
          <div>
            <div className="text-[10px] mono uppercase tracking-widest text-[#9CA3AF]">
              ABIL Middleware
            </div>
            <div className="text-sm text-white font-medium mt-0.5">{toast.message}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PAGE_META = {
  sws: { title: 'Karnataka Single Window System', subtitle: 'SWS · Authoritative Registry', accent: '#2563EB' },
  abil: { title: 'ABIL Orchestration Console', subtitle: 'Live Middleware · Reconciliation Engine', accent: '#14B8A6' },
  legacy: { title: 'Legacy Government Systems', subtitle: 'Independent Departmental Portals', accent: '#F59E0B' },
  conflict: { title: 'Conflict Resolution Center', subtitle: 'Live synchronization anomalies and reconciliation workflows', accent: '#F59E0B' },
};

const WorkspaceShell = () => {
  const { activePage, setActivePage } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);

  const meta = PAGE_META[activePage];

  return (
    <div className="flex h-screen w-screen bg-[#0B1220] text-[#E5E7EB] overflow-hidden">
      <Sidebar
        active={activePage}
        setActive={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} accent={meta.accent} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {activePage === 'sws' && <SWSPortal />}
              {activePage === 'abil' && <ABILWorkspace />}
              {activePage === 'legacy' && <LegacySystems />}
              {activePage === 'conflict' && <ConflictCenter />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toast />
    </div>
  );
};

const Workspace = () => (
  <WorkspaceProvider>
    <WorkspaceShell />
  </WorkspaceProvider>
);

export default Workspace;
