import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prismaBin = path.resolve(__dirname, '../node_modules/prisma/dist/prisma.js');

const rawArgs = process.argv.slice(2);
// If 'deploy' is called with positional 'module.ts', strip it because Prisma 8 CLI expects 0 arguments for deploy.
const cleanArgs = [];
for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === 'module.ts' && rawArgs.includes('deploy')) {
    continue;
  }
  cleanArgs.push(arg);
}

const child = spawn(process.execPath, [prismaBin, ...cleanArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

