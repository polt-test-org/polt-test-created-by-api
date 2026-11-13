#!/usr/bin/env node
import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}
async function validateJiraConnection(host, email, apiToken) {
    try {
        const response = await axios.get(`${host}/rest/api/3/myself`, {
            auth: {
                username: email,
                password: apiToken,
            },
            timeout: 10000,
        });
        console.log(`\n✅ Connection successful! Logged in as: ${response.data.displayName}`);
        return true;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error("\n❌ Authentication failed. Please check your email and API token.");
            }
            else if (error.code === "ENOTFOUND") {
                console.error("\n❌ Could not reach Jira host. Please check the URL.");
            }
            else {
                console.error(`\n❌ Connection failed: ${error.message}`);
            }
        }
        else {
            console.error(`\n❌ Unexpected error: ${error}`);
        }
        return false;
    }
}
async function setup() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║        MCP Jira Xray Server - Interactive Setup           ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    const envPath = path.resolve(__dirname, "../.env");
    // Check if .env already exists
    try {
        await fs.access(envPath);
        console.log("⚠️  .env file already exists.\n");
        const overwrite = await question("Do you want to overwrite it? (yes/no): ");
        if (overwrite.toLowerCase() !== "yes" && overwrite.toLowerCase() !== "y") {
            console.log("\n✅ Setup cancelled. Existing configuration preserved.");
            rl.close();
            return;
        }
    }
    catch {
        // File doesn't exist, continue
    }
    console.log("\n📋 Please provide your Jira configuration:\n");
    // Get Jira Host
    let jiraHost = "";
    while (!jiraHost) {
        jiraHost = await question("Jira Host (e.g., https://your-company.atlassian.net): ");
        jiraHost = jiraHost.trim();
        if (!jiraHost) {
            console.log("❌ Jira Host is required.");
            continue;
        }
        if (!jiraHost.startsWith("http://") && !jiraHost.startsWith("https://")) {
            jiraHost = `https://${jiraHost}`;
        }
        // Remove trailing slash
        jiraHost = jiraHost.replace(/\/$/, "");
    }
    // Get Jira Email
    let jiraEmail = "";
    while (!jiraEmail) {
        jiraEmail = await question("Jira Email: ");
        jiraEmail = jiraEmail.trim();
        if (!jiraEmail) {
            console.log("❌ Jira Email is required.");
            continue;
        }
        if (!jiraEmail.includes("@")) {
            console.log("❌ Please enter a valid email address.");
            jiraEmail = "";
        }
    }
    // Get API Token
    console.log("\n💡 To get an API token:");
    console.log("   1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens");
    console.log("   2. Click 'Create API token'");
    console.log("   3. Copy the token\n");
    let apiToken = "";
    while (!apiToken) {
        apiToken = await question("Jira API Token: ");
        apiToken = apiToken.trim();
        if (!apiToken) {
            console.log("❌ API Token is required.");
        }
    }
    // Validate connection
    console.log("\n🔄 Validating connection to Jira...");
    const isValid = await validateJiraConnection(jiraHost, jiraEmail, apiToken);
    if (!isValid) {
        console.log("\n❌ Setup failed. Please check your credentials and try again.");
        const retry = await question("\nDo you want to try again? (yes/no): ");
        rl.close();
        if (retry.toLowerCase() === "yes" || retry.toLowerCase() === "y") {
            // Restart setup
            await setup();
        }
        return;
    }
    // Get output format preference
    console.log("\n📝 Output Format Configuration:\n");
    console.log("Default format: {\"ticketId\":\"\",\"test\":\"\",\"testCases\":[]}");
    const useDefault = await question("\nUse default format? (yes/no): ");
    let outputFormat = '{"ticketId":"","test":"","testCases":[]}';
    if (useDefault.toLowerCase() !== "yes" && useDefault.toLowerCase() !== "y") {
        console.log("\nEnter your custom JSON format (keys: ticketId, test, testCases):");
        const customFormat = await question("Format: ");
        if (customFormat.trim()) {
            try {
                JSON.parse(customFormat);
                outputFormat = customFormat.trim();
            }
            catch {
                console.log("⚠️  Invalid JSON format. Using default format.");
            }
        }
    }
    // Create .env content
    const envContent = `# Jira Configuration
JIRA_HOST=${jiraHost}
JIRA_EMAIL=${jiraEmail}
JIRA_API_TOKEN=${apiToken}

# Output Configuration
OUTPUT_FORMAT=${outputFormat}
`;
    // Write to .env file
    try {
        await fs.writeFile(envPath, envContent, "utf-8");
        console.log("\n✅ Configuration saved to .env file!");
        console.log("\n📁 File location:", envPath);
        console.log("\n🚀 Setup complete! You can now use the MCP server.");
        console.log("\n📖 Next steps:");
        console.log("   1. Configure your MCP client (VS Code, Claude Desktop, etc.)");
        console.log("   2. Restart the MCP client to load the server");
        console.log("   3. Try: 'Extract tests for ticket PROJ-123'\n");
    }
    catch (error) {
        console.error("\n❌ Failed to save configuration:", error);
    }
    rl.close();
}
setup().catch((error) => {
    console.error("❌ Setup failed:", error);
    rl.close();
    process.exit(1);
});
