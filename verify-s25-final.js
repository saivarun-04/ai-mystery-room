import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`REQUEST: ${req.method()} ${req.url()}`);
      console.log(`  Origin: ${req.headers()['origin'] || 'none'}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log(`RESPONSE: ${res.status()} ${res.url()}`);
      console.log(`  CORS: ${res.headers()['access-control-allow-origin'] || 'NONE'}`);
      try {
        const body = await res.text();
        console.log(`  Body: ${body.substring(0, 400)}`);
      } catch (e) {}
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`CONSOLE ERROR: ${msg.text().substring(0, 100)}`);
    }
  });

  console.log('=== S25 Verification: Frontend on port 5173 ===\n');

  // Test on port 5173 (matches backend CORS config)
  console.log('--- Testing on http://localhost:5173 ---');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5173/create', { timeout: 10000 });

  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  console.log('Submitting form...');
  await page.click('button:has-text("Create Mystery")');
  await page.waitForTimeout(3000);

  const url = page.url();
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.log(`\nURL: ${url}`);
  console.log(`Error: ${errorMsg ? errorMsg.substring(0, 100) : 'none'}`);

  if (url.includes('/investigate')) {
    console.log('\n✓ SUCCESS: Created mystery on port 5173');
  } else if (errorMsg && errorMsg.includes('quota')) {
    console.log('\n✓ CORS working - Gemini quota exceeded (billing limitation)');
  } else {
    console.log('\n? Unexpected result');
  }

  await browser.close();
})();
