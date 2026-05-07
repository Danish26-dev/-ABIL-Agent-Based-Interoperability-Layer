import { BaseAgent, AgentInput } from "./base";
import { store } from "../store/memoryStore";

/**
 * Conflict Agent: Detects data conflicts between systems
 * Compares current state against incoming change
 */
export class ConflictAgent extends BaseAgent {
  constructor() {
    super("conflict");
  }

  protected buildPrompt(input: AgentInput): string {
    const { ubid, field, targetSystem, proposedValue } = input.payload;

    const systemSnapshot = store.systems[targetSystem as keyof typeof store.systems];
    const currentRecord = systemSnapshot?.data || {};
    const currentValue = currentRecord[field];

    return `You are the Conflict Detection Agent in a government interoperability system.

Your task: Detect and classify conflicts between system states.

UBID: ${ubid}
Field: ${field}
Target System: ${targetSystem}
Current Value: ${JSON.stringify(currentValue)}
Proposed Value: ${JSON.stringify(proposedValue)}

Tasks:
1. Detect if values conflict (different non-null values)
2. Classify severity (HIGH|MEDIUM|LOW)
3. Determine if conflict is resolvable
4. Suggest resolution strategy

Respond with JSON:
{
  "conflictDetected": boolean,
  "severity": "HIGH" | "MEDIUM" | "LOW",
  "conflictType": "data_mismatch" | "stale_value" | "permission_violation",
  "resolvable": boolean,
  "suggestedResolution": "authoritative_override" | "merge" | "manual_review",
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      return {
        conflictDetected: parsed.conflictDetected ?? false,
        severity: parsed.severity || "MEDIUM",
        conflictType: parsed.conflictType || "data_mismatch",
        resolvable: parsed.resolvable ?? true,
        suggestedResolution: parsed.suggestedResolution || "manual_review",
      };
    } catch {
      return {
        conflictDetected: false,
        severity: "LOW",
        conflictType: "data_mismatch",
        resolvable: true,
        suggestedResolution: "manual_review",
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { ubid, field, targetSystem, proposedValue } = input.payload;

    const systemSnapshot = store.systems[targetSystem as keyof typeof store.systems];
    const currentRecord = systemSnapshot?.data || {};
    const currentValue = currentRecord[field];

    // Detect conflict
    const conflictDetected =
      currentValue != null &&
      proposedValue != null &&
      currentValue !== proposedValue;

    let severity = "LOW";
    if (conflictDetected) {
      // Critical fields = HIGH
      if (["powerLoad", "pollutionCategory", "address"].includes(field)) {
        severity = "HIGH";
      } else if (["category", "employeeCount"].includes(field)) {
        severity = "MEDIUM";
      }
    }

    return {
      conflictDetected,
      severity,
      conflictType: conflictDetected ? "data_mismatch" : "none",
      resolvable: true,
      suggestedResolution: conflictDetected ? "manual_review" : "proceed",
    };
  }
}

export const conflictAgent = new ConflictAgent();
