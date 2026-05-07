import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION || "us-east-1";

export const bedrockClient = new BedrockRuntimeClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const isBedrockEnabled = process.env.BEDROCK_ENABLED === "true";
export const bedrockModelId = process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0";

/**
 * Invoke Bedrock model for conflict explanation or field mapping
 */
export async function invokeBedrockModel(prompt: string): Promise<string> {
  if (!isBedrockEnabled) {
    return "[Bedrock disabled - using deterministic fallback]";
  }

  try {
    const input = {
      modelId: bedrockModelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        maxTokens: 1024,
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    const bodyText = new TextDecoder().decode(response.body);
    const parsedBody = JSON.parse(bodyText);

    // Amazon Nova response format
    return (
      parsedBody.output?.message?.content?.[0]?.text ||
      parsedBody.content?.[0]?.text ||
      "[No response from model]"
    );
  } catch (error) {
    console.error("Bedrock invocation error:", error);
    return "[Bedrock error - using deterministic fallback]";
  }
}
