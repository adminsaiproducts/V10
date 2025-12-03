/**
 * CRM V9 API Response Investigation
 * Test the actual API responses from the deployed application
 */

const { chromium } = require('playwright');

const CRM_URL = 'https://script.google.com/a/macros/saiproducts.co.jp/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec';

async function investigateAPI() {
  console.log('🔍 CRM V9 API Response Investigation\n');
  console.log(`📍 URL: ${CRM_URL}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  const apiCalls = [];

  // Intercept network requests
  page.on('request', request => {
    if (request.url().includes('api_getCustomers') || request.url().includes('google.script.run')) {
      console.log(`📡 Request: ${request.method()} ${request.url()}`);
      apiCalls.push({
        type: 'request',
        method: request.method(),
        url: request.url()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('api_getCustomers') || response.url().includes('/exec')) {
      console.log(`📨 Response: ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log(`📄 Response Body (first 500 chars):\n${body.substring(0, 500)}\n`);

        // Try to parse as JSON
        try {
          const json = JSON.parse(body);
          if (json.status === 'success' && json.data) {
            console.log(`✅ JSON Response - Customer count: ${json.data.length}`);
            apiCalls.push({
              type: 'response',
              status: response.status(),
              url: response.url(),
              customerCount: json.data.length
            });
          }
        } catch (e) {
          // Not JSON, probably HTML
        }
      } catch (e) {
        console.log(`⚠️  Could not read response body`);
      }
    }
  });

  try {
    console.log('📍 Loading page...');
    await page.goto(CRM_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('\n📍 Looking for iframe...');
    const iframe = page.frameLocator('#sandboxFrame');

    await page.waitForTimeout(5000);

    console.log('📍 Clicking 顧客管理 button...');
    try {
      const customerButton = iframe.locator('button:has-text("顧客管理")').first();
      await customerButton.click();
      console.log('✅ Clicked 顧客管理\n');

      // Wait for API calls to complete
      await page.waitForTimeout(10000);

      console.log('\n═══════════════════════════════════════════');
      console.log('📊 API Calls Summary');
      console.log('═══════════════════════════════════════════');
      apiCalls.forEach((call, index) => {
        console.log(`\nCall ${index + 1}:`);
        console.log(`  Type: ${call.type}`);
        if (call.method) console.log(`  Method: ${call.method}`);
        if (call.status) console.log(`  Status: ${call.status}`);
        if (call.customerCount) console.log(`  ✅ Customer Count: ${call.customerCount}`);
        console.log(`  URL: ${call.url.substring(0, 100)}...`);
      });
      console.log('═══════════════════════════════════════════\n');

    } catch (error) {
      console.error('⚠️  Could not click 顧客管理:', error.message);
    }

    console.log('✨ Investigation complete\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

investigateAPI()
  .then(() => {
    console.log('✅ API investigation complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
