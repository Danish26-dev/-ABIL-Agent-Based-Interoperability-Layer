import { BaseAgent, AgentInput } from "./base";

/**
 * Translation Agent: Converts field values between system schemas
 * Maps canonical format to system-specific formats
 */
export class TranslationAgent extends BaseAgent {
  constructor() {
    super("translation");
  }

  protected buildPrompt(input: AgentInput): string {
    const { canonicalPatch, targetSystem } = input.payload;

    const schemaExamples = {
      sws: {
        category:
          "SMALL|MEDIUM|LARGE|MICRO_SMALL|MICRO_MEDIUM|MICRO_LARGE",
        approvalStatus: "SUBMITTED|APPROVED|REJECTED|PENDING_REVIEW",
      },
      bescom: {
        powerLoad: "numeric kwh",
        sanctionedLoad: "numeric kwh",
      },
      kspcb: {
        pollutionCategory:
          "WHITE|GREEN|ORANGE|RED|SPECIAL|HIGHLY_HAZARDOUS",
      },
      labour: {
        employeeCount: "numeric",
        registeredUnder:
          "BUILDING_REGULATION|FACTORIES_ACT|SHOPS_ACT|NONE",
      },
    };

    return `You are the Translation Agent in a government interoperability system.

Your task: Convert canonical data to ${targetSystem} system format.

Canonical Patch:
${JSON.stringify(canonicalPatch, null, 2)}

Target System Schema:
${JSON.stringify(schemaExamples[targetSystem as keyof typeof schemaExamples] || {}, null, 2)}

Tasks:
1. Map canonical field names to ${targetSystem} field names
2. Convert data types (dates, enums, numbers)
3. Apply system-specific validation rules
4. Handle missing/null values per system defaults

Respond with JSON:
{
  "translatedPatch": { /* mapped fields */ },
  "mappings": { "canonicalField": "systemField" },
  "issues": string[],
  "reasoning": string
}`;
  }

  protected parseBedrockResponse(response: string, input: AgentInput): any {
    try {
      const parsed = JSON.parse(response);
      return {
        translatedPatch: parsed.translatedPatch || input.payload.canonicalPatch,
        mappings: parsed.mappings || {},
        issues: parsed.issues || [],
      };
    } catch {
      return {
        translatedPatch: input.payload.canonicalPatch,
        mappings: {},
        issues: [],
      };
    }
  }

  protected async deterministic(input: AgentInput): Promise<any> {
    const { canonicalPatch, targetSystem } = input.payload;

    // Map canonical to system-specific
    const mappings: Record<string, string> = {
      businessName: targetSystem === "sws" ? "name" : "businessName",
      address: "address",
      owner: "ownerName",
      powerLoad: targetSystem === "bescom" ? "loadInKwh" : "powerLoad",
      pollutionCategory: "category",
      employeeCount:
        targetSystem === "labour" ? "totalEmployees" : "employeeCount",
      phone: "phone",
      category: "category",
      approvalStatus: "status",
    };

    const translatedPatch: Record<string, any> = {};
    for (const [canonical, value] of Object.entries(canonicalPatch)) {
      const systemField = mappings[canonical] || canonical;
      translatedPatch[systemField] = value;
    }

    return {
      translatedPatch,
      mappings,
      issues: [],
    };
  }
}

export const translationAgent = new TranslationAgent();
