import { randomUUID } from 'node:crypto';

import { enqueueEvent, publishBusEvent } from './eventBus';
import { store } from '../store/memoryStore';
import {
  AgentLifecycleEvent,
  ConflictRecord,
  OrchestrationInput,
  SyncEvent,
  SystemName,
} from '../domain/types';
import { isoNow, nextId } from '../utils/ids';
import { listenerAgent } from '../agents/listener';
import { decisionAgent } from '../agents/decision';
import { translationAgent } from '../agents/translation';
import { conflictAgent } from '../agents/conflict';
import { syncAgent } from '../agents/sync';
import { auditAgent } from '../agents/audit';

const fieldTargets: Record<string, SystemName[]> = {
  address: ['bescom', 'kspcb', 'labour'],
  businessName: ['bescom', 'kspcb', 'labour'],
  owner: ['bescom', 'kspcb', 'labour'],
  phone: ['bescom', 'kspcb', 'labour'],
  category: ['bescom', 'kspcb', 'labour'],
  powerLoad: ['bescom'],
  pollutionCategory: ['kspcb'],
  employeeCount: ['labour'],
};

/**
 * Enhanced orchestration using Strands agents
 * Each agent runs with Bedrock reasoning, falls back to deterministic
 */
export const orchestrateChangeWithStrands = async (input: OrchestrationInput) => {
  const eventId = `evt_${randomUUID().slice(0, 8)}`;
  const source = input.system;
  const origin = input.origin ?? input.system;

  console.log(`[Orchestrator] Starting Strands pipeline for event ${eventId}`);

  try {
    // 1. LISTENER AGENT: Validate and normalize
    const listenerResult = await listenerAgent.execute({
      agentName: 'listener',
      payload: {
        systemPayload: input.patch,
        sourceSystem: source,
      },
    });

    if (!listenerResult.data.isValid) {
      console.warn(`[Listener] Event rejected: ${listenerResult.data.issues.join(', ')}`);
      return { error: 'Invalid event', details: listenerResult.data.issues };
    }

    if (listenerResult.data.isDuplicate) {
      console.log(`[Listener] Duplicate event detected, skipping`);
      return { error: 'Duplicate event', deduplicated: true };
    }

    const normalizedEvent = listenerResult.data.normalizedEvent;
    const field = Object.keys(input.patch)[0] ?? 'unknown';
    const canonicalPatch = canonicalize(input.patch);

    // 2. DECISION AGENT: Determine routing
    const decisionResult = await decisionAgent.execute({
      agentName: 'decision',
      payload: {
        normalizedEvent,
        field,
        source,
      },
    });

    if (!decisionResult.data.shouldPropagate) {
      console.log(`[Decision] Change blocked by policy`);
      return { error: 'Blocked by policy' };
    }

    const targetSystems = decisionResult.data.targetSystems;

    // 3. TRANSLATION AGENT: Convert to canonical
    const translationResult = await translationAgent.execute({
      agentName: 'translation',
      payload: {
        canonicalPatch,
        targetSystem: source,
      },
    });

    // 4. CONFLICT AGENT: Detect conflicts
    const proposedValue = canonicalPatch[field];
    const conflictResult = await conflictAgent.execute({
      agentName: 'conflict',
      payload: {
        ubid: input.ubid,
        field,
        targetSystem: source,
        proposedValue,
      },
    });

    if (conflictResult.data.conflictDetected) {
      console.log(`[Conflict] Detected: ${conflictResult.data.severity} severity`);
      // Continue with conflict handling
    }

    // 5. SYNC AGENT: Apply changes
    const syncResult = await syncAgent.execute({
      agentName: 'sync',
      payload: {
        ubid: input.ubid,
        field,
        targetSystem: source,
        translatedPatch: translationResult.data.translatedPatch,
        proposedValue,
      },
    });

    // 6. AUDIT AGENT: Record trail
    const auditResult = await auditAgent.execute({
      agentName: 'audit',
      payload: {
        ubid: input.ubid,
        field,
        sourceSystem: source,
        targetSystem: targetSystems[0] || 'unknown',
        proposedValue,
        eventId,
      },
    });

    console.log(`[Orchestrator] Strands pipeline completed successfully`);

    // CRITICAL: Apply changes to store (sync agent verified it's safe)
    if (syncResult.data.applied !== false) {
      store.canonical = {
        ...store.canonical,
        ...canonicalPatch,
        updatedAt: isoNow(),
        version: store.canonical.version + 1,
        origin,
      };

      applyCanonicalToSource(source, canonicalPatch);
      const updatedTargets = applyCanonicalToTargets(targetSystems, canonicalPatch);

      publishBusEvent('sync-completed', {
        eventId,
        field,
        source,
        targets: updatedTargets,
        canonical: store.canonical,
      });

      return {
        success: true,
        eventId,
        field,
        source,
        targetSystems: updatedTargets,
        agentModes: {
          listener: listenerResult.mode,
          decision: decisionResult.mode,
          translation: translationResult.mode,
          conflict: conflictResult.mode,
          sync: syncResult.mode,
          audit: auditResult.mode,
        },
        reasoning: {
          listener: listenerResult.reasoning,
          decision: decisionResult.reasoning,
          conflict: conflictResult.reasoning,
          sync: syncResult.reasoning,
          audit: auditResult.reasoning,
        },
        canonical: store.canonical,
        updatedTargets,
      };
    }

    // If sync agent blocked, return conflict
    if (conflictResult.data.conflictDetected) {
      const conflict = createConflict(input, {
        eventId,
        source,
        origin,
        target: targetSystems,
        ubid: input.ubid,
        field,
        oldValue: store.canonical[field as keyof typeof store.canonical],
        newValue: proposedValue,
        timestamp: isoNow(),
        version: store.canonical.version + 1,
      }, source);

      return {
        success: false,
        eventId,
        field,
        source,
        targetSystems: [],
        conflict,
        canonical: store.canonical,
      };
    }

    return {
      success: true,
      eventId,
      field,
      source,
      targetSystems,
      agentModes: {
        listener: listenerResult.mode,
        decision: decisionResult.mode,
        translation: translationResult.mode,
        conflict: conflictResult.mode,
        sync: syncResult.mode,
        audit: auditResult.mode,
      },
      reasoning: {
        listener: listenerResult.reasoning,
        decision: decisionResult.reasoning,
        conflict: conflictResult.reasoning,
        sync: syncResult.reasoning,
        audit: auditResult.reasoning,
      },
      canonical: store.canonical,
    };
  } catch (error) {
    console.error(`[Orchestrator] Strands pipeline failed, falling back to deterministic:`, error);
    return orchestrateChange(input);
  }
};

