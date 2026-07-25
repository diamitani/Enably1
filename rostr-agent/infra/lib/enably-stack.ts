import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ses from "aws-cdk-lib/aws-ses";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class EnablyStack extends cdk.Stack {
  public readonly assetBucket: s3.Bucket;
  public readonly documentsTableName: string;
  public readonly researchTableName: string;
  public readonly activityTableName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // S3 Bucket - Asset Storage
    // ========================================
    const assetBucket = new s3.Bucket(this, "EnablyAssetBucket", {
      bucketName: `enably-assets-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: "DeleteOldVersions",
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ========================================
    // DynamoDB Tables
    // ========================================

    // Workspaces table - stores workspace/tenant data
    const workspacesTable = new dynamodb.Table(this, "WorkspacesTable", {
      tableName: "enably-workspaces",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    workspacesTable.addGlobalSecondaryIndex({
      indexName: "gsi1",
      partitionKey: { name: "gsi1pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "gsi1sk", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Documents table - ICPs, Personas, Playbooks, Templates
    const documentsTable = new dynamodb.Table(this, "DocumentsTable", {
      tableName: "enably-documents",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    documentsTable.addGlobalSecondaryIndex({
      indexName: "type-index",
      partitionKey: {
        name: "workspaceId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "docType", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    documentsTable.addGlobalSecondaryIndex({
      indexName: "updated-index",
      partitionKey: {
        name: "workspaceId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "updatedAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Research table - company snapshots, enrichment data
    const researchTable = new dynamodb.Table(this, "ResearchTable", {
      tableName: "enably-research",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Activity table - tasks, outreach logs, analytics
    const activityTable = new dynamodb.Table(this, "ActivityTable", {
      tableName: "enably-activity",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    activityTable.addGlobalSecondaryIndex({
      indexName: "date-index",
      partitionKey: {
        name: "workspaceId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "activityDate", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ========================================
    // Secrets Manager - API Keys
    // ========================================
    const apiSecrets = new secretsmanager.Secret(this, "EnablyApiSecrets", {
      secretName: "enably/api-keys",
      description: "API keys for Enably integrations (HubSpot, Clearbit, etc.)",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          hubspot_api_key: "",
          clearbit_api_key: "",
          openai_api_key: "",
        }),
        generateStringKey: "placeholder",
      },
    });

    // ========================================
    // Lambda Functions
    // ========================================

    // Lambda execution role with Bedrock access
    const lambdaRole = new iam.Role(this, "EnablyLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB access
    workspacesTable.grantReadWriteData(lambdaRole);
    documentsTable.grantReadWriteData(lambdaRole);
    researchTable.grantReadWriteData(lambdaRole);
    activityTable.grantReadWriteData(lambdaRole);

    // Grant S3 access
    assetBucket.grantReadWrite(lambdaRole);

    // Grant Secrets Manager access
    apiSecrets.grantRead(lambdaRole);

    // Grant Bedrock access
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: ["*"],
      })
    );

    // Grant SES access
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );

    // Environment variables for all lambdas
    const lambdaEnv = {
      WORKSPACES_TABLE: workspacesTable.tableName,
      DOCUMENTS_TABLE: documentsTable.tableName,
      RESEARCH_TABLE: researchTable.tableName,
      ACTIVITY_TABLE: activityTable.tableName,
      ASSET_BUCKET: assetBucket.bucketName,
      SECRETS_ARN: apiSecrets.secretArn,
      BEDROCK_MODEL_ID: "anthropic.claude-3-sonnet-20240229-v1:0",
    };

    // API Handler Lambda
    const apiHandler = new lambda.Function(this, "ApiHandler", {
      functionName: "enably-api-handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/api"),
      role: lambdaRole,
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Assistant Lambda (Bedrock integration)
    const assistantHandler = new lambda.Function(this, "AssistantHandler", {
      functionName: "enably-assistant-handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/assistant"),
      role: lambdaRole,
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Research Lambda (enrichment, company snapshots)
    const researchHandler = new lambda.Function(this, "ResearchHandler", {
      functionName: "enably-research-handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/research"),
      role: lambdaRole,
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Outreach Lambda (SES email sending)
    const outreachHandler = new lambda.Function(this, "OutreachHandler", {
      functionName: "enably-outreach-handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/outreach"),
      role: lambdaRole,
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // ========================================
    // API Gateway
    // ========================================
    const api = new apigateway.RestApi(this, "EnablyApi", {
      restApiName: "Enably GTM API",
      description: "API for Enably GTM OS",
      deployOptions: {
        stageName: "v1",
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Api-Key",
          "X-Workspace-Id",
        ],
      },
    });

    // API Resources
    const workspaces = api.root.addResource("workspaces");
    const workspace = workspaces.addResource("{workspaceId}");

    const documents = workspace.addResource("documents");
    const document = documents.addResource("{documentId}");

    const icps = workspace.addResource("icps");
    const icp = icps.addResource("{icpId}");

    const personas = workspace.addResource("personas");
    const persona = personas.addResource("{personaId}");

    const playbooks = workspace.addResource("playbooks");
    const playbook = playbooks.addResource("{playbookId}");

    const templates = workspace.addResource("templates");
    const template = templates.addResource("{templateId}");

    const research = workspace.addResource("research");
    const researchItem = research.addResource("{domain}");

    const assistant = workspace.addResource("assistant");
    const assistantChat = assistant.addResource("chat");

    const outreach = workspace.addResource("outreach");
    const outreachSend = outreach.addResource("send");

    const assets = workspace.addResource("assets");
    const assetUpload = assets.addResource("upload");

    // Lambda integrations
    const apiIntegration = new apigateway.LambdaIntegration(apiHandler);
    const assistantIntegration = new apigateway.LambdaIntegration(
      assistantHandler
    );
    const researchIntegration = new apigateway.LambdaIntegration(
      researchHandler
    );
    const outreachIntegration = new apigateway.LambdaIntegration(
      outreachHandler
    );

    // Wire up routes
    workspaces.addMethod("GET", apiIntegration);
    workspaces.addMethod("POST", apiIntegration);
    workspace.addMethod("GET", apiIntegration);
    workspace.addMethod("PUT", apiIntegration);
    workspace.addMethod("DELETE", apiIntegration);

    documents.addMethod("GET", apiIntegration);
    documents.addMethod("POST", apiIntegration);
    document.addMethod("GET", apiIntegration);
    document.addMethod("PUT", apiIntegration);
    document.addMethod("DELETE", apiIntegration);

    icps.addMethod("GET", apiIntegration);
    icps.addMethod("POST", apiIntegration);
    icp.addMethod("GET", apiIntegration);
    icp.addMethod("PUT", apiIntegration);
    icp.addMethod("DELETE", apiIntegration);

    personas.addMethod("GET", apiIntegration);
    personas.addMethod("POST", apiIntegration);
    persona.addMethod("GET", apiIntegration);
    persona.addMethod("PUT", apiIntegration);
    persona.addMethod("DELETE", apiIntegration);

    playbooks.addMethod("GET", apiIntegration);
    playbooks.addMethod("POST", apiIntegration);
    playbook.addMethod("GET", apiIntegration);
    playbook.addMethod("PUT", apiIntegration);
    playbook.addMethod("DELETE", apiIntegration);

    templates.addMethod("GET", apiIntegration);
    templates.addMethod("POST", apiIntegration);
    template.addMethod("GET", apiIntegration);
    template.addMethod("PUT", apiIntegration);
    template.addMethod("DELETE", apiIntegration);

    research.addMethod("GET", researchIntegration);
    researchItem.addMethod("GET", researchIntegration);
    researchItem.addMethod("POST", researchIntegration);

    assistantChat.addMethod("POST", assistantIntegration);

    outreachSend.addMethod("POST", outreachIntegration);

    assetUpload.addMethod("POST", apiIntegration);

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
      description: "API Gateway endpoint URL",
    });

    new cdk.CfnOutput(this, "AssetBucketName", {
      value: assetBucket.bucketName,
      description: "S3 bucket for assets",
    });

    new cdk.CfnOutput(this, "WorkspacesTableName", {
      value: workspacesTable.tableName,
      description: "DynamoDB workspaces table",
    });

    new cdk.CfnOutput(this, "DocumentsTableName", {
      value: documentsTable.tableName,
      description: "DynamoDB documents table",
    });
  }
}
