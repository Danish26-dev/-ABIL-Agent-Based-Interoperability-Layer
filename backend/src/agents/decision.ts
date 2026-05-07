import { BaseAgent, AgentInput } from "./base";
import { store } from "../store/memoryStore";

/**
 * Decision Agent: Determines if change should be propagated
 * Uses policy authority matrix to decide routing
 */
export class DecisionAgent extends BaseAgent {
  constructor() {
    super("decision");
  }

  protected buildPrompt(input: AgentInput): string {
    const { normalizedEvent } = input.payload;
    const { ubid, field, source } = normalizedEvent;

    const authoritativeSystem = store.policies[field] || 'sws';

    return `You are the Decision Agent in a government interoperability system.

Your task: Decide if this change should be propagated based on data authority.

Event:
- UBID: ${ubid}
- Field: ${field}
- Source System: ${source}

Authority Policy:
- Authoritative System: ${authoritativeSystem}

Tasks:
1. Check if source is authoritative for this field
2. Determine if change should propagate to targets
3. Flag conflicts if multiple systems claim authority
4. Decide propagation strategy (broadcast, targeted, blocked)

Respond with JSON:
{
  "shouldPropagate": boolean,
  "propagationStrategy": "broadcast" | "targeted" | "blocked",
  "targetSystems": string[],
  "requiresConflictResolution": boolean,
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      const allSystems: string[] = ['sws', 'bescom', 'kspcb', 'labour'];
      const source = input.payload?.normalizedEvent?.source || 'sws';
      const defaultTargets = allSystems.filter((sys) => sys !== source);

      return {
        shouldPropagate: parsed.shouldPropagate ?? true,
        propagationStrategy: parsed.propagationStrategy || 'targeted',
        targetSystems:
          Array.isArray(parsed.targetSystems) && parsed.targetSystems.length > 0
            ? parsed.targetSystems
            : defaultTargets,
        requiresConflictResolution: parsed.requiresConflictResolution ?? false,
      };
    } catch {
      const allSystems: string[] = ['sws', 'bescom', 'kspcb', 'labour'];
      const source = input.payload?.normalizedEvent?.source || 'sws';
      return {
        shouldPropagate: true,
        propagationStrategy: 'targeted',
        targetSystems: allSystems.filter((sys) => sys !== source),
        requiresConflictResolution: false,
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { normalizedEvent } = input.payload;
    const { ubid, field, source } = normalizedEvent;

    const authoritativeSystem = store.policies[field] || 'sws';

    // Check authority
    const isAuthoritative = source === authoritativeSystem;

    // Determine targets (propagate to other systems if authoritative, else to authoritative system)
    const allSystems: string[] = ['sws', 'bescom', 'kspcb', 'labour'];
    const targetSystems = isAuthoritative
      ? allSystems.filter((sys) => sys !== source)
      : [authoritativeSystem].filter((sys) => sys !== source);

    return {
      shouldPropagate: isAuthoritative || targetSystems.length > 0,
      propagationStrategy:
        targetSystems.length === 0 ? 'blocked' : 'targeted',
      targetSystems,
      requiresConflictResolution: !isAuthoritative && targetSystems.length > 0,
    };
  }
}

export const decisionAgent = new DecisionAgent();
