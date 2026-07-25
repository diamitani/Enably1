import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const bedrockClient = new BedrockRuntimeClient({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE;
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,X-Workspace-Id",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  const { pathParameters, body } = event;
  const workspaceId = pathParameters?.workspaceId;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    const { message, context = [] } = parsedBody;

    if (!message) {
      return response(400, { error: "Message is required" });
    }

    // Load workspace context (ICP, Playbook, etc.)
    const workspaceContext = await loadWorkspaceContext(workspaceId, context);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(workspaceContext);

    // Call Bedrock
    const assistantResponse = await invokeAssistant(systemPrompt, message);

    return response(200, {
      response: assistantResponse,
      sources: workspaceContext.sources,
    });
  } catch (error) {
    console.error("Error:", error);
    return response(500, { error: error.message });
  }
}

async function loadWorkspaceContext(workspaceId, requestedContext) {
  const context = {
    icp: null,
    playbook: null,
    personas: [],
    templates: [],
    sources: [],
  };

  // Load ICP
  if (requestedContext.includes("icp") || requestedContext.length === 0) {
    const icpResult = await docClient.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        IndexName: "type-index",
        KeyConditionExpression: "workspaceId = :wid AND docType = :docType",
        ExpressionAttributeValues: { ":wid": workspaceId, ":docType": "ICP" },
        Limit: 1,
      })
    );
    if (icpResult.Items?.[0]) {
      context.icp = icpResult.Items[0];
      context.sources.push({ type: "ICP", title: context.icp.title });
    }
  }

  // Load Playbook
  if (requestedContext.includes("playbook") || requestedContext.length === 0) {
    const playbookResult = await docClient.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        IndexName: "type-index",
        KeyConditionExpression: "workspaceId = :wid AND docType = :docType",
        ExpressionAttributeValues: {
          ":wid": workspaceId,
          ":docType": "PLAYBOOK",
        },
        Limit: 1,
      })
    );
    if (playbookResult.Items?.[0]) {
      context.playbook = playbookResult.Items[0];
      context.sources.push({ type: "Playbook", title: context.playbook.title });
    }
  }

  // Load Personas
  if (requestedContext.includes("personas")) {
    const personaResult = await docClient.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        IndexName: "type-index",
        KeyConditionExpression: "workspaceId = :wid AND docType = :docType",
        ExpressionAttributeValues: {
          ":wid": workspaceId,
          ":docType": "PERSONA",
        },
        Limit: 5,
      })
    );
    context.personas = personaResult.Items || [];
    context.personas.forEach((p) =>
      context.sources.push({ type: "Persona", title: p.title })
    );
  }

  return context;
}

function buildSystemPrompt(context) {
  let systemPrompt = `You are an AI assistant for the Enably GTM OS platform. You help sales teams with their go-to-market strategy, including defining ICPs, building playbooks, writing messaging, and planning outreach.

Be concise, helpful, and actionable. When making suggestions, reference the user's specific context when available.`;

  if (context.icp) {
    systemPrompt += `

## Current ICP
Title: ${context.icp.title}
${JSON.stringify(context.icp.content, null, 2)}`;
  }

  if (context.playbook) {
    systemPrompt += `

## Current Playbook
Title: ${context.playbook.title}
${JSON.stringify(context.playbook.content, null, 2)}`;
  }

  if (context.personas.length > 0) {
    systemPrompt += `

## Buyer Personas`;
    context.personas.forEach((p) => {
      systemPrompt += `
### ${p.title}
${JSON.stringify(p.content, null, 2)}`;
    });
  }

  systemPrompt += `

When providing suggestions:
1. Reference the user's specific ICP, playbook, and personas when relevant
2. Be specific and actionable
3. Cite which document influenced your recommendation
4. Keep responses focused and concise`;

  return systemPrompt;
}

async function invokeAssistant(systemPrompt, userMessage) {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.content[0].text;
}
