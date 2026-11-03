#!/usr/bin/env node
// CPOA audit: measure what Claude Code loads into every session for a project.
// Read-only. No dependencies. Usage: node measure.mjs [projectDir] [--json]
// Token figures are estimates (characters / 4), good for comparison, not billing.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const projectDir = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());
const home = os.homedir();
const userDir = path.join(home, '.claude');

const tokens = text => Math.round(text.length / 4);
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const isDir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const rel = p => {
  const r = path.relative(projectDir, p);
  if (!r.startsWith('..') && !path.isAbsolute(r)) return r || '.';
  const h = path.relative(home, p);
  return h.startsWith('..') ? p : path.join('~', h);
};

// ---------- frontmatter ----------
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text || '');
  if (!m) return {};
  const out = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    let [, key, val] = kv;
    if (/^[>|][-+]?$/.test(val.trim()) || val.trim() === '') {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) block.push(lines[++i].trim());
      if (block.length && block.every(b => b.startsWith('- '))) out[key] = block.map(b => b.slice(2).trim());
      else val = block.join(' ');
    }
    if (out[key] === undefined) out[key] = val.replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

// ---------- always-loaded instruction files ----------
const IMPORT_RE = /(^|\s)@((?:~[\\/]|\.{0,2}[\\/]|[A-Za-z]:[\\/])?[^\s`'")\]]+)/g;

function importsOf(text, baseDir) {
  const found = [];
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const clean = line.replace(/`[^`]*`/g, '');
    for (const m of clean.matchAll(IMPORT_RE)) {
      let target = m[2].replace(/[.,;:]+$/, '');
      if (!/[\\/.]/.test(target)) continue; // @name mentions, not file imports
      target = target.startsWith('~') ? path.join(home, target.slice(2)) : path.resolve(baseDir, target);
      found.push(target);
    }
  }
  return found;
}

function addInstructionFile(file, layer, list, seen, depth = 0) {
  const key = path.resolve(file).toLowerCase();
  if (seen.has(key)) return;
  const text = read(file);
  if (text === null) return;
  seen.add(key);
  list.push({ layer: depth ? `${layer} (import)` : layer, file: rel(file), abs: path.resolve(file), lines: text.split(/\r?\n/).length, tokens: tokens(text) });
  if (depth >= 5) return;
  for (const imp of importsOf(text, path.dirname(file))) addInstructionFile(imp, layer, list, seen, depth + 1);
}

function instructionFiles() {
  const list = [];
  const seen = new Set();
  addInstructionFile(path.join(userDir, 'CLAUDE.md'), 'user', list, seen);
  const chain = [];
  for (let d = projectDir; ; d = path.dirname(d)) {
    chain.unshift(d);
    if (path.dirname(d) === d) break;
  }
  for (const d of chain) {
    const layer = d === projectDir ? 'project' : 'parent folder';
    if (path.resolve(d).toLowerCase() === path.resolve(home).toLowerCase()) continue; // ~/.claude/CLAUDE.md covers home
    for (const name of ['CLAUDE.md', path.join('.claude', 'CLAUDE.md'), 'CLAUDE.local.md']) {
      addInstructionFile(path.join(d, name), name === 'CLAUDE.local.md' ? `${layer} (local)` : layer, list, seen);
    }
  }
  return list;
}