const canonicalize = (patch: Record<string, unknown>) => {
  const canonicalPatch: Record<string, unknown> = {};

  if (patch.address !== undefined) canonicalPatch.address = String(patch.address);
  if (patch.businessName !== undefined) canonicalPatch.businessName = String(patch.businessName);
  if (patch.owner !== undefined || patch.ownerName !== undefined) canonicalPatch.owner = String(patch.owner ?? patch.ownerName);
  if (patch.phone !== undefined) canonicalPatch.phone = String(patch.phone);
  if (patch.category !== undefined) canonicalPatch.category = String(patch.category);
  if (patch.powerLoad !== undefined) canonicalPatch.powerLoad = String(patch.powerLoad);
  if (patch.pollutionCategory !== undefined) canonicalPatch.pollutionCategory = String(patch.pollutionCategory);
  if (patch.employeeCount !== undefined) canonicalPatch.employeeCount = Number(patch.employeeCount);
  if (patch.approvalStatus !== undefined) canonicalPatch.approvalStatus = String(patch.approvalStatus);

  return canonicalPatch;
};

const applyCanonicalToSource = (system: SystemName, canonicalPatch: Record<string, unknown>) => {
  const data = store.systems[system].data;

  if (system === 'sws') {
    if (canonicalPatch.businessName !== undefined) data.businessName = canonicalPatch.businessName;
    if (canonicalPatch.address !== undefined) data.address = canonicalPatch.address;
    if (canonicalPatch.owner !== undefined) data.owner = canonicalPatch.owner;
    if (canonicalPatch.phone !== undefined) data.phone = canonicalPatch.phone;
    if (canonicalPatch.category !== undefined) data.category = canonicalPatch.category;
    if (canonicalPatch.approvalStatus !== undefined) data.approvalStatus = canonicalPatch.approvalStatus;
  }

  if (system === 'bescom') {
    if (canonicalPatch.address !== undefined) data.consumerAddress = canonicalPatch.address;
    if (canonicalPatch.powerLoad !== undefined) data.powerLoad = canonicalPatch.powerLoad;
  }

  if (system === 'kspcb') {
    if (canonicalPatch.address !== undefined) data.facilityAddress = canonicalPatch.address;
    if (canonicalPatch.pollutionCategory !== undefined) data.pollutionCategory = canonicalPatch.pollutionCategory;
  }

  if (system === 'labour') {
    if (canonicalPatch.address !== undefined) data.registeredAddress = canonicalPatch.address;
    if (canonicalPatch.employeeCount !== undefined) data.employeeCount = canonicalPatch.employeeCount;
  }

  store.systems[system].version += 1;
  store.systems[system].updatedAt = isoNow();
  store.systems[system].origin = system;
};

