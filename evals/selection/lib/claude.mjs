// One headless Claude Code run of one case, in a throwaway consumer project
// with this repository loaded as a plugin.
import { spawn } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const TEXT = /\.(tsx?|jsx?|mjs|html|css)$/;

export const PREAMBLE = `You are working in a React + TypeScript app that depends on @gener8v/ui.
Design and implement the task below. Write the code into files under src/ in this
project (create new files as needed). Do not ask questions: make reasonable assumptions
and finish. When you are done, reply with a short note naming the components you used
and, if you started from a design-system template, which one.

Task: `;

function walk(dir, root = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, root, out);
    else if (TEXT.test(name)) out.push(relative(root, p));
  }
  return out;
}

/** Files the run created or changed, relative to the project. */
export function producedFiles(workdir, fixtureDir) {
  const before = new Map(walk(fixtureDir).map((p) => [p, readFileSync(join(fixtureDir, p), 'utf8')]));
  return walk(workdir)
    .map((p) => ({ path: p, content: readFileSync(join(workdir, p), 'utf8') }))
    .filter((f) => before.get(f.path) !== f.content);
}

/** Pull the facts the scorer and the report need out of a stream-json transcript. */
export function parseTranscript(lines) {
  const readPaths = [];
  let skillFired = false;
  let result = null;
  const tools = {};
  for (const line of lines) {
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === 'assistant') {
      for (const block of ev.message?.content ?? []) {
        if (block.type !== 'tool_use') continue;
        tools[block.name] = (tools[block.name] ?? 0) + 1;
        const input = block.input ?? {};
        for (const k of ['file_path', 'path', 'pattern']) if (typeof input[k] === 'string') readPaths.push(input[k]);
        if (block.name === 'Skill' && /gener8v-design-system/.test(JSON.stringify(input))) skillFired = true;
      }
    } else if (ev.type === 'result') {
      result = ev;
    }
  }
  const models = Object.keys(result?.modelUsage ?? {});
  return {
    finalText: result?.result ?? '',
    readPaths,
    skillFired,
    tools,
    costUsd: result?.total_cost_usd ?? 0,
    durationMs: result?.duration_ms ?? 0,
    turns: result?.num_turns ?? 0,
    models,
    error: !result ? 'no result event' : result.is_error ? (result.subtype ?? 'error') : null,
  };
}

/**
 * @param {{kase: object, model: string, pluginRoot: string, fixtureDir: string, maxTurns: number, timeoutMs: number, keep: boolean}} o
 */
export function runCase(o) {
  const workdir = mkdtempSync(join(tmpdir(), `ds-eval-${o.kase.id}-`));
  cpSync(o.fixtureDir, workdir, { recursive: true });
  const args = [
    '-p', PREAMBLE + o.kase.prompt,
    '--model', o.model,
    '--output-format', 'stream-json', '--verbose',
    '--plugin-dir', o.pluginRoot,
    // The plugin's docs (design/, packages/ui/src) live beside the skill, as they
    // do in an installed copy of the plugin. Allow reading them.
    '--add-dir', o.pluginRoot,
    // Only this plugin: no user or local settings, plugins, hooks or MCP servers.
    '--setting-sources', 'project',
    '--strict-mcp-config',
    '--tools', 'Read,Glob,Grep,Write,Edit,Skill',
    '--permission-mode', 'acceptEdits',
    '--max-turns', String(o.maxTurns),
    '--no-session-persistence',
  ];
  return new Promise((resolve) => {
    const child = spawn('claude', args, { cwd: workdir, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), o.timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => {
      clearTimeout(timer);
      const t = parseTranscript(out.split('\n'));
      const files = producedFiles(workdir, o.fixtureDir);
      if (!o.keep) rmSync(workdir, { recursive: true, force: true });
      resolve({
        ...t,
        files,
        exitCode: code,
        error: t.error ?? (code !== 0 ? `exit ${code}: ${err.slice(-400)}` : null),
        workdir: o.keep ? workdir : null,
      });
    });
  });
}
