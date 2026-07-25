import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const sesClient = new SESClient({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const ACTIVITY_TABLE = process.env.ACTIVITY_TABLE;

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
    const {
      to,
      subject,
      htmlBody,
      textBody,
      from,
      replyTo,
      templateId,
      variables,
      leadId,
    } = parsedBody;

    // Validate required fields
    if (!to || !subject || (!htmlBody && !textBody)) {
      return response(400, {
        error: "Missing required fields: to, subject, and body (html or text)",
      });
    }

    // Process template variables if provided
    let processedSubject = subject;
    let processedHtml = htmlBody;
    let processedText = textBody;

    if (variables) {
      processedSubject = replaceVariables(subject, variables);
      processedHtml = htmlBody ? replaceVariables(htmlBody, variables) : null;
      processedText = textBody ? replaceVariables(textBody, variables) : null;
    }

    // Send email via SES
    const emailResult = await sendEmail({
      to: Array.isArray(to) ? to : [to],
      from: from || `noreply@${process.env.SES_DOMAIN || "enably.io"}`,
      replyTo: replyTo || from,
      subject: processedSubject,
      htmlBody: processedHtml,
      textBody: processedText,
    });

    // Log activity
    await logActivity({
      workspaceId,
      type: "email_sent",
      leadId,
      templateId,
      recipient: to,
      subject: processedSubject,
      messageId: emailResult.MessageId,
    });

    return response(200, {
      success: true,
      messageId: emailResult.MessageId,
    });
  } catch (error) {
    console.error("Error:", error);

    // Log failed attempt
    await logActivity({
      workspaceId,
      type: "email_failed",
      error: error.message,
      recipient: parsedBody.to,
      subject: parsedBody.subject,
    });

    return response(500, { error: error.message });
  }
}

function replaceVariables(text, variables) {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

async function sendEmail({ to, from, replyTo, subject, htmlBody, textBody }) {
  const params = {
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Body: {},
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: from,
    ReplyToAddresses: replyTo ? [replyTo] : undefined,
  };

  if (htmlBody) {
    params.Message.Body.Html = {
      Charset: "UTF-8",
      Data: htmlBody,
    };
  }

  if (textBody) {
    params.Message.Body.Text = {
      Charset: "UTF-8",
      Data: textBody,
    };
  }

  const command = new SendEmailCommand(params);
  return await sesClient.send(command);
}

async function logActivity({
  workspaceId,
  type,
  leadId,
  templateId,
  recipient,
  subject,
  messageId,
  error,
}) {
  const now = new Date();
  const activityId = crypto.randomUUID();

  const item = {
    pk: `WS#${workspaceId}`,
    sk: `ACTIVITY#${activityId}`,
    id: activityId,
    workspaceId,
    type,
    leadId,
    templateId,
    recipient,
    subject,
    messageId,
    error,
    activityDate: now.toISOString().split("T")[0],
    createdAt: now.toISOString(),
    ttl: Math.floor(now.getTime() / 1000) + 90 * 24 * 60 * 60, // 90 days
  };

  await docClient.send(
    new PutCommand({
      TableName: ACTIVITY_TABLE,
      Item: item,
    })
  );
}
