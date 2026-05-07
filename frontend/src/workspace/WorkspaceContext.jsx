import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const WorkspaceContext = createContext(null);

const initialBusiness = {
  ubid: 'KA-1023-7841',
  businessName: 'Kaveri Industries Pvt. Ltd.',
  ownerName: 'Rajesh Kumar Shetty',
  address: 'No. 47, Industrial Estate, Peenya, Bangalore, Karnataka - 560058',
  phone: '+91 80 4567 8901',
  category: 'Medium Manufacturing',
  approvalStatus: 'APPROVED',
};

const initialLegacy = {
  bescom: {
    ubid: 'KA-1023-7841',
    consumerAddress: 'No. 47, Industrial Estate, Peenya, Bangalore, Karnataka - 560058',
    powerLoad: '125 kW',
    connectionStatus: 'Active',
    sanctionDate: '2021-03-14',
    accountNumber: 'BES-2278813',
  },
  kspcb: {
    enterpriseId: 'KA-1023-7841',
    facilityAddress: 'No. 47, Industrial Estate, Peenya, Bengaluru, Karnataka',
    pollutionCategory: 'Orange',
    consentValidity: '2026-12-31',
    effluentDischarge: 'Within Limits',
    lastInspection: '2024-09-22',
  },
  labour: {
    establishmentId: 'KA-1023-7841',
    registeredAddress: 'No. 47, Industrial Estate, Peenya, Bangalore - 560058',
    employeeCount: 78,
    pfRegistration: 'KN/BNG/0046721',
    esiCode: '53-12345-678',
    lastReturnFiled: '2025-01-15',
  },
};

const POLICY = {
  address: 'sws',
  phone: 'sws',
  ownerName: 'sws',
  category: 'sws',
  powerLoad: 'bescom',
  pollutionCategory: 'kspcb',
  employeeCount: 'labour',
};

const AGENT_DEFS = [
  { id: 'listener', name: 'Listener Agent', role: 'Monitors system events and detects state changes' },
  { id: 'decision', name: 'Decision Agent', role: 'Evaluates synchronization priority and routing' },
  { id: 'translation', name: 'Translation Agent', role: 'Schema mapping and data transformation' },
  { id: 'sync', name: 'Sync Agent', role: 'Bidirectional propagation across systems' },
  { id: 'conflict', name: 'Conflict Resolution Agent', role: 'Detects and resolves data conflicts' },
  { id: 'audit', name: 'Audit Agent', role: 'Records every event for compliance trail' },
];

const SEED_CONFLICTS = [
  {
    id: 'CFL-1023',
    ubid: 'KA-1023-7841',
    field: 'address',
    fieldLabel: 'Registered Address',
    systems: ['sws', 'bescom'],
    sources: {
      sws: 'No. 47, Industrial Estate, Peenya, Bangalore - 560058',
      bescom: 'No. 47, Industrial Estate, Peenya, Bengaluru - 560058',
    },
    timestamps: { sws: 'Today 12:31:04', bescom: 'Today 12:31:07' },
    deltaSeconds: 3,
    origin: 'sws',
    severity: 'medium',
    status: 'pending',
    resolved: false,
    detectedAt: 'Today 12:31:08',
    note: 'City spelling divergence — Bangalore vs Bengaluru.',
  },
  {
    id: 'CFL-1019',
    ubid: 'KA-0987-3122',
    field: 'employeeCount',
    fieldLabel: 'Employee Count',
    systems: ['sws', 'labour'],
    sources: { sws: '54', labour: '78' },
    timestamps: { sws: 'Yesterday 18:02', labour: 'Today 09:14' },
    deltaSeconds: 54720,
    origin: 'labour',
    severity: 'high',
    status: 'manual_review',
    resolved: false,
    detectedAt: 'Today 09:14:21',
    note: 'Headcount divergence exceeds 30% threshold — escalated to operator review.',
  },
  {
    id: 'CFL-1014',
    ubid: 'KA-1023-7841',
    field: 'powerLoad',
    fieldLabel: 'Sanctioned Power Load',
    systems: ['sws', 'bescom'],
    sources: { sws: '110 kW', bescom: '125 kW' },
    timestamps: { sws: '02 Feb 14:22', bescom: '02 Feb 14:22' },
    deltaSeconds: 0,
    origin: 'bescom',
    severity: 'low',
    status: 'resolved',
    resolved: true,
    authoritative: 'bescom',
    detectedAt: '02 Feb 14:22:30',
    resolvedAt: '02 Feb 14:22:34',
    note: 'BESCOM authoritative for power load — auto-reconciled.',
  },
  {
    id: 'CFL-1011',
    ubid: 'KA-2210-6603',
    field: 'pollutionCategory',
    fieldLabel: 'Pollution Category',
    systems: ['sws', 'kspcb'],
    sources: { sws: 'Green', kspcb: 'Orange' },
    timestamps: { sws: '01 Feb 11:08', kspcb: '01 Feb 11:09' },
    deltaSeconds: 41,
    origin: 'kspcb',
    severity: 'medium',
    status: 'resolved',
    resolved: true,
    authoritative: 'kspcb',
    detectedAt: '01 Feb 11:09:11',
    resolvedAt: '01 Feb 11:09:18',
    note: 'KSPCB authoritative for pollution categorisation.',
  },
];

