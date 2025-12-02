/**
 * CRM V9 System に address_lookup_demo.html を自動デプロイ
 * Playwright でブラウザ自動操作を行い、HTMLファイルを追加してデプロイします
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 設定
const GAS_PROJECT_URL = 'https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjIK2qG9FcQ/edit';
const HTML_FILE_PATH = path.join(__dirname, '..', 'address_lookup_demo.html');
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const TIMEOUT = 60000; // 60秒

async function deployToGAS() {
  console.log('🚀 CRM V9 System へのデプロイを開始します...\n');

  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    console.error('❌ エラー: .env に GOOGLE_EMAIL と GOOGLE_PASSWORD が設定されていません');
    return false;
  }

  if (!fs.existsSync(HTML_FILE_PATH)) {
    console.error(`❌ エラー: HTMLファイルが見つかりません: ${HTML_FILE_PATH}`);
    return false;
  }

  const htmlContent = fs.readFileSync(HTML_FILE_PATH, 'utf-8');
  console.log(`📄 HTMLファイル読み込み完了: ${HTML_FILE_PATH}`);
  console.log(`   サイズ: ${(htmlContent.length / 1024).toFixed(2)} KB\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // ========================================
    // ステップ 1: Google ログイン
    // ========================================
    console.log('📍 Step 1: Google アカウントにログイン中...');
    await page.goto(GAS_PROJECT_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });

    // ログインページかどうか確認
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log('   ログインが必要です。自動ログインを実行します...');

      // メールアドレス入力
      await page.fill('input[type="email"]', GOOGLE_EMAIL);
      await page.click('button:has-text("次へ")');
      await page.waitForTimeout(2000);

      // パスワード入力
      await page.fill('input[type="password"]', GOOGLE_PASSWORD);
      await page.click('button:has-text("次へ")');
      await page.waitForTimeout(5000);

      console.log('   ログイン完了');
    } else {
      console.log('   既にログイン済みです');
    }

    await page.waitForTimeout(3000);
    console.log('✅ Step 1: ログイン完了\n');

    // ========================================
    // ステップ 2: HTMLファイルの存在確認
    // ========================================
    console.log('📍 Step 2: address_lookup_demo.html の存在確認...');

    // ファイル一覧で確認
    const fileExists = await page.locator('text=address_lookup_demo.html').isVisible().catch(() => false);

    if (fileExists) {
      console.log('   ⚠️  address_lookup_demo.html は既に存在します');
      console.log('   既存ファイルを使用します（上書きはスキップ）\n');
    } else {
      console.log('   address_lookup_demo.html は存在しません。新規作成します...');

      // ========================================
      // ステップ 3: 新規HTMLファイル作成
      // ========================================
      console.log('\n📍 Step 3: 新規HTMLファイル作成...');

      // 「+」ボタンをクリック（ファイル追加）
      await page.click('[aria-label="ファイルを追加"]').catch(async () => {
        // 別の方法: メニューから追加
        await page.click('button:has-text("ファイル")');
        await page.click('text=新規');
        await page.click('text=HTML ファイル');
      });

      await page.waitForTimeout(2000);

      // ファイル名入力ダイアログ
      const fileNameInput = await page.locator('input[placeholder="ファイル名を入力"]').or(page.locator('input[type="text"]')).first();
      await fileNameInput.fill('address_lookup_demo');
      await page.click('button:has-text("OK")');

      await page.waitForTimeout(3000);
      console.log('   HTMLファイル作成完了: address_lookup_demo.html');

      // ========================================
      // ステップ 4: HTMLコンテンツを貼り付け
      // ========================================
      console.log('\n📍 Step 4: HTMLコンテンツを貼り付け...');

      // エディタ領域を探す
      const editor = await page.locator('.CodeMirror').or(page.locator('textarea')).first();
      await editor.click();

      // 全選択して削除
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');

      // HTMLコンテンツを貼り付け
      await page.keyboard.insertText(htmlContent);

      await page.waitForTimeout(2000);
      console.log('   HTMLコンテンツ貼り付け完了');

      // 保存
      await page.keyboard.press('Control+S');
      await page.waitForTimeout(3000);
      console.log('✅ Step 4: ファイル保存完了\n');
    }

    // ========================================
    // ステップ 5: デプロイ
    // ========================================
    console.log('📍 Step 5: デプロイ実行...');

    // デプロイボタンをクリック
    await page.click('button:has-text("デプロイ")');
    await page.waitForTimeout(2000);

    // 「新しいデプロイ」を選択
    await page.click('text=新しいデプロイ');
    await page.waitForTimeout(2000);

    // 説明を入力
    const timestamp = new Date().toISOString().split('T')[0];
    await page.fill('input[placeholder="説明（省略可）"]', `Address Lookup Demo - ${timestamp}`);

    // デプロイボタンをクリック
    await page.click('button:has-text("デプロイ")');
    await page.waitForTimeout(10000); // デプロイには時間がかかる

    console.log('✅ Step 5: デプロイ完了\n');

    // ========================================
    // ステップ 6: デプロイURLを取得
    // ========================================
    console.log('📍 Step 6: デプロイURL取得...');

    // URLをコピー
    const deployUrl = await page.locator('input[readonly]').or(page.locator('text=https://script.google.com')).first().inputValue().catch(() => null);

    if (deployUrl) {
      console.log(`\n🎉 デプロイ成功！`);
      console.log(`\n📍 デプロイURL:`);
      console.log(deployUrl);
      console.log(`\n📍 デモページURL (住所検索):`);
      console.log(`${deployUrl}?demo=address\n`);
    } else {
      console.log('⚠️  デプロイURLを自動取得できませんでした。手動で確認してください。\n');
    }

    // スクリーンショット保存
    const screenshotDir = path.join(__dirname, '..', 'screenshots', 'deployment');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, `deployment_${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 スクリーンショット保存: ${screenshotPath}\n`);

    return true;

  } catch (error) {
    console.error('\n❌ デプロイエラー:', error.message);
    console.error('スタックトレース:', error.stack);

    // エラー時もスクリーンショットを保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotDir = path.join(__dirname, '..', 'screenshots', 'deployment');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await page.screenshot({
      path: path.join(screenshotDir, `ERROR_${timestamp}.png`),
      fullPage: true
    });

    return false;
  } finally {
    await browser.close();
  }
}

// スクリプト実行
deployToGAS()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
