# Medifi NHS Email MCP Server

Connects Cursor (or any MCP client) to your Medifi email inbox. It watches for **new unread** emails with subject **NHSINFORMATION**, scans NHS letter content with AI, and stores them for the Medifi app.

## Setup

1. Users connect their inbox in the Medifi app under **Account → NHS email inbox** (email + app password).
2. For MCP-only testing you can pass `email` and `password` to the `sync_nhs_emails` tool, or set optional `EMAIL_*` vars in `.env`.
3. Set your LLM key (`ANTHROPIC_API_KEY` recommended for PDF/image letters).

2. Install server dependencies from `server/`:
   ```bash
   cd server && npm install
   ```

## Run the MCP server

```bash
cd server && npm run mcp
```

## Cursor MCP config

Add to your Cursor MCP settings (`.cursor/mcp.json` or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "medifi-email": {
      "command": "node",
      "args": ["/absolute/path/to/Medifi/server/mcp/server.js"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `email_status` | Whether email is configured and last sync time |
| `sync_nhs_emails` | Check inbox now and process new NHSINFORMATION emails |
## App integration

After a user connects their inbox in **Account**, the app checks every 2 minutes. New **NHSINFORMATION** emails appear under **Your Letters**.
