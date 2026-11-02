import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Capture all relevant events
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`REQUEST: ${req.method()} ${req.url()}`);
      console.log(`  Origin: ${req.headers()['origin'] || 'none'}`);
      console.log(`  Content-Type: ${req.headers()['content-type']}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log(`RESPONSE: ${res.status()} ${res.url()}`);
      console.log(`  CORS-Allow-Origin: ${res.headers()['access-control-allow-origin'] || 'NONE'}`);
      try {
        const body = await res.text();
        console.log(`  Body: ${body.substring(0, 300)}...`);
      } catch (e) {}
    }
  });
  page.on('requestfailed', req => {
    console.log(`FAILED: ${req.url()}`, req.failure().errorText);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  console.log('=== S25 Create Mystery Network Diagnosis ===\n');

  // Test on port 5174 as specified in task
  console.log('--- Loading frontend on port 5174 ---');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });
  console.log('Frontend loaded ✓\n');

  // Navigate to Create page
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5174/create', { timeout: 10000 });
  await page.waitForSelector('h1', { timeout: 10000 });
  console.log('Create page loaded ✓\n');

  // Fill form
  await page.fill('textarea', 'A mysterious art theft at the midnight gallery.');
  await page.waitForTimeout(500);

  console.log('--- Submitting Create Mystery ---');
  await page.click('button:has-text("Create Mystery")');

  // Wait for response
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log(`\nCurrent URL: ${currentUrl}`);

  // Check for error message
  const errorMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.log(`Error shown: ${errorMsg ? errorMsg.substring(0, 150) + '...' : 'none'}`);

  // Check if we're on investigation page
  if (currentUrl.includes('/investigate')) {
    console.log('\n✓ SUCCESS: Mystery created and redirected to investigation page!');
  } else if (currentUrl.includes('/create')) {
    console.log('\n✗ FAILED: Still on create page - checking error details...');

    // Try direct API call to see if backend responds
    console.log('\n--- Direct API test ---');
    const apiResult = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:3000/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ difficulty: 'easy', theme: 'detective' }),
        });
        return {
          status: res.status,
          cors: res.headers.get('access-control-allow-origin'),
          body: await res.text().then(t => t.substring(0, 300)),
        };
      } catch (err) {
        return { error: err.message };
      }
    });
    console.log('Direct API result:', JSON.stringify(apiResult, null, 2));
  }

  await browser.close();
})();
