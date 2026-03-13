import type { AuditResult, Finding } from "./audit.js";

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m",
  cyan: "\x1b[36m", magenta: "\x1b[35m", blue: "\x1b[34m", gray: "\x1b[90m",
};
const col = (t: string, ...c: string[]) => c.join("") + t + C.reset;

const SEVERITY_COLORS: Record<string, string> = {
  critical: C.red + C.bold,
  high: C.red,
  medium: C.yellow,
  low: C.cyan,
  info: C.gray,
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: "🚨", high: "🔴", medium: "🟡", low: "🔵", info: "ℹ️",
};

function formatFindings(label: string, findings: Finding[]): string[] {
  if (findings.length === 0) return [];
  const lines: string[] = [
    "",
    col(`  ${SEVERITY_ICONS[label]} ${label.toUpperCase()} (${findings.length})`, SEVERITY_COLORS[label]),
  ];
  for (const f of findings) {
    lines.push(col(`    ▸ ${f.title}`, C.bold));
    lines.push(col(`      ${f.description}`, C.gray));
    if (f.location) lines.push(col(`      Location: ${f.location}`, C.dim));
    lines.push(col(`      Fix: ${f.recommendation}`, C.cyan));
  }
  return lines;
}

export function formatAuditResult(result: AuditResult, filename: string): string {
  const totalIssues = Object.values(result.severity).flat().length;
  const hasCritical = result.severity.critical.length > 0;
  const hasHigh = result.severity.high.length > 0;

  const lines: string[] = [
    "",
    col("  ═══════════════════════════════════════════════════", C.bold),
    col("  AI AUDIT REPORT", C.bold, C.cyan) + col(`  — ${filename}`, C.gray),
    col("  ═══════════════════════════════════════════════════", C.bold),
    "",
    col("  SUMMARY", C.bold),
    col(`  ${result.summary}`, C.gray),
    "",
    col("  SCORE: ", C.bold) + col(result.overallScore, hasCritical ? C.red : hasHigh ? C.yellow : C.green, C.bold),
    "",
    col("  FINDINGS", C.bold) + col(` (${totalIssues} total)`, C.gray),
    ...formatFindings("critical", result.severity.critical),
    ...formatFindings("high", result.severity.high),
    ...formatFindings("medium", result.severity.medium),
    ...formatFindings("low", result.severity.low),
    ...formatFindings("info", result.severity.info),
  ];

  if (result.gasOptimizations.length > 0) {
    lines.push("", col("  ⛽ GAS OPTIMIZATIONS", C.bold, C.yellow));
    for (const g of result.gasOptimizations) {
      lines.push(col(`    • ${g}`, C.gray));
    }
  }

  lines.push(
    "",
    col("  RECOMMENDATION", C.bold),
    col(`  ${result.recommendation}`, C.cyan),
    "",
    col("  ═══════════════════════════════════════════════════", C.bold),
    col("  Powered by Claude. Not a substitute for professional audit.", C.dim),
    "",
  );

  return lines.join("\n");
}
