#!/usr/bin/env node
/**
 * Read-only guard for the standards-reviewer agent.
 *
 * Why this exists
 * The reviewer needs `git diff` and similar commands to see a change, so it
 * needs the Bash tool. A prompt that says "do not write" is not a security
 * boundary, and an agent's own permission settings can be overridden by the
 * mode the session runs in. This hook is the boundary. It runs before every
 * Bash call the reviewer makes (see the `hooks` block in
 * `.claude/agents/standards-reviewer.md`) and lets only read-only git commands
 * through.
 *
 * Rules
 * - One command only: no shell operators, redirection or substitution.
 * - The command must be `git <subcommand>` with a read-only subcommand.
 * - Flags that write a file or start another program are blocked.
 * - Anything the guard cannot parse is blocked (fail closed).
 *
 * Exit 0 allows the call. Exit 2 blocks it and sends the reason to the agent.
 * An allowed call still goes through Claude Code's normal permission checks.
 */

class Blocked extends Error {}

const READ_ONLY_GIT = new Set([
  "status", "diff", "log", "show", "ls-files", "blame", "grep", "rev-parse", "shortlog", "describe",
])

// Flags that can write a file or start another program.
const UNSAFE_FLAG = /^(--output(=|$)|--ext-diff$|--textconv$|--open-files-in-pager|-O)/

// Characters that chain, redirect or substitute commands in a shell.
const SHELL_OPERATOR = /[;&|<>`$\r\n]/

/** Splits a command into words and removes quotes. */
function tokenize(command) {
  const tokens = []
  let current = ""
  let quote = null
  let inToken = false
  for (const c of command) {
    if (quote) {
      if (c === quote) quote = null
      else current += c
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      inToken = true
      continue
    }
    if (/\s/.test(c)) {
      if (inToken) tokens.push(current)
      current = ""
      inToken = false
      continue
    }
    current += c
    inToken = true
  }
  if (quote) throw new Blocked("unclosed quote")
  if (inToken) tokens.push(current)
  return tokens
}

function check(input) {
  if (input?.tool_name !== "Bash") throw new Blocked(`unexpected tool "${input?.tool_name ?? "(none)"}"`)
  const command = input?.tool_input?.command
  if (typeof command !== "string" || !command.trim()) throw new Blocked("no command")

  const operator = command.match(SHELL_OPERATOR)
  if (operator) throw new Blocked(`shell operator ${JSON.stringify(operator[0])}`)

  const [program, ...args] = tokenize(command)
  const name = program.replace(/\\/g, "/").split("/").pop().replace(/\.exe$/i, "")
  if (name !== "git") throw new Blocked(`"${program}" is not git`)

  let i = 0
  while (args[i] === "--no-pager" || args[i] === "-P") i++
  const sub = args[i]
  if (!READ_ONLY_GIT.has(sub)) throw new Blocked(`"git ${sub ?? ""}" is not on the read-only list`)

  const unsafe = args.slice(i + 1).find((a) => UNSAFE_FLAG.test(a))
  if (unsafe) throw new Blocked(`flag ${unsafe} can write a file or start a program`)
}

let raw = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  raw += chunk
})
process.stdin.on("end", () => {
  try {
    check(JSON.parse(raw))
    process.exit(0)
  } catch (err) {
    const reason = err instanceof Blocked ? err.message : `could not read the tool call (${err.message})`
    process.stderr.write(
      `Standards reviewer guard: blocked - ${reason}.\n` +
        `The reviewer is read-only. Allowed: git ${[...READ_ONLY_GIT].join(", ")}. ` +
        "Put the command in your report as a recommendation instead.\n"
    )
    process.exit(2)
  }
})
