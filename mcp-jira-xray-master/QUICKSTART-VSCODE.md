# VS Code MCP Quick Start

## ⚡ TL;DR - Get Started in 3 Steps

```bash
# 1. Configure the server (if not done already)
npm run setup

# 2. Open VS Code in this project
code .

# 3. Enable MCP in VS Code
# Press: Cmd + Shift + P → Type: "MCP: Enable" → Enter
```

**That's it!** The `.vscode/mcp.json` is already configured. ✅

---

## 🎯 How to Use

### Method 1: With GitHub Copilot Chat (Easiest)

1. Open Copilot Chat panel (click chat icon or press `Cmd + I`)
2. Type natural language commands:

```
Extract tests for ticket PROJ-123
```

```
List test executions for PROJ-456
```

Copilot will automatically use the MCP tools!

### Method 2: Direct Tool Execution

1. Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows)
2. Type: `MCP: Run Tool`
3. Select `jira-xray`
4. Choose tool:
   - `extract_tests` - Extract tests for a ticket
   - `list_test_executions` - List test executions
5. Enter ticket ID (e.g., `PROJ-123`)

---

## 🔍 Verify Installation

### Check if MCP is Working

1. `Cmd + Shift + P` → "MCP: Show MCP Servers"
2. You should see `jira-xray` listed
3. Click to expand and see tools

### View Server Status

1. `Cmd + Shift + U` (Open Output panel)
2. Dropdown → Select "Model Context Protocol"
3. Look for `jira-xray` messages

---

## 📁 What's Already Configured

✅ **`.vscode/mcp.json`** - Points to your built server  
✅ **`build/index.js`** - Compiled MCP server  
✅ **`.env`** - Your Jira credentials (after running setup)  

All you need to do is **enable MCP in VS Code**!

---

## 🐛 Troubleshooting

### "MCP server not found"

```bash
# 1. Make sure setup is complete
npm run validate

# 2. Rebuild if needed
npm run build

# 3. Restart VS Code
```

### "Connection failed" when using tools

```bash
# Test your Jira connection
npm run validate
```

If this fails, run `npm run setup` to reconfigure.

### "Command not found: MCP"

Update VS Code to version 1.90.0 or higher.

---

## 📚 Full Documentation

- **[VSCODE-SETUP.md](./VSCODE-SETUP.md)** - Complete VS Code guide
- **[SETUP.md](./SETUP.md)** - Configuration guide
- **[INTERACTIVE-TOOLS.md](./INTERACTIVE-TOOLS.md)** - Setup & validation tools
- **[README.md](./README.md)** - Full project documentation

---

## 💡 Pro Tips

1. **Use natural language** - Copilot understands: "Get tests for PROJ-123"
2. **Check extractions folder** - All results saved to `extractions/`
3. **Validate before big tasks** - Run `npm run validate` to ensure connection works
4. **Share with team** - The `.vscode/mcp.json` is in git, so teammates get it automatically

---

**Need help?** See [VSCODE-SETUP.md](./VSCODE-SETUP.md) for detailed troubleshooting!
