import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Capture all network events
  page.on('request', req => {
    console.log(`REQUEST: ${req.method()} ${req.url()}`);
    if (req.headers()['origin']) {
      console.log(`  Origin: ${req.headers()['origin']}`);
    }
  });
  page.on('response', async res => {
    console.log(`RESPONSE: ${res.status()} ${res.url()}`);
    const corsOrigin = res.headers()['access-control-allow-origin'];
    console.log(`  CORS-Allow-Origin: ${corsOrigin || 'NONE'}`);
    try {
      const body = await res.text();
      if (body.length < 500) {
        console.log(`  Body: ${body.substring(0, 500)}`);
      }
    } catch (e) {}
  });
  page.on('requestfailed', req => {
    console.log(`FAILED: ${req.url()}`, req.failure().errorText);
  });

  console.log('=== S24 API Request Test ===\n');

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  // Try a direct API call from the browser context
  console.log('--- Making direct fetch from browser ---');
  const apiResult = await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'easy', theme: 'detective' }),
      });
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: await res.text(),
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  console.log('API Result:', JSON.stringify(apiResult, null, 2));

  // Now test the actual form submission
  console.log('\n--- Testing Create page form ---');
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5174/create', { timeout: 10000 });

  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  // Click submit
  await page.click('button:has-text("Create Mystery")');
  await page.waitForTimeout(3000);

  // Check for error message
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.log('\nError shown in UI:', errorMsg);

  await browser.close();
})();
