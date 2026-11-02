import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const artifactDir = path.resolve('qa-artifacts');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir);
  }

  const errors = [];
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`PAGE ERROR: ${err.message}`);
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(artifactDir, 'home-verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Check for h1 heading
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
    console.log(`Heading found: "${h1Text}"`);

    // Check buttons
    const buttons = await page.$$eval('button, a', elements =>
      elements.map(el => el.textContent.trim()).filter(t => t.length > 0)
    );
    console.log('Interactive elements found:', buttons);

    // Test navigation to /create
    console.log('Clicking Start Investigation / navigating to /create...');
    await page.click('text=Start Investigation');
    await page.waitForTimeout(2000);

    const createScreenshotPath = path.join(artifactDir, 'create-verified.png');
    await page.screenshot({ path: createScreenshotPath, fullPage: true });
    console.log(`Create page screenshot saved: ${createScreenshotPath}`);

    const createHeading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found on create');
    console.log(`Create page heading found: "${createHeading}"`);

    if (errors.length > 0) {
      console.log('\nErrors detected during test:');
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\nSUCCESS: Visual verification passed with zero errors!');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
