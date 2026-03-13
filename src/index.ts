#!/usr/bin/env node
import { readFileSync } from "fs";
import { auditContract } from "./audit.js";
import { formatAuditResult } from "./format.js";

const args = process.argv.slice(2);
const file = args.find(a => a.endsWith(".sol"));
const model = args.includes("--fast") ? "claude-haiku-4-5" : "claude-opus-4-5";
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!file) {
  console.error("\nUsage: node src/index.js <Contract.sol> [--fast]\n");
  console.error("  --fast    Use claude-haiku (faster, less thorough)\n");
  console.error("Requires: ANTHROPIC_API_KEY env var\n");
  process.exit(1);
}

if (!apiKey) {
  console.error("\nMissing ANTHROPIC_API_KEY environment variable.");
  console.error("Get your key at: https://console.anthropic.com\n");
  process.exit(1);
}

async function main() {
  let source: string;
  try {
    source = readFileSync(file, "utf-8");
  } catch {
    console.error(`Cannot read file: ${file}`);
    process.exit(1);
  }

  const filename = file.split("/").pop() ?? file;
  console.log(`\nAuditing ${filename} with ${model}...`);
  console.log("This may take 15-30 seconds.\n");

  const result = await auditContract(source, apiKey, model);
  console.log(formatAuditResult(result, filename));
}

main().catch(err => {
  console.error("\nError:", err.message);
  process.exit(1);
});
