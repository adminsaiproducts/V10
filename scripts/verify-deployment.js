/**
 * CRM V10 Deployment Verification Script
 *
 * This script uses Playwright to verify that the deployed GAS Web App is working correctly.
 *
 * Usage:
 *   node scripts/verify-deployment.js <WEB_APP_URL>
 *
 * Example:
 *   node scripts/verify-deployment.js https://script.google.com/macros/s/AKfyc.../exec
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Get Web App URL from command line argument or environment variable
const DEPLOYMENT_URL = process.argv[2] || process.env.DEPLOYMENT_URL;

if (!DEPLOYMENT_URL) {
  console.error('❌ Error: No deployment URL provided.');
  console.error('Usage: node scripts/verify-deployment.js <WEB_APP_URL>');
  console.error('   or: DEPLOYMENT_URL=<url> node scripts/verify-deployment.js');
  process.exit(1);
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function verifyDeployment() {
  console.log('🚀 Starting deployment verification...');
  console.log(`📍 Target URL: ${DEPLOYMENT_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Track console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Track errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    // Step 1: Navigate to Web App
    console.log('\n📄 Step 1: Loading Web App...');
    await page.goto(DEPLOYMENT_URL, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.screenshot({
      path: path.join(screenshotsDir, '01_initial_load.png'),
      fullPage: true
    });
    console.log('✅ Page loaded successfully');

    // Step 2: Check for React root element
    console.log('\n🔍 Step 2: Checking for React application...');
    const reactRoot = await page.locator('#root').count();
    if (reactRoot > 0) {
      console.log('✅ React root element found');
    } else {
      console.log('⚠️  Warning: React root element not found');
    }

    // Step 3: Wait for content to render
    console.log('\n⏳ Step 3: Waiting for content to render...');
    await page.waitForTimeout(3000); // Wait 3 seconds for React to render

    await page.screenshot({
      path: path.join(screenshotsDir, '02_after_render.png'),
      fullPage: true
    });

    // Step 4: Check for Material UI elements
    console.log('\n🎨 Step 4: Checking for Material UI...');
    const muiElements = await page.locator('[class*="Mui"]').count();
    if (muiElements > 0) {
      console.log(`✅ Material UI detected (${muiElements} elements found)`);
    } else {
      console.log('⚠️  Warning: No Material UI elements found');
    }

    // Step 5: Check page title
    console.log('\n📝 Step 5: Checking page title...');
    const title = await page.title();
    console.log(`   Title: "${title}"`);

    // Step 6: Final screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '03_final_state.png'),
      fullPage: true
    });

    // Report console messages
    console.log('\n📋 Console Messages:');
    if (consoleMessages.length === 0) {
      console.log('   (no messages)');
    } else {
      consoleMessages.forEach(msg => {
        const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} [${msg.type}] ${msg.text}`);
      });
    }

    // Report errors
    console.log('\n🐛 JavaScript Errors:');
    if (errors.length === 0) {
      console.log('   ✅ No errors detected');
    } else {
      errors.forEach(error => {
        console.log(`   ❌ ${error}`);
      });
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (errors.length === 0 && reactRoot > 0) {
      console.log('✅ VERIFICATION PASSED');
      console.log('   - Page loaded successfully');
      console.log('   - React application is running');
      console.log('   - No JavaScript errors detected');
      if (muiElements > 0) {
        console.log('   - Material UI is active');
      }
    } else {
      console.log('⚠️  VERIFICATION COMPLETED WITH WARNINGS');
      if (errors.length > 0) {
        console.log(`   - ${errors.length} JavaScript error(s) detected`);
      }
      if (reactRoot === 0) {
        console.log('   - React root element not found');
      }
    }
    console.log('='.repeat(60));

    console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED');
    console.error(`   Error: ${error.message}`);

    await page.screenshot({
      path: path.join(screenshotsDir, 'error.png'),
      fullPage: true
    });

    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyDeployment().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