const applyCanonicalToTargets = (targets: SystemName[], canonicalPatch: Record<string, unknown>) => {
  const updatedTargets: SystemName[] = [];

  for (const target of targets) {
    const data = store.systems[target].data;

    if (target === 'bescom') {
      if (canonicalPatch.address !== undefined) data.consumerAddress = canonicalPatch.address;
      if (canonicalPatch.powerLoad !== undefined) data.powerLoad = canonicalPatch.powerLoad;
      if (canonicalPatch.businessName !== undefined) data.businessName = canonicalPatch.businessName;
    }

    if (target === 'kspcb') {
      if (canonicalPatch.address !== undefined) data.facilityAddress = canonicalPatch.address;
      if (canonicalPatch.pollutionCategory !== undefined) data.pollutionCategory = canonicalPatch.pollutionCategory;
      if (canonicalPatch.businessName !== undefined) data.enterpriseName = canonicalPatch.businessName;
    }

    if (target === 'labour') {
      if (canonicalPatch.address !== undefined) data.registeredAddress = canonicalPatch.address;
      if (canonicalPatch.employeeCount !== undefined) data.employeeCount = canonicalPatch.employeeCount;
      if (canonicalPatch.businessName !== undefined) data.establishmentName = canonicalPatch.businessName;
    }

    store.systems[target].version += 1;
    store.systems[target].updatedAt = isoNow();
    store.systems[target].origin = store.systems[target].origin === target ? target : store.systems[target].origin;
    updatedTargets.push(target);
  }

  return updatedTargets;
};

const recordLifecycle = (agent: AgentLifecycleEvent) => {
  publishBusEvent('agent-state', agent);
};

const audit = (eventId: string, actor: AgentLifecycleEvent['agent'], action: string, status: 'started' | 'completed' | 'warning' | 'error', summary: string, metadata?: Record<string, unknown>) => {
  const entry = {
    id: nextId('aud'),
    eventId,
    actor,
    action,
    status,
    summary,
    timestamp: isoNow(),
    metadata,
  };
  store.auditLogs.unshift(entry);
  publishBusEvent('audit-recorded', entry);
  return entry;
};

const createConflict = (input: OrchestrationInput, event: SyncEvent, authoritative: SystemName): ConflictRecord => {
  const sourceValue = input.patch[event.field];
  const conflict: ConflictRecord = {
    id: nextId('cfl'),
    eventId: event.eventId,
    ubid: input.ubid,
    field: event.field,
    fieldLabel: event.field,
    source: input.system,
    target: event.target,
    systemValues: {
      [input.system]: sourceValue,
      [authoritative]: store.canonical[event.field as keyof typeof store.canonical] ?? sourceValue,
    },
    timestamps: {
      [input.system]: isoNow(),
      [authoritative]: store.systems[authoritative].updatedAt,
    },
    severity: input.system === authoritative ? 'low' : 'medium',
    status: input.system === authoritative ? 'resolved' : 'pending',
    origin: input.origin ?? input.system,
    authoritative,
    resolved: input.system === authoritative,
    detectedAt: isoNow(),
    note:
      input.system === authoritative
        ? `${authoritative.toUpperCase()} change accepted as golden record.`
        : `${input.system.toUpperCase()} differs from ${authoritative.toUpperCase()} policy. Authoritative value retained.`,
  };

  store.conflicts.unshift(conflict);
  publishBusEvent('conflict-detected', conflict);
  return conflict;
};

