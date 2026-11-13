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

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testConnection(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         MCP Jira Xray - Connection Validator              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const envPath = path.resolve(__dirname, "../.env");

  // Check if .env exists
  try {
    await fs.access(envPath);
  } catch {
    console.error("❌ .env file not found!");
    console.log("\n💡 Run 'npm run setup' to configure the server first.\n");
    rl.close();
    return;
  }

  // Read .env file
  const envContent = await fs.readFile(envPath, "utf-8");
  const envVars: Record<string, string> = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      if (key && values.length > 0) {
        envVars[key.trim()] = values.join("=").trim();
      }
    }
  });

  const host = envVars.JIRA_HOST;
  const email = envVars.JIRA_EMAIL;
  const token = envVars.JIRA_API_TOKEN;

  if (!host || !email || !token) {
    console.error("❌ Missing required configuration in .env file!");
    console.log("\n💡 Run 'npm run setup' to reconfigure.\n");
    rl.close();
    return;
  }

  console.log("📋 Current Configuration:");
  console.log(`   Host:  ${host}`);
  console.log(`   Email: ${email}`);
  console.log(`   Token: ${"*".repeat(20)}\n`);

  console.log("🔄 Testing connection to Jira...\n");

  try {
    // Test basic connection
    const response = await axios.get(`${host}/rest/api/3/myself`, {
      auth: {
        username: email,
        password: token,
      },
      timeout: 10000,
    });

    console.log("✅ Connection successful!");
    console.log(`   Logged in as: ${response.data.displayName}`);
    console.log(`   Email: ${response.data.emailAddress}`);
    console.log(`   Account ID: ${response.data.accountId}\n`);

    // Test permissions
    console.log("🔍 Testing permissions...\n");

    try {
      const projectsResponse = await axios.get(`${host}/rest/api/3/project`, {
        auth: {
          username: email,
          password: token,
        },
        timeout: 10000,
      });

      console.log(`✅ Can access ${projectsResponse.data.length} project(s)`);
      
      if (projectsResponse.data.length > 0) {
        console.log("\n   Available projects:");
        projectsResponse.data.slice(0, 5).forEach((project: any) => {
          console.log(`   - ${project.key}: ${project.name}`);
        });
        if (projectsResponse.data.length > 5) {
          console.log(`   ... and ${projectsResponse.data.length - 5} more`);
        }
      }
    } catch (permError) {
      console.log("⚠️  Limited permissions - cannot list projects");
    }

    console.log("\n✅ Configuration is valid!");
    console.log("\n🚀 Your MCP server is ready to use!\n");

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error("❌ Authentication failed!");
        console.error("   Please check your email and API token.");
      } else if (error.code === "ENOTFOUND") {
        console.error("❌ Could not reach Jira host!");
        console.error(`   Please check the URL: ${host}`);
      } else if (error.code === "ETIMEDOUT") {
        console.error("❌ Connection timed out!");
        console.error("   Please check your network connection.");
      } else {
        console.error(`❌ Connection failed: ${error.message}`);
      }
    } else {
      console.error(`❌ Unexpected error: ${error}`);
    }

    console.log("\n💡 Run 'npm run setup' to reconfigure.\n");
  }

  rl.close();
}

testConnection().catch((error) => {
  console.error("❌ Validation failed:", error);
  rl.close();
  process.exit(1);
});
