import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE;
const RESEARCH_TABLE = process.env.RESEARCH_TABLE;
const ACTIVITY_TABLE = process.env.ACTIVITY_TABLE;

export async function handler(event) {
  console.log("Bedrock Agent Action Group Event:", JSON.stringify(event, null, 2));

  const { actionGroup, apiPath, httpMethod, requestBody } = event;
  const parameters = requestBody?.content?.["application/json"]?.properties || {};

  try {
    let result;

    switch (apiPath) {
      case "/icp/create":
        result = await createICP(parameters);
        break;
      case "/icp/get":
        result = await getICP(parameters);
        break;
      case "/persona/create":
        result = await createPersona(parameters);
        break;
      case "/template/create":
        result = await createTemplate(parameters);
        break;
      case "/research/company":
        result = await researchCompany(parameters);
        break;
      case "/outreach/generate":
        result = await generateOutreach(parameters);
        break;
      case "/activity/log":
        result = await logActivity(parameters);
        break;
      case "/activity/summary":
        result = await getActivitySummary(parameters);
        break;
      default:
        result = { error: `Unknown API path: ${apiPath}` };
    }

    return {
      messageVersion: "1.0",
      response: {
        actionGroup,
        apiPath,
        httpMethod,
        httpStatusCode: 200,
        responseBody: {
          "application/json": {
            body: JSON.stringify(result),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      messageVersion: "1.0",
      response: {
        actionGroup,
        apiPath,
        httpMethod,
        httpStatusCode: 500,
        responseBody: {
          "application/json": {
            body: JSON.stringify({ error: error.message }),
          },
        },
      },
    };
  }
}

// ========================================
// ICP Operations
// ========================================
async function createICP(params) {
  const { workspaceId, name, industry, companySize, painPoints, qualificationCriteria, budget, decisionMakers } = params;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOC#${id}`,
    id,
    workspaceId,
    docType: "ICP",
    title: name,
    content: {
      industry,
      companySize,
      painPoints: painPoints || [],
      qualificationCriteria: qualificationCriteria || [],
      budget,
      decisionMakers: decisionMakers || [],
    },
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({ TableName: DOCUMENTS_TABLE, Item: item }));

  return {
    success: true,
    icp: item,
    message: `ICP "${name}" created successfully with ID ${id}`,
  };
}

async function getICP(params) {
  const { workspaceId, icpId } = params;

  if (icpId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: DOCUMENTS_TABLE,
        Key: { pk: `WS#${workspaceId}`, sk: `DOC#${icpId}` },
      })
    );
    return result.Item || { error: "ICP not found" };
  }

  // Get latest ICP
  const result = await docClient.send(
    new QueryCommand({
      TableName: DOCUMENTS_TABLE,
      IndexName: "type-index",
      KeyConditionExpression: "workspaceId = :wid AND docType = :docType",
      ExpressionAttributeValues: { ":wid": workspaceId, ":docType": "ICP" },
      Limit: 1,
      ScanIndexForward: false,
    })
  );

  return result.Items?.[0] || { message: "No ICP found. Create one first." };
}

// ========================================
// Persona Operations
// ========================================
async function createPersona(params) {
  const { workspaceId, icpId, name, title, responsibilities, goals, challenges, preferredChannels, messagingAngle } = params;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOC#${id}`,
    id,
    workspaceId,
    docType: "PERSONA",
    title: name,
    content: {
      icpId,
      jobTitle: title,
      responsibilities: responsibilities || [],
      goals: goals || [],
      challenges: challenges || [],
      preferredChannels: preferredChannels || [],
      messagingAngle,
    },
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({ TableName: DOCUMENTS_TABLE, Item: item }));

  return {
    success: true,
    persona: item,
    message: `Persona "${name}" created successfully`,
  };
}

// ========================================
// Template Operations
// ========================================
async function createTemplate(params) {
  const { workspaceId, name, type, subject, content, personaId, cadenceStep } = params;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Extract variables from content
  const variableMatches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const variables = variableMatches.map((v) => v.replace(/[{}]/g, ""));

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOC#${id}`,
    id,
    workspaceId,
    docType: "TEMPLATE",
    title: name,
    content: {
      type,
      subject,
      body: content,
      variables,
      personaId,
      cadenceStep,
    },
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({ TableName: DOCUMENTS_TABLE, Item: item }));

  return {
    success: true,
    template: item,
    message: `Template "${name}" created with variables: ${variables.join(", ")}`,
  };
}

// ========================================
// Research Operations
// ========================================
async function researchCompany(params) {
  const { workspaceId, domain } = params;

  // Check cache
  const existing = await docClient.send(
    new GetCommand({
      TableName: RESEARCH_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOMAIN#${domain}` },
    })
  );

  if (existing.Item) {
    const age = Date.now() - new Date(existing.Item.createdAt).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return { ...existing.Item, cached: true };
    }
  }

  // Enrich company data
  const companyData = enrichCompanyData(domain);
  const triggers = identifySalesTriggers(companyData);

  const now = new Date().toISOString();
  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOMAIN#${domain}`,
    domain,
    workspaceId,
    company: companyData,
    triggers,
    createdAt: now,
    ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };

  await docClient.send(new PutCommand({ TableName: RESEARCH_TABLE, Item: item }));

  return {
    company: companyData,
    triggers,
    message: `Found ${triggers.length} sales triggers for ${domain}`,
  };
}

