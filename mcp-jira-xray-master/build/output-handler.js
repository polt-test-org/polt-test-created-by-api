import fs from "fs/promises";
import path from "path";
export class FileOutputHandler {
    outputDirectory;
    constructor(config) {
        this.outputDirectory = config.directory;
    }
    /**
     * Format output with comprehensive test automation details
     */
    formatOutput(data) {
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
    isAutomatable(testCase) {
        // Tests with steps and clear expected results are more automatable
        const hasSteps = testCase.steps && testCase.steps.length > 0;
        const hasLabels = testCase.labels.includes("automated") || testCase.labels.includes("automation");
        const isApiTest = testCase.labels.includes("api") || testCase.summary.toLowerCase().includes("api");
        return hasSteps || hasLabels || isApiTest;
    }
    /**
     * Estimate complexity of test automation
     */
    estimateComplexity(testCase) {
        const stepCount = testCase.steps?.length || 0;
        const hasData = testCase.steps?.some((step) => step.data) || false;
        if (stepCount === 0)
            return "Unknown";
        if (stepCount <= 3 && !hasData)
            return "Low";
        if (stepCount <= 6 || hasData)
            return "Medium";
        return "High";
    }
    /**
     * Suggest test automation framework based on test characteristics
     */
    suggestFramework(testCase) {
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
    async saveToFile(data, ticketId) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save output file: ${errorMessage}`);
        }
    }
    /**
     * List all extraction files for a ticket
     */
    async listExtractions(ticketId) {
        try {
            const files = await fs.readdir(this.outputDirectory);
            if (ticketId) {
                return files.filter((file) => file.startsWith(ticketId));
            }
            return files.filter((file) => file.endsWith(".json"));
        }
        catch (error) {
            return [];
        }
    }
}
