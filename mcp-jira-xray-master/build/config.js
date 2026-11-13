import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
config({ path: path.resolve(__dirname, "../.env") });
export class ConfigManager {
    static loadConfig() {
        // Validate required environment variables
        const requiredVars = ["JIRA_HOST", "JIRA_EMAIL", "JIRA_API_TOKEN"];
        const missing = requiredVars.filter((varName) => !process.env[varName]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}\n` +
                `Please create a .env file based on .env.example`);
        }
        // Parse output format
        let outputFormat;
        try {
            outputFormat = process.env.OUTPUT_FORMAT
                ? JSON.parse(process.env.OUTPUT_FORMAT)
                : { ticketId: "", test: "", testCases: [] };
        }
        catch (error) {
            console.error("Warning: Invalid OUTPUT_FORMAT in .env, using default format");
            outputFormat = { ticketId: "", test: "", testCases: [] };
        }
        return {
            jira: {
                host: process.env.JIRA_HOST,
                email: process.env.JIRA_EMAIL,
                apiToken: process.env.JIRA_API_TOKEN,
            },
            output: {
                format: outputFormat,
                directory: path.resolve(__dirname, "../extractions"),
            },
        };
    }
}
