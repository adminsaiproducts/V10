/**
 * ページ構造デバッグスクリプト
 * CRM V9のHTML構造を確認し、正しいセレクタを見つける
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CRM_URL = 'https://script.google.com/a/macros/saiproducts.co.jp/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec';

async function debugPageStructure() {
  console.log('🔍 CRM V9 ページ構造を確認します...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('📍 ページロード...');
    await page.goto(CRM_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('✅ ページロード完了\n');

    // HTMLコンテンツを取得
    const htmlContent = await page.content();
    const htmlPath = path.join(__dirname, '..', 'debug-page-structure.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log(`📄 HTML保存: ${htmlPath}\n`);

    // サイドメニューのテキストを全て抽出
    console.log('📋 サイドメニューの内容を確認:');
    const sidebarTexts = await page.locator('[role="navigation"], nav, aside, .sidebar, .drawer').allTextContents();
    console.log('サイドバーテキスト:', sidebarTexts);

    // 「顧客」を含む要素を全て検索
    console.log('\n🔍 「顧客」を含む要素を検索:');
    const customerElements = await page.locator('text=/顧客/').all();
    console.log(`見つかった要素数: ${customerElements.length}`);

    for (let i = 0; i < Math.min(customerElements.length, 10); i++) {
      const elem = customerElements[i];
      const text = await elem.textContent();
      const tagName = await elem.evaluate(el => el.tagName);
      const classList = await elem.evaluate(el => el.className);
      const role = await elem.getAttribute('role');

      console.log(`\n要素 ${i + 1}:`);
      console.log(`  Tag: ${tagName}`);
      console.log(`  Class: ${classList}`);
      console.log(`  Role: ${role}`);
      console.log(`  Text: ${text}`);
    }

    // Material UIのボタン要素を確認
    console.log('\n🔍 Material UIボタンを検索:');
    const buttons = await page.locator('button, [role="button"]').all();
    console.log(`見つかったボタン数: ${buttons.length}`);

    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const btn = buttons[i];
      const text = await btn.textContent();
      const classList = await btn.evaluate(el => el.className);

      if (text && text.includes('顧客')) {
        console.log(`\nボタン ${i + 1}:`);
        console.log(`  Class: ${classList}`);
        console.log(`  Text: ${text}`);
      }
    }

    console.log('\n✨ デバッグ完了\n');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
}

debugPageStructure()
  .then(() => {
    console.log('📝 デバッグ情報を確認してください。');
    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
