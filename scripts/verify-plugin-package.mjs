// Also exported to the public repository: Node builtins only, no app checkout.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_FILES = [
  '.claude-plugin/marketplace.json', 'LICENSE', 'README.md',
  'plugins/agent-wiki/.claude-plugin/plugin.json', 'plugins/agent-wiki/.mcp.json',
  'plugins/agent-wiki/skills/setup/SKILL.md', 'scripts/verify-plugin-package.mjs',
].sort();
export const sha256 = (content) => createHash('sha256').update(content).digest('hex');
export const packageChecksum = (hashes) => sha256(JSON.stringify(hashes));
export function firstPrompt(skill) {
  const blocks = [...skill.matchAll(/<!-- BEGIN GENERATED FIRST_PROMPT -->\n[^\n]*\n\n> ([^\n]+)\n\n<!-- END GENERATED FIRST_PROMPT -->/g)];
  if (blocks.length !== 1) throw new Error('Expected exactly one generated first prompt');
  return blocks[0][1];
}
export function validateContents(files) {
  if (JSON.stringify(Object.keys(files).sort()) !== JSON.stringify(PACKAGE_FILES)) throw new Error('Unexpected package file set');
  const catalog = JSON.parse(files['.claude-plugin/marketplace.json']);
  const plugin = JSON.parse(files['plugins/agent-wiki/.claude-plugin/plugin.json']);
  if (catalog.name !== 'agent-wiki' || catalog.plugins.length !== 1 || catalog.plugins[0].name !== plugin.name || plugin.name !== 'agent-wiki') throw new Error('Marketplace/plugin identity mismatch');
  if (catalog.plugins[0].source !== './plugins/agent-wiki') throw new Error('Marketplace source must resolve to the nested plugin root');
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version) || catalog.metadata.version !== plugin.version || catalog.plugins[0].version !== plugin.version) throw new Error('Plugin/marketplace version mismatch');
  const server = JSON.parse(files['plugins/agent-wiki/.mcp.json']);
  const expected = { mcpServers: { 'agent-wiki': { type: 'http', url: 'https://getagentwiki.com/mcp' } } };
  if (JSON.stringify(server) !== JSON.stringify(expected)) throw new Error('MCP endpoint/config changed or bundled credentials present');
  const skill = files['plugins/agent-wiki/skills/setup/SKILL.md'];
  if (!skill.startsWith('---\nname: setup\n') || !skill.includes('\ndisable-model-invocation: true\n---')) throw new Error('Setup must be an explicitly invoked skill');
  firstPrompt(skill);
  return plugin.version;
}
export function verifyPackage(directory) {
  const root = resolve(directory);
  const receipt = JSON.parse(readFileSync(join(root, 'SOURCE.json'), 'utf8'));
  if (receipt.schemaVersion !== 1 || receipt.repository !== 'https://github.com/animal-ltd/agent-wiki' || !/^[a-f0-9]{40}$/.test(receipt.sourceSha)) throw new Error('Invalid source provenance');
  // Fail closed on extra runtime files, symlinks, hooks, or accidentally shipped secrets.
  const paths = [];
  function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      if (dir === root && name === '.git') continue;
      const path = join(dir, name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error('Package must not contain symlinks');
      if (stat.isDirectory()) walk(path);
      else paths.push(relative(root, path));
    }
  }
  walk(root);
  if (JSON.stringify(paths.sort()) !== JSON.stringify([...PACKAGE_FILES, 'SOURCE.json'].sort())) throw new Error('Unexpected public package file set');
  const files = Object.fromEntries(PACKAGE_FILES.map((path) => [path, readFileSync(join(root, path), 'utf8')]));
  const version = validateContents(files);
  const hashes = Object.fromEntries(PACKAGE_FILES.map((path) => [path, sha256(files[path])]));
  if (JSON.stringify(receipt.files) !== JSON.stringify(hashes) || receipt.packageChecksum !== packageChecksum(hashes)) throw new Error('Package checksum mismatch');
  if (receipt.version !== version || receipt.firstPromptChecksum !== sha256(firstPrompt(files['plugins/agent-wiki/skills/setup/SKILL.md']))) throw new Error('Receipt version/prompt mismatch');
  return receipt;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const receipt = verifyPackage(process.argv[2] || '.');
  console.log(`Verified agent-wiki ${receipt.version}; source ${receipt.sourceSha}; sha256 ${receipt.packageChecksum}`);
}
