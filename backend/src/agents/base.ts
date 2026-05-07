import { invokeBedrockModel, isBedrockEnabled } from "../config/aws";
import { AgentLifecycleEvent } from "../domain/types";
import { publishBusEvent } from "../services/eventBus";

export interface AgentInput {
  agentName: string;
  payload: Record<string, any>;
  context?: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  data: any;
  reasoning?: string;
  mode: "strands" | "deterministic";
  executionTime: number;
}

/**
 * Base Agent Class using Strands SDK pattern
 * Implements deterministic fallback if Strands/Bedrock fails
 */
export abstract class BaseAgent {
  protected agentName: string;
  protected agentId: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.agentId = `agent-${agentName}-${Date.now()}`;
  }

  /**
   * Execute agent with Bedrock reasoning or fallback
   */
  async execute(input: AgentInput): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // Emit lifecycle event: agent started
      this.emitLifecycle("STARTED", input.payload);

      let result: AgentResult;

      if (isBedrockEnabled) {
        result = await this.executeWithStrands(input);
      } else {
        result = await this.executeDeterministic(input);
      }

      // Emit lifecycle event: agent completed
      this.emitLifecycle("COMPLETED", result.data);

      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`${this.agentName} execution error:`, error);

      // Emit lifecycle event: agent failed
      this.emitLifecycle("FAILED", { error: String(error) });

      // Fallback to deterministic
      return this.executeDeterministic(input).then((result) => ({
        ...result,
        executionTime: Date.now() - startTime,
      }));
    }
  }

  /**
   * Execute with Strands SDK + Bedrock reasoning
   */
  protected async executeWithStrands(input: AgentInput): Promise<AgentResult> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(input);
    const reasoning = await invokeBedrockModel(prompt);
    const data = this.parseBedrockResponse(reasoning, input);

    return {
      success: true,
      data,
      reasoning,
      mode: "strands",
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute with deterministic fallback (no LLM)
   */
  protected async executeDeterministic(
    input: AgentInput
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const data = await this.deterministic(input);

    return {
      success: true,
      data,
      mode: "deterministic",
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Emit agent lifecycle event to bus
   */
  protected emitLifecycle(
    status: "STARTED" | "COMPLETED" | "FAILED",
    payload: any
  ): void {
    const event = {
      id: this.agentId,
      agent: this.agentName as any,
      stage: status,
      message: `${this.agentName} agent ${status.toLowerCase()}`,
      timestamp: new Date().toISOString(),
    };

    // Publish to generic agent-state event
    publishBusEvent("agent-state", event);
  }

  /**
   * Build prompt for Bedrock
   */
  protected abstract buildPrompt(input: AgentInput): string;

  /**
   * Parse Bedrock response
   */
  protected abstract parseBedrockResponse(
    response: string,
    input: AgentInput
  ): any;

  /**
   * Deterministic fallback logic
   */
  protected abstract deterministic(input: AgentInput): Promise<any>;
}
