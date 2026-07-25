import * as cdk from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface BedrockAgentStackProps extends cdk.StackProps {
  documentsBucket: s3.IBucket;
  documentsTable: string;
  researchTable: string;
  activityTable: string;
}

export class BedrockAgentStack extends cdk.Stack {
  public readonly agent: bedrock.CfnAgent;
  public readonly agentAlias: bedrock.CfnAgentAlias;

  constructor(scope: Construct, id: string, props: BedrockAgentStackProps) {
    super(scope, id, props);

    // ========================================
    // Bedrock Agent Execution Role
    // ========================================
    const agentRole = new iam.Role(this, "EnablyAgentRole", {
      assumedBy: new iam.ServicePrincipal("bedrock.amazonaws.com"),
      description: "Execution role for Enably GTM Agent",
    });

    // Grant Bedrock model invocation
    agentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0`,
        ],
      })
    );

    // ========================================
    // Action Group Lambda
    // ========================================
    const actionGroupLambdaRole = new iam.Role(this, "ActionGroupLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB access
    actionGroupLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ],
        resources: [
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.documentsTable}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.documentsTable}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.researchTable}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.activityTable}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.activityTable}/index/*`,
        ],
      })
    );

    // Grant S3 access
    props.documentsBucket.grantReadWrite(actionGroupLambdaRole);

    // Grant SES access
    actionGroupLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );

    // Action Group Lambda - handles all GTM operations
    const actionGroupLambda = new lambda.Function(this, "GTMActionGroupLambda", {
      functionName: "enably-gtm-action-group",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/action-group"),
      role: actionGroupLambdaRole,
      environment: {
        DOCUMENTS_TABLE: props.documentsTable,
        RESEARCH_TABLE: props.researchTable,
        ACTIVITY_TABLE: props.activityTable,
        ASSET_BUCKET: props.documentsBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Grant Bedrock permission to invoke the Lambda
    actionGroupLambda.addPermission("BedrockInvoke", {
      principal: new iam.ServicePrincipal("bedrock.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:bedrock:${this.region}:${this.account}:agent/*`,
    });

    // ========================================
    // Knowledge Base for GTM Context
    // ========================================
    const kbRole = new iam.Role(this, "KnowledgeBaseRole", {
      assumedBy: new iam.ServicePrincipal("bedrock.amazonaws.com"),
    });

    props.documentsBucket.grantRead(kbRole);

    kbRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v1`,
          `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`,
        ],
      })
    );

    // ========================================
    // Bedrock Agent
    // ========================================
    this.agent = new bedrock.CfnAgent(this, "EnablyGTMAgent", {
      agentName: "enably-gtm-agent",
      description:
        "Enably GTM OS Agent - AI assistant for sales enablement and go-to-market operations",
      agentResourceRoleArn: agentRole.roleArn,
      foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
      idleSessionTtlInSeconds: 1800,
      instruction: `You are the Enably GTM Agent, an AI assistant that helps sales teams with their go-to-market strategy.

Your capabilities include:
1. **ICP Management**: Create, update, and analyze Ideal Customer Profiles
2. **Persona Building**: Generate and refine buyer personas based on ICP
3. **Messaging Generation**: Create personalized outreach templates with variable support
4. **Playbook Operations**: Help build and manage sales playbooks
5. **Research & Enrichment**: Look up company information and identify sales triggers
6. **Outreach Assistance**: Draft emails, DMs, and call scripts using templates

When helping users:
- Always reference their existing ICP, personas, and playbook when making suggestions
- Be specific and actionable in recommendations
- Use data from research to personalize outreach
- Track activities and provide analytics insights
- Cite sources when referencing stored documents

Key behaviors:
- Proactively suggest improvements to ICPs and personas
- Identify high-priority leads based on triggers
- Generate multiple template variations for A/B testing
- Provide talking points for calls based on research
- Remind users of daily activity targets`,

      actionGroups: [
        {
          actionGroupName: "GTMOperations",
          description: "Core GTM operations including ICP, personas, playbooks, templates, research, and outreach",
          actionGroupExecutor: {
            lambda: actionGroupLambda.functionArn,
          },
          apiSchema: {
            payload: JSON.stringify({
              openapi: "3.0.0",
              info: {
                title: "Enably GTM Operations API",
                version: "1.0.0",
              },
              paths: {
                "/icp/create": {
                  post: {
                    operationId: "createICP",
                    summary: "Create a new Ideal Customer Profile",
                    description: "Creates an ICP with industry, company size, pain points, and qualification criteria",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "name"],
                            properties: {
                              workspaceId: { type: "string", description: "Workspace identifier" },
                              name: { type: "string", description: "ICP name/title" },
                              industry: { type: "string", description: "Target industry" },
                              companySize: { type: "string", description: "Company size range (e.g., 50-200)" },
                              painPoints: { type: "array", items: { type: "string" }, description: "Key pain points" },
                              qualificationCriteria: { type: "array", items: { type: "string" }, description: "Qualification criteria" },
                              budget: { type: "string", description: "Typical budget range" },
                              decisionMakers: { type: "array", items: { type: "string" }, description: "Key decision makers" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "ICP created successfully" },
                    },
                  },
                },
                "/icp/get": {
                  get: {
                    operationId: "getICP",
                    summary: "Get an existing ICP",
                    parameters: [
                      { name: "workspaceId", in: "query", required: true, schema: { type: "string" } },
                      { name: "icpId", in: "query", required: false, schema: { type: "string" } },
                    ],
                    responses: {
                      "200": { description: "ICP data returned" },
                    },
                  },
                },
                "/persona/create": {
                  post: {
                    operationId: "createPersona",
                    summary: "Create a buyer persona",
                    description: "Creates a detailed buyer persona linked to an ICP",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "name", "icpId"],
                            properties: {
                              workspaceId: { type: "string" },
                              icpId: { type: "string", description: "Associated ICP ID" },
                              name: { type: "string", description: "Persona name (e.g., 'Security-First CISO')" },
                              title: { type: "string", description: "Job title" },
                              responsibilities: { type: "array", items: { type: "string" } },
                              goals: { type: "array", items: { type: "string" } },
                              challenges: { type: "array", items: { type: "string" } },
                              preferredChannels: { type: "array", items: { type: "string" } },
                              messagingAngle: { type: "string", description: "Best approach for outreach" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "Persona created successfully" },
                    },
                  },
                },
                "/template/create": {
                  post: {
                    operationId: "createTemplate",
                    summary: "Create an outreach template",
                    description: "Creates an email, DM, or call script template with variable placeholders",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "name", "type", "content"],
                            properties: {
                              workspaceId: { type: "string" },
                              name: { type: "string", description: "Template name" },
                              type: { type: "string", enum: ["email", "dm", "call_script", "linkedin"], description: "Template type" },
                              subject: { type: "string", description: "Email subject line (for email type)" },
                              content: { type: "string", description: "Template body with {{variable}} placeholders" },
                              personaId: { type: "string", description: "Associated persona ID" },
                              cadenceStep: { type: "number", description: "Position in sequence" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "Template created successfully" },
                    },
                  },
                },
                "/research/company": {
                  post: {
                    operationId: "researchCompany",
                    summary: "Research a company by domain",
                    description: "Fetches company information and identifies sales triggers",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "domain"],
                            properties: {
                              workspaceId: { type: "string" },
                              domain: { type: "string", description: "Company domain (e.g., acme.com)" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "Company research data returned" },
                    },
                  },
                },
                "/outreach/generate": {
                  post: {
                    operationId: "generateOutreach",
                    summary: "Generate personalized outreach",
                    description: "Generates personalized outreach using template + lead data + research",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "templateId"],
                            properties: {
                              workspaceId: { type: "string" },
                              templateId: { type: "string", description: "Template to use" },
                              leadData: {
                                type: "object",
                                properties: {
                                  firstName: { type: "string" },
                                  lastName: { type: "string" },
                                  company: { type: "string" },
                                  title: { type: "string" },
                                  email: { type: "string" },
                                },
                              },
                              companyDomain: { type: "string", description: "Domain for research enrichment" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "Personalized outreach generated" },
                    },
                  },
                },
                "/activity/log": {
                  post: {
                    operationId: "logActivity",
                    summary: "Log a sales activity",
                    description: "Records an outreach activity (email sent, call made, etc.)",
                    requestBody: {
                      required: true,
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            required: ["workspaceId", "type"],
                            properties: {
                              workspaceId: { type: "string" },
                              type: { type: "string", enum: ["email", "call", "dm", "meeting", "note"] },
                              leadId: { type: "string" },
                              outcome: { type: "string" },
                              notes: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      "200": { description: "Activity logged successfully" },
                    },
                  },
                },
                "/activity/summary": {
                  get: {
                    operationId: "getActivitySummary",
                    summary: "Get activity summary",
                    description: "Returns daily/weekly activity counts vs targets",
                    parameters: [
                      { name: "workspaceId", in: "query", required: true, schema: { type: "string" } },
                      { name: "period", in: "query", schema: { type: "string", enum: ["today", "week", "month"] } },
                    ],
                    responses: {
                      "200": { description: "Activity summary returned" },
                    },
                  },
                },
              },
            }),
          },
        },
      ],
    });

    // ========================================
    // Agent Alias (for deployment)
    // ========================================
    this.agentAlias = new bedrock.CfnAgentAlias(this, "EnablyAgentAlias", {
      agentId: this.agent.attrAgentId,
      agentAliasName: "prod",
      description: "Production alias for Enably GTM Agent",
    });

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "AgentId", {
      value: this.agent.attrAgentId,
      description: "Bedrock Agent ID",
    });

    new cdk.CfnOutput(this, "AgentAliasId", {
      value: this.agentAlias.attrAgentAliasId,
      description: "Bedrock Agent Alias ID",
    });
  }
}
