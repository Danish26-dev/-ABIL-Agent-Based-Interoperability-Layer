import { BaseAgent, AgentInput } from "./base";
import { store } from "../store/memoryStore";

/**
 * Audit Agent: Records all changes for compliance and replay
 * Maintains immutable audit trail
 */
export class AuditAgent extends BaseAgent {
  constructor() {
    super("audit");
  }

  protected buildPrompt(input: AgentInput): string {
    const { ubid, field, sourceSystem, targetSystem, proposedValue, eventId } = input.payload;

    return `You are the Audit Agent in a government interoperability system.

Your task: Record comprehensive audit trail for compliance.

Event ID: ${eventId}
UBID: ${ubid}
Field: ${field}
Source: ${sourceSystem}
Target: ${targetSystem}
Value: ${JSON.stringify(proposedValue)}

Tasks:
1. Create immutable audit record
2. Include all metadata (actor, timestamp, system states before/after)
3. Classify change type (CREATE|UPDATE|DELETE|CONFLICT_RESOLVED)
4. Assign compliance category
5. Mark for potential replay capability

Respond with JSON:
{
  "auditId": "audit_id",
  "changeType": "CREATE" | "UPDATE" | "DELETE" | "CONFLICT_RESOLVED",
  "complianceCategory": "critical" | "standard" | "metadata",
  "recordedTimestamp": "ISO_datetime",
  "replayable": boolean,
  "metadata": { /* additional context */ },
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      return {
        auditId: parsed.auditId || `aud-${Date.now()}`,
        changeType: parsed.changeType || "UPDATE",
        complianceCategory: parsed.complianceCategory || "standard",
        recordedTimestamp:
          parsed.recordedTimestamp || new Date().toISOString(),
        replayable: parsed.replayable ?? true,
        metadata: parsed.metadata || {},
      };
    } catch {
      return {
        auditId: `aud-${Date.now()}`,
        changeType: "UPDATE",
        complianceCategory: "standard",
        recordedTimestamp: new Date().toISOString(),
        replayable: true,
        metadata: {},
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { ubid, field, sourceSystem, targetSystem, proposedValue, eventId } = input.payload;

    // Get current state before
    const systemSnapshot = store.systems[sourceSystem as keyof typeof store.systems];
    const beforeState = systemSnapshot?.data || {};

    // Determine change type
    const isNew = Object.keys(beforeState).length === 0;
    const changeType = isNew ? "CREATE" : "UPDATE";

    // Classify criticality
    const criticalFields = [
      "powerLoad",
      "pollutionCategory",
      "address",
      "owner",
    ];
    const complianceCategory = criticalFields.includes(field)
      ? "critical"
      : "standard";

    return {
      auditId: `aud-${eventId}-${Date.now()}`,
      changeType,
      complianceCategory,
      recordedTimestamp: new Date().toISOString(),
      replayable: true,
      metadata: {
        sourceSystem,
        targetSystem,
        field,
        beforeValue: beforeState[field],
        afterValue: proposedValue,
      },
    };
  }
}

export const auditAgent = new AuditAgent();
