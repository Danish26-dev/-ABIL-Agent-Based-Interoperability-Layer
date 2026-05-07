import { BaseAgent, AgentInput, AgentResult } from "./base";
import { SyncEvent } from "../domain/types";
import { store } from "../store/memoryStore";

/**
 * Listener Agent: Receives and validates incoming sync events
 * Filters duplicates, validates schema, normalizes timestamps
 */
export class ListenerAgent extends BaseAgent {
  constructor() {
    super("listener");
  }

  protected buildPrompt(input: AgentInput): string {
    const { systemPayload, sourceSystem } = input.payload;

    return `You are the Listener Agent in a government interoperability system.

Your task: Validate and normalize this incoming event from ${sourceSystem}.

Event Data:
${JSON.stringify(systemPayload, null, 2)}

Tasks:
1. Validate schema completeness
2. Check for duplicate events (same ubid + field + timestamp within 5 seconds)
3. Normalize timestamps to ISO format
4. Identify system type from origin
5. Return normalized event ready for Decision Agent

Respond with JSON containing:
{
  "isValid": boolean,
  "isDuplicate": boolean,
  "normalizedEvent": { /* normalized payload */ },
  "issues": string[],
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      return {
        isValid: parsed.isValid ?? true,
        isDuplicate: parsed.isDuplicate ?? false,
        normalizedEvent: parsed.normalizedEvent || input.payload.systemPayload,
        issues: parsed.issues || [],
      };
    } catch {
      return {
        isValid: true,
        isDuplicate: false,
        normalizedEvent: input.payload.systemPayload,
        issues: [],
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { systemPayload, sourceSystem } = input.payload;
    const { ubid, field, newValue } = systemPayload;

    // Check for duplicates (timestamp is ISO string in store)
    const recentEvents = store.events.filter(
      (e) =>
        e.ubid === ubid &&
        e.field === field &&
        Date.now() - new Date(e.timestamp).getTime() < 5000
    );

    const isDuplicate = recentEvents.some((e) => e.newValue === newValue);

    // Validate required fields
    const issues: string[] = [];
    if (!ubid) issues.push("Missing UBID");
    if (!field) issues.push("Missing field name");
    if (newValue === undefined) issues.push("Missing newValue");

    return {
      isValid: issues.length === 0,
      isDuplicate,
      normalizedEvent: {
        ...systemPayload,
        timestamp: new Date().toISOString(),
        source: sourceSystem,
      },
      issues,
    };
  }
}

export const listenerAgent = new ListenerAgent();
