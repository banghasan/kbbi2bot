import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { logTarget } from '../tgcloud/lib/log-target.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const configPath = resolve(root, 'tgcloud/lib/runtime-config.js');

function readDotEnv(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^['"]|['"]$/gu, '');
  }
  return values;
}

const env = readDotEnv(envPath);
const chatId = (env.KBBI_LOG_CHAT_ID ?? '').trim();
const threadId = chatId ? (env.KBBI_LOG_THREAD_ID ?? '').trim() : '';
const adminIds = [...new Set((env.KBBI_ADMIN_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean))];
if (adminIds.some((id) => !/^[1-9]\d*$/.test(id))) {
  console.error('KBBI_ADMIN_IDS harus berisi Telegram user ID positif, dipisahkan koma.');
  process.exit(1);
}
try {
  logTarget({ chatId, threadId });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

writeFileSync(configPath, `export const LOG_CONFIG = Object.freeze({\n  chatId: ${JSON.stringify(chatId)},\n  threadId: ${JSON.stringify(threadId)},\n});\nexport const ADMIN_IDS = Object.freeze(${JSON.stringify(adminIds)});\n`);
console.log('Generated tgcloud/lib/runtime-config.js');

const result = spawnSync('npx', ['tgcloud', 'push', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
