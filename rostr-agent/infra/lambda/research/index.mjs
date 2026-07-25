import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const secretsClient = new SecretsManagerClient({});

const RESEARCH_TABLE = process.env.RESEARCH_TABLE;
const SECRETS_ARN = process.env.SECRETS_ARN;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,X-Workspace-Id",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

let cachedSecrets = null;

async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;

  const result = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: SECRETS_ARN })
  );
  cachedSecrets = JSON.parse(result.SecretString);
  return cachedSecrets;
}

export async function handler(event) {
  const { httpMethod, pathParameters } = event;
  const workspaceId = pathParameters?.workspaceId;
  const domain = pathParameters?.domain;

  try {
    if (httpMethod === "GET" && domain) {
      return await getResearch(workspaceId, domain);
    }

    if (httpMethod === "POST" && domain) {
      return await createResearch(workspaceId, domain);
    }

    if (httpMethod === "GET" && !domain) {
      return await listResearch(workspaceId);
    }

    return response(404, { error: "Not found" });
  } catch (error) {
    console.error("Error:", error);
    return response(500, { error: error.message });
  }
}

async function getResearch(workspaceId, domain) {
  const result = await docClient.send(
    new GetCommand({
      TableName: RESEARCH_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOMAIN#${domain}` },
    })
  );

  if (!result.Item) {
    return response(404, { error: "Research not found for this domain" });
  }

  return response(200, { research: result.Item });
}

async function listResearch(workspaceId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: RESEARCH_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `WS#${workspaceId}` },
      Limit: 50,
    })
  );

  return response(200, { research: result.Items || [] });
}

async function createResearch(workspaceId, domain) {
  // Check cache first
  const existing = await docClient.send(
    new GetCommand({
      TableName: RESEARCH_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOMAIN#${domain}` },
    })
  );

  // Return cached if less than 24 hours old
  if (existing.Item) {
    const age = Date.now() - new Date(existing.Item.createdAt).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return response(200, { research: existing.Item, cached: true });
    }
  }

  // Fetch fresh data
  const companyData = await enrichCompany(domain);
  const triggers = identifyTriggers(companyData);

  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOMAIN#${domain}`,
    domain,
    workspaceId,
    company: companyData,
    triggers,
    createdAt: now,
    updatedAt: now,
    ttl,
  };

  await docClient.send(new PutCommand({ TableName: RESEARCH_TABLE, Item: item }));

  return response(201, { research: item, cached: false });
}

async function enrichCompany(domain) {
  // This is a placeholder - in production, integrate with Clearbit, Apollo, etc.
  // For now, return mock data based on domain patterns

  const cleanDomain = domain.replace(/^www\./, "").toLowerCase();
  const companyName = cleanDomain
    .split(".")[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    name: companyName,
    domain: cleanDomain,
    industry: inferIndustry(cleanDomain),
    employeeCount: inferSize(cleanDomain),
    location: "United States",
    description: `${companyName} is a company operating in the ${inferIndustry(cleanDomain)} sector.`,
    socialProfiles: {
      linkedin: `https://linkedin.com/company/${cleanDomain.split(".")[0]}`,
      twitter: `https://twitter.com/${cleanDomain.split(".")[0]}`,
    },
    techStack: inferTechStack(cleanDomain),
    fundingStage: inferFundingStage(cleanDomain),
    lastUpdated: new Date().toISOString(),
  };
}

function inferIndustry(domain) {
  if (domain.includes("tech") || domain.includes("software")) return "Technology";
  if (domain.includes("health") || domain.includes("med")) return "Healthcare";
  if (domain.includes("fin") || domain.includes("bank")) return "Financial Services";
  if (domain.includes("retail") || domain.includes("shop")) return "Retail";
  return "B2B SaaS";
}

function inferSize(domain) {
  const hash = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  return sizes[hash % sizes.length];
}

function inferTechStack(domain) {
  return ["AWS", "Salesforce", "HubSpot", "Slack", "Google Workspace"];
}

function inferFundingStage(domain) {
  const stages = ["Seed", "Series A", "Series B", "Series C", "Growth", "Public"];
  const hash = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return stages[hash % stages.length];
}

function identifyTriggers(companyData) {
  const triggers = [];

  // Check for growth signals
  if (["Series B", "Series C", "Growth"].includes(companyData.fundingStage)) {
    triggers.push({
      type: "funding",
      signal: `${companyData.fundingStage} company - likely scaling`,
      priority: "high",
    });
  }

  // Check for tech stack alignment
  if (companyData.techStack.includes("Salesforce")) {
    triggers.push({
      type: "tech_stack",
      signal: "Uses Salesforce - CRM integration opportunity",
      priority: "medium",
    });
  }

  if (companyData.techStack.includes("HubSpot")) {
    triggers.push({
      type: "tech_stack",
      signal: "Uses HubSpot - marketing alignment",
      priority: "medium",
    });
  }

  // Size-based triggers
  if (["51-200", "201-500"].includes(companyData.employeeCount)) {
    triggers.push({
      type: "company_size",
      signal: "Mid-market company - sweet spot for GTM tooling",
      priority: "high",
    });
  }

  return triggers;
}
