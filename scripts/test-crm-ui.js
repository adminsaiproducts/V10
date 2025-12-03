// scripts/test-crm-ui.js - Test CRM V10 UI with automatic authentication
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbxaRkvr4fmTR1a0IRzIfLo3uun-QuXAYencN90cr9HVB7Yjv5aCn-ARyZfRvpg8Ot9CJQ/exec';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'crm-test');

// Credentials from .env
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

async function autoLogin(page) {
  console.log('🔐 Starting automatic login...');

  // Wait for email input
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', GOOGLE_EMAIL);
  console.log(`   Email entered: ${GOOGLE_EMAIL}`);

  // Click Next
  await page.click('button:has-text("次へ"), button:has-text("Next")');
  await page.waitForTimeout(2000);

  // Wait for password input
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await page.fill('input[type="password"]', GOOGLE_PASSWORD);
  console.log('   Password entered');

  // Click Next
  await page.click('button:has-text("次へ"), button:has-text("Next")');
  console.log('   Submitted login form');

  // Wait for redirect back to app
  await page.waitForTimeout(5000);
}

async function main() {
  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🚀 Starting CRM V10 UI Test (Auto-Login Mode)...');
  console.log(`📍 URL: ${DEPLOY_URL}`);
  console.log(`📧 Login: ${GOOGLE_EMAIL}`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Enable console logging from the page
  page.on('console', msg => {
    console.log(`   [Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`   [Browser Error] ${err.message}`);
  });

  try {
    console.log('\n📱 Loading CRM V10...');
    await page.goto(DEPLOY_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // Take screenshot of initial state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-initial-load.png'),
      fullPage: true
    });
    console.log('✅ Screenshot: 01-initial-load.png');

    // Check if we need to login
    const url = page.url();
    if (url.includes('accounts.google.com') || url.includes('ServiceLogin')) {
      await autoLogin(page);

      // Wait for redirect back to app
      try {
        await page.waitForURL('**/exec**', { timeout: 30000 });
        console.log('✅ Login successful!');
      } catch (e) {
        console.log('⚠️ Still waiting for app redirect...');
        await page.waitForTimeout(5000);
      }
    }

    // Handle GAS authorization screen
    const pageTitle = await page.title();
    if (pageTitle.includes('Authorization') || await page.$('text=REVIEW PERMISSIONS')) {
      console.log('🔑 Authorization required, clicking REVIEW PERMISSIONS...');

      // Click "REVIEW PERMISSIONS" button - this opens a popup
      const reviewBtn = await page.$('text=REVIEW PERMISSIONS');
      if (reviewBtn) {
        // Wait for popup to open
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          reviewBtn.click()
        ]);

        console.log('   Popup opened, handling OAuth flow...');
        await popup.waitForLoadState('domcontentloaded');
        await popup.waitForTimeout(2000);

        // Handle "This app isn't verified" warning - click Advanced
        let advancedLink = await popup.$('#details-button');
        if (!advancedLink) advancedLink = await popup.$('text=詳細');
        if (!advancedLink) advancedLink = await popup.$('text=Advanced');
        if (advancedLink) {
          console.log('   Clicking Advanced/Details link...');
          await advancedLink.click();
          await popup.waitForTimeout(2000);
        }

        // Click "Go to CRM V10 Base64 (unsafe)"
        let goToAppLink = await popup.$('a[id*="proceed"]');
        if (!goToAppLink) goToAppLink = await popup.$('text=CRM V10 Base64（安全ではないページ）に移動');
        if (!goToAppLink) goToAppLink = await popup.$('text=Go to CRM V10 Base64 (unsafe)');
        if (goToAppLink) {
          console.log('   Clicking Go to app link...');
          await goToAppLink.click();
          await popup.waitForTimeout(3000);
        }

        // Handle OAuth consent - click Allow
        let allowButton = await popup.$('#submit_approve_access');
        if (!allowButton) allowButton = await popup.$('button:has-text("許可")');
        if (!allowButton) allowButton = await popup.$('button:has-text("Allow")');
        if (allowButton) {
          console.log('   Clicking Allow button...');
          await allowButton.click();
          await popup.waitForTimeout(3000);
        }

        // Popup should close automatically after authorization
        console.log('✅ Authorization completed');

        // Wait for main page to refresh
        await page.waitForTimeout(5000);
      }
    }

    // Wait for page content to fully load
    console.log('\n⏳ Waiting for page to fully load...');
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-after-login.png'),
      fullPage: true
    });
    console.log('✅ Screenshot: 02-after-login.png');

    // Check for frames (GAS uses iframe for user content)
    const frames = page.frames();
    console.log(`\n📋 Found ${frames.length} frames`);

    frames.forEach((frame, i) => {
      console.log(`   Frame ${i}: ${frame.url().substring(0, 100)}`);
    });

    // Find the user content frame
    let contentFrame = null;
    for (const frame of frames) {
      const frameUrl = frame.url();
      if (frameUrl.includes('sandbox') || frameUrl.includes('userContent')) {
        console.log('\n   ✅ Found content iframe!');
        contentFrame = frame;
        break;
      }
    }

    if (!contentFrame) {
      console.log('\n   ⚠️ No sandbox iframe found, using main page');
      contentFrame = page;
    }

    // Wait for React to render
    console.log('\n⏳ Waiting for React to render...');
    await page.waitForTimeout(3000);

    // Try to get content from the iframe
    try {
      const iframeContent = await contentFrame.evaluate(() => {
        return {
          title: document.title,
          bodyHTML: document.body ? document.body.innerHTML.substring(0, 500) : 'No body',
          rootContent: document.getElementById('root') ? document.getElementById('root').innerHTML.substring(0, 500) : 'No #root',
          scripts: Array.from(document.scripts).map(s => s.src || 'inline').slice(0, 5),
          errors: window.__REACT_ERROR__ || null
        };
      });
      console.log('\n📝 Iframe Content Analysis:');
      console.log(`   Title: ${iframeContent.title}`);
      console.log(`   Body HTML (first 500 chars):\n   ${iframeContent.bodyHTML}`);
      console.log(`   #root content (first 500 chars):\n   ${iframeContent.rootContent}`);
      console.log(`   Scripts: ${JSON.stringify(iframeContent.scripts)}`);
    } catch (e) {
      console.log('   ❌ Could not access iframe content:', e.message);
    }

    // Take screenshot of the iframe directly if possible
    if (contentFrame !== page) {
      try {
        const frameElement = await contentFrame.frameElement();
        if (frameElement) {
          await frameElement.screenshot({
            path: path.join(SCREENSHOT_DIR, '03-iframe-content.png')
          });
          console.log('✅ Screenshot: 03-iframe-content.png (iframe only)');
        }
      } catch (e) {
        console.log('   Could not screenshot iframe:', e.message);
      }
    }

    // Take full page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-final-state.png'),
      fullPage: true
    });
    console.log('✅ Screenshot: 04-final-state.png');

    console.log('\n📸 All screenshots saved to:', SCREENSHOT_DIR);
    console.log('\n⏳ Keeping browser open for 30 seconds for observation...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'error-state.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

main().catch(console.error);
