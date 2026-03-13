export interface AuditResult {
  summary: string;
  severity: {
    critical: Finding[];
    high: Finding[];
    medium: Finding[];
    low: Finding[];
    info: Finding[];
  };
  gasOptimizations: string[];
  overallScore: string;
  recommendation: string;
}

export interface Finding {
  title: string;
  description: string;
  location?: string;
  recommendation: string;
}

const SYSTEM_PROMPT = `You are an expert Solidity security auditor with deep knowledge of EVM, common attack vectors, and DeFi security patterns.

When auditing a contract, analyze:
1. Reentrancy vulnerabilities
2. Integer overflow/underflow
3. Access control issues
4. Front-running risks
5. Oracle manipulation
6. Flash loan attack surfaces
7. Centralization risks
8. Gas optimization opportunities
9. Logic errors and edge cases
10. Missing events and input validation

Respond ONLY with a valid JSON object matching this structure:
{
  "summary": "2-3 sentence overview",
  "severity": {
    "critical": [{"title": "", "description": "", "location": "", "recommendation": ""}],
    "high": [],
    "medium": [],
    "low": [],
    "info": []
  },
  "gasOptimizations": ["optimization 1", "optimization 2"],
  "overallScore": "A/B/C/D/F with one line explanation",
  "recommendation": "Overall recommendation in 1-2 sentences"
}`;

export async function auditContract(
  sourceCode: string,
  apiKey: string,
  model = "claude-opus-4-5"
): Promise<AuditResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Audit this Solidity contract:\n\n\`\`\`solidity\n${sourceCode}\n\`\`\``,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content.find(c => c.type === "text")?.text ?? "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse audit response as JSON");

  return JSON.parse(jsonMatch[0]) as AuditResult;
}