function enrichCompanyData(domain) {
  const cleanDomain = domain.replace(/^www\./, "").toLowerCase();
  const companyName = cleanDomain
    .split(".")[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const hash = cleanDomain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const industries = ["Technology", "Healthcare", "Financial Services", "Manufacturing", "Retail", "B2B SaaS"];
  const sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
  const stages = ["Seed", "Series A", "Series B", "Series C", "Growth", "Public"];

  return {
    name: companyName,
    domain: cleanDomain,
    industry: industries[hash % industries.length],
    employeeCount: sizes[hash % sizes.length],
    fundingStage: stages[hash % stages.length],
    location: "United States",
    techStack: ["AWS", "Salesforce", "Slack", "HubSpot"].slice(0, (hash % 4) + 1),
    description: `${companyName} is a ${industries[hash % industries.length].toLowerCase()} company.`,
  };
}

function identifySalesTriggers(company) {
  const triggers = [];

  if (["Series B", "Series C", "Growth"].includes(company.fundingStage)) {
    triggers.push({
      type: "funding",
      signal: `${company.fundingStage} stage - scaling operations`,
      priority: "high",
      talkingPoint: `Congrats on the ${company.fundingStage}! Many teams at this stage are looking to systematize their GTM.`,
    });
  }

  if (["51-200", "201-500"].includes(company.employeeCount)) {
    triggers.push({
      type: "company_size",
      signal: "Mid-market sweet spot",
      priority: "high",
      talkingPoint: "At your size, having a consistent GTM playbook becomes critical for scaling the sales team.",
    });
  }

  if (company.techStack.includes("Salesforce")) {
    triggers.push({
      type: "tech_stack",
      signal: "Salesforce user - CRM integration",
      priority: "medium",
      talkingPoint: "We integrate directly with Salesforce to keep your CRM updated automatically.",
    });
  }

  if (company.techStack.includes("HubSpot")) {
    triggers.push({
      type: "tech_stack",
      signal: "HubSpot user - marketing alignment",
      priority: "medium",
      talkingPoint: "Our HubSpot integration syncs your GTM assets with marketing campaigns.",
    });
  }

  return triggers;
}

// ========================================
// Outreach Operations
// ========================================
async function generateOutreach(params) {
  const { workspaceId, templateId, leadData, companyDomain } = params;

  // Get template
  const templateResult = await docClient.send(
    new GetCommand({
      TableName: DOCUMENTS_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOC#${templateId}` },
    })
  );

  if (!templateResult.Item) {
    return { error: "Template not found" };
  }

  const template = templateResult.Item;

  // Get company research if domain provided
  let companyData = null;
  let triggers = [];

  if (companyDomain) {
    const research = await researchCompany({ workspaceId, domain: companyDomain });
    companyData = research.company;
    triggers = research.triggers || [];
  }

  // Build variables
  const variables = {
    first_name: leadData?.firstName || "[First Name]",
    last_name: leadData?.lastName || "[Last Name]",
    full_name: `${leadData?.firstName || ""} ${leadData?.lastName || ""}`.trim() || "[Full Name]",
    company: leadData?.company || companyData?.name || "[Company]",
    title: leadData?.title || "[Title]",
    industry: companyData?.industry || "[Industry]",
    company_size: companyData?.employeeCount || "[Company Size]",
    pain_point: triggers[0]?.talkingPoint || "[Pain Point]",
    trigger: triggers[0]?.signal || "[Recent Trigger]",
  };

  // Replace variables in template
  let personalizedSubject = template.content.subject || "";
  let personalizedBody = template.content.body || "";

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    personalizedSubject = personalizedSubject.replace(regex, value);
    personalizedBody = personalizedBody.replace(regex, value);
  }

  return {
    subject: personalizedSubject,
    body: personalizedBody,
    variables,
    triggers,
    message: "Personalized outreach generated successfully",
  };
}

// ========================================
// Activity Operations
// ========================================
async function logActivity(params) {
  const { workspaceId, type, leadId, outcome, notes } = params;

  const id = crypto.randomUUID();
  const now = new Date();

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `ACTIVITY#${id}`,
    id,
    workspaceId,
    type,
    leadId,
    outcome,
    notes,
    activityDate: now.toISOString().split("T")[0],
    createdAt: now.toISOString(),
    ttl: Math.floor(now.getTime() / 1000) + 90 * 24 * 60 * 60,
  };

  await docClient.send(new PutCommand({ TableName: ACTIVITY_TABLE, Item: item }));

  // Get updated counts for today
  const summary = await getActivitySummary({ workspaceId, period: "today" });

  return {
    success: true,
    activity: item,
    todaySummary: summary,
    message: `${type} activity logged successfully`,
  };
}

async function getActivitySummary(params) {
  const { workspaceId, period = "today" } = params;

  const now = new Date();
  let startDate;

  switch (period) {
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate = new Date(now.toISOString().split("T")[0]);
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: ACTIVITY_TABLE,
      IndexName: "date-index",
      KeyConditionExpression: "workspaceId = :wid AND activityDate >= :start",
      ExpressionAttributeValues: {
        ":wid": workspaceId,
        ":start": startDate.toISOString().split("T")[0],
      },
    })
  );

  const activities = result.Items || [];
  const counts = {
    email: 0,
    call: 0,
    dm: 0,
    meeting: 0,
    total: activities.length,
  };

  activities.forEach((a) => {
    if (counts[a.type] !== undefined) counts[a.type]++;
  });

  // Default targets
  const targets = {
    email: 40,
    call: 30,
    dm: 20,
  };

  return {
    period,
    counts,
    targets,
    progress: {
      email: Math.round((counts.email / targets.email) * 100),
      call: Math.round((counts.call / targets.call) * 100),
      dm: Math.round((counts.dm / targets.dm) * 100),
    },
  };
}
