import axios from "axios";
export class JiraXrayClient {
    client;
    constructor(config) {
        this.client = axios.create({
            baseURL: config.host,
            auth: {
                username: config.email,
                password: config.apiToken,
            },
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });
    }
    /**
     * Get ticket details from Jira
     */
    async getTicket(ticketId) {
        try {
            const response = await this.client.get(`/rest/api/3/issue/${ticketId}`);
            const issue = response.data;
            return {
                key: issue.key,
                summary: issue.fields.summary,
                description: this.extractDescription(issue.fields.description),
                issueType: issue.fields.issuetype?.name || "Unknown",
                status: issue.fields.status?.name || "Unknown",
                priority: issue.fields.priority?.name || "Medium",
                assignee: issue.fields.assignee?.displayName || undefined,
                reporter: issue.fields.reporter?.displayName || undefined,
                created: issue.fields.created,
                updated: issue.fields.updated,
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get ticket ${ticketId}: ${error.response?.data?.errorMessages?.join(", ") || error.message}`);
            }
            throw error;
        }
    }
    /**
     * Extract plain text from Jira description (handles ADF format)
     */
    extractDescription(description) {
        if (!description)
            return "";
        // If it's already a string, return it
        if (typeof description === "string")
            return description;
        // If it's ADF (Atlassian Document Format), extract text
        if (description.type === "doc" && description.content) {
            return this.extractTextFromADF(description.content);
        }
        return "";
    }
    /**
     * Recursively extract text from ADF content
     */
    extractTextFromADF(content) {
        let text = "";
        for (const node of content) {
            if (node.type === "text") {
                text += node.text;
            }
            else if (node.content) {
                text += this.extractTextFromADF(node.content);
            }
            // Add newline after paragraphs
            if (node.type === "paragraph") {
                text += "\n";
            }
        }
        return text.trim();
    }
    /**
     * Get tests directly linked to a ticket (e.g., Story -> Test links)
     */
    async getLinkedTests(ticketId) {
        try {
            const response = await this.client.get(`/rest/api/3/issue/${ticketId}`, {
                params: {
                    fields: "issuelinks",
                },
            });
            const links = response.data.fields?.issuelinks || [];
            const testCases = [];
            for (const link of links) {
                // Check if the linked issue is a Test
                const linkedIssue = link.outwardIssue || link.inwardIssue;
                if (linkedIssue && linkedIssue.fields?.issuetype?.name === "Test") {
                    const testKey = linkedIssue.key;
                    // Get full test details
                    const testDetails = await this.getTestDetails(testKey);
                    testCases.push(testDetails);
                }
            }
            return testCases;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Failed to get linked tests: ${error.message}`);
            }
            return [];
        }
    }
    /**
     * Get detailed information about a test case
     */
    async getTestDetails(testKey) {
        try {
            const response = await this.client.get(`/rest/api/3/issue/${testKey}`);
            const issue = response.data;
            // Try to get test steps from Xray (supports both Server/DC and Cloud)
            const testSteps = await this.getTestSteps(testKey, issue.fields);
            const testType = issue.fields.customfield_10100?.value || "Manual"; // Adjust field ID as needed
            return {
                key: issue.key,
                summary: issue.fields.summary,
                description: this.extractDescription(issue.fields.description),
                issueType: issue.fields.issuetype?.name || "Test",
                status: issue.fields.status?.name || "Unknown",
                priority: issue.fields.priority?.name || "Medium",
                testType: testType,
                steps: testSteps,
                labels: issue.fields.labels || [],
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Failed to get test details for ${testKey}: ${error.message}`);
            }
            return {
                key: testKey,
                summary: "Unknown",
                description: "",
                issueType: "Test",
                status: "Unknown",
                priority: "Medium",
                labels: [],
            };
        }
    }
    /**
     * Get test steps for a test case (supports both Xray Server/DC and Cloud)
     */
    async getTestSteps(testKey, fields) {
        // Try Xray Cloud GraphQL API first
        try {
            const graphqlResponse = await this.client.post("/rest/graphql", {
                query: `
          query {
            getTests(jql: "key = ${testKey}", limit: 1) {
              results {
                issueId
                jira(fields: ["key"])
                testType {
                  name
                  kind
                }
                steps {
                  id
                  action
                  data
                  result
                }
              }
            }
          }
        `
            });
            const tests = graphqlResponse.data?.data?.getTests?.results;
            if (tests && tests.length > 0 && tests[0].steps) {
                console.error(`✓ Retrieved ${tests[0].steps.length} test steps via GraphQL for ${testKey}`);
                return tests[0].steps.map((step, index) => ({
                    index: index + 1,
                    action: step.action || "",
                    data: step.data || undefined,
                    expectedResult: step.result || "",
                }));
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`GraphQL API failed for ${testKey}: ${error.response?.status || error.message}`);
            }
        }
        // Try Xray Server/DC custom fields (various possible field IDs)
        const possibleFields = [
            'customfield_10014',
            'customfield_10015',
            'customfield_10016',
            'customfield_10017',
        ];
        for (const fieldId of possibleFields) {
            const stepsData = fields[fieldId];
            if (stepsData && Array.isArray(stepsData) && stepsData.length > 0) {
                console.error(`✓ Retrieved ${stepsData.length} test steps from ${fieldId} for ${testKey}`);
                return stepsData.map((step, index) => ({
                    index: index + 1,
                    action: step.step || step.action || "",
                    data: step.data || undefined,
                    expectedResult: step.result || step.expectedResult || "",
                }));
            }
        }
        // Log that no steps were found
        console.error(`⚠ No test steps found for ${testKey}`);
        console.error(`  Note: Xray Cloud requires additional API authentication to access test steps.`);
        console.error(`  Please refer to: https://docs.getxray.app/display/XRAYCLOUD/Authentication`);
        return [];
    }
    /**
     * Get test executions linked to a ticket
     */
    async getTestExecutions(ticketId) {
        try {
            // Search for test executions linked to the ticket using the new API
            const jql = `issue in testExecutions("${ticketId}")`;
            const response = await this.client.post("/rest/api/3/search/jql", {
                jql: jql,
                fields: ["summary", "status"],
            });
            const issues = response.data.issues || [];
            return issues.map((issue) => ({
                key: issue.key,
                summary: issue.fields.summary,
                status: issue.fields.status?.name || "Unknown",
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get test executions for ${ticketId}: ${error.response?.data?.errorMessages?.join(", ") || error.message}`);
            }
            throw error;
        }
    }
    /**
     * Get test cases from a test execution
     */
    async getTestsFromExecution(executionKey) {
        try {
            // Get tests from execution using Xray API
            const response = await this.client.get(`/rest/raven/1.0/api/testexec/${executionKey}/test`);
            const tests = response.data || [];
            // Get detailed information for each test
            const testCases = [];
            for (const test of tests) {
                const testDetails = await this.getTestDetails(test.key);
                testCases.push(testDetails);
            }
            return testCases;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                // If Xray API not available, try alternative method
                console.error(`Xray API not available, trying alternative method`);
                return await this.getTestsAlternative(executionKey);
            }
            throw error;
        }
    }
    /**
     * Alternative method to get tests if Xray API is not available
     */
    async getTestsAlternative(executionKey) {
        try {
            const jql = `issue in testsOfTestExecution("${executionKey}")`;
            const response = await this.client.post("/rest/api/3/search/jql", {
                jql: jql,
                fields: ["summary", "description"],
            });
            const issues = response.data.issues || [];
            const testCases = [];
            for (const issue of issues) {
                const testDetails = await this.getTestDetails(issue.key);
                testCases.push(testDetails);
            }
            return testCases;
        }
        catch (error) {
            console.error(`Alternative method failed, returning empty array`);
            return [];
        }
    }
    /**
     * Get all projects accessible to the user
     */
    async getProjects() {
        try {
            const response = await this.client.get("/rest/api/3/project");
            const projects = response.data || [];
            return projects.map((project) => ({
                key: project.key,
                name: project.name,
                projectTypeKey: project.projectTypeKey || "Unknown",
                style: project.style || "classic",
            }));
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get projects: ${error.response?.data?.errorMessages?.join(", ") || error.message}`);
            }
            throw error;
        }
    }
}
