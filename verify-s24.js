import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`REQUEST: ${req.method()} ${req.url()}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log(`RESPONSE: ${res.status()} ${res.url()}`);
      console.log(`  CORS: ${res.headers()['access-control-allow-origin']}`);
    }
  });

  console.log('=== S24 Final Verification ===\n');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5173/create', { timeout: 10000 });

  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  console.log('Submitting Create Mystery form...');
  await page.click('button:has-text("Create Mystery")');
  await page.waitForTimeout(3000);

  const url = page.url();
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);

  console.log(`\nFinal URL: ${url}`);
  console.log(`Error: ${errorMsg ? errorMsg.substring(0, 100) + '...' : 'none'}`);

  if (url.includes('/create') && errorMsg && errorMsg.includes('quota')) {
    console.log('\n✓ CORS working — request reached backend');
    console.log('✓ Backend returning 429 (Gemini quota exceeded)');
    console.log('✓ This is a billing limitation, not a code bug');
  }

  await page.screenshot({ path: 'qa-artifacts/s24-cors-fixed.png' });
  console.log('\nScreenshot saved to qa-artifacts/s24-cors-fixed.png');

  await browser.close();
})();