export const orchestrateChange = (input: OrchestrationInput) => {
  const eventId = `evt_${randomUUID().slice(0, 8)}`;
  const source = input.system;
  const origin = input.origin ?? input.system;
  const canonicalPatch = canonicalize(input.patch);
  const field = Object.keys(canonicalPatch)[0] ?? Object.keys(input.patch)[0] ?? 'unknown';
  const oldValue = store.canonical[field as keyof typeof store.canonical];
  const target = fieldTargets[field] ?? (source === 'sws' ? ['bescom', 'kspcb', 'labour'] : ['sws']);
  const event: SyncEvent = {
    eventId,
    source,
    origin,
    target,
    ubid: input.ubid,
    field,
    oldValue,
    newValue: canonicalPatch[field] ?? input.patch[field],
    timestamp: isoNow(),
    version: store.canonical.version + 1,
  };

  store.events.unshift(event);
  enqueueEvent(event);

  recordLifecycle({
    id: nextId('agt'),
    agent: 'listener',
    stage: 'detect',
    message: `Detected ${field} change from ${source.toUpperCase()}`,
    eventId,
    timestamp: isoNow(),
  });
  audit(eventId, 'listener', 'poll-and-detect', 'started', `Detected ${field} change from ${source.toUpperCase()}`);

  const decisionTargets = target.filter((system) => system !== source || source === 'sws');
  recordLifecycle({
    id: nextId('agt'),
    agent: 'decision',
    stage: 'route',
    message: `Routing ${field} to ${decisionTargets.map((system) => system.toUpperCase()).join(', ')}`,
    eventId,
    timestamp: isoNow(),
  });
  audit(eventId, 'decision', 'route-event', 'completed', `Decision agent selected ${decisionTargets.length} target system(s)`, {
    targets: decisionTargets,
  });

  recordLifecycle({
    id: nextId('agt'),
    agent: 'translation',
    stage: 'map',
    message: `Translated ${field} into canonical model`,
    eventId,
    timestamp: isoNow(),
  });
  audit(eventId, 'translation', 'canonical-transform', 'completed', `Translated ${field} into canonical model`, {
    canonicalPatch,
  });

  const authoritative = store.policies[field] ?? 'sws';
  const shouldConflict = source !== authoritative;
  const conflict = shouldConflict ? createConflict(input, event, authoritative) : undefined;

  recordLifecycle({
    id: nextId('agt'),
    agent: 'conflict',
    stage: shouldConflict ? 'review' : 'clear',
    message: shouldConflict
      ? `${field} is governed by ${authoritative.toUpperCase()}`
      : `No conflict for ${field}`,
    eventId,
    timestamp: isoNow(),
  });
  audit(
    eventId,
    'conflict',
    'conflict-check',
    shouldConflict ? 'warning' : 'completed',
    shouldConflict
      ? `Conflict detected for ${field}; retained authoritative source ${authoritative.toUpperCase()}`
      : `No conflict detected for ${field}`,
    { authoritative, conflict: Boolean(conflict) }
  );

  if (!shouldConflict || source === authoritative) {
    store.canonical = {
      ...store.canonical,
      ...canonicalPatch,
      updatedAt: isoNow(),
      version: store.canonical.version + 1,
      origin,
    };

    applyCanonicalToSource(source, canonicalPatch);
    const updatedTargets = applyCanonicalToTargets(decisionTargets, canonicalPatch);

    recordLifecycle({
      id: nextId('agt'),
      agent: 'sync',
      stage: 'propagate',
      message: `Propagated ${field} to ${updatedTargets.map((system) => system.toUpperCase()).join(', ')}`,
      eventId,
      timestamp: isoNow(),
    });
    audit(eventId, 'sync', 'api-sync', 'completed', `Propagated ${field} to target systems`, {
      targets: updatedTargets,
    });

    const replaySession = {
      id: nextId('rep'),
      eventIds: [eventId],
      createdAt: isoNow(),
      summary: `Sync lifecycle for ${field} from ${source.toUpperCase()}`,
    };
    store.replaySessions.unshift(replaySession);

    const result = {
      event,
      conflict: null,
      canonical: store.canonical,
      updatedTargets,
      replaySession,
    };

    publishBusEvent('sync-started', { eventId, field, source, targets: updatedTargets });
    publishBusEvent('sync-completed', result);
    recordLifecycle({
      id: nextId('agt'),
      agent: 'audit',
      stage: 'archive',
      message: `Audit trail persisted for ${eventId}`,
      eventId,
      timestamp: isoNow(),
    });
    audit(eventId, 'audit', 'archive-trail', 'completed', `Recorded lifecycle for ${eventId}`);
    return result;
  }

  const result = {
    event,
    conflict,
    canonical: store.canonical,
    updatedTargets: [] as SystemName[],
    replaySession: {
      id: nextId('rep'),
      eventIds: [eventId],
      createdAt: isoNow(),
      summary: `Conflict lifecycle for ${field} from ${source.toUpperCase()}`,
    },
  };

  store.replaySessions.unshift(result.replaySession);
  recordLifecycle({
    id: nextId('agt'),
    agent: 'sync',
    stage: 'paused',
    message: `Propagation paused for ${field} pending authority resolution`,
    eventId,
    timestamp: isoNow(),
  });
  audit(eventId, 'sync', 'api-sync', 'warning', `Propagation paused for ${field} because a conflict was raised`);
  publishBusEvent('sync-started', { eventId, field, source, targets: decisionTargets });
  publishBusEvent('sync-completed', result);
  return result;
};

export const resolveConflict = (conflictId: string, authoritative: SystemName) => {
  const conflict = store.conflicts.find((item) => item.id === conflictId);
  if (!conflict) {
    return null;
  }

  conflict.authoritative = authoritative;
  conflict.status = 'resolved';
  conflict.resolved = true;
  conflict.resolvedAt = isoNow();
  conflict.note = `Manually resolved in favor of ${authoritative.toUpperCase()}.`;

  const replaySession = {
    id: nextId('rep'),
    eventIds: [conflict.eventId],
    createdAt: isoNow(),
    summary: `Resolved conflict for ${conflict.field}`,
  };
  store.replaySessions.unshift(replaySession);
  return conflict;
};
