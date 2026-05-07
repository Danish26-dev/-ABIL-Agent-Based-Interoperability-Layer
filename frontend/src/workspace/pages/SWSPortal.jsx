import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Save,
  X,
  Phone,
  MapPin,
  User,
  Tag,
  Hash,
  FileCheck2,
  Calendar,
  Shield,
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';

const Field = ({ label, value, onChange, editing, icon: Icon, name, mono }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-[#6b7280]">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {editing ? (
      <input
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-[#0B1220] border border-[#2563EB]/40 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-md px-3 py-2 text-sm text-white outline-none transition"
        data-testid={`sws-field-${name}`}
      />
    ) : (
      <div
        className={`px-3 py-2 rounded-md bg-[#0B1220] border border-white/5 text-sm text-[#E5E7EB] ${
          mono ? 'mono' : ''
        }`}
      >
        {value}
      </div>
    )}
  </div>
);

const TimelineEntry = ({ time, title, status, last }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div
        className={`w-3 h-3 rounded-full border-2 ${
          status === 'done'
            ? 'bg-[#14B8A6] border-[#14B8A6]'
            : status === 'active'
            ? 'bg-[#2563EB] border-[#2563EB] animate-pulse'
            : 'bg-transparent border-white/20'
        }`}
      />
      {!last && <div className="w-px flex-1 bg-white/10 mt-1" />}
    </div>
    <div className="pb-6 -mt-1">
      <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">{time}</div>
      <div className="text-sm text-white mt-0.5">{title}</div>
    </div>
  </div>
);

const SWSPortal = () => {
  const { business, updateBusiness } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(business);

  const startEdit = () => {
    setDraft(business);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const onChange = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const save = () => {
    const changes = {};
    Object.keys(draft).forEach((k) => {
      if (draft[k] !== business[k]) changes[k] = draft[k];
    });
    if (Object.keys(changes).length) {
      updateBusiness(changes);
    }
    setEditing(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" data-testid="sws-portal-page">
      {/* Government banner */}
      <div className="bg-gradient-to-r from-[#0c2461]/40 via-[#1d4ed8]/20 to-transparent border border-[#2563EB]/20 rounded-lg p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#2563EB]/15 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-[#60a5fa]" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] mono uppercase tracking-widest text-[#9CA3AF]">
            Government of Karnataka · Industries & Commerce Department
          </div>
          <h1 className="text-xl font-semibold text-white mt-0.5">
            Single Window Clearance System
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] mono">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
          <span className="text-[#14B8A6]">CITIZEN PORTAL · LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Profile */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#111827] border border-white/5 rounded-xl">
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                  Section A
                </div>
                <h2 className="text-base font-semibold text-white">Business Profile</h2>
              </div>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#60a5fa] text-xs font-medium transition border border-[#2563EB]/30"
                  data-testid="sws-edit-btn"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[#9CA3AF] text-xs transition"
                    data-testid="sws-cancel-btn"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-medium transition"
                    data-testid="sws-save-btn"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save & Synchronise
                  </button>
                </div>
              )}
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="UBID" value={editing ? draft.ubid : business.ubid} icon={Hash} name="ubid" mono editing={false} onChange={onChange} />
              <Field
                label="Business Name"
                value={editing ? draft.businessName : business.businessName}
                icon={Building2}
                name="businessName"
                editing={false}
                onChange={onChange}
              />
              <Field
                label="Owner Name"
                value={editing ? draft.ownerName : business.ownerName}
                icon={User}
                name="ownerName"
                editing={editing}
                onChange={onChange}
              />
              <Field
                label="Phone"
                value={editing ? draft.phone : business.phone}
                icon={Phone}
                name="phone"
                editing={editing}
                onChange={onChange}
                mono
              />
              <div className="md:col-span-2">
                <Field
                  label="Registered Address"
                  value={editing ? draft.address : business.address}
                  icon={MapPin}
                  name="address"
                  editing={editing}
                  onChange={onChange}
                />
              </div>
              <Field
                label="Category"
                value={editing ? draft.category : business.category}
                icon={Tag}
                name="category"
                editing={editing}
                onChange={onChange}
              />
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-[#6b7280]">
                  <Shield className="w-3 h-3" />
                  Approval Status
                </label>
                <div className="px-3 py-2 rounded-md bg-[#14B8A6]/10 border border-[#14B8A6]/30 text-sm text-[#14B8A6] mono font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {business.approvalStatus}
                </div>
              </div>
            </div>
          </section>

          {/* Approvals timeline */}
          <section className="bg-[#111827] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-[#60a5fa]" />
              <h2 className="text-base font-semibold text-white">Approvals Timeline</h2>
            </div>
            <div className="ml-1">
              <TimelineEntry time="14 MAR 2021" title="Initial UBID issued" status="done" />
              <TimelineEntry
                time="22 MAR 2021"
                title="BESCOM electrical sanction completed"
                status="done"
              />
              <TimelineEntry
                time="04 APR 2021"
                title="KSPCB consent (Orange category) granted"
                status="done"
              />
              <TimelineEntry
                time="11 APR 2021"
                title="Labour department registration"
                status="done"
              />
              <TimelineEntry time="LIVE" title="ABIL synchronization layer active" status="active" last />
            </div>
          </section>
        </div>

        {/* Action panel */}
        <aside className="space-y-6">
          <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
            <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-3">
              Approval Status
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#14B8A6]/15 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <div>
                <div className="text-white font-semibold">Operational</div>
                <div className="text-[#9CA3AF] text-xs">All clearances active</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
            <div className="text-[10px] mono uppercase tracking-widest text-[#6b7280] mb-3">
              Connected Departments
            </div>
            <div className="space-y-2">
              {[
                { code: 'BES', label: 'BESCOM', state: 'In sync' },
                { code: 'KSP', label: 'KSPCB', state: 'In sync' },
                { code: 'LAB', label: 'Labour Dept', state: 'In sync' },
              ].map((d) => (
                <div
                  key={d.code}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-[#0B1220] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#2563EB]/10 text-[#60a5fa] text-[10px] mono font-semibold flex items-center justify-center">
                      {d.code}
                    </div>
                    <span className="text-sm text-[#E5E7EB]">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mono text-[#14B8A6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                    {d.state}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2563EB]/10 to-[#14B8A6]/5 border border-[#2563EB]/20 rounded-xl p-5">
            <div className="text-[10px] mono uppercase tracking-widest text-[#60a5fa] mb-2">
              How synchronization works
            </div>
            <p className="text-[13px] text-[#E5E7EB] leading-relaxed">
              When you save changes here, ABIL captures the delta, evaluates priority, translates the
              schema, and propagates the update to BESCOM, KSPCB and Labour Department — without
              modifying any of those legacy systems.
            </p>
            <div className="mt-3 text-[11px] mono text-[#14B8A6] flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Try editing the address to watch ABIL react
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SWSPortal;
