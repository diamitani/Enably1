import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

const WORKSPACES_TABLE = process.env.WORKSPACES_TABLE;
const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE;
const ASSET_BUCKET = process.env.ASSET_BUCKET;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,X-Workspace-Id",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  const { httpMethod, resource, pathParameters, body } = event;
  const workspaceId = pathParameters?.workspaceId;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    // Workspaces
    if (resource === "/workspaces" && httpMethod === "GET") {
      return await listWorkspaces();
    }
    if (resource === "/workspaces" && httpMethod === "POST") {
      return await createWorkspace(parsedBody);
    }
    if (resource === "/workspaces/{workspaceId}" && httpMethod === "GET") {
      return await getWorkspace(workspaceId);
    }
    if (resource === "/workspaces/{workspaceId}" && httpMethod === "PUT") {
      return await updateWorkspace(workspaceId, parsedBody);
    }
    if (resource === "/workspaces/{workspaceId}" && httpMethod === "DELETE") {
      return await deleteWorkspace(workspaceId);
    }

    // Documents (generic)
    if (
      resource === "/workspaces/{workspaceId}/documents" &&
      httpMethod === "GET"
    ) {
      return await listDocuments(workspaceId, event.queryStringParameters);
    }
    if (
      resource === "/workspaces/{workspaceId}/documents" &&
      httpMethod === "POST"
    ) {
      return await createDocument(workspaceId, parsedBody);
    }
    if (
      resource === "/workspaces/{workspaceId}/documents/{documentId}" &&
      httpMethod === "GET"
    ) {
      return await getDocument(workspaceId, pathParameters.documentId);
    }
    if (
      resource === "/workspaces/{workspaceId}/documents/{documentId}" &&
      httpMethod === "PUT"
    ) {
      return await updateDocument(
        workspaceId,
        pathParameters.documentId,
        parsedBody
      );
    }
    if (
      resource === "/workspaces/{workspaceId}/documents/{documentId}" &&
      httpMethod === "DELETE"
    ) {
      return await deleteDocument(workspaceId, pathParameters.documentId);
    }

    // ICPs
    if (resource === "/workspaces/{workspaceId}/icps" && httpMethod === "GET") {
      return await listDocuments(workspaceId, { docType: "ICP" });
    }
    if (
      resource === "/workspaces/{workspaceId}/icps" &&
      httpMethod === "POST"
    ) {
      return await createDocument(workspaceId, { ...parsedBody, docType: "ICP" });
    }
    if (
      resource === "/workspaces/{workspaceId}/icps/{icpId}" &&
      httpMethod === "GET"
    ) {
      return await getDocument(workspaceId, pathParameters.icpId);
    }
    if (
      resource === "/workspaces/{workspaceId}/icps/{icpId}" &&
      httpMethod === "PUT"
    ) {
      return await updateDocument(workspaceId, pathParameters.icpId, parsedBody);
    }
    if (
      resource === "/workspaces/{workspaceId}/icps/{icpId}" &&
      httpMethod === "DELETE"
    ) {
      return await deleteDocument(workspaceId, pathParameters.icpId);
    }

    // Personas
    if (
      resource === "/workspaces/{workspaceId}/personas" &&
      httpMethod === "GET"
    ) {
      return await listDocuments(workspaceId, { docType: "PERSONA" });
    }
    if (
      resource === "/workspaces/{workspaceId}/personas" &&
      httpMethod === "POST"
    ) {
      return await createDocument(workspaceId, {
        ...parsedBody,
        docType: "PERSONA",
      });
    }
    if (
      resource === "/workspaces/{workspaceId}/personas/{personaId}" &&
      httpMethod === "GET"
    ) {
      return await getDocument(workspaceId, pathParameters.personaId);
    }
    if (
      resource === "/workspaces/{workspaceId}/personas/{personaId}" &&
      httpMethod === "PUT"
    ) {
      return await updateDocument(
        workspaceId,
        pathParameters.personaId,
        parsedBody
      );
    }
    if (
      resource === "/workspaces/{workspaceId}/personas/{personaId}" &&
      httpMethod === "DELETE"
    ) {
      return await deleteDocument(workspaceId, pathParameters.personaId);
    }

    // Playbooks
    if (
      resource === "/workspaces/{workspaceId}/playbooks" &&
      httpMethod === "GET"
    ) {
      return await listDocuments(workspaceId, { docType: "PLAYBOOK" });
    }
    if (
      resource === "/workspaces/{workspaceId}/playbooks" &&
      httpMethod === "POST"
    ) {
      return await createDocument(workspaceId, {
        ...parsedBody,
        docType: "PLAYBOOK",
      });
    }
    if (
      resource === "/workspaces/{workspaceId}/playbooks/{playbookId}" &&
      httpMethod === "GET"
    ) {
      return await getDocument(workspaceId, pathParameters.playbookId);
    }
    if (
      resource === "/workspaces/{workspaceId}/playbooks/{playbookId}" &&
      httpMethod === "PUT"
    ) {
      return await updateDocument(
        workspaceId,
        pathParameters.playbookId,
        parsedBody
      );
    }
    if (
      resource === "/workspaces/{workspaceId}/playbooks/{playbookId}" &&
      httpMethod === "DELETE"
    ) {
      return await deleteDocument(workspaceId, pathParameters.playbookId);
    }

    // Templates
    if (
      resource === "/workspaces/{workspaceId}/templates" &&
      httpMethod === "GET"
    ) {
      return await listDocuments(workspaceId, { docType: "TEMPLATE" });
    }
    if (
      resource === "/workspaces/{workspaceId}/templates" &&
      httpMethod === "POST"
    ) {
      return await createDocument(workspaceId, {
        ...parsedBody,
        docType: "TEMPLATE",
      });
    }
    if (
      resource === "/workspaces/{workspaceId}/templates/{templateId}" &&
      httpMethod === "GET"
    ) {
      return await getDocument(workspaceId, pathParameters.templateId);
    }
    if (
      resource === "/workspaces/{workspaceId}/templates/{templateId}" &&
      httpMethod === "PUT"
    ) {
      return await updateDocument(
        workspaceId,
        pathParameters.templateId,
        parsedBody
      );
    }
    if (
      resource === "/workspaces/{workspaceId}/templates/{templateId}" &&
      httpMethod === "DELETE"
    ) {
      return await deleteDocument(workspaceId, pathParameters.templateId);
    }

    // Asset upload (pre-signed URL)
    if (
      resource === "/workspaces/{workspaceId}/assets/upload" &&
      httpMethod === "POST"
    ) {
      return await getUploadUrl(workspaceId, parsedBody);
    }

    return response(404, { error: "Not found" });
  } catch (error) {
    console.error("Error:", error);
    return response(500, { error: error.message });
  }
}

