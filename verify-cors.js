import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`API REQUEST: ${req.method()} ${req.url()}`);
      console.log(`  Origin: ${req.headers()['origin'] || 'none'}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log(`API RESPONSE: ${res.status()} ${res.url()}`);
      console.log(`  CORS-Allow-Origin: ${res.headers()['access-control-allow-origin'] || 'NONE'}`);
      try {
        const body = await res.text();
        console.log(`  Body: ${body.substring(0, 200)}...`);
      } catch (e) {}
    }
  });
  page.on('requestfailed', req => {
    if (req.url().includes('/api/')) {
      console.log(`API FAILED: ${req.url()}`, req.failure().errorText);
    }
  });

  console.log('=== S24 CORS Test ===\n');

  // Test on port 5173
  console.log('--- Testing frontend on http://localhost:5173 ---');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  // Fill and submit form
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5173/create', { timeout: 10000 });
  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  console.log('Submitting form...');
  await page.click('button:has-text("Create Mystery")');
  await page.waitForTimeout(3000);

  // Check result
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  const url = page.url();
  console.log(`Final URL: ${url}`);
  console.log(`Error shown: ${errorMsg || 'none'}`);

  // If we're still on /create with an error, check if it's a Gemini quota error
  if (url.includes('/create') && errorMsg && errorMsg.includes('quota')) {
    console.log('\n✓ CORS is working - request reached backend');
    console.log('✗ Gemini API quota exceeded (429) - expected billing limitation');
  } else if (url.includes('/create') && errorMsg) {
    console.log(`\n✗ Unexpected error: ${errorMsg}`);
  } else if (url.includes('/investigate')) {
    console.log('\n✓ Mystery created successfully and redirected to investigation');
  }

  // Also test direct fetch
  console.log('\n--- Direct fetch test from browser ---');
  const directResult = await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'easy', theme: 'detective' }),
      });
      return {
        status: res.status,
        cors: res.headers.get('access-control-allow-origin'),
        body: await res.text().then(t => t.substring(0, 100)),
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  console.log('Direct fetch result:', JSON.stringify(directResult, null, 2));

  await browser.close();
})();
