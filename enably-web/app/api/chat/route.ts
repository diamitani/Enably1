import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    messages: await convertToModelMessages(messages),
    system,
    tools: frontendTools(tools ?? {}),
    maxOutputTokens: 4096,
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (error) =>
      error instanceof Error ? error.message : String(error),
  });
}
