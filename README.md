# ai-audit 🔍

> AI-powered Solidity security auditor. Get a structured audit in seconds.

Paste a `.sol` file, get a full security report with categorized findings, severity levels, gas optimizations, and an overall score — powered by Claude.

## Setup

```bash
git clone https://github.com/7abar/ai-audit
cd ai-audit
npm install
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

```bash
# Audit a contract (uses claude-opus-4-5 by default — thorough)
node src/index.js MyContract.sol

# Fast mode: uses claude-haiku-4-5 (cheaper, ~3x faster)
node src/index.js MyContract.sol --fast
```

## Example Output

```
  ═══════════════════════════════════════════════════
  AI AUDIT REPORT  — Vault.sol
  ═══════════════════════════════════════════════════

  SUMMARY
  The contract implements a yield vault with a critical reentrancy
  vulnerability in the withdraw function. Access controls are present
  but insufficiently scoped.

  SCORE: D — Critical reentrancy vulnerability must be fixed before deployment

  FINDINGS (3 total)

  🚨 CRITICAL (1)
    ▸ Reentrancy in withdraw()
      State is updated after external call, allowing reentrant withdrawal.
      Location: withdraw() line 47
      Fix: Apply Checks-Effects-Interactions pattern; update balance before transfer.

  🟡 MEDIUM (1)
    ▸ Missing input validation on deposit amount
      Zero-value deposits are allowed, wasting gas and polluting events.
      Fix: Add require(amount > 0, "zero deposit") guard.

  🔵 LOW (1)
    ▸ Missing event for ownership transfer
      Fix: Emit OwnershipTransferred event in transferOwner().

  ⛽ GAS OPTIMIZATIONS
    • Cache array length in loop: for (uint i; i < arr.length; i++) → uint len = arr.length
    • Use unchecked{} for loop counters (Solidity >=0.8)
    • Mark functions that don't modify state as view

  RECOMMENDATION
  Fix the reentrancy vulnerability immediately. The contract should not
  be deployed until the critical finding is resolved.
```

## What It Checks

| Category | Examples |
|---|---|
| **Reentrancy** | Cross-function reentrancy, read-only reentrancy |
| **Access Control** | Missing onlyOwner, role mismatches |
| **Integer Issues** | Overflow/underflow (pre-0.8), casting bugs |
| **Front-Running** | Sandwich attacks, price manipulation |
| **Oracle Manipulation** | Spot price usage, TWAP window too short |
| **Flash Loans** | Single-block manipulation, price oracle attacks |
| **Centralization** | Admin keys, upgrade authority, pause controls |
| **Gas** | Storage reads in loops, redundant SSTOREs |
| **Logic** | Edge cases, off-by-one errors, wrong invariants |
| **Events** | Missing events for state changes |

## Models

| Flag | Model | Speed | Thoroughness |
|---|---|---|---|
| _(default)_ | `claude-opus-4-5` | ~20s | ★★★★★ |
| `--fast` | `claude-haiku-4-5` | ~5s | ★★★☆☆ |

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` environment variable ([get one here](https://console.anthropic.com))

## Works With

Any EVM-compatible Solidity contract: Ethereum, Base, Arbitrum, Optimism, Polygon, etc.

## ⚠️ Disclaimer

> **This is AI-assisted analysis, not a formal audit.** Use as a first pass before professional review. AI can miss vulnerabilities and produce false positives. For production contracts handling real value, always engage a professional auditing firm.

## License

MIT
