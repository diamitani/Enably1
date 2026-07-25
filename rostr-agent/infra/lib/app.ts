#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EnablyStack } from "./enably-stack";
import { BedrockAgentStack } from "./bedrock-agent-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "us-east-1",
};

// Core infrastructure stack
const coreStack = new EnablyStack(app, "EnablyStack", {
  env,
  description: "Enably GTM OS - Sales enablement platform infrastructure",
});

// Bedrock Agent stack (depends on core for DynamoDB tables and S3)
new BedrockAgentStack(app, "EnablyAgentStack", {
  env,
  description: "Enably GTM OS - Bedrock Agent for AI-powered GTM assistance",
  documentsBucket: coreStack.assetBucket,
  documentsTable: coreStack.documentsTableName,
  researchTable: coreStack.researchTableName,
  activityTable: coreStack.activityTableName,
});
