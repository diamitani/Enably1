import { anthropic } from "@ai-sdk/anthropic";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: await convertToModelMessages(messages),
    tools: frontendTools(tools),
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  return result.toUIMessageStreamResponse();
}
