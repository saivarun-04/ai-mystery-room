import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('=== S23 Scroll Position Verification ===\n');

  // Navigate to home page
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });

  let scrollTop1 = await page.evaluate(() => window.scrollY);
  console.log(`Home page scroll Y: ${scrollTop1}`);
  await page.screenshot({ path: 'qa-artifacts/s23-home-top.png' });
  console.log('Screenshot: qa-artifacts/s23-home-top.png');

  // Click "Start Investigation" to go to Create page
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5174/create', { timeout: 10000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  let scrollTop2 = await page.evaluate(() => window.scrollY);
  console.log(`Create page scroll Y after nav: ${scrollTop2}`);
  await page.screenshot({ path: 'qa-artifacts/s23-create-top.png' });
  console.log('Screenshot: qa-artifacts/s23-create-top.png');

  // Scroll down a bit on Create page
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);

  let scrollTop3 = await page.evaluate(() => window.scrollY);
  console.log(`Create page scroll Y after scrolling: ${scrollTop3}`);
  await page.screenshot({ path: 'qa-artifacts/s23-create-scrolled.png' });
  console.log('Screenshot: qa-artifacts/s23-create-scrolled.png');

  // Click Cancel to return to Home
  await page.click('text=Cancel');
  await page.waitForURL('http://localhost:5174', { timeout: 10000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  let scrollTop4 = await page.evaluate(() => window.scrollY);
  console.log(`Home page scroll Y after Cancel: ${scrollTop4}`);
  await page.screenshot({ path: 'qa-artifacts/s23-home-after-cancel.png' });
  console.log('Screenshot: qa-artifacts/s23-home-after-cancel.png');

  // Test browser Back button
  console.log('\n--- Testing browser Back button ---');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });
  await page.click('text=Start Investigation');
  await page.waitForURL('http://localhost:5174/create', { timeout: 10000 });
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);

  await page.goBack();
  await page.waitForURL('http://localhost:5174', { timeout: 10000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  let scrollTop5 = await page.evaluate(() => window.scrollY);
  console.log(`Home page scroll Y after browser Back: ${scrollTop5}`);
  await page.screenshot({ path: 'qa-artifacts/s23-home-after-back.png' });
  console.log('Screenshot: qa-artifacts/s23-home-after-back.png');

  // Verify all pass
  console.log('\n=== RESULTS ===');
  const allPass = scrollTop1 === 0 && scrollTop2 === 0 && scrollTop4 === 0 && scrollTop5 === 0;
  console.log(`Initial home top: ${scrollTop1 === 0 ? '✓' : '✗'}`);
  console.log(`Create after nav: ${scrollTop2 === 0 ? '✓' : '✗'}`);
  console.log(`Home after Cancel: ${scrollTop4 === 0 ? '✓' : '✗'}`);
  console.log(`Home after Back: ${scrollTop5 === 0 ? '✓' : '✗'}`);
  console.log(allPass ? '\nALL CHECKS PASSED ✓' : '\nSOME CHECKS FAILED ✗');

  await browser.close();
})();
