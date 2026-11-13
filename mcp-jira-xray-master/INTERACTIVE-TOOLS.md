# Interactive Setup & Validation Tools

Your MCP Jira Xray server now includes two powerful interactive tools:

## 🎯 Interactive Setup (`npm run setup`)

### What it does:
- **Prompts for configuration** - No manual .env editing needed
- **Validates in real-time** - Tests your Jira connection immediately
- **Shows helpful instructions** - Guides you to get API tokens
- **Prevents errors** - Validates email format, URLs, and JSON
- **Confirms success** - Shows your Jira display name when connected

### How to use:

```bash
cd /Users/sajith/Documents/work/sajithrw/mcp-jira-xray
npm run setup
```

### What you'll see:

```
╔════════════════════════════════════════════════════════════╗
║        MCP Jira Xray Server - Interactive Setup           ║
╚════════════════════════════════════════════════════════════╝

📋 Please provide your Jira configuration:

Jira Host (e.g., https://your-company.atlassian.net): 
```

The wizard will:
1. ✅ Prompt for your Jira host
2. ✅ Ask for your email
3. ✅ Show instructions to get API token
4. ✅ Test the connection immediately
5. ✅ Show "✅ Connection successful! Logged in as: Your Name"
6. ✅ Ask about output format preferences
7. ✅ Save everything to `.env`

---

## 🔍 Connection Validator (`npm run validate`)

### What it does:
- **Reads existing .env** - Uses your saved configuration
- **Tests connection** - Verifies you can reach Jira
- **Checks authentication** - Confirms credentials are valid
- **Lists permissions** - Shows accessible projects
- **Provides diagnostics** - Clear error messages if something's wrong

### How to use:

```bash
npm run validate
```

### What you'll see:

```
╔════════════════════════════════════════════════════════════╗
║         MCP Jira Xray - Connection Validator              ║
╚════════════════════════════════════════════════════════════╝

📋 Current Configuration:
   Host:  https://your-company.atlassian.net
   Email: you@company.com
   Token: ********************

🔄 Testing connection to Jira...

✅ Connection successful!
   Logged in as: Your Name
   Email: you@company.com
   Account ID: 123456:abc-def

🔍 Testing permissions...

✅ Can access 5 project(s)

   Available projects:
   - PROJ: Project Name
   - TEST: Test Project
   ... and more

✅ Configuration is valid!

🚀 Your MCP server is ready to use!
```

---

## 🚀 Usage Flow

### First-time setup:
```bash
# 1. Run interactive setup
npm run setup

# 2. Configuration saved automatically!
# 3. Use the server immediately
```

### Verify anytime:
```bash
# Test your connection
npm run validate
```

### If credentials change:
```bash
# Re-run setup to update
npm run setup
# It will ask if you want to overwrite existing config
```

---

## 🎨 Features

### Setup Script Features:
- ✅ **Smart URL handling** - Adds `https://` if missing
- ✅ **Email validation** - Ensures valid email format
- ✅ **Real-time testing** - Connects to Jira during setup
- ✅ **Shows logged-in user** - Confirms you're authenticated
- ✅ **Overwrite protection** - Asks before replacing existing config
- ✅ **Custom formats** - Configure output JSON structure
- ✅ **Retry on failure** - Try again if connection fails

### Validation Script Features:
- ✅ **Comprehensive checks** - Tests connection, auth, and permissions
- ✅ **Project listing** - Shows what you have access to
- ✅ **Clear diagnostics** - Specific error messages
- ✅ **Network troubleshooting** - Detects timeout, DNS, auth issues
- ✅ **Quick verification** - Fast check before using server

---

## 💡 Pro Tips

1. **Run `validate` before important work** - Ensures connection is working
2. **Use `setup` when switching Jira instances** - Quick reconfiguration
3. **Keep API tokens secure** - Never commit `.env` to git (already in `.gitignore`)
4. **Test after updates** - Run `validate` after Jira admin changes

---

## 📝 Example Session

```bash
# Initial setup
$ npm run setup
# ... enter credentials ...
# ✅ Connection successful! Logged in as: John Doe
# ✅ Configuration saved!

# Verify it works
$ npm run validate
# ✅ Configuration is valid!
# ✅ Can access 5 project(s)

# Now use with VS Code or Claude Desktop!
```

Your `.env` file is automatically created and validated! 🎉
