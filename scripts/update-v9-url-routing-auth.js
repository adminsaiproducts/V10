/**
 * Update V9 Apps Script with URL Routing Feature (with Google Login)
 * Manually updates bundle.js, index.html, and javascript.html in V9 Apps Script
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCRIPT_ID = '1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjIK2qG9FcQ';
const EDITOR_URL = `https://script.google.com/home/projects/${SCRIPT_ID}/edit`;
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const TIMEOUT = 60000;

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

  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    console.error('❌ エラー: .env に GOOGLE_EMAIL と GOOGLE_PASSWORD が設定されていません');
    process.exit(1);
  }

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
    // ========================================
    // ステップ 1: Google ログイン
    // ========================================
    console.log('📍 Step 1: Google アカウントにログイン中...');
    await page.goto(EDITOR_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    await page.waitForTimeout(3000);

    // 現在のURLを確認
    let currentUrl = page.url();
    console.log(`   現在のURL: ${currentUrl}`);

    // リダイレクトされた場合（developers.google.comなど）
    if (!currentUrl.includes('script.google.com/home/projects')) {
      console.log('   ⚠️  Apps Script Editorにリダイレクトされませんでした');
      console.log('   Googleログインを試行します...\n');

      // Googleログインページに移動
      await page.goto('https://accounts.google.com/signin', { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await page.waitForTimeout(2000);

      // メールアドレス入力
      console.log('   📧 メールアドレスを入力中...');
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill(GOOGLE_EMAIL);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }

      // パスワード入力
      console.log('   🔑 パスワードを入力中...');
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible({ timeout: 5000 })) {
        await passwordInput.fill(GOOGLE_PASSWORD);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }

      console.log('   ✅ ログイン完了');
      console.log('   Apps Script Editorに再度アクセスします...\n');

      // ログイン後、再度Apps Script Editorにアクセス
      await page.goto(EDITOR_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await page.waitForTimeout(5000);

      currentUrl = page.url();
      console.log(`   現在のURL: ${currentUrl}`);

      if (!currentUrl.includes('script.google.com/home/projects')) {
        console.error('   ❌ エラー: Apps Script Editorにアクセスできませんでした');
        console.error(`   現在のURL: ${currentUrl}`);
        console.error('   スクリーンショットを確認してください');
        await page.screenshot({
          path: path.join(__dirname, '..', 'screenshots', `login-failed-${Date.now()}.png`),
          fullPage: true
        });
        throw new Error('Apps Script Editor access failed after login');
      }
    } else {
      console.log('   ✅ 既にログイン済みです');
    }

    console.log('✅ Step 1: ログイン完了\n');
    await page.waitForTimeout(3000);

    // ========================================
    // ステップ 2: 各ファイルを更新
    // ========================================
    console.log('📍 Step 2: Apps Script ファイルを更新中...\n');

    // Wait for editor to fully load
    console.log('   エディタの読み込みを待機中...');
    await page.waitForTimeout(5000);

    // Take screenshot for debugging
    await page.screenshot({
      path: path.join(__dirname, '..', 'screenshots', `editor-loaded-${Date.now()}.png`),
      fullPage: true
    });
    console.log('   スクリーンショット保存: editor-loaded-*.png\n');

    // Update each file
    for (const [fileName, content] of Object.entries(contents)) {
      console.log(`📍 Updating ${fileName}...`);

      // Try multiple selector strategies
      const selectors = [
        `text="${fileName}"`,
        `[role="treeitem"]:has-text("${fileName}")`,
        `.item-label:has-text("${fileName}")`,
        `div:has-text("${fileName}")`,
        `span:has-text("${fileName}")`
      ];

      let found = false;
      for (const selector of selectors) {
        try {
          console.log(`   セレクタを試行中: ${selector}`);
          const elem = page.locator(selector).first();
          if (await elem.isVisible({ timeout: 3000 })) {
            console.log(`   ✅ ファイルが見つかりました: ${fileName}`);
            await elem.click();
            await page.waitForTimeout(3000);
            found = true;
            break;
          }
        } catch (e) {
          console.log(`   ❌ セレクタ失敗: ${selector}`);
          continue;
        }
      }

      if (!found) {
        console.error(`  ❌ Could not find ${fileName}`);
        console.error(`  手動でファイルを選択してください（30秒待機）`);
        await page.waitForTimeout(30000);
      }

      // Replace content
      console.log(`  📝 Replacing content...`);
      await page.keyboard.press('Control+A');
      await page.waitForTimeout(500);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(1000);

      // Split large content for insertText
      const chunkSize = 10000;
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        await page.keyboard.insertText(chunk);
        await page.waitForTimeout(100);
      }
      await page.waitForTimeout(2000);

      // Save
      await page.keyboard.press('Control+S');
      await page.waitForTimeout(3000);

      console.log(`  ✅ Updated ${fileName}\n`);
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
    throw error;
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