// Workspace operations
async function listWorkspaces() {
  const result = await docClient.send(
    new QueryCommand({
      TableName: WORKSPACES_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "WORKSPACE" },
    })
  );
  return response(200, { workspaces: result.Items || [] });
}

async function createWorkspace(data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item = {
    pk: "WORKSPACE",
    sk: `WS#${id}`,
    id,
    name: data.name,
    createdAt: now,
    updatedAt: now,
    settings: data.settings || {},
    gsi1pk: `WS#${id}`,
    gsi1sk: "METADATA",
  };
  await docClient.send(new PutCommand({ TableName: WORKSPACES_TABLE, Item: item }));
  return response(201, { workspace: item });
}

async function getWorkspace(workspaceId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: WORKSPACES_TABLE,
      Key: { pk: "WORKSPACE", sk: `WS#${workspaceId}` },
    })
  );
  if (!result.Item) return response(404, { error: "Workspace not found" });
  return response(200, { workspace: result.Item });
}

async function updateWorkspace(workspaceId, data) {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: WORKSPACES_TABLE,
      Key: { pk: "WORKSPACE", sk: `WS#${workspaceId}` },
      UpdateExpression: "SET #name = :name, updatedAt = :updatedAt, settings = :settings",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":updatedAt": now,
        ":settings": data.settings || {},
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return response(200, { workspace: result.Attributes });
}

async function deleteWorkspace(workspaceId) {
  await docClient.send(
    new DeleteCommand({
      TableName: WORKSPACES_TABLE,
      Key: { pk: "WORKSPACE", sk: `WS#${workspaceId}` },
    })
  );
  return response(204, {});
}

// Document operations
async function listDocuments(workspaceId, params = {}) {
  const queryParams = {
    TableName: DOCUMENTS_TABLE,
    IndexName: params.docType ? "type-index" : "updated-index",
    KeyConditionExpression: "workspaceId = :wid",
    ExpressionAttributeValues: { ":wid": workspaceId },
    ScanIndexForward: false,
    Limit: params.limit || 50,
  };

  if (params.docType) {
    queryParams.KeyConditionExpression += " AND docType = :docType";
    queryParams.ExpressionAttributeValues[":docType"] = params.docType;
  }

  const result = await docClient.send(new QueryCommand(queryParams));
  return response(200, { documents: result.Items || [] });
}

async function createDocument(workspaceId, data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const item = {
    pk: `WS#${workspaceId}`,
    sk: `DOC#${id}`,
    id,
    workspaceId,
    docType: data.docType || "DOCUMENT",
    title: data.title,
    content: data.content || {},
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(new PutCommand({ TableName: DOCUMENTS_TABLE, Item: item }));
  return response(201, { document: item });
}

async function getDocument(workspaceId, documentId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: DOCUMENTS_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOC#${documentId}` },
    })
  );
  if (!result.Item) return response(404, { error: "Document not found" });
  return response(200, { document: result.Item });
}

async function updateDocument(workspaceId, documentId, data) {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: DOCUMENTS_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOC#${documentId}` },
      UpdateExpression: "SET title = :title, content = :content, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": data.title,
        ":content": data.content || {},
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return response(200, { document: result.Attributes });
}

async function deleteDocument(workspaceId, documentId) {
  await docClient.send(
    new DeleteCommand({
      TableName: DOCUMENTS_TABLE,
      Key: { pk: `WS#${workspaceId}`, sk: `DOC#${documentId}` },
    })
  );
  return response(204, {});
}

// Asset upload
async function getUploadUrl(workspaceId, data) {
  const key = `${workspaceId}/${crypto.randomUUID()}/${data.filename}`;
  const command = new PutObjectCommand({
    Bucket: ASSET_BUCKET,
    Key: key,
    ContentType: data.contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return response(200, { uploadUrl, key });
}
