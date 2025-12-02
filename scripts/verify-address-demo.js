/**
 * Address Lookup Demo デプロイメント検証スクリプト
 * Playwright を使用してブラウザで住所検索機能の動作確認を行い、スクリーンショットを保存します。
 *
 * 使用方法:
 * 1. デプロイURLを環境変数に設定: $env:DEMO_URL="https://script.google.com/.../exec?demo=address"
 * 2. 実行: node scripts/verify-address-demo.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 設定
const DEMO_URL = process.env.DEMO_URL || 'https://script.google.com/macros/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec?demo=address';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'address-demo');
const TIMEOUT = 30000; // 30秒

// テストデータ
const TEST_DATA = {
  zipcode: '100-0005',
  expectedAddress: '東京都千代田区丸の内',
  prefecture: '東京都',
  city: '千代田区',
  address1: '丸の内1-9-1',
  expectedZipcode: '100-6701',
  invalidZipcode: '123'
};

async function verifyAddressDemo() {
  console.log('🚀 住所検索デモ検証を開始します...\n');
  console.log(`📍 URL: ${DEMO_URL}\n`);

  if (DEMO_URL === 'PLEASE_SET_DEMO_URL_WITH_?demo=address') {
    console.error('❌ エラー: DEMO_URL が設定されていません');
    console.error('設定方法: $env:DEMO_URL="https://script.google.com/.../exec?demo=address"');
    return false;
  }

  // スクリーンショット保存ディレクトリの作成
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // デバッグ用に headless: false
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const results = {
    pageLoad: false,
    uiDisplay: false,
    zipcodeSearch: false,
    addressSearch: false,
    errorHandling: false
  };

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // ========================================
    // SS4: ステップ 1 - ページ読み込み確認
    // ========================================
    console.log('📍 Step 1 (SS4): ページ読み込み確認...');
    await page.goto(DEMO_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(2000); // UIが完全に描画されるまで待機

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `SS4_demo_page_initial_${timestamp}.png`),
      fullPage: true
    });

    console.log('✅ Step 1: ページ読み込み完了');
    results.pageLoad = true;

    // ========================================
    // ステップ 2 - UI表示確認
    // ========================================
    console.log('\n📍 Step 2: UI表示確認...');

    // タイトル確認
    const title = await page.title();
    console.log(`  タイトル: ${title}`);

    // 背景色確認 (紫グラデーション)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).background;
    });
    console.log(`  背景: ${bgColor.substring(0, 50)}...`);

    // セクション確認
    const sections = await page.$$('.section');
    console.log(`  セクション数: ${sections.length}`);

    if (title.includes('住所検索デモ') && sections.length === 2) {
      console.log('✅ Step 2: UI表示確認完了');
      results.uiDisplay = true;
    } else {
      console.warn('⚠️  Step 2: UI表示に問題があります');
    }

    // ========================================
    // SS5: ステップ 3 - 郵便番号→住所検索テスト
    // ========================================
    console.log('\n📍 Step 3 (SS5): 郵便番号→住所検索テスト...');
    console.log(`  入力郵便番号: ${TEST_DATA.zipcode}`);

    // 郵便番号入力
    await page.fill('#zipcode', TEST_DATA.zipcode);

    // 検索ボタンクリック
    await page.click('button:has-text("住所を検索")');

    // 結果待機 (最大10秒)
    await page.waitForSelector('#addressResult.success, #addressResult.error', { timeout: 10000 });
    await page.waitForTimeout(1000); // 結果表示の安定化

    // スクリーンショット撮影
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `SS5_zipcode_result_${timestamp}.png`),
      fullPage: true
    });

    // 結果確認
    const addressResultClass = await page.getAttribute('#addressResult', 'class');
    const addressResultText = await page.textContent('#addressResult');

    console.log(`  結果クラス: ${addressResultClass}`);
    console.log(`  結果テキスト: ${addressResultText.substring(0, 100)}...`);

    if (addressResultClass.includes('success') && addressResultText.includes(TEST_DATA.expectedAddress)) {
      console.log('✅ Step 3: 郵便番号検索成功');
      results.zipcodeSearch = true;
    } else {
      console.error('❌ Step 3: 郵便番号検索失敗');
    }

    // ========================================
    // SS6: ステップ 4 - 住所→郵便番号検索テスト
    // ========================================
    console.log('\n📍 Step 4 (SS6): 住所→郵便番号検索テスト...');
    console.log(`  入力住所: ${TEST_DATA.prefecture} ${TEST_DATA.city} ${TEST_DATA.address1}`);

    // 住所入力
    await page.fill('#prefecture', TEST_DATA.prefecture);
    await page.fill('#city', TEST_DATA.city);
    await page.fill('#address1', TEST_DATA.address1);

    // 検索ボタンクリック
    await page.click('button:has-text("郵便番号を検索")');

    // 結果待機 (最大10秒)
    await page.waitForSelector('#zipcodeResult.success, #zipcodeResult.error', { timeout: 10000 });
    await page.waitForTimeout(1000); // 結果表示の安定化

    // スクリーンショット撮影
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `SS6_address_result_${timestamp}.png`),
      fullPage: true
    });

    // 結果確認
    const zipcodeResultClass = await page.getAttribute('#zipcodeResult', 'class');
    const zipcodeResultText = await page.textContent('#zipcodeResult');

    console.log(`  結果クラス: ${zipcodeResultClass}`);
    console.log(`  結果テキスト: ${zipcodeResultText.substring(0, 100)}...`);

    if (zipcodeResultClass.includes('success') && zipcodeResultText.includes(TEST_DATA.expectedZipcode)) {
      console.log('✅ Step 4: 住所検索成功');
      results.addressSearch = true;
    } else {
      console.error('❌ Step 4: 住所検索失敗');
    }

    // ========================================
    // SS7: ステップ 5 - エラーハンドリングテスト
    // ========================================
    console.log('\n📍 Step 5 (SS7): エラーハンドリングテスト...');
    console.log(`  入力不正値: ${TEST_DATA.invalidZipcode}`);

    // 不正な郵便番号入力
    await page.fill('#zipcode', TEST_DATA.invalidZipcode);

    // 検索ボタンクリック
    await page.click('button:has-text("住所を検索")');

    // エラー表示待機
    await page.waitForSelector('#addressResult.error', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // スクリーンショット撮影
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `SS7_error_handling_${timestamp}.png`),
      fullPage: true
    });

    // エラー確認
    const errorClass = await page.getAttribute('#addressResult', 'class');
    const errorText = await page.textContent('#addressResult');

    console.log(`  エラークラス: ${errorClass}`);
    console.log(`  エラーテキスト: ${errorText.substring(0, 100)}...`);

    if (errorClass.includes('error')) {
      console.log('✅ Step 5: エラーハンドリング成功');
      results.errorHandling = true;
    } else {
      console.error('❌ Step 5: エラーハンドリング失敗');
    }

    // ========================================
    // 結果サマリー
    // ========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 検証結果サマリー');
    console.log('═══════════════════════════════════════════');
    console.log(`${results.pageLoad ? '✅' : '❌'} ページ読み込み`);
    console.log(`${results.uiDisplay ? '✅' : '❌'} UI表示確認`);
    console.log(`${results.zipcodeSearch ? '✅' : '❌'} 郵便番号→住所検索`);
    console.log(`${results.addressSearch ? '✅' : '❌'} 住所→郵便番号検索`);
    console.log(`${results.errorHandling ? '✅' : '❌'} エラーハンドリング`);
    console.log('═══════════════════════════════════════════\n');

    console.log(`📁 スクリーンショット保存先: ${SCREENSHOT_DIR}`);
    console.log(`   - SS4_demo_page_initial_${timestamp}.png`);
    console.log(`   - SS5_zipcode_result_${timestamp}.png`);
    console.log(`   - SS6_address_result_${timestamp}.png`);
    console.log(`   - SS7_error_handling_${timestamp}.png\n`);

    // 総合判定
    const allPassed = Object.values(results).every(r => r === true);

    if (allPassed) {
      console.log('🎉 検証成功: 住所検索デモは正常に動作しています!\n');
      return true;
    } else {
      console.log('⚠️  検証完了: いくつかのテストが失敗しました。上記を確認してください。\n');
      return false;
    }

  } catch (error) {
    console.error('\n❌ 検証エラー:', error.message);
    console.error('スタックトレース:', error.stack);

    // エラー時もスクリーンショットを保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `ERROR_${timestamp}.png`),
      fullPage: true
    });

    return false;
  } finally {
    await browser.close();
  }
}

// スクリプト実行
verifyAddressDemo()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
