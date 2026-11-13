# MCP Jira Xray Server

A Model Context Protocol (MCP) server for extracting test information from Jira Xray. This server connects to Jira instances with Xray Test Management and extracts test cases related to specific tickets.

## Features

- 🔍 Extract tests related to any Jira ticket
- 📋 List test executions linked to tickets
- 🎨 Configurable JSON output format
- 💾 Automatic saving to the `extractions` folder
- 🔐 Secure connection using Jira API tokens

## Installation

### Prerequisites

- Node.js 17 or higher
- A Jira instance with Xray Test Management
- Jira API token

### Setup

1. Clone this repository or install via npm:

```bash
git clone <repository-url>
cd mcp-jira-xray
npm install
```

2. **Run the interactive setup:**

```bash
npm run setup
```

This will guide you through:
- Entering your Jira host URL
- Providing your Jira email
- Adding your API token
- Validating the connection
- Configuring output format

**Or** manually create a `.env` file:

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Getting a Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label and copy the token
4. Use this token in your `.env` file

## Configuration

### Jira Connection

The server requires three configuration values:

- `JIRA_HOST`: Your Jira instance URL (e.g., `https://mycompany.atlassian.net`)
- `JIRA_EMAIL`: Your Jira account email
- `JIRA_API_TOKEN`: Your Jira API token

### Output Format

The `OUTPUT_FORMAT` environment variable defines the JSON structure for extracted test data. You can customize this to match your needs.

**Default format:**
```json
{
  "ticketId": "",
  "test": "",
  "testCases": []
}
```

**Custom format example:**
```json
{
  "ticket": {
    "id": "",
    "name": ""
  },
  "tests": {
    "cases": []
  }
}
```

The server will populate the fields based on these keys:
- `ticketId` → The Jira ticket ID
- `test` → The ticket summary
- `testCases` → Array of test case descriptions

## Usage

### With VS Code

**Good news!** The server is already configured for this project in `.vscode/mcp.json`. 

**Quick Start:**
1. Make sure you've run `npm run setup` (configuration complete)
2. Open Command Palette: `Cmd/Ctrl + Shift + P`
3. Type: "MCP: Enable" and press Enter
4. Try: "Extract tests for ticket PROJ-123" in Copilot Chat

📖 **See [VSCODE-SETUP.md](./VSCODE-SETUP.md) for complete VS Code installation guide**

### With Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jira-xray": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-jira-xray/build/index.js"]
    }
  }
}
```

### Available Tools

#### 1. `extract_tests`
Extracts all tests related to a given Jira ticket.

**Parameters:**
- `ticketId` (string): The Jira ticket ID (e.g., "PROJ-123")

**Example:**
```
Extract tests for ticket PROJ-123
```

**Output:**
- Test execution details
- All test cases with descriptions
- Saved to `extractions/PROJ-123_<timestamp>.json`

#### 2. `list_test_executions`
Lists all test executions linked to a Jira ticket.

**Parameters:**
- `ticketId` (string): The Jira ticket ID

**Example:**
```
List test executions for PROJ-123
```

**Output:**
- List of test execution keys
- Test execution summaries
- Execution statuses

## Output Files

All extracted test data is saved to the `extractions/` folder with the following naming convention:

```
extractions/<TICKET-ID>_<TIMESTAMP>.json
```

Example: `extractions/PROJ-123_2024-01-15T10-30-45-123Z.json`

## Development

### Interactive Setup

Run the setup wizard:

```bash
npm run setup
```

### Validate Configuration

Test your Jira connection:

```bash
npm run validate
```

This will:
- Check your .env configuration
- Test connection to Jira
- Verify authentication
- List accessible projects
- Confirm permissions

### Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `build/` directory.

### Project Structure

```
mcp-jira-xray/
├── src/
│   ├── index.ts           # Main MCP server entry point
│   ├── jira-client.ts     # Jira API client
│   ├── config.ts          # Configuration management
│   └── output-handler.ts  # File output handling
├── build/                 # Compiled JavaScript (generated)
├── extractions/           # Output files (generated)
├── .env                   # Environment configuration
├── .env.example           # Example configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### "Missing required environment variables"

Make sure your `.env` file exists and contains all required variables (`JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`).

### "Failed to get ticket"

- Verify your Jira credentials are correct
- Check that the ticket ID exists in your Jira instance
- Ensure your API token has appropriate permissions

### "Xray API not available"

The server tries multiple methods to extract test data. If Xray-specific APIs aren't available, it falls back to standard Jira JQL queries. This may happen if:
- Xray is not installed on your Jira instance
- Your account doesn't have Xray permissions

### Connection Issues

- Ensure your `JIRA_HOST` includes the protocol (https://)
- Check that your network allows connections to Jira
- Verify your API token is valid and not expired

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues and questions:
- Check existing [GitHub Issues](<repository-url>/issues)
- Create a new issue with detailed information
- Include your Jira and Xray versions
