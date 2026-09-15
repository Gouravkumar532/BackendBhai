import puppeteer from 'puppeteer';

const urls = [
  'http://localhost:4001/',
  'http://localhost:4002/',
  'http://localhost:4003/'
];

async function checkSite(url) {
  console.log(`Checking ${url}...`);
  const browser = await puppeteer.launch({ channel: 'chrome', headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()} at ${msg.location().url}`);
    }
  });

  page.on('requestfailed', request => {
    errors.push(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
    console.log(`Status: ${response.status()}`);
  } catch (err) {
    errors.push(`Goto Error: ${err.message}`);
  }

  if (url.includes('4003')) {
    try {
      await page.waitForSelector('button');
      await page.click('button');
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}
  } else if (url.includes('4002')) {
    try {
      await page.waitForSelector('.btn-add');
      await page.click('.btn-add');
      await page.click('.btn-normal');
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
  
  if (errors.length > 0) {
    console.log(`Found ${errors.length} errors on ${url}:`);
    errors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log(`No errors found on ${url}`);
  }
  console.log('---');
}

async function main() {
  for (const url of urls) {
    await checkSite(url);
  }
}

main().catch(console.error);