export const WorkspaceProvider = ({ children }) => {
  const [business, setBusiness] = useState(initialBusiness);
  const [legacy, setLegacy] = useState(initialLegacy);
  const [events, setEvents] = useState([]);
  const [agentStates, setAgentStates] = useState(() =>
    AGENT_DEFS.reduce((acc, a) => ({ ...acc, [a.id]: { status: 'idle', message: 'Standing by' } }), {})
  );
  const [activeConflict, setActiveConflict] = useState(null);
  const [conflicts, setConflicts] = useState(SEED_CONFLICTS);
  const [activePage, setActivePage] = useState('sws');
  const [metrics, setMetrics] = useState({
    connectedSystems: 4,
    eventsProcessed: 1284,
    successRate: 99.2,
    activeConflicts: SEED_CONFLICTS.filter((c) => !c.resolved).length,
    avgSyncTime: 184,
    resolvedToday: 12,
    escalated: SEED_CONFLICTS.filter((c) => c.status === 'manual_review').length,
    avgResolutionMs: 1420,
  });
  const [toast, setToast] = useState(null);
  const evIdRef = useRef(0);

  const fireToast = useCallback((message, kind = 'info') => {
    setToast({ id: Date.now(), message, kind });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const pushEvent = useCallback((label, kind = 'info', source = 'ABIL') => {
    evIdRef.current += 1;
    const ev = {
      id: evIdRef.current,
      label,
      kind,
      source,
      time: new Date().toLocaleTimeString('en-GB'),
    };
    setEvents((prev) => [ev, ...prev].slice(0, 50));
    return ev;
  }, []);

  const updateAgent = (id, status, message) => {
    setAgentStates((prev) => ({ ...prev, [id]: { status, message } }));
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Run the orchestration pipeline when any system field is changed
  const runSyncPipeline = useCallback(
    async ({ field, newValue, sourceSystem, conflict = null }) => {
      // 1. Listener
      updateAgent('listener', 'active', `Detected ${field} change in ${sourceSystem.toUpperCase()}`);
      pushEvent(`${sourceSystem.toUpperCase()} update detected: ${field}`, 'info', sourceSystem);
      fireToast('ABIL detected synchronization event', 'info');
      await sleep(100);

      // 2. Decision
      updateAgent('decision', 'processing', `Evaluating priority for ${field}`);
      pushEvent(`Decision: priority HIGH for ${field}`, 'info');
      await sleep(100);

      // 3. Translation
      updateAgent('translation', 'processing', 'Schema mapping in progress');
      pushEvent('Translation complete: schema normalised', 'sync');
      await sleep(80);

      // 4. Conflict check
      let conflictRecord = null;
      if (conflict) {
        updateAgent('conflict', 'warning', `Conflict on ${field}`);
        pushEvent(`Conflict detected on ${field}`, 'warning');
        setActiveConflict(conflict);
        setMetrics((m) => ({ ...m, activeConflicts: m.activeConflicts + 1 }));
        fireToast(`Conflict detected on ${field}`, 'warning');

        // Push to conflict history
        const cflId = `CFL-${1024 + (evIdRef.current % 1000)}`;
        conflictRecord = {
          id: cflId,
          ubid: business.ubid,
          field,
          fieldLabel: field,
          systems: Object.keys(conflict.sources),
          sources: conflict.sources,
          timestamps: conflict.timestamps || {},
          deltaSeconds: 3,
          origin: sourceSystem,
          severity: 'medium',
          status: 'pending',
          resolved: false,
          detectedAt: new Date().toLocaleTimeString('en-GB'),
          note: `${field} divergence between ${Object.keys(conflict.sources).map((s) => s.toUpperCase()).join(' & ')}.`,
        };
        setConflicts((prev) => [conflictRecord, ...prev]);

        await sleep(200);

        // Apply policy
        const authoritative = POLICY[field] || 'sws';
        pushEvent(`Resolution policy applied: ${authoritative.toUpperCase()} authoritative`, 'sync');
        updateAgent('conflict', 'active', 'Resolution applied');
        await sleep(80);
        setMetrics((m) => ({
          ...m,
          activeConflicts: Math.max(0, m.activeConflicts - 1),
          resolvedToday: m.resolvedToday + 1,
        }));
        setActiveConflict((c) => (c ? { ...c, resolved: true, authoritative } : null));
        setConflicts((prev) =>
          prev.map((c) =>
            c.id === conflictRecord.id
              ? {
                  ...c,
                  status: 'resolved',
                  resolved: true,
                  authoritative,
                  resolvedAt: new Date().toLocaleTimeString('en-GB'),
                }
              : c
          )
        );
      }

      // 5. Sync
      updateAgent('sync', 'running', 'Propagating to legacy systems');
      pushEvent('Sync Agent: BESCOM updated', 'sync');
      await sleep(80);
      pushEvent('Sync Agent: KSPCB updated', 'sync');
      await sleep(80);
      pushEvent('Sync Agent: Labour Department updated', 'sync');
      await sleep(80);

      // 6. Audit
      updateAgent('audit', 'active', `Recorded event #${1000 + evIdRef.current}`);
      pushEvent(`Audit recorded event #${1000 + evIdRef.current}`, 'info');

      setMetrics((m) => ({
        ...m,
        eventsProcessed: m.eventsProcessed + 1,
        avgSyncTime: Math.round((m.avgSyncTime * 9 + (180 + Math.random() * 80)) / 10),
      }));

      // Settle agents back to idle
      await sleep(150);
      ['listener', 'decision', 'translation', 'sync', 'audit'].forEach((id) =>
        updateAgent(id, 'idle', 'Standing by')
      );
      if (!conflict) updateAgent('conflict', 'idle', 'No conflicts');
    },
    [fireToast, pushEvent]
  );

  const updateBusiness = useCallback(
    (patch) => {
      const field = Object.keys(patch)[0];
      const newValue = patch[field];

      // Immediate UI update for instant feedback
      setBusiness((prev) => ({ ...prev, ...patch }));
      
      // Immediately propagate to legacy where SWS is authoritative
      setLegacy((prev) => ({
        ...prev,
        bescom: { ...prev.bescom, consumerAddress: patch.address ?? prev.bescom.consumerAddress },
        kspcb: { ...prev.kspcb, facilityAddress: patch.address ?? prev.kspcb.facilityAddress },
        labour: { ...prev.labour, registeredAddress: patch.address ?? prev.labour.registeredAddress },
      }));

      // Start pipeline animation immediately (non-blocking)
      runSyncPipeline({ field, newValue, sourceSystem: 'sws' });

      // Call backend API in background (don't await)
      fetch(`${API_URL}/api/systems/sws/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ubid: initialBusiness.ubid,
          patch,
        }),
      })
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error('Failed to update SWS');
        })
        .then((_result) =>
          fetch(`${API_URL}/api/systems`).then((r) => r.json())
        )
        .then((state) => {
          // Update canonical (SWS) with backend state
          setBusiness((prev) => ({
            ...prev,
            address: state.canonical.address || prev.address,
            businessName: state.canonical.businessName || prev.businessName,
          }));

          // Update all systems with backend state
          setLegacy({
            bescom: {
              ubid: state.systems.bescom.ubid,
              consumerAddress: state.systems.bescom.data.consumerAddress || '',
              powerLoad: state.systems.bescom.data.powerLoad || '',
              connectionStatus: state.systems.bescom.data.connectionStatus || 'Active',
              sanctionDate: state.systems.bescom.data.sanctionDate || '2021-03-14',
              accountNumber: state.systems.bescom.data.accountNumber || '',
            },
            kspcb: {
              enterpriseId: state.systems.kspcb.ubid,
              facilityAddress: state.systems.kspcb.data.facilityAddress || '',
              pollutionCategory: state.systems.kspcb.data.pollutionCategory || '',
              consentValidity: state.systems.kspcb.data.consentValidity || '2026-12-31',
              effluentDischarge: state.systems.kspcb.data.effluentDischarge || '',
              lastInspection: state.systems.kspcb.data.lastInspection || '',
            },
            labour: {
              establishmentId: state.systems.labour.ubid,
              registeredAddress: state.systems.labour.data.registeredAddress || '',
              employeeCount: state.systems.labour.data.employeeCount || 0,
              pfRegistration: state.systems.labour.data.pfRegistration || '',
              esiCode: state.systems.labour.data.esiCode || '',
              lastReturnFiled: state.systems.labour.data.lastReturnFiled || '',
            },
          });
        })
        .catch((error) => console.error('Backend sync error:', error));
    },
    [runSyncPipeline]
  );

  const updateLegacy = useCallback(
    (system, patch) => {
      const field = Object.keys(patch)[0];
      const newValue = patch[field];

      // Immediate UI update for instant feedback
      setLegacy((prev) => ({ ...prev, [system]: { ...prev[system], ...patch } }));

      // Map field names to backend API format
      const fieldMapping = {
        consumerAddress: 'address',
        facilityAddress: 'address',
        registeredAddress: 'address',
        powerLoad: 'powerLoad',
        pollutionCategory: 'pollutionCategory',
        employeeCount: 'employeeCount',
      };

      const backendField = fieldMapping[field] || field;

      // Start pipeline animation immediately (non-blocking)
      runSyncPipeline({
        field: backendField,
        newValue,
        sourceSystem: system,
      });

      fetch(`${API_URL}/api/systems/${system}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ubid: business.ubid,
          patch: { [backendField]: newValue },
          origin: system,
        }),
      })
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error(`Failed to update ${system}`);
        })
        .then((_result) =>
          fetch(`${API_URL}/api/systems`).then((r) => r.json())
        )
        .then((state) => {
          // Update canonical (SWS) with backend state
          setBusiness((prev) => ({
            ...prev,
            address: state.canonical.address || prev.address,
            businessName: state.canonical.businessName || prev.businessName,
          }));

          // Update all systems with backend state
          setLegacy({
            bescom: {
              ubid: state.systems.bescom.ubid,
              consumerAddress: state.systems.bescom.data.consumerAddress || '',
              powerLoad: state.systems.bescom.data.powerLoad || '',
              connectionStatus: state.systems.bescom.data.connectionStatus || 'Active',
              sanctionDate: state.systems.bescom.data.sanctionDate || '2021-03-14',
              accountNumber: state.systems.bescom.data.accountNumber || '',
            },
            kspcb: {
              enterpriseId: state.systems.kspcb.ubid,
              facilityAddress: state.systems.kspcb.data.facilityAddress || '',
              pollutionCategory: state.systems.kspcb.data.pollutionCategory || '',
              consentValidity: state.systems.kspcb.data.consentValidity || '2026-12-31',
              effluentDischarge: state.systems.kspcb.data.effluentDischarge || '',
              lastInspection: state.systems.kspcb.data.lastInspection || '',
            },
            labour: {
              establishmentId: state.systems.labour.ubid,
              registeredAddress: state.systems.labour.data.registeredAddress || '',
              employeeCount: state.systems.labour.data.employeeCount || 0,
              pfRegistration: state.systems.labour.data.pfRegistration || '',
              esiCode: state.systems.labour.data.esiCode || '',
              lastReturnFiled: state.systems.labour.data.lastReturnFiled || '',
            },
          });
        })
        .catch((error) => console.error('Backend sync error:', error));
    },
    [business.ubid, runSyncPipeline]
  );

  const triggerDemoConflict = () => {
    const conflict = {
      field: 'address',
      sources: {
        sws: 'Bangalore, Karnataka',
        bescom: 'Bengaluru, Karnataka',
      },
      timestamps: {
        sws: 'Today 12:31',
        bescom: 'Today 12:33',
      },
    };
    runSyncPipeline({
      field: 'address',
      newValue: 'Bengaluru, Karnataka',
      sourceSystem: 'bescom',
      conflict,
    });
  };

  const syncConflictsFromBackend = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/conflicts`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          // Map backend conflicts to frontend format
          const mappedConflicts = data.items.map((c) => ({
            id: c.id,
            ubid: c.ubid,
            field: c.field,
            fieldLabel: c.fieldLabel,
            systems: [c.source, c.target],
            sources: c.systemValues,
            timestamps: c.timestamps,
            origin: c.origin,
            severity: c.severity,
            status: c.status,
            resolved: c.resolved,
            authoritative: c.authoritative,
            detectedAt: c.detectedAt,
            resolvedAt: c.resolvedAt,
            note: c.note,
          }));
          setConflicts(mappedConflicts);
          setMetrics((m) => ({
            ...m,
            activeConflicts: mappedConflicts.filter((c) => !c.resolved).length,
          }));
        }
      }
    } catch (error) {
      console.error('Error syncing conflicts from backend:', error);
    }
  }, []);

  const dismissConflict = () => setActiveConflict(null);

  const replayConflict = useCallback(
    (conflict) => {
      // Re-run the pipeline animation against the existing conflict record
      runSyncPipeline({
        field: conflict.field,
        newValue: conflict.sources[conflict.origin],
        sourceSystem: conflict.origin,
        conflict: {
          field: conflict.field,
          sources: conflict.sources,
          timestamps: conflict.timestamps,
        },
      });
      fireToast(`Replaying ${conflict.id}…`, 'info');
    },
    [runSyncPipeline, fireToast]
  );

  const resolveConflictManually = (conflictId, authoritative) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? {
              ...c,
              status: 'resolved',
              resolved: true,
              authoritative,
              resolvedAt: new Date().toLocaleTimeString('en-GB'),
            }
          : c
      )
    );
    setMetrics((m) => ({
      ...m,
      activeConflicts: Math.max(0, m.activeConflicts - 1),
      resolvedToday: m.resolvedToday + 1,
      escalated: Math.max(0, m.escalated - 1),
    }));
    pushEvent(`Manual resolution applied to ${conflictId} → ${authoritative.toUpperCase()}`, 'sync');
    fireToast(`${conflictId} resolved manually`, 'info');
  };

  const escalateConflict = (conflictId) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'manual_review' } : c))
    );
    setMetrics((m) => ({ ...m, escalated: m.escalated + 1 }));
    fireToast(`${conflictId} escalated for manual review`, 'warning');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        business,
        legacy,
        events,
        agents: AGENT_DEFS.map((a) => ({ ...a, ...agentStates[a.id] })),
        agentStates,
        activeConflict,
        conflicts,
        metrics,
        toast,
        policy: POLICY,
        activePage,
        setActivePage,
        updateBusiness,
        updateLegacy,
        triggerDemoConflict,
        dismissConflict,
        replayConflict,
        resolveConflictManually,
        escalateConflict,
        syncConflictsFromBackend,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};
