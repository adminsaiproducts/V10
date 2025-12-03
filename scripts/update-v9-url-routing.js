/**
 * Update V9 Apps Script with URL Routing Feature
 * Manually updates bundle.js, index.html, and javascript.html in V9 Apps Script
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCRIPT_ID = '1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjIK2qG9FcQ';
const EDITOR_URL = `https://script.google.com/home/projects/${SCRIPT_ID}/edit`;

// V9 dist paths
const V9_DIST = path.join(__dirname, '..', '..', 'V9', 'dist');
const FILES = {
  'bundle.js': path.join(V9_DIST, 'bundle.js'),
  'index.html': path.join(V9_DIST, 'index.html'),
  'javascript.html': path.join(V9_DIST, 'javascript.html')
};

async function updateV9() {
  console.log('🚀 V9 URL Routing Manual Update\n');
  console.log(`📁 V9 Dist Path: ${V9_DIST}`);
  console.log(`🌐 Editor URL: ${EDITOR_URL}\n`);

  // Load and verify files
  const contents = {};
  for (const [name, filepath] of Object.entries(FILES)) {
    if (!fs.existsSync(filepath)) {
      console.error(`❌ File not found: ${filepath}`);
      process.exit(1);
    }
    contents[name] = fs.readFileSync(filepath, 'utf-8');
    console.log(`✅ Loaded ${name} (${contents[name].length} bytes)`);
  }

  // Verify api_getCustomerById exists
  if (!contents['bundle.js'].includes('api_getCustomerById')) {
    console.error('❌ bundle.js missing api_getCustomerById!');
    process.exit(1);
  }
  console.log('✅ Verified: api_getCustomerById in bundle.js');

  // Verify window.CRM_INITIAL_STATE exists
  if (!contents['index.html'].includes('window.CRM_INITIAL_STATE')) {
    console.error('❌ index.html missing window.CRM_INITIAL_STATE!');
    process.exit(1);
  }
  console.log('✅ Verified: window.CRM_INITIAL_STATE in index.html\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📍 Opening Apps Script Editor...');
    await page.goto(EDITOR_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);
    console.log('✅ Editor loaded\n');

    // Update each file
    for (const [fileName, content] of Object.entries(contents)) {
      console.log(`\n📍 Updating ${fileName}...`);

      // Find file
      const selectors = [
        `text="${fileName}"`,
        `[role="treeitem"]:has-text("${fileName}")`
      ];

      let found = false;
      for (const selector of selectors) {
        try {
          const elem = page.locator(selector).first();
          if (await elem.isVisible({ timeout: 2000 })) {
            await elem.click();
            await page.waitForTimeout(2000);
            found = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!found) {
        console.error(`  ❌ Could not find ${fileName}`);
        continue;
      }

      // Replace content
      console.log(`  📝 Replacing content...`);
      await page.keyboard.press('Control+A');
      await page.waitForTimeout(500);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(1000);
      await page.keyboard.insertText(content);
      await page.waitForTimeout(2000);

      // Save
      await page.keyboard.press('Control+S');
      await page.waitForTimeout(3000);

      console.log(`  ✅ Updated ${fileName}`);
    }

    console.log('\n🎉 V9 URL Routing Update Complete!\n');
    console.log('次のステップ:');
    console.log('1. Apps Script Editorで変更を確認');
    console.log('2. デプロイメントを更新');
    console.log('3. URL routing機能をテスト\n');

    // Keep browser open for 2 minutes
    console.log('⏸️  ブラウザを2分間開いたままにします...');
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({
      path: path.join(__dirname, '..', 'screenshots', `v9-update-error-${Date.now()}.png`),
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

updateV9()
  .then(() => {
    console.log('✨ Complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal:', error);
    process.exit(1);
  });
