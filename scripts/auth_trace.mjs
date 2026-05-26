import { chromium } from 'playwright';
import fs from 'fs';

const url = process.argv[2] || process.env.TRACE_URL || 'http://localhost:3000';
const TRACE_EMAIL = process.env.TRACE_EMAIL || null;
const TRACE_PASS = process.env.TRACE_PASS || null;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const records = [];
  const consoleLogs = [];

  page.on('request', (req) => {
    const r = {
      id: req._requestId || Math.random().toString(36).slice(2),
      url: req.url(),
      method: req.method(),
      startTime: Date.now(),
      resourceType: req.resourceType(),
      headers: req.headers(),
      postData: req.postData ? req.postData() : undefined,
      status: 'ongoing'
    };
    records.push(r);
  });

  page.on('response', async (res) => {
    try {
      const req = res.request();
      const rec = records.find(r => r.url === req.url() && r.method === req.method() && r.status === 'ongoing');
      const endTime = Date.now();
      if (rec) {
        rec.status = 'ok';
        rec.statusCode = res.status();
        rec.endTime = endTime;
        rec.durationMs = rec.endTime - rec.startTime;
        try {
          const body = await res.text();
          rec.size = body.length;
          if (/\/api\/auth\/sync-profile/i.test(req.url())) {
            rec.resBody = body;
          }
        } catch (e) {
          rec.size = null;
        }
      } else {
        records.push({ url: req.url(), method: req.method(), status: 'ok', statusCode: res.status(), startTime: null, endTime, durationMs: null });
      }
    } catch (e) {
      // ignore
    }
  });

  page.on('requestfailed', (req) => {
    const rec = records.find(r => r.url === req.url() && r.method === req.method() && r.status === 'ongoing');
    const endTime = Date.now();
    if (rec) {
      rec.status = 'failed';
      rec.failure = req.failure()?.errorText || 'failed';
      rec.endTime = endTime;
      rec.durationMs = rec.endTime - rec.startTime;
    } else {
      records.push({ url: req.url(), method: req.method(), status: 'failed', failure: req.failure()?.errorText || 'failed', startTime: null, endTime, durationMs: null });
    }
  });

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text(), timestamp: Date.now() });
  });

  // Navigate and wait
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});

  // Wait additional time to allow auth calls and dynamic scripts
  await page.waitForTimeout(10000);

  // Also try to open auth modal if present to trigger login flows
  try {
    // Try several common triggers to open the auth modal
    let authBtn = await page.locator('button:has-text("Login")').first();
    if ((await authBtn.count()) === 0) authBtn = await page.locator('button:has-text("Launch Review Auditor")').first();
    if ((await authBtn.count()) === 0) authBtn = await page.locator('button:has-text("Get started")').first();
    if (await authBtn.count() > 0) {
      await authBtn.click();
      await page.waitForTimeout(1000);

      // Fill login form (non-destructive test credentials)
      try {
        const emailInput = page.locator('input[type="email"]').first();
        const passInput = page.locator('input[type="password"]').first();
        if ((await emailInput.count()) > 0 && (await passInput.count()) > 0) {
          const emailVal = TRACE_EMAIL || 'trace+test@example.com';
          const passVal = TRACE_PASS || 'Password123!';
          await emailInput.fill(emailVal);
          await passInput.fill(passVal);
          // Click the submit button if present, otherwise press Enter in password field
          const submitBtn = page.locator('button[type="submit"]').first();
          if ((await submitBtn.count()) > 0) {
            await submitBtn.click();
          } else {
            await passInput.press('Enter');
          }
          await page.waitForTimeout(6000);

          // After login, attempt a sample review analysis from the browser context
            try {
            const sample = [
              { reviewText: 'Absolutely superb device, highly recommend!', rating: 5, reviewerName: 'Alice', productName: 'Earbuds Pro' },
              { reviewText: 'Terrible build, broke after a week. Do not buy.', rating: 1, reviewerName: 'Bob', productName: 'Earbuds Pro' },
              { reviewText: 'Amazing sound but battery is poor.', rating: 4, reviewerName: 'Carol', productName: 'Earbuds Pro' }
            ];
            await page.evaluate(async (reviews) => {
              try {
                // Call analyze endpoint without Authorization header; server supports anonymous processing for tracing
                await fetch('/api/reviews/analyze', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reviews })
                });
              } catch (e) {
                // ignore
              }
            }, sample);
            await page.waitForTimeout(4000);
          } catch (e) {}
        }
      } catch (e) {}
    }
  } catch (e) {}

  const filtered = records.filter(r => /auth|login|sync-profile|identitytoolkit|signInWithPassword/i.test(r.url));

  fs.writeFileSync('auth_trace.json', JSON.stringify({ url, timestamp: Date.now(), all: records, authRelated: filtered, console: consoleLogs }, null, 2));
  console.log('Done. Saved auth_trace.json');

  await browser.close();
})();
