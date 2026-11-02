import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Capture all console messages and network events
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });
  page.on('request', req => {
    console.log(`REQUEST: ${req.method()} ${req.url()}`);
    console.log(`  Headers:`, JSON.stringify(req.headers(), null, 2));
  });
  page.on('response', async res => {
    console.log(`RESPONSE: ${res.status()} ${res.url()}`);
    console.log(`  CORS-Allow-Origin: ${res.headers()['access-control-allow-origin']}`);
    try {
      const body = await res.text();
      console.log(`  Body (first 500):`, body.substring(0, 500));
    } catch (e) {}
  });
  page.on('requestfailed', req => {
    console.log(`FAILED: ${req.url()}`, req.failure().errorText);
  });

  console.log('=== S24 Detailed Network Trace ===\n');

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  // Navigate to create page
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5174/create', { timeout: 10000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  // Fill form
  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  // Click submit and watch network
  console.log('\n--- Clicking Create Mystery ---');
  await page.click('button:has-text("Create Mystery")');

  // Wait for any network activity
  await page.waitForTimeout(3000);

  // Check for error message on page
  const errorMsg = await page.locator('text=/failed|error|network/i').first().textContent().catch(() => null);
  console.log('\nError message shown in UI:', errorMsg);

  await browser.close();
})();
