# Installing MCP Jira Xray Server in VS Code

This guide shows you how to use the MCP Jira Xray server with VS Code's built-in MCP support.

## Prerequisites

- **VS Code** version 1.90.0 or higher
- **Node.js** 17 or higher
- Completed the interactive setup (`npm run setup`)

## Installation Steps

### 1. Verify Your Configuration

First, make sure your server is configured:

```bash
cd /Users/sajith/Documents/work/sajithrw/mcp-jira-xray
npm run validate
```

If this fails, run `npm run setup` first.

### 2. Configure VS Code MCP Settings

VS Code can read MCP servers from two places:

#### Option A: Project-Level (Already Configured! ✅)

The server is already configured in `.vscode/mcp.json` for this workspace:

```json
{
  "servers": {
    "jira-xray": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/Users/sajith/Documents/work/sajithrw/mcp-jira-xray/build/index.js"
      ]
    }
  }
}
```

**This means the server is already set up for this project!** 🎉

#### Option B: User-Level (For All Projects)

To make the server available in all VS Code projects:

1. Open VS Code Settings (JSON):
   - Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
   - Type: "Preferences: Open User Settings (JSON)"
   - Press Enter

2. Add the MCP configuration:

```json
{
  // ... your other settings ...
  "mcp.servers": {
    "jira-xray": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/Users/sajith/Documents/work/sajithrw/mcp-jira-xray/build/index.js"
      ]
    }
  }
}
```

### 3. Enable MCP in VS Code

1. Open Command Palette: `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
2. Type: "MCP: Enable"
3. Press Enter

### 4. Verify Server is Running

1. Open Command Palette: `Cmd + Shift + P`
2. Type: "MCP: Show MCP Servers"
3. You should see `jira-xray` in the list
4. Click on it to see available tools:
   - `extract_tests`
   - `list_test_executions`
   - `list_projects`

### 5. Test the Server

#### Using GitHub Copilot Chat:

1. Open Copilot Chat (icon in sidebar or `Cmd + I`)
2. Try these commands:

```
@workspace /tools

List all Jira projects

Extract tests for ticket PROJ-123

List test executions for PROJ-456
```

#### Using Command Palette:

1. `Cmd + Shift + P`
2. Type: "MCP: Run Tool"
3. Select `jira-xray`
4. Choose a tool (`extract_tests`, `list_test_executions`, or `list_projects`)
5. Enter parameters if needed (ticket ID for extract/list executions)

## Troubleshooting

### Server Not Appearing

**Check MCP Status:**
1. `Cmd + Shift + P` → "MCP: Show MCP Servers"
2. Look for any error messages

**Common Issues:**

1. **`.env` file missing or incomplete**
   ```bash
   npm run setup
   ```

2. **Build files not present**
   ```bash
   npm run build
   ```

3. **Path is incorrect in mcp.json**
   - Check that the path in `.vscode/mcp.json` matches your installation
   - Use absolute paths, not relative

4. **VS Code needs restart**
   - Completely quit VS Code
   - Reopen the project

### Check Server Logs

1. Open Output panel: `Cmd + Shift + U` (macOS) or `Ctrl + Shift + U` (Windows/Linux)
2. Select "Model Context Protocol" from dropdown
3. Look for errors from `jira-xray` server

### Test Server Manually

Run the server directly to see errors:

```bash
node /Users/sajith/Documents/work/sajithrw/mcp-jira-xray/build/index.js
```

If it doesn't error immediately, the server is waiting for input (working correctly).
Press `Ctrl + C` to exit.

## Using the Server

### With GitHub Copilot

Once configured, you can use natural language:

```
List all available Jira projects

Extract all tests for JIRA ticket PROJ-123
```

Copilot will automatically:
1. Detect the `extract_tests` tool is available
2. Call it with the ticket ID
3. Show you the results
4. Tell you where the file was saved

### Direct Tool Invocation

1. `Cmd + Shift + P` → "MCP: Run Tool"
2. Select `jira-xray` server
3. Choose tool:
   - `list_projects` - List all accessible Jira projects
   - `extract_tests` - Extract all tests for a ticket
   - `list_test_executions` - List test executions for a ticket
4. Enter ticket ID if required (for extract_tests and list_test_executions)
5. View results

### View Extracted Data

All extractions are saved in:
```
/Users/sajith/Documents/work/sajithrw/mcp-jira-xray/extractions/
```

Files are named: `TICKET-ID_TIMESTAMP.json`

## Features in VS Code

### 1. IntelliSense for Tools

When using Copilot, it knows about your MCP tools and can suggest them.

### 2. Tool Discovery

VS Code automatically discovers MCP tools and makes them available to AI features.

### 3. Workspace Integration

The `.vscode/mcp.json` file means anyone who opens this project gets the MCP server automatically.

### 4. Easy Debugging

You can see server logs in the Output panel for troubleshooting.

## Quick Reference

### Configuration Files

- **Project config**: `.vscode/mcp.json` (already set up ✅)
- **User config**: VS Code Settings JSON
- **Server config**: `.env` file in project root

### Common Commands

```bash
# Configure server (first time)
npm run setup

# Test connection
npm run validate

# Rebuild if needed
npm run build

# Run server manually (for testing)
node build/index.js
```

### VS Code Commands

- `Cmd/Ctrl + Shift + P` → "MCP: Show MCP Servers"
- `Cmd/Ctrl + Shift + P` → "MCP: Run Tool"
- `Cmd/Ctrl + Shift + P` → "MCP: Enable"
- `Cmd/Ctrl + Shift + U` → Open Output Panel

## Next Steps

1. ✅ Server is already configured in `.vscode/mcp.json`
2. ✅ Run `npm run validate` to test connection
3. ✅ Enable MCP in VS Code
4. ✅ Test with Copilot: "Extract tests for ticket PROJ-123"

## Advanced: Multiple Projects

To use this server in other VS Code projects:

1. Add to User Settings (Option B above), OR
2. Copy `.vscode/mcp.json` to other projects, OR
3. Create a symlink to this project's `.vscode/mcp.json`

## Support

If the server isn't working:

1. Check server status: `npm run validate`
2. View VS Code logs: Output panel → "Model Context Protocol"
3. Test manually: `node build/index.js`
4. Verify `.env` file exists and has correct values
5. Check path in `.vscode/mcp.json` is correct

---

**You're all set!** The server is already configured for this project. Just enable MCP in VS Code and start using it! 🚀
