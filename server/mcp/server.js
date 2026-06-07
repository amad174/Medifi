#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  syncNhsEmails,
  getEmailStatus,
  emailConfigured,
} from "../emailInbox.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const server = new McpServer({
  name: "medifi-email",
  version: "1.0.0",
});

const credentialsSchema = {
  email: z.string().email().optional().describe("Inbox email address"),
  password: z.string().optional().describe("Email or app password"),
  imapHost: z.string().optional(),
  imapPort: z.number().optional(),
  userId: z.string().optional().describe("User id for tracking processed emails"),
};

server.tool(
  "email_status",
  "Check NHS email inbox sync status for a user or server .env fallback",
  credentialsSchema,
  async (args) => {
    const credentials = args.email && args.password
      ? { email: args.email, password: args.password, imapHost: args.imapHost, imapPort: args.imapPort }
      : undefined;
    const status = await getEmailStatus({ userId: args.userId, credentials });
    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
    };
  }
);

server.tool(
  "sync_nhs_emails",
  "Read new unread NHSINFORMATION emails, scan NHS documents with AI, and return parsed letters",
  credentialsSchema,
  async (args) => {
    const credentials = args.email && args.password
      ? { email: args.email, password: args.password, imapHost: args.imapHost, imapPort: args.imapPort }
      : undefined;
    if (!emailConfigured(credentials)) {
      return {
        content: [{
          type: "text",
          text: "No email credentials. Pass email + password to this tool, or connect inbox in the Medifi app Account screen.",
        }],
        isError: true,
      };
    }
    const result = await syncNhsEmails({ userId: args.userId, credentials });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
