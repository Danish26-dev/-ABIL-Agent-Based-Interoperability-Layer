import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Factory,
  Users,
  Edit3,
  Save,
  X,
  Plug,
  Wind,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';

const TABS = [
  {
    id: 'bescom',
    label: 'BESCOM',
    sub: 'Bangalore Electricity Supply Co.',
    icon: Zap,
    accent: '#F59E0B',
    style: 'utility',
  },
  {
    id: 'kspcb',
    label: 'KSPCB',
    sub: 'Karnataka State Pollution Control Board',
    icon: Wind,
    accent: '#14B8A6',
    style: 'pcb',
  },
  {
    id: 'labour',
    label: 'Labour Department',
    sub: 'Government of Karnataka',
    icon: Briefcase,
    accent: '#60a5fa',
    style: 'labour',
  },
];

const Row = ({ label, value, name, editing, onChange, mono = false }) => (
  <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-3 border-b border-white/5 last:border-b-0">
    <div className="text-[11px] mono uppercase tracking-widest text-[#6b7280] pt-2">{label}</div>
    {editing ? (
      <input
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-[#0B1220] border border-[#2563EB]/40 focus:border-[#2563EB] rounded-md px-3 py-1.5 text-sm text-white outline-none"
        data-testid={`legacy-field-${name}`}
      />
    ) : (
      <div className={`text-sm text-[#E5E7EB] py-1.5 ${mono ? 'mono' : ''}`}>{value}</div>
    )}
  </div>
);

const BescomView = ({ data, editing, onChange }) => (
  <div className="bg-gradient-to-br from-[#FCD34D]/5 via-transparent to-transparent border-2 border-[#F59E0B]/20 rounded-md">
    <div className="px-6 py-4 bg-[#F59E0B]/10 border-b-2 border-[#F59E0B]/20 flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-[#F59E0B]/20 flex items-center justify-center">
        <Plug className="w-5 h-5 text-[#F59E0B]" />
      </div>
      <div>
        <div className="text-[10px] mono uppercase tracking-widest text-[#9CA3AF]">
          Government of Karnataka · Energy Department
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          BESCOM Enterprise Utility Portal
        </h3>
      </div>
      <span className="ml-auto text-[10px] mono px-2 py-1 rounded bg-[#F59E0B]/15 text-[#F59E0B] uppercase tracking-widest">
        Legacy v2.4
      </span>
    </div>
    <div className="px-6 py-4">
      <Row label="UBID" value={data.ubid} name="ubid" mono editing={false} onChange={onChange} />
      <Row
        label="Account Number"
        value={data.accountNumber}
        name="accountNumber"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="Consumer Address"
        value={data.consumerAddress}
        name="consumerAddress"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Sanctioned Power Load"
        value={data.powerLoad}
        name="powerLoad"
        editing={editing}
        onChange={onChange}
        mono
      />
      <Row
        label="Connection Status"
        value={data.connectionStatus}
        name="connectionStatus"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Sanction Date"
        value={data.sanctionDate}
        name="sanctionDate"
        editing={false}
        onChange={onChange}
        mono
      />
    </div>
  </div>
);

const KspcbView = ({ data, editing, onChange }) => (
  <div className="bg-[#0B1220] border border-[#14B8A6]/20 rounded-lg overflow-hidden">
    <div className="px-6 py-5 border-b border-[#14B8A6]/20 bg-gradient-to-r from-[#14B8A6]/10 to-transparent">
      <div className="text-[10px] mono uppercase tracking-widest text-[#14B8A6]">
        KSPCB · Industrial Pollution Control Cell
      </div>
      <h3 className="text-xl font-light text-white mt-1">
        Karnataka State Pollution Control Board
      </h3>
      <div className="text-[#9CA3AF] text-xs mt-0.5">
        Consent Management System · Established 1974
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 px-6 py-5">
      <Row
        label="Enterprise ID"
        value={data.enterpriseId}
        name="enterpriseId"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="Pollution Category"
        value={data.pollutionCategory}
        name="pollutionCategory"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Facility Address"
        value={data.facilityAddress}
        name="facilityAddress"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Consent Validity"
        value={data.consentValidity}
        name="consentValidity"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="Effluent Discharge"
        value={data.effluentDischarge}
        name="effluentDischarge"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Last Inspection"
        value={data.lastInspection}
        name="lastInspection"
        mono
        editing={false}
        onChange={onChange}
      />
    </div>
  </div>
);

const LabourView = ({ data, editing, onChange }) => (
  <div className="bg-[#0B1220] border border-[#60a5fa]/20 rounded-sm">
    {/* Govt of Karnataka strip */}
    <div className="bg-[#1d4ed8] px-6 py-2 text-[10px] mono uppercase tracking-widest text-white flex items-center justify-between">
      <span>Government of Karnataka</span>
      <span>Department of Labour</span>
    </div>
    <div className="px-6 py-5 border-b border-white/5">
      <h3 className="text-lg font-semibold text-white">
        Labour Department Establishment Portal
      </h3>
      <div className="text-[#9CA3AF] text-xs mt-0.5">
        Karnataka Shops & Commercial Establishments Act · 1961
      </div>
    </div>
    <div className="px-6 py-2">
      <Row
        label="Establishment ID"
        value={data.establishmentId}
        name="establishmentId"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="Registered Address"
        value={data.registeredAddress}
        name="registeredAddress"
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="Total Employees"
        value={data.employeeCount}
        name="employeeCount"
        mono
        editing={editing}
        onChange={onChange}
      />
      <Row
        label="PF Registration"
        value={data.pfRegistration}
        name="pfRegistration"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="ESI Code"
        value={data.esiCode}
        name="esiCode"
        mono
        editing={false}
        onChange={onChange}
      />
      <Row
        label="Last Return Filed"
        value={data.lastReturnFiled}
        name="lastReturnFiled"
        mono
        editing={false}
        onChange={onChange}
      />
    </div>
  </div>
);

const LegacySystems = () => {
  const { legacy, updateLegacy, triggerDemoConflict } = useWorkspace();
  const [active, setActive] = useState('bescom');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(legacy);

  const tab = TABS.find((t) => t.id === active);

  const startEdit = () => {
    setDraft(legacy);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const onChange = (k, v) =>
    setDraft((d) => ({ ...d, [active]: { ...d[active], [k]: v } }));

  const save = () => {
    const before = legacy[active];
    const after = draft[active];
    const patch = {};
    Object.keys(after).forEach((k) => {
      if (after[k] !== before[k]) patch[k] = after[k];
    });
    if (Object.keys(patch).length) {
      updateLegacy(active, patch);
    }
    setEditing(false);
  };

  return (
    <div className="p-6" data-testid="legacy-systems-page">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex bg-[#111827] border border-white/5 rounded-lg p-1 gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActive(t.id);
                  setEditing(false);
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-[#9CA3AF] hover:text-white'
                }`}
                data-testid={`legacy-tab-${t.id}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="legacyTabBg"
                    className="absolute inset-0 rounded-md"
                    style={{ background: `${t.accent}1f`, border: `1px solid ${t.accent}55` }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" style={{ color: isActive ? t.accent : '#9CA3AF' }} />
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={triggerDemoConflict}
            className="px-3 py-2 rounded-md bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-medium transition flex items-center gap-2"
            data-testid="legacy-simulate-conflict-btn"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate Conflict
          </button>
          {!editing ? (
            <button
              onClick={startEdit}
              className="px-3 py-2 rounded-md bg-[#2563EB]/15 hover:bg-[#2563EB]/25 border border-[#2563EB]/40 text-[#60a5fa] text-xs font-medium transition flex items-center gap-2"
              data-testid="legacy-edit-btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={cancel}
                className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-[#9CA3AF] text-xs transition flex items-center gap-2"
                data-testid="legacy-cancel-btn"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={save}
                className="px-3 py-2 rounded-md bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-medium transition flex items-center gap-2"
                data-testid="legacy-save-btn"
              >
                <Save className="w-3.5 h-3.5" />
                Save & Trigger Sync
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-[#9CA3AF] text-xs mb-4 mono">
        {tab.sub} · Schema heterogeneity intentional · ABIL reconciles across formats.
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {active === 'bescom' && (
          <BescomView data={editing ? draft.bescom : legacy.bescom} editing={editing} onChange={onChange} />
        )}
        {active === 'kspcb' && (
          <KspcbView data={editing ? draft.kspcb : legacy.kspcb} editing={editing} onChange={onChange} />
        )}
        {active === 'labour' && (
          <LabourView data={editing ? draft.labour : legacy.labour} editing={editing} onChange={onChange} />
        )}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Hint
          color="#F59E0B"
          icon={Zap}
          title="BESCOM"
          text="Power load is BESCOM-authoritative. Address syncs are mediated by ABIL."
        />
        <Hint
          color="#14B8A6"
          icon={Factory}
          title="KSPCB"
          text="Pollution category is KSPCB-authoritative. Conflicts on address are auto-resolved."
        />
        <Hint
          color="#60a5fa"
          icon={Users}
          title="Labour"
          text="Employee count is Labour-authoritative. Address mirrors SWS golden record."
        />
      </div>
    </div>
  );
};

const Hint = ({ color, icon: Icon, title, text }) => (
  <div
    className="bg-[#111827] border rounded-lg p-4"
    style={{ borderColor: `${color}33` }}
  >
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-sm font-semibold text-white">{title}</span>
    </div>
    <div className="text-[12px] text-[#9CA3AF] leading-relaxed">{text}</div>
  </div>
);

export default LegacySystems;
