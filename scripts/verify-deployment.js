/**
 * CRM V10 デプロイメント検証スクリプト
 * Playwright を使用してブラウザで動作確認を行い、スクリーンショットを保存します。
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 設定
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
const TIMEOUT = 30000; // 30秒

async function verifyDeployment() {
  console.log('🚀 CRM V10 デプロイメント検証を開始します...\n');

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

  try {
    // ステップ 1: ページにアクセス
    console.log(`📍 Step 1: ${DEPLOYMENT_URL} にアクセス中...`);
    await page.goto(DEPLOYMENT_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, `01_initial_load_${timestamp}.png`),
      fullPage: true 
    });
    console.log('✅ Step 1: ページ読み込み完了\n');

    // ステップ 2: React アプリケーションの起動確認
    console.log('📍 Step 2: React アプリケーションの起動確認...');
    await page.waitForSelector('#root', { timeout: TIMEOUT });
    console.log('✅ Step 2: #root 要素が見つかりました\n');

    // ステップ 3: Material UI の読み込み確認
    console.log('📍 Step 3: Material UI の読み込み確認...');
    const hasMuiElements = await page.evaluate(() => {
      const muiElements = document.querySelectorAll('[class*="Mui"]');
      return muiElements.length > 0;
    });
    
    if (hasMuiElements) {
      console.log('✅ Step 3: Material UI コンポーネントが検出されました\n');
    } else {
      console.warn('⚠️  Step 3: Material UI コンポーネントが見つかりません\n');
    }

    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, `02_mui_loaded_${timestamp}.png`),
      fullPage: true 
    });

    // ステップ 4: コンソールエラーのチェック
    console.log('📍 Step 4: コンソールエラーのチェック...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 少し待機してエラーを収集
    await page.waitForTimeout(3000);

    if (errors.length === 0) {
      console.log('✅ Step 4: コンソールエラーなし\n');
    } else {
      console.error('❌ Step 4: 以下のコンソールエラーが検出されました:');
      errors.forEach(err => console.error(`   - ${err}`));
      console.log('');
    }

    // ステップ 5: 最終スクリーンショット
    console.log('📍 Step 5: 最終スクリーンショット保存...');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, `03_final_state_${timestamp}.png`),
      fullPage: true 
    });
    console.log('✅ Step 5: スクリーンショット保存完了\n');

    // 結果サマリー
    console.log('═══════════════════════════════════════════');
    console.log('📊 検証結果サマリー');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ ページ読み込み: 成功`);
    console.log(`✅ React アプリ起動: 成功`);
    console.log(`${hasMuiElements ? '✅' : '⚠️ '} Material UI: ${hasMuiElements ? '検出' : '未検出'}`);
    console.log(`${errors.length === 0 ? '✅' : '❌'} コンソールエラー: ${errors.length === 0 ? 'なし' : errors.length + '件'}`);
    console.log('═══════════════════════════════════════════\n');

    console.log(`📁 スクリーンショット保存先: ${SCREENSHOT_DIR}\n`);

    // 総合判定
    if (errors.length === 0 && hasMuiElements) {
      console.log('🎉 検証成功: デプロイメントは正常に動作しています!\n');
      return true;
    } else {
      console.log('⚠️  検証完了: いくつかの問題が検出されました。上記を確認してください。\n');
      return false;
    }

  } catch (error) {
    console.error('❌ 検証エラー:', error.message);
    
    // エラー時もスクリーンショットを保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, `error_${timestamp}.png`),
      fullPage: true 
    });
    
    return false;
  } finally {
    await browser.close();
  }
}

// スクリプト実行
verifyDeployment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
