import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'https://reviewshield-ai-b2424.vercel.app';
const maxRetries = parseInt(process.env.MAX_RETRIES || '8', 10);
const delayMs = parseInt(process.env.RETRY_DELAY_MS || '15000', 10); // 15s default

function runTrace() {
  return new Promise((resolve, reject) => {
    const cmd = `node scripts/auth_trace.mjs ${url}`;
    console.log(`Running: ${cmd}`);
    exec(cmd, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Trace command failed:', err);
        return reject(err);
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
      const tracePath = path.join(process.cwd(), 'auth_trace.json');
      if (!fs.existsSync(tracePath)) return reject(new Error('auth_trace.json not created'));
      const content = fs.readFileSync(tracePath, 'utf8');
      try {
        const data = JSON.parse(content);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

(async () => {
  console.log('Tracing URL:', url);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);
      const data = await runTrace();

      // Heuristics: check for any auth-related requests or logs we added
      const hasAuthNetwork = (data.authRelated && data.authRelated.length > 0);
      const hasConsoleLogs = (data.console && data.console.some(c => /auth:getIdToken:done|api:sync-profile:start|ui:dashboard:render/i.test(c.text)));
      const hasServerLogs = (data.all && data.all.some(r => /api\/auth\/sync-profile/i.test(r.url)));

      if (hasAuthNetwork || hasConsoleLogs || hasServerLogs) {
        console.log('Instrumentation detected in production trace. Saved auth_trace.json');
        process.exit(0);
      } else {
        console.log('Instrumentation not detected yet (no auth network/console/server logs).');
        if (attempt < maxRetries) {
          console.log(`Waiting ${delayMs}ms before retrying...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        } else {
          console.log('Max retries reached. Last trace saved to auth_trace.json');
          process.exit(2);
        }
      }
    } catch (err) {
      console.error('Error running trace:', err);
      if (attempt < maxRetries) {
        console.log(`Retrying after ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      process.exit(3);
    }
  }
})();
