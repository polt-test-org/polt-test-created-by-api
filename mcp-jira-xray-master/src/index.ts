#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { JiraXrayClient } from "./jira-client.js";
import { ConfigManager } from "./config.js";
import { FileOutputHandler } from "./output-handler.js";

// Initialize configuration
const config = ConfigManager.loadConfig();
const jiraClient = new JiraXrayClient(config.jira);
const outputHandler = new FileOutputHandler(config.output);

// Create MCP server instance
const server = new McpServer({
  name: "mcp-jira-xray",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// Register the extract tests tool
server.tool(
  "extract_tests",
  "Extract tests related to a given Jira ticket number",
  {
    ticketId: z.string().describe("The Jira ticket ID (e.g., PROJ-123)"),
  },
  async ({ ticketId }) => {
    try {
      console.error(`Extracting tests for ticket: ${ticketId}`);
      
      // Get ticket details
      const ticket = await jiraClient.getTicket(ticketId);
      
      // Get tests directly linked to the ticket
      const linkedTests = await jiraClient.getLinkedTests(ticketId);
      
      // Get test executions linked to the ticket
      const testExecutions = await jiraClient.getTestExecutions(ticketId);
      
      // Extract test cases from executions
      const executionTests = [];
      for (const execution of testExecutions) {
        const tests = await jiraClient.getTestsFromExecution(execution.key);
        executionTests.push(...tests);
      }
      
      // Combine all test cases
      const allTests = [...linkedTests, ...executionTests];
      
      // Format the output with comprehensive details
      const output = outputHandler.formatOutput({
        ticket: {
          id: ticket.key,
          summary: ticket.summary,
          description: ticket.description,
          issueType: ticket.issueType,
          status: ticket.status,
          priority: ticket.priority,
          assignee: ticket.assignee,
          reporter: ticket.reporter,
          created: ticket.created,
          updated: ticket.updated,
        },
        extraction: {
          timestamp: new Date().toISOString(),
          totalTests: allTests.length,
          linkedTests: linkedTests.length,
          executionTests: executionTests.length,
        },
        testCases: allTests,
      });
      
      // Save to file
      const filePath = await outputHandler.saveToFile(output, ticketId);
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully extracted tests for ${ticketId}.\n\nTicket: ${ticket.summary}\nLinked Tests: ${linkedTests.length}\nExecution Tests: ${executionTests.length}\nTotal Test Cases: ${allTests.length}\n\nOutput saved to: ${filePath}\n\nSample output:\n${JSON.stringify(output, null, 2).substring(0, 1000)}...`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error extracting tests: ${errorMessage}`);
      
      return {
        content: [
          {
            type: "text",
            text: `Error extracting tests for ${ticketId}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Register list tests tool
server.tool(
  "list_test_executions",
  "List all test executions linked to a Jira ticket",
  {
    ticketId: z.string().describe("The Jira ticket ID (e.g., PROJ-123)"),
  },
  async ({ ticketId }) => {
    try {
      console.error(`Listing test executions for ticket: ${ticketId}`);
      
      const testExecutions = await jiraClient.getTestExecutions(ticketId);
      
      const executionList = testExecutions.map((exec) => 
        `- ${exec.key}: ${exec.summary} (Status: ${exec.status})`
      ).join("\n");
      
      return {
        content: [
          {
            type: "text",
            text: `Test Executions for ${ticketId}:\n\n${executionList || "No test executions found"}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error listing test executions: ${errorMessage}`);
      
      return {
        content: [
          {
            type: "text",
            text: `Error listing test executions for ${ticketId}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Register list projects tool
server.tool(
  "list_projects",
  "List all available Jira projects you have access to",
  {},
  async () => {
    try {
      console.error(`Listing available Jira projects`);
      
      const projects = await jiraClient.getProjects();
      
      const projectList = projects.map((project) => 
        `- ${project.key}: ${project.name} (${project.projectTypeKey})`
      ).join("\n");
      
      return {
        content: [
          {
            type: "text",
            text: `Available Jira Projects:\n\n${projectList || "No projects found"}\n\nTotal: ${projects.length} project(s)`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error listing projects: ${errorMessage}`);
      
      return {
        content: [
          {
            type: "text",
            text: `Error listing Jira projects: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Jira Xray Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
