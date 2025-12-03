/**
 * CRM V9 ページネーション調査スクリプト (iframe対応版)
 * GAS Web Appはiframeでコンテンツをサンドボックス化しているため、
 * iframe内部にアクセスして調査を行います
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CRM_URL = 'https://script.google.com/a/macros/saiproducts.co.jp/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'crm-v9-pagination');
const TIMEOUT = 60000;

async function investigatePagination() {
  console.log('🔍 CRM V9 ページネーション調査を開始します (iframe対応版)...\n');
  console.log(`📍 URL: ${CRM_URL}\n`);

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  const results = {
    pageLoaded: false,
    iframeFound: false,
    totalCustomersDisplayed: 0,
    customersOnPage: 0,
    paginationExists: false,
    currentPage: '',
    totalPages: '',
    screenshotsPath: SCREENSHOT_DIR
  };

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // Step 1: ページロード
    console.log('📍 Step 1: ページロード...');
    await page.goto(CRM_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `01_initial_load_${timestamp}.png`),
      fullPage: true
    });

    console.log('✅ Step 1: ページロード完了\n');
    results.pageLoaded = true;

    // Step 2: iframe内に入る
    console.log('📍 Step 2: iframe内のコンテンツにアクセス...');
    const iframeElement = await page.frameLocator('#sandboxFrame');

    if (iframeElement) {
      console.log('✅ iframe発見\n');
      results.iframeFound = true;

      // iframe内のコンテンツが読み込まれるまで待機
      await page.waitForTimeout(5000);

      // Step 3: 顧客管理メニューをクリック
      console.log('📍 Step 3: 「顧客管理」メニューをクリック...');

      try {
        // Material UIのListItemButtonを探してクリック
        const customerButton = iframeElement.locator('button:has-text("顧客管理")').first();
        await customerButton.click();
        console.log('✅ 「顧客管理」メニューをクリック\n');

        await page.waitForTimeout(7000); // 顧客データ読み込み待機

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `02_customer_list_${timestamp}.png`),
          fullPage: true
        });

        // Step 4: 表示件数の確認
        console.log('📍 Step 4: 表示件数の確認...');

        // テーブル行をカウント
        const tableRows = iframeElement.locator('table tbody tr');
        const rowCount = await tableRows.count();
        results.customersOnPage = rowCount;
        console.log(`  テーブル行数: ${rowCount}件`);

        // ページネーション情報を取得
        const paginationText = await iframeElement.locator('text=/\\d+-\\d+ of \\d+|Page \\d+ of \\d+/').textContent().catch(() => null);
        if (paginationText) {
          results.paginationExists = true;
          console.log(`  ページネーション情報: ${paginationText}`);

          // "1-50 of 10852" のような形式から解析
          const match = paginationText.match(/(\d+)-(\d+) of (\d+)/);
          if (match) {
            results.totalCustomersDisplayed = parseInt(match[3]);
            results.currentPage = `${match[1]}-${match[2]}`;
            results.totalPages = match[3];
          }
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('📊 調査結果サマリー');
        console.log('═══════════════════════════════════════════');
        console.log(`✅ iframe内アクセス: ${results.iframeFound ? '成功' : '失敗'}`);
        console.log(`📈 合計顧客数: ${results.totalCustomersDisplayed}件`);
        console.log(`📄 現在ページの表示数: ${results.customersOnPage}件`);
        console.log(`🔢 ページネーション: ${results.paginationExists ? '存在' : '不在'}`);
        console.log(`📍 表示範囲: ${results.currentPage} / ${results.totalPages}`);
        console.log('═══════════════════════════════════════════\n');

      } catch (error) {
        console.error('⚠️  顧客管理メニューのクリックに失敗:', error.message);
      }
    } else {
      console.log('❌ iframeが見つかりません\n');
    }

    console.log('✨ 調査完了\n');
    return results;

  } catch (error) {
    console.error('\n❌ 調査エラー:', error.message);
    console.error('スタックトレース:', error.stack);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `ERROR_${timestamp}.png`),
      fullPage: true
    });

    return results;
  } finally {
    await browser.close();
  }
}

investigatePagination()
  .then(results => {
    console.log('📁 スクリーンショット保存先:', SCREENSHOT_DIR);

    // レポート生成
    const reportPath = path.join(__dirname, '..', 'CRM_V9_PAGINATION_REPORT.md');
    const report = `# CRM V9 Pagination Investigation Report

**調査日時:** ${new Date().toISOString()}
**調査URL:** ${CRM_URL}

## 調査結果

| 項目 | 結果 |
|------|------|
| ページロード | ${results.pageLoaded ? '✅ 成功' : '❌ 失敗'} |
| iframe内アクセス | ${results.iframeFound ? '✅ 成功' : '❌ 失敗'} |
| 合計顧客数 | ${results.totalCustomersDisplayed}件 |
| 現在ページの表示数 | ${results.customersOnPage}件 |
| ページネーション | ${results.paginationExists ? '✅ 存在' : '❌ 不在'} |
| 表示範囲 | ${results.currentPage} / ${results.totalPages} |

## スクリーンショット

保存先: \`${results.screenshotsPath}\`

## 分析

${results.customersOnPage > 0 && results.totalCustomersDisplayed > 0 ? `
- **表示率:** ${results.customersOnPage} / ${results.totalCustomersDisplayed} (${(results.customersOnPage / results.totalCustomersDisplayed * 100).toFixed(1)}%)

${results.customersOnPage < results.totalCustomersDisplayed ? `
⚠️ **問題:** 全${results.totalCustomersDisplayed}件中、${results.customersOnPage}件しか表示されていません。

${results.paginationExists ? `
✅ ページネーションUIは存在します。
💡 **推奨:** Material UI TableとPaginationコンポーネントによるUI/UX改善を検討
` : `
❌ **重大:** ページネーションUIが不完全
📋 **推奨:** Material UI Tableを使用した改善実装が必要
`}
` : ''}
` : 'データ取得に問題がある可能性があります'}

---

**🤖 Generated by Claude Code CRM V9 Investigation Script**
`;

    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`✅ レポート保存完了: ${reportPath}\n`);

    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
