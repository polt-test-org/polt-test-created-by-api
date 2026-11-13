import fs from "fs/promises";
import path from "path";

export interface TestStep {
  index: number;
  action: string;
  data?: string;
  expectedResult: string;
}

export interface TestCase {
  key: string;
  summary: string;
  description: string;
  issueType: string;
  status: string;
  priority: string;
  testType?: string;
  steps?: TestStep[];
  labels: string[];
}

export interface TestExtractionData {
  ticket: {
    id: string;
    summary: string;
    description: string;
    issueType: string;
    status: string;
    priority: string;
    assignee?: string;
    reporter?: string;
    created: string;
    updated: string;
  };
  extraction: {
    timestamp: string;
    totalTests: number;
    linkedTests: number;
    executionTests: number;
  };
  testCases: TestCase[];
}

export class FileOutputHandler {
  private outputDirectory: string;

  constructor(config: { format?: any; directory: string }) {
    this.outputDirectory = config.directory;
  }

  /**
   * Format output with comprehensive test automation details
   */
  formatOutput(data: TestExtractionData): any {
    return {
      ticket: data.ticket,
      extraction: data.extraction,
      testCases: data.testCases.map((testCase) => ({
        key: testCase.key,
        summary: testCase.summary,
        description: testCase.description,
        issueType: testCase.issueType,
        status: testCase.status,
        priority: testCase.priority,
        testType: testCase.testType || "Manual",
        labels: testCase.labels,
        steps: testCase.steps || [],
        automation: {
          automatable: this.isAutomatable(testCase),
          complexity: this.estimateComplexity(testCase),
          suggested_framework: this.suggestFramework(testCase),
        },
      })),
      metadata: {
        format_version: "2.0",
        generated_by: "mcp-jira-xray",
        schema_description: "Enhanced format for test automation agents",
      },
    };
  }

  /**
   * Determine if a test case is automatable
   */
  private isAutomatable(testCase: TestCase): boolean {
    // Tests with steps and clear expected results are more automatable
    const hasSteps = testCase.steps && testCase.steps.length > 0;
    const hasLabels = testCase.labels.includes("automated") || testCase.labels.includes("automation");
    const isApiTest = testCase.labels.includes("api") || testCase.summary.toLowerCase().includes("api");
    
    return hasSteps || hasLabels || isApiTest;
  }

  /**
   * Estimate complexity of test automation
   */
  private estimateComplexity(testCase: TestCase): string {
    const stepCount = testCase.steps?.length || 0;
    const hasData = testCase.steps?.some((step) => step.data) || false;
    
    if (stepCount === 0) return "Unknown";
    if (stepCount <= 3 && !hasData) return "Low";
    if (stepCount <= 6 || hasData) return "Medium";
    return "High";
  }

  /**
   * Suggest test automation framework based on test characteristics
   */
  private suggestFramework(testCase: TestCase): string {
    const summary = testCase.summary.toLowerCase();
    const description = testCase.description.toLowerCase();
    const labels = testCase.labels.map((l) => l.toLowerCase());
    
    if (labels.includes("api") || summary.includes("api") || description.includes("endpoint")) {
      return "REST-assured / Postman / Playwright";
    }
    
    if (labels.includes("ui") || summary.includes("ui") || summary.includes("login") || summary.includes("verify")) {
      return "Selenium / Playwright / Cypress";
    }
    
    if (labels.includes("mobile") || summary.includes("mobile") || summary.includes("app")) {
      return "Appium";
    }
    
    if (labels.includes("performance") || summary.includes("performance") || summary.includes("load")) {
      return "JMeter / K6";
    }
    
    return "Selenium / Playwright (default)";
  }

  /**
   * Save formatted output to file
   */
  async saveToFile(data: any, ticketId: string): Promise<string> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDirectory, { recursive: true });
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${ticketId}_${timestamp}.json`;
      const filePath = path.join(this.outputDirectory, filename);
      
      // Write to file with pretty printing
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      
      console.error(`Output saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save output file: ${errorMessage}`);
    }
  }

  /**
   * List all extraction files for a ticket
   */
  async listExtractions(ticketId?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDirectory);
      
      if (ticketId) {
        return files.filter((file) => file.startsWith(ticketId));
      }
      
      return files.filter((file) => file.endsWith(".json"));
    } catch (error) {
      return [];
    }
  }
}