// ---------- files an instruction tells Claude to read at session start ----------
// Not loaded by Claude Code itself, but read because an always-loaded file says so.
const SESSION_RE = /(start of (every|each|the|a) (new )?session|at session[- ]start|session start\b|ved session(ens)?[- ]?start|sessionsstart|i starten af (hver|en) session|begin(ning)? of (every|each) session)/i;
const READ_RE = /\b(read|reads|reading|review|læs|læse|gennemlæs)\b/i;
const NEGATION_RE = /\b(do not|don't|never|no need to|not|ikke|aldrig)\b/i;
const PRONOUN_RE = /\b(it|this file|den|det|denne fil)\b/i;
const NOT_A_READ_RE = /(costs? context|auto-?listed|injected|auto-?imported|loads? automatically)/i;
const FILE_REF_RE = /`([^`\s]+\.(?:md|mdx|txt))`|\]\(([^)\s]+\.(?:md|mdx|txt))\)/gi;

const fileRefs = line => [...line.matchAll(FILE_REF_RE)].map(m => m[1] || m[2]);

function instructedReads(instr) {
  const imported = new Set(instr.map(f => f.abs.toLowerCase()));
  const found = new Map();
  for (const f of instr) {
    const lines = (read(f.abs) || '').split(/\r?\n/);
    let inFence = false;
    lines.forEach((line, i) => {
      if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }
      if (inFence) return;
      // Judge each sentence on its own: "Loading it costs context. Read it at session start."
      // A sentence counts only if it names a session start, uses a reading verb and is not negated.
      const sentences = line.split(/(?<=[.!?])\s+/).filter(s =>
        SESSION_RE.test(s) && READ_RE.test(s) && !NEGATION_RE.test(s) && !NOT_A_READ_RE.test(s));
      for (const sentence of sentences) {
        let refs = fileRefs(sentence);
        let match = 'same line';
        // "At the start of every session, read:" followed by a list of files
        if (!refs.length && /:\s*$/.test(sentence)) {
          let j = i + 1;
          if (j < lines.length && !lines[j].trim()) j++;
          for (; j < lines.length && lines[j].trim(); j++) {
            if (/^\s*([-*]|\d+[.)])\s/.test(lines[j])) refs.push(...fileRefs(lines[j]).slice(0, 1));
          }
          match = 'list below';
        }
        // "Read it at the start of every session": the file is named earlier in the same paragraph,
        // or in the heading of the section. Lower confidence, so it is labelled.
        if (!refs.length && PRONOUN_RE.test(sentence)) {
          for (let j = i - 1; j >= Math.max(0, i - 3) && lines[j].trim() && !refs.length; j--) refs = fileRefs(lines[j]).slice(-1);
          match = 'same paragraph';
          for (let j = i - 1; j >= 0 && !refs.length; j--) {
            if (/^#{1,6}\s/.test(lines[j])) { refs = fileRefs(lines[j]).slice(0, 1); match = 'section heading'; break; }
          }
        }
        addRefs(refs, match);
      }
      function addRefs(refs, match) {
        for (const ref of refs) {
          const candidates = [path.resolve(projectDir, ref), path.resolve(path.dirname(f.abs), ref)];
          const hit = candidates.find(c => { try { return fs.statSync(c).isFile(); } catch { return false; } });
          if (!hit || imported.has(hit.toLowerCase()) || found.has(hit.toLowerCase())) continue;
          const text = read(hit) || '';
          found.set(hit.toLowerCase(), { file: rel(hit), lines: text.split(/\r?\n/).length, tokens: tokens(text), instructedBy: `${f.file}:${i + 1}`, match });
        }
      }
    });
  }
  return [...found.values()];
}

// ---------- auto memory ----------
function memoryIndex() {
  const projects = path.join(userDir, 'projects');
  if (!isDir(projects)) return null;
  const encoded = projectDir.replace(/[^A-Za-z0-9]/g, '-').toLowerCase();
  const match = fs.readdirSync(projects).find(n => n.toLowerCase() === encoded);
  if (!match) return null;
  const file = path.join(projects, match, 'memory', 'MEMORY.md');
  const text = read(file);
  if (text === null) return null;
  const loaded = text.split(/\r?\n/).slice(0, 200).join('\n');
  const memDir = path.dirname(file);
  const notes = fs.readdirSync(memDir).filter(n => n.endsWith('.md') && n !== 'MEMORY.md').length;
  return { file: rel(file), lines: text.split(/\r?\n/).length, tokens: tokens(loaded), notes };
}

// ---------- skills, agents, commands ----------
function walkFiles(dir, test, depth = 3, out = []) {
  if (!isDir(dir) || depth < 0) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, test, depth - 1, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

function skills(root, scope) {
  return walkFiles(path.join(root, 'skills'), n => n === 'SKILL.md').map(f => {
    const text = read(f) || '';
    const fm = frontmatter(text);
    const hidden = String(fm['disable-model-invocation']).toLowerCase() === 'true';
    const desc = fm.description || '';
    return {
      scope, name: fm.name || path.basename(path.dirname(f)), file: rel(f),
      descriptionTokens: hidden ? 0 : tokens(`${fm.name || ''}: ${desc}`),
      bodyTokens: tokens(text), userOnly: hidden,
    };
  });
}

function agents(root, scope) {
  return walkFiles(path.join(root, 'agents'), n => n.endsWith('.md'), 1).map(f => {
    const text = read(f) || '';
    const fm = frontmatter(text);
    const tools = Array.isArray(fm.tools) ? fm.tools : (fm.tools ? fm.tools.split(',').map(t => t.trim()).filter(Boolean) : null);
    return {
      scope, name: fm.name || path.basename(f, '.md'), file: rel(f),
      descriptionTokens: tokens(`${fm.name || ''}: ${fm.description || ''}`),
      bodyTokens: tokens(text),
      tools: tools || 'ALL (no tools field: inherits every tool)',
      model: fm.model || 'inherit',
    };
  });
}

function commands(root, scope) {
  return walkFiles(path.join(root, 'commands'), n => n.endsWith('.md'), 2).map(f => {
    const fm = frontmatter(read(f) || '');
    const hidden = String(fm['disable-model-invocation']).toLowerCase() === 'true';
    return { scope, name: path.basename(f, '.md'), file: rel(f), descriptionTokens: hidden ? 0 : tokens(fm.description || '') };
  });
}

// ---------- settings, hooks, MCP ----------
function settings() {
  const files = [
    ['user', path.join(userDir, 'settings.json')],
    ['user (local)', path.join(userDir, 'settings.local.json')],
    ['project', path.join(projectDir, '.claude', 'settings.json')],
    ['project (local)', path.join(projectDir, '.claude', 'settings.local.json')],
  ];
  const out = [];
  for (const [scope, f] of files) {
    const text = read(f);
    if (text === null) continue;
    let j;
    try { j = JSON.parse(text); } catch { out.push({ scope, file: rel(f), error: 'invalid JSON' }); continue; }
    const p = j.permissions || {};
    const allow = p.allow || [];
    const oneOff = allow.filter(r => r.length > 120 || /\b(commit -m|commit -F|rm |git push)\b/.test(r));
    out.push({
      scope, file: rel(f),
      allowRules: allow.length, denyRules: (p.deny || []).length, askRules: (p.ask || []).length,
      oneOffAllowRules: oneOff.length,
      defaultMode: p.defaultMode || null,
      hookEvents: Object.keys(j.hooks || {}),
    });
  }
  return out;
}

function mcpServers() {
  const out = [];
  const projectMcp = read(path.join(projectDir, '.mcp.json'));
  if (projectMcp) {
    try {
      const j = JSON.parse(projectMcp);
      for (const [name, s] of Object.entries(j.mcpServers || {})) {
        const env = JSON.stringify(s.env || {});
        out.push({ scope: 'project (.mcp.json)', name, secretInFile: /(sbp_|sk-|ghp_|token"\s*:\s*"[^"$]{12,})/i.test(env + JSON.stringify(s.headers || {})) });
      }
    } catch { out.push({ scope: 'project (.mcp.json)', name: 'invalid JSON' }); }
  }
  const global = read(path.join(home, '.claude.json'));
  if (global) {
    try {
      const j = JSON.parse(global);
      for (const name of Object.keys(j.mcpServers || {})) out.push({ scope: 'user', name });
      const proj = Object.entries(j.projects || {}).find(([k]) => path.resolve(k).toLowerCase() === projectDir.toLowerCase());
      for (const name of Object.keys(proj?.[1]?.mcpServers || {})) out.push({ scope: 'local', name });
    } catch { /* unreadable global config: skip */ }
  }
  return out;
}

// ---------- on-demand instruction files in subfolders ----------
function nestedClaudeFiles() {
  const skip = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.vercel', '.claude', 'coverage']);
  const out = [];
  (function walk(dir, depth) {
    if (depth > 4) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isDirectory() && !skip.has(e.name)) walk(path.join(dir, e.name), depth + 1);
      else if (e.name === 'CLAUDE.md' && dir !== projectDir) {
        const text = read(path.join(dir, e.name)) || '';
        out.push({ file: rel(path.join(dir, e.name)), tokens: tokens(text) });
      }
    }
  })(projectDir, 0);
  return out;
}

// ---------- report ----------
const instr = instructionFiles();
const memory = memoryIndex();
const sessionReads = instructedReads(instr);
const skillList = [...skills(path.join(projectDir, '.claude'), 'project'), ...skills(userDir, 'user')];
const agentList = [...agents(path.join(projectDir, '.claude'), 'project'), ...agents(userDir, 'user')];
const commandList = [...commands(path.join(projectDir, '.claude'), 'project'), ...commands(userDir, 'user')];
const sum = (xs, k) => xs.reduce((a, x) => a + (x[k] || 0), 0);

const always = {
  instructionFiles: sum(instr, 'tokens'),
  memoryIndex: memory?.tokens || 0,
  skillDescriptions: sum(skillList, 'descriptionTokens'),
  agentDescriptions: sum(agentList, 'descriptionTokens'),
  commandDescriptions: sum(commandList, 'descriptionTokens'),
};
always.total = Object.values(always).reduce((a, b) => a + b, 0);
// Instructed reads are an upper bound (whole files), so they stay outside the total.
const readByInstructionUpTo = sum(sessionReads, 'tokens');

const report = {
  projectDir, measuredAt: new Date().toISOString(), tokenMethod: 'estimate: characters / 4',
  alwaysLoadedTokens: always,
  readByInstructionUpTo, instructionFiles: instr.map(({ abs, ...f }) => f), readByInstruction: sessionReads, memory, skills: skillList, agents: agentList, commands: commandList,
  settings: settings(), mcpServers: mcpServers(), onDemandClaudeFiles: nestedClaudeFiles(),
  notMeasured: ['installed plugins', 'MCP tool definitions', 'Claude Code system prompt', 'rules in .claude/rules/'],
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const pad = (s, n) => String(s).padEnd(n);
  const line = (label, n) => console.log(`  ${pad(label, 28)} ~${String(n).padStart(6)} tokens`);
  console.log(`CPOA measurement: ${projectDir}`);
  console.log('\nLoaded into EVERY session (estimate)');
  line('Instruction files', always.instructionFiles);
  line('Memory index', always.memoryIndex);
  line('Skill descriptions', always.skillDescriptions);
  line('Agent descriptions', always.agentDescriptions);
  line('Command descriptions', always.commandDescriptions);
  line('TOTAL', always.total);
  if (readByInstructionUpTo) {
    line('Plus read by instruction', readByInstructionUpTo);
    console.log('    (upper bound: the whole files, see below)');
  }
  console.log('\nInstruction files');
  for (const f of instr) console.log(`  ${pad(f.layer, 24)} ${pad(f.lines + ' lines', 11)} ~${String(f.tokens).padStart(5)}  ${f.file}`);
  if (sessionReads.length) {
    console.log('\nRead at session start because an instruction says so (whole file, estimate)');
    for (const s of sessionReads) console.log(`  ${pad(s.lines + ' lines', 11)} ~${String(s.tokens).padStart(6)}  ${s.file}  (instructed by ${s.instructedBy}, file named in ${s.match})`);
  }
  if (memory) console.log(`\nMemory index: ${memory.file} (${memory.lines} lines, ${memory.notes} notes)`);
  console.log(`\nSkills: ${skillList.length} (${skillList.filter(s => s.userOnly).length} user-invoked only)`);
  for (const s of skillList) console.log(`  ${pad(s.scope, 8)} ${pad(s.name, 30)} desc ~${String(s.descriptionTokens).padStart(4)}  body ~${s.bodyTokens}`);
  console.log(`\nAgents: ${agentList.length}`);
  for (const a of agentList) console.log(`  ${pad(a.scope, 8)} ${pad(a.name, 24)} tools: ${Array.isArray(a.tools) ? a.tools.join(', ') : a.tools}`);
  if (commandList.length) console.log(`\nCommands: ${commandList.length}`);
  console.log('\nSettings');
  for (const s of report.settings) console.log(`  ${pad(s.scope, 16)} allow ${s.allowRules ?? '?'} (one-off looking: ${s.oneOffAllowRules ?? '?'}), deny ${s.denyRules ?? '?'}, hooks: ${(s.hookEvents || []).join(', ') || 'none'}${s.defaultMode ? ', mode: ' + s.defaultMode : ''}${s.error ? ' ' + s.error : ''}`);
  console.log(`\nMCP servers: ${report.mcpServers.map(m => `${m.name} (${m.scope}${m.secretInFile ? ', SECRET IN FILE' : ''})`).join(', ') || 'none found'}`);
  if (report.onDemandClaudeFiles.length) console.log(`\nSubfolder CLAUDE.md (loaded only when Claude works there): ${report.onDemandClaudeFiles.map(f => f.file).join(', ')}`);
  console.log(`\nNot measured: ${report.notMeasured.join(', ')}`);
}
