# JSON Output Format for Test Automation

The MCP Jira Xray server extracts test information in a comprehensive JSON format designed to be consumed by test automation agents.

## Format Version: 2.0

## Structure

```json
{
  "ticket": { ... },
  "extraction": { ... },
  "testCases": [ ... ],
  "metadata": { ... }
}
```

## Fields Description

### `ticket` - Source Ticket Information

Information about the Jira ticket that tests are linked to.

```json
{
  "id": "SCRUM-1",
  "summary": "Task 1",
  "description": "Detailed description of the ticket",
  "issueType": "Task",
  "status": "To Do",
  "priority": "Medium",
  "assignee": "John Doe",
  "reporter": "Jane Smith",
  "created": "2025-11-08T21:50:20.786+0800",
  "updated": "2025-11-09T01:18:20.202+0800"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Jira ticket ID (e.g., SCRUM-1) |
| `summary` | string | Ticket title/summary |
| `description` | string | Full ticket description |
| `issueType` | string | Type of issue (Story, Task, Bug, etc.) |
| `status` | string | Current status (To Do, In Progress, Done, etc.) |
| `priority` | string | Priority level (High, Medium, Low) |
| `assignee` | string? | Person assigned to the ticket (optional) |
| `reporter` | string? | Person who created the ticket (optional) |
| `created` | string | ISO 8601 timestamp of creation |
| `updated` | string | ISO 8601 timestamp of last update |

### `extraction` - Extraction Metadata

Information about the extraction process.

```json
{
  "timestamp": "2025-11-08T17:37:00.835Z",
  "totalTests": 5,
  "linkedTests": 3,
  "executionTests": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp when extraction was performed |
| `totalTests` | number | Total number of test cases found |
| `linkedTests` | number | Number of tests directly linked to ticket |
| `executionTests` | number | Number of tests from test executions |

### `testCases` - Test Case Details

Array of detailed test case information.

```json
{
  "key": "TC-1",
  "summary": "Verify valid user can log in",
  "description": "Test verifies that a user with valid credentials can successfully log in",
  "issueType": "Test",
  "status": "To Do",
  "priority": "Medium",
  "testType": "Manual",
  "labels": ["ui", "login", "automated"],
  "steps": [
    {
      "index": 1,
      "action": "Navigate to login page",
      "data": "https://app.example.com/login",
      "expectedResult": "Login page is displayed"
    },
    {
      "index": 2,
      "action": "Enter valid username and password",
      "data": "username: test@example.com, password: Test123!",
      "expectedResult": "Credentials are entered in fields"
    },
    {
      "index": 3,
      "action": "Click login button",
      "expectedResult": "User is redirected to dashboard"
    }
  ],
  "automation": {
    "automatable": true,
    "complexity": "Medium",
    "suggested_framework": "Selenium / Playwright / Cypress"
  }
}
```

#### Test Case Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Jira test case ID (e.g., TC-1) |
| `summary` | string | Test case title/summary |
| `description` | string | Detailed test description |
| `issueType` | string | Issue type (typically "Test") |
| `status` | string | Current test status |
| `priority` | string | Test priority (High, Medium, Low) |
| `testType` | string | Type of test (Manual, Automated, etc.) |
| `labels` | string[] | Array of labels/tags |
| `steps` | TestStep[] | Array of test steps (see below) |
| `automation` | object | Automation metadata (see below) |

#### Test Steps

Each test step contains:

| Field | Type | Description |
|-------|------|-------------|
| `index` | number | Step number (1-based) |
| `action` | string | Action to perform |
| `data` | string? | Test data or input (optional) |
| `expectedResult` | string | Expected outcome |

#### Automation Metadata

Provides AI/automation agents with guidance:

| Field | Type | Description |
|-------|------|-------------|
| `automatable` | boolean | Whether test is suitable for automation |
| `complexity` | string | Complexity level: "Low", "Medium", "High", "Unknown" |
| `suggested_framework` | string | Recommended test automation framework |

**Framework Suggestions:**
- `Selenium / Playwright / Cypress` - UI tests
- `REST-assured / Postman / Playwright` - API tests
- `Appium` - Mobile tests
- `JMeter / K6` - Performance tests

**Complexity Estimation:**
- **Low**: 1-3 steps, no test data
- **Medium**: 4-6 steps or has test data
- **High**: 7+ steps with complex data

**Automatable Detection:**
Tests are marked automatable if:
- Has defined test steps
- Has labels: "automated", "automation", "api"
- Summary includes "api"

### `metadata` - Format Information

Information about the output format.

```json
{
  "format_version": "2.0",
  "generated_by": "mcp-jira-xray",
  "schema_description": "Enhanced format for test automation agents"
}
```

## Usage Examples

### Example 1: Simple Test (No Steps)

```json
{
  "ticket": {
    "id": "SCRUM-1",
    "summary": "User login feature",
    "issueType": "Story",
    "status": "In Progress",
    "priority": "High"
  },
  "extraction": {
    "timestamp": "2025-11-08T17:37:00.835Z",
    "totalTests": 1,
    "linkedTests": 1,
    "executionTests": 0
  },
  "testCases": [
    {
      "key": "TC-1",
      "summary": "Verify valid user can log in",
      "description": "Test user login functionality",
      "issueType": "Test",
      "status": "To Do",
      "priority": "Medium",
      "testType": "Manual",
      "labels": [],
      "steps": [],
      "automation": {
        "automatable": false,
        "complexity": "Unknown",
        "suggested_framework": "Selenium / Playwright / Cypress"
      }
    }
  ],
  "metadata": {
    "format_version": "2.0",
    "generated_by": "mcp-jira-xray"
  }
}
```

### Example 2: API Test with Steps

```json
{
  "testCases": [
    {
      "key": "TC-10",
      "summary": "API: Verify user creation endpoint",
      "description": "Test POST /api/users endpoint",
      "labels": ["api", "automated"],
      "steps": [
        {
          "index": 1,
          "action": "Send POST request to /api/users",
          "data": "{\"name\": \"John\", \"email\": \"john@test.com\"}",
          "expectedResult": "Response status code is 201"
        },
        {
          "index": 2,
          "action": "Verify response body",
          "expectedResult": "Response contains user ID and created timestamp"
        }
      ],
      "automation": {
        "automatable": true,
        "complexity": "Low",
        "suggested_framework": "REST-assured / Postman / Playwright"
      }
    }
  ]
}
```

## Consuming the JSON Output

### For Test Automation Agents

1. **Parse the JSON file**
2. **Iterate through `testCases` array**
3. **Check `automation.automatable` flag**
4. **Use `automation.suggested_framework` for tool selection**
5. **Convert `steps` to test code**
6. **Use `automation.complexity` for effort estimation**

### Python Example

```python
import json

def load_test_extraction(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def generate_tests(extraction):
    ticket = extraction['ticket']
    test_cases = extraction['testCases']
    
    print(f"Generating tests for: {ticket['id']} - {ticket['summary']}")
    
    for test in test_cases:
        if test['automation']['automatable']:
            print(f"\n  Test: {test['key']} - {test['summary']}")
            print(f"  Framework: {test['automation']['suggested_framework']}")
            print(f"  Complexity: {test['automation']['complexity']}")
            
            for step in test['steps']:
                print(f"    Step {step['index']}: {step['action']}")
                if step.get('data'):
                    print(f"      Data: {step['data']}")
                print(f"      Expected: {step['expectedResult']}")

# Usage
extraction = load_test_extraction('extractions/SCRUM-1_timestamp.json')
generate_tests(extraction)
```

### JavaScript/TypeScript Example

```typescript
interface TestExtraction {
  ticket: {
    id: string;
    summary: string;
    // ... other fields
  };
  testCases: TestCase[];
}

interface TestCase {
  key: string;
  summary: string;
  steps: TestStep[];
  automation: {
    automatable: boolean;
    complexity: string;
    suggested_framework: string;
  };
}

async function generatePlaywrightTest(testCase: TestCase) {
  if (!testCase.automation.automatable) return;
  
  console.log(`test('${testCase.summary}', async ({ page }) => {`);
  
  for (const step of testCase.steps) {
    console.log(`  // Step ${step.index}: ${step.action}`);
    if (step.data) {
      console.log(`  // Data: ${step.data}`);
    }
    // Generate actual Playwright code here
  }
  
  console.log('});');
}
```

## Field Mapping for Automation Tools

| JSON Field | Selenium | Playwright | REST-assured | Postman |
|------------|----------|------------|--------------|---------|
| `steps[].action` | Comment | Comment | Given/When | Step name |
| `steps[].data` | Test data | Fixture | Request body | Variables |
| `steps[].expectedResult` | Assert | Expect | Then | Tests |
| `testType` | @Tag | @tag | @Tag | Folder |
| `priority` | @Priority | - | @Priority | - |
| `labels` | @Tags | Tags | @Tags | Tags |

## Schema Validation

To validate JSON output:

```typescript
import Ajv from 'ajv';

const schema = {
  type: "object",
  required: ["ticket", "extraction", "testCases", "metadata"],
  properties: {
    ticket: { type: "object" },
    extraction: {
      type: "object",
      required: ["timestamp", "totalTests", "linkedTests", "executionTests"]
    },
    testCases: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "summary", "automation"]
      }
    },
    metadata: {
      type: "object",
      required: ["format_version", "generated_by"]
    }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);
```

## Version History

### Version 2.0 (Current)
- Enhanced test case details with steps
- Added automation metadata
- Framework suggestions
- Complexity estimation
- Comprehensive ticket information
- Support for test executions and linked tests

### Version 1.0 (Legacy)
- Basic test extraction
- Simple format: ticketId, test, testCases array

## Support

For issues or questions about the JSON format, please refer to the main README.md or open an issue.
