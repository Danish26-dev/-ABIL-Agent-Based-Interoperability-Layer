import { BaseAgent, AgentInput } from "./base";
import { store } from "../store/memoryStore";

/**
 * Sync Agent: Applies approved changes to system state
 * Updates version vectors and propagates to targets
 */
export class SyncAgent extends BaseAgent {
  constructor() {
    super("sync");
  }

  protected buildPrompt(input: AgentInput): string {
    const { ubid, field, targetSystem, translatedPatch, proposedValue } = input.payload;

    return `You are the Sync Agent in a government interoperability system.

Your task: Apply approved changes to system state and update version tracking.

UBID: ${ubid}
Field: ${field}
Target System: ${targetSystem}
Proposed Change: ${JSON.stringify(proposedValue)}
Translated Patch: ${JSON.stringify(translatedPatch)}

Tasks:
1. Validate change is approved (no pending conflicts)
2. Update system state for ${targetSystem}
3. Increment version vector
4. Record change timestamp
5. Determine cascade targets for propagation

Respond with JSON:
{
  "applied": boolean,
  "newVersion": "version_string",
  "updatedRecord": { /* full updated record */ },
  "cascadeTargets": ["system1", "system2"],
  "syncTimestamp": "ISO_datetime",
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      return {
        applied: parsed.applied ?? true,
        newVersion: parsed.newVersion || "1.0",
        updatedRecord: parsed.updatedRecord || {},
        cascadeTargets: parsed.cascadeTargets || [],
        syncTimestamp: parsed.syncTimestamp || new Date().toISOString(),
      };
    } catch {
      return {
        applied: true,
        newVersion: "1.0",
        updatedRecord: {},
        cascadeTargets: [],
        syncTimestamp: new Date().toISOString(),
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { ubid, field, targetSystem, translatedPatch } = input.payload;

    // Get current record from systems snapshot
    const systemSnapshot = store.systems[targetSystem as keyof typeof store.systems];
    const currentRecord = systemSnapshot?.data || { ubid, version: "1.0" };

    // Apply patch
    const updatedRecord = {
      ...currentRecord,
      ...translatedPatch,
      version: `${(parseFloat((systemSnapshot?.version || 1).toString()) + 0.1).toFixed(1)}`,
    };

    // Determine cascade targets (all other systems)
    const allSystems: (keyof typeof store.systems)[] = [
      "sws",
      "bescom",
      "kspcb",
      "labour",
    ];
    const cascadeTargets: string[] = [];
    for (const sys of allSystems) {
      if (sys !== targetSystem) {
        cascadeTargets.push(sys);
      }
    }

    return {
      applied: true,
      newVersion: updatedRecord.version,
      updatedRecord,
      cascadeTargets,
      syncTimestamp: new Date().toISOString(),
    };
  }
}

export const syncAgent = new SyncAgent();
