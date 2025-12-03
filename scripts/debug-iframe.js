// scripts/debug-iframe.js - Debug all nested iframes in GAS
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbzSVpkJYwWId2DHdHhFm1KkcHIZ0X3GMwzWLMKdZoRRlui-wt4NfkqqZ-oqk5voetwCGA/exec';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

async function autoLogin(page) {
  console.log('🔐 Logging in...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', GOOGLE_EMAIL);
  await page.click('button:has-text("次へ"), button:has-text("Next")');
  await page.waitForTimeout(2000);
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await page.fill('input[type="password"]', GOOGLE_PASSWORD);
  await page.click('button:has-text("次へ"), button:has-text("Next")');
  await page.waitForTimeout(5000);
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Capture all console messages
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleLogs.push({ type: 'pageerror', text: err.message }));

  try {
    console.log('📱 Loading CRM V10...');
    await page.goto(DEPLOY_URL, { waitUntil: 'networkidle', timeout: 60000 });

    const url = page.url();
    if (url.includes('accounts.google.com')) {
      await autoLogin(page);
      await page.waitForURL('**/exec**', { timeout: 30000 }).catch(() => {});
    }

    console.log('⏳ Waiting for content to load completely...');
    await page.waitForTimeout(8000);  // Wait longer for nested iframes

    // List all frames
    const frames = page.frames();
    console.log(`\n📋 All frames (${frames.length}):`);

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const frameUrl = frame.url();
      const frameName = frame.name() || '(unnamed)';
      console.log(`   ${i}: [${frameName}] ${frameUrl.substring(0, 100)}`);

      // Try to get content from each frame
      try {
        const frameContent = await frame.evaluate(() => {
          return {
            title: document.title,
            hasRoot: !!document.getElementById('root'),
            bodyLength: document.body ? document.body.innerHTML.length : 0,
            firstScript: document.scripts[0] ? (document.scripts[0].src || 'inline') : 'none'
          };
        });
        console.log(`      - Title: "${frameContent.title}", #root: ${frameContent.hasRoot}, body: ${frameContent.bodyLength} chars`);

        // If this frame has #root, save its content
        if (frameContent.hasRoot || frameContent.bodyLength > 1000) {
          const html = await frame.evaluate(() => document.documentElement.outerHTML);
          const outputPath = path.join(__dirname, '..', `debug-frame-${i}.html`);
          fs.writeFileSync(outputPath, html, 'utf8');
          console.log(`      📄 Saved to: debug-frame-${i}.html (${(html.length/1024).toFixed(1)} KB)`);
        }
      } catch (e) {
        console.log(`      ⚠️ Cannot access: ${e.message.substring(0, 50)}`);
      }
    }

    // Print console errors
    const errors = consoleLogs.filter(l => l.type === 'error' || l.type === 'pageerror');
    if (errors.length > 0) {
      console.log('\n🔴 Console Errors:');
      errors.forEach(e => console.log(`   ${e.text}`));
    }

    // Try to find the actual content frame by looking for userHtmlFrame
    console.log('\n🔍 Looking for userHtmlFrame...');
    const userHtmlFrame = page.frame({ name: 'userHtmlFrame' });
    if (userHtmlFrame) {
      console.log('✅ Found userHtmlFrame!');
      try {
        const html = await userHtmlFrame.evaluate(() => document.documentElement.outerHTML);
        const outputPath = path.join(__dirname, '..', 'debug-userHtmlFrame.html');
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`📄 Saved userHtmlFrame content: ${(html.length/1024).toFixed(1)} KB`);

        // Check for #root
        const hasRoot = html.includes('id="root"');
        console.log(`   Has #root: ${hasRoot}`);

        // Show first 1000 chars
        console.log('\n📝 userHtmlFrame content preview:');
        console.log(html.substring(0, 1000));
      } catch (e) {
        console.log(`❌ Cannot access userHtmlFrame content: ${e.message}`);
      }
    } else {
      console.log('❌ userHtmlFrame not found by name');
    }

    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Done');
  }
}

main().catch(console.error);
