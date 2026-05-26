import { chromium } from 'playwright';
import fs from 'fs';

const url = process.argv[2] || 'https://reviewshield-ai-b2424.vercel.app';

const browser = await chromium.launch();
const page = await browser.newPage();

const logs = [];
page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', err => logs.push({ type: 'pageerror', text: String(err) }));

await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'deployed_screenshot.png', fullPage: true });

await browser.close();
fs.writeFileSync('deployed_console_logs.json', JSON.stringify(logs, null, 2));
console.log('Done. Saved deployed_screenshot.png and deployed_console_logs.json');
