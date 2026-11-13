# Quick Setup Guide

Follow these steps to get started with the MCP Jira Xray Server:

## Method 1: Interactive Setup (Recommended)

Run the interactive setup wizard:

```bash
cd /Users/sajith/Documents/work/sajithrw/mcp-jira-xray
npm run setup
```

The setup wizard will:
1. ✅ Prompt for your Jira host URL
2. ✅ Ask for your Jira email
3. ✅ Request your API token (with instructions on how to get it)
4. ✅ Validate the connection in real-time
5. ✅ Let you configure the output format
6. ✅ Save everything to `.env` automatically

## Method 2: Manual Setup

If you prefer manual configuration:

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Jira credentials:

```env
JIRA_HOST=https://your-instance.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
OUTPUT_FORMAT={"ticketId":"","test":"","testCases":[]}
```

### 2. Validate Your Configuration

Test your connection:

```bash
npm run validate
```

This will verify:
- Your Jira credentials are correct
- You can connect to the Jira instance
- You have the necessary permissions
- List your accessible projects

## 3. Get Jira API Token (If needed)

1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token and paste it in your `.env` file

## 4. Configure Claude Desktop (or other MCP client)

## Method 2: Manual Setup

If you prefer manual configuration:

### 1. Configure Environment

### For Claude Desktop:

**macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "jira-xray": {
      "command": "node",
      "args": [
        "/Users/sajith/Documents/work/sajithrw/mcp-jira-xray/build/index.js"
      ]
    }
  }
}
```

**Important:** Update the path to match your actual installation directory!

## 5. Restart Claude Desktop

Completely quit and restart Claude Desktop to load the new MCP server.

## 6. Test the Server

In Claude Desktop, try these commands:

```
Extract tests for ticket PROJ-123
```

```
List test executions for PROJ-456
```

## 7. Check Output

Extracted test data will be saved in:
```
/Users/sajith/Documents/work/sajithrw/mcp-jira-xray/extractions/
```

## Quick Validation Commands

```bash
# Run interactive setup
npm run setup

# Test your connection
npm run validate

# Rebuild if needed
npm run build
```

## Troubleshooting

### Server Not Showing Up
- Check that the path in `claude_desktop_config.json` is correct
- Ensure the build directory exists and contains `index.js`
- Restart Claude Desktop completely

### Authentication Errors
- Verify your `JIRA_HOST` includes `https://`
- Check your API token is valid
- Ensure your email matches your Jira account

### No Test Data Found
- Verify the ticket ID exists in Jira
- Check that Xray is installed in your Jira instance
- Ensure you have permission to view tests

## Next Steps

- Customize the `OUTPUT_FORMAT` in `.env` to match your needs
- Review the full documentation in `README.md`
- Check the `extractions/` folder for saved test data

## Need Help?

- Read the full README.md
- Check the Jira API documentation
- Verify your Xray installation
