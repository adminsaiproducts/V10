/**
 * ページネーション調査スクリプト
 * 現在デプロイされているCRM V9の顧客一覧ページを調査し、
 * 実際の表示件数とページネーション機能を確認します
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 設定
const CRM_URL = 'https://script.google.com/a/macros/saiproducts.co.jp/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'pagination-investigation');
const TIMEOUT = 60000; // 60秒

async function investigatePagination() {
  console.log('🔍 ページネーション調査を開始します...\n');
  console.log(`📍 URL: ${CRM_URL}\n`);

  // スクリーンショット保存ディレクトリの作成
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // ゆっくり動作させて確認しやすく
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  const results = {
    pageLoaded: false,
    totalCustomersDisplayed: 0,
    customersOnPage: 0,
    paginationExists: false,
    paginationInfo: '',
    previousButtonExists: false,
    nextButtonExists: false,
    pageInfo: '',
    screenshotsPath: SCREENSHOT_DIR
  };

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // ========================================
    // Step 1: ページロード
    // ========================================
    console.log('📍 Step 1: ページロード...');
    await page.goto(CRM_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(3000); // UIが完全に描画されるまで待機

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `01_initial_load_${timestamp}.png`),
      fullPage: true
    });

    console.log('✅ Step 1: ページロード完了\n');
    results.pageLoaded = true;

    // ========================================
    // Step 2: 顧客一覧ページへ移動
    // ========================================
    console.log('📍 Step 2: 顧客一覧ページへ移動...');

    // CRM V9のサイドメニュー「顧客管理」をクリック（複数のセレクタ戦略を試行）
    let navigated = false;

    // CRM V9はMaterial UIを使用（ListItemButton内にListItemText）
    const strategies = [
      // Material UI ListItemButton内のテキスト
      'button:has-text("顧客管理")',
      '[role="button"]:has-text("顧客管理")',
      '.MuiListItemButton-root:has-text("顧客管理")',
      '.MuiListItemText-primary:has-text("顧客管理")',
      // 汎用的なセレクタ
      'text=/顧客管理/',
      'a:has-text("顧客管理")',
      'div:has-text("顧客管理")'
    ];

    for (const selector of strategies) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`  セレクタ "${selector}" で「顧客管理」メニューを発見`);
          await element.click();
          console.log('  クリック完了、顧客データ読み込み待機中...');
          await page.waitForTimeout(5000); // 顧客データ読み込み待機
          navigated = true;
          break;
        }
      } catch (e) {
        // 次の戦略を試行
        console.log(`  セレクタ "${selector}" では見つかりませんでした`);
        continue;
      }
    }

    if (navigated) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `02_customer_list_${timestamp}.png`),
        fullPage: true
      });
      console.log('✅ Step 2: 顧客一覧ページ表示完了\n');
    } else {
      console.log('⚠️  「顧客管理」メニューが見つかりません。\n');
    }

    // ========================================
    // Step 3: 表示件数の確認
    // ========================================
    console.log('📍 Step 3: 表示件数の確認...');

    // 合計顧客数の取得
    const totalCustomersText = await page.locator('text=/Total Customers:/').textContent().catch(() => null);
    if (totalCustomersText) {
      const match = totalCustomersText.match(/Total Customers:\s*(\d+)/);
      if (match) {
        results.totalCustomersDisplayed = parseInt(match[1]);
        console.log(`  合計顧客数表示: ${results.totalCustomersDisplayed}件`);
      }
    }

    // ページ上の顧客リスト項目数をカウント
    const customerItems = await page.locator('ul li').count();
    results.customersOnPage = customerItems;
    console.log(`  ページ上の顧客項目数: ${results.customersOnPage}件`);

    // ========================================
    // Step 4: ページネーション要素の確認
    // ========================================
    console.log('\n📍 Step 4: ページネーション要素の確認...');

    // "Page X of Y" の確認
    const pageInfoElement = page.locator('text=/Page \\d+ of \\d+/');
    if (await pageInfoElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      results.paginationExists = true;
      results.pageInfo = await pageInfoElement.textContent();
      console.log(`  ページ情報: ${results.pageInfo}`);
    } else {
      console.log('  ⚠️  ページ情報が見つかりません');
    }

    // Previousボタンの確認
    const prevButton = page.locator('button:has-text("Previous")');
    results.previousButtonExists = await prevButton.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`  Previousボタン: ${results.previousButtonExists ? '✅ 存在' : '❌ 不在'}`);

    // Nextボタンの確認
    const nextButton = page.locator('button:has-text("Next")');
    results.nextButtonExists = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`  Nextボタン: ${results.nextButtonExists ? '✅ 存在' : '❌ 不在'}`);

    // ========================================
    // Step 5: Nextボタンのテスト（存在する場合）
    // ========================================
    if (results.nextButtonExists) {
      console.log('\n📍 Step 5: Nextボタンのテスト...');

      const nextButtonEnabled = await nextButton.isEnabled();
      console.log(`  Nextボタンの状態: ${nextButtonEnabled ? '有効' : '無効'}`);

      if (nextButtonEnabled) {
        await nextButton.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `03_next_page_${timestamp}.png`),
          fullPage: true
        });

        // 次ページのページ情報を取得
        const nextPageInfo = await pageInfoElement.textContent().catch(() => 'N/A');
        console.log(`  次ページ情報: ${nextPageInfo}`);

        // 次ページの顧客数をカウント
        const nextPageCustomers = await page.locator('ul li').count();
        console.log(`  次ページの顧客項目数: ${nextPageCustomers}件`);
      }
    }

    // ========================================
    // 結果サマリー
    // ========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 調査結果サマリー');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ ページロード: ${results.pageLoaded ? '成功' : '失敗'}`);
    console.log(`📈 合計顧客数表示: ${results.totalCustomersDisplayed}件`);
    console.log(`📄 現在ページの顧客数: ${results.customersOnPage}件`);
    console.log(`🔢 ページネーション: ${results.paginationExists ? '存在' : '不在'}`);
    console.log(`📍 ページ情報: ${results.pageInfo || 'N/A'}`);
    console.log(`⬅️  Previousボタン: ${results.previousButtonExists ? '存在' : '不在'}`);
    console.log(`➡️  Nextボタン: ${results.nextButtonExists ? '存在' : '不在'}`);
    console.log('═══════════════════════════════════════════\n');

    console.log(`📁 スクリーンショット保存先: ${SCREENSHOT_DIR}\n`);

    // 分析と推奨事項
    console.log('🎯 分析結果:');
    if (results.totalCustomersDisplayed > 0 && results.customersOnPage > 0) {
      const ratio = (results.customersOnPage / results.totalCustomersDisplayed * 100).toFixed(1);
      console.log(`  - 表示率: ${results.customersOnPage} / ${results.totalCustomersDisplayed} (${ratio}%)`);

      if (results.customersOnPage < results.totalCustomersDisplayed) {
        console.log(`  ⚠️  全${results.totalCustomersDisplayed}件中、${results.customersOnPage}件しか表示されていません`);

        if (!results.paginationExists || !results.nextButtonExists) {
          console.log('  ❌ 重大な問題: ページネーションUIが不完全です');
          console.log('  📋 推奨: Material UI Tableを使用した改善実装が必要');
        } else {
          console.log('  ✅ ページネーションUIは存在します');
          console.log('  💡 推奨: UI/UXの改善（Material UI化）を検討');
        }
      }
    }

    console.log('\n✨ 調査完了\n');
    return results;

  } catch (error) {
    console.error('\n❌ 調査エラー:', error.message);
    console.error('スタックトレース:', error.stack);

    // エラー時もスクリーンショットを保存
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

// スクリプト実行
investigatePagination()
  .then(results => {
    console.log('📝 調査結果を保存します...');

    const reportPath = path.join(__dirname, '..', 'PAGINATION_INVESTIGATION_REPORT.md');
    const report = `# Pagination Investigation Report

**調査日時:** ${new Date().toISOString()}
**調査URL:** ${CRM_URL}

## 調査結果

| 項目 | 結果 |
|------|------|
| ページロード | ${results.pageLoaded ? '✅ 成功' : '❌ 失敗'} |
| 合計顧客数表示 | ${results.totalCustomersDisplayed}件 |
| 現在ページの顧客数 | ${results.customersOnPage}件 |
| ページネーション存在 | ${results.paginationExists ? '✅ Yes' : '❌ No'} |
| ページ情報 | ${results.pageInfo || 'N/A'} |
| Previousボタン | ${results.previousButtonExists ? '✅ 存在' : '❌ 不在'} |
| Nextボタン | ${results.nextButtonExists ? '✅ 存在' : '❌ 不在'} |

## スクリーンショット

保存先: \`${results.screenshotsPath}\`

## 分析

${results.totalCustomersDisplayed > 0 && results.customersOnPage > 0 ? `
- **表示率:** ${results.customersOnPage} / ${results.totalCustomersDisplayed} (${(results.customersOnPage / results.totalCustomersDisplayed * 100).toFixed(1)}%)
${results.customersOnPage < results.totalCustomersDisplayed ? `
- ⚠️ **問題:** 全${results.totalCustomersDisplayed}件中、${results.customersOnPage}件しか表示されていません
${!results.paginationExists || !results.nextButtonExists ? `
- ❌ **重大:** ページネーションUIが不完全
- 📋 **推奨:** Material UI Tableを使用した改善実装が必要
` : `
- ✅ ページネーションUIは存在します
- 💡 **推奨:** UI/UXの改善（Material UI化）を検討
`}
` : ''}
` : 'データ取得に問題がある可能性があります'}

## Next Steps

1. Material UI TableとPaginationコンポーネントの導入
2. 表示件数選択機能の追加（10/25/50/100件）
3. ソート機能の追加
4. フィルター機能の強化

---

**🤖 Generated by Claude Code Investigation Script**
`;

    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`✅ レポート保存完了: ${reportPath}\n`);

    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
