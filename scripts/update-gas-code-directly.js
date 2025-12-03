/**
 * Apps Script Editor自動更新スクリプト
 * clasp pushが動作しない場合の緊急対応として、
 * Playwrightを使ってApps Scriptエディタで直接コードを更新します
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCRIPT_ID = '1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjIK2qG9FcQ';
const EDITOR_URL = `https://script.google.com/home/projects/${SCRIPT_ID}/edit`;
const BUNDLE_PATH = path.join(__dirname, '..', '..', 'V9', 'dist', 'bundle.js');

async function updateGASCode() {
  console.log('🔧 Apps Script Editor 自動更新開始\n');
  console.log(`📁 Bundle Path: ${BUNDLE_PATH}`);
  console.log(`🌐 Editor URL: ${EDITOR_URL}\n`);

  // bundle.jsを読み込む
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(`❌ bundle.jsが見つかりません: ${BUNDLE_PATH}`);
    process.exit(1);
  }

  const bundleContent = fs.readFileSync(BUNDLE_PATH, 'utf-8');
  console.log(`✅ bundle.js読み込み完了 (${bundleContent.length}文字)\n`);

  // 修正が含まれているか確認
  if (!bundleContent.includes('listCustomersPaginated(1, 10000)')) {
    console.error('❌ bundle.jsに修正が含まれていません!');
    console.error('   "listCustomersPaginated(1, 10000)" が見つかりません');
    process.exit(1);
  }
  console.log('✅ 修正内容の確認完了: listCustomersPaginated(1, 10000)\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Apps Script Editorにアクセス...');
    await page.goto(EDITOR_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);
    console.log('✅ Step 1: ページロード完了\n');

    console.log('📍 Step 2: bundle.js ファイルを選択...');

    // ファイルリストからbundle.jsを探してクリック
    const strategies = [
      'text="bundle.js"',
      '[role="treeitem"]:has-text("bundle.js")',
      '.file-name:has-text("bundle.js")',
      'div:has-text("bundle.js")'
    ];

    let fileFound = false;
    for (const selector of strategies) {
      try {
        const fileElement = page.locator(selector).first();
        if (await fileElement.isVisible({ timeout: 3000 })) {
          console.log(`  セレクタ "${selector}" でbundle.jsを発見`);
          await fileElement.click();
          console.log('  クリック完了');
          await page.waitForTimeout(3000);
          fileFound = true;
          break;
        }
      } catch (e) {
        console.log(`  セレクタ "${selector}" では見つかりませんでした`);
        continue;
      }
    }

    if (!fileFound) {
      console.error('❌ bundle.jsファイルが見つかりません');
      console.log('\n📸 スクリーンショットを撮影します...');
      await page.screenshot({
        path: path.join(__dirname, '..', 'screenshots', `gas-editor-error-${Date.now()}.png`),
        fullPage: true
      });
      await browser.close();
      process.exit(1);
    }

    console.log('✅ Step 2: bundle.js選択完了\n');

    console.log('📍 Step 3: コードエディタにフォーカス...');

    // Monaco Editorのテキストエリアにフォーカス
    const editorSelectors = [
      '.monaco-editor textarea',
      'textarea.inputarea',
      '[role="code"]',
      '.view-lines'
    ];

    let editorFocused = false;
    for (const selector of editorSelectors) {
      try {
        const editor = page.locator(selector).first();
        if (await editor.isVisible({ timeout: 3000 })) {
          console.log(`  セレクタ "${selector}" でエディタを発見`);
          await editor.click();
          await page.waitForTimeout(1000);
          editorFocused = true;
          break;
        }
      } catch (e) {
        console.log(`  セレクタ "${selector}" では見つかりませんでした`);
        continue;
      }
    }

    if (!editorFocused) {
      console.log('⚠️  エディタが見つかりませんでした。手動で更新してください。');
      console.log('\nブラウザを開いたままにします。手動で以下を実施してください:');
      console.log('1. bundle.jsファイルを開く');
      console.log('2. Ctrl+A で全選択');
      console.log('3. 削除');
      console.log('4. 新しいコードを貼り付け（クリップボードにコピー済み）');
      console.log('5. Ctrl+S で保存\n');

      // クリップボードにbundle.jsの内容をコピー (Windows用)
      require('child_process').spawn('clip').stdin.end(bundleContent);
      console.log('✅ bundle.jsの内容をクリップボードにコピーしました\n');

      // ブラウザを閉じずに待機
      await page.waitForTimeout(300000); // 5分待機
      await browser.close();
      return;
    }

    console.log('✅ Step 3: エディタフォーカス完了\n');

    console.log('📍 Step 4: 既存コードを全選択して削除...');
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(500);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(1000);
    console.log('✅ Step 4: 既存コード削除完了\n');

    console.log('📍 Step 5: 新しいコードを貼り付け...');
    await page.keyboard.insertText(bundleContent);
    await page.waitForTimeout(2000);
    console.log('✅ Step 5: コード貼り付け完了\n');

    console.log('📍 Step 6: 保存...');
    await page.keyboard.press('Control+S');
    await page.waitForTimeout(3000);
    console.log('✅ Step 6: 保存完了\n');

    console.log('🎉 Apps Script Editorの更新が完了しました!\n');
    console.log('次のステップ:');
    console.log('1. デプロイメントを作成: clasp deploy');
    console.log('2. または既存のデプロイメントを更新してください\n');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    console.error('スタックトレース:', error.stack);

    console.log('\n📸 エラースクリーンショットを撮影...');
    await page.screenshot({
      path: path.join(__dirname, '..', 'screenshots', `gas-editor-error-${Date.now()}.png`),
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

updateGASCode()
  .then(() => {
    console.log('✨ スクリプト完了');
    process.exit(0);
  })
  .catch(error => {
    console.error('致命的エラー:', error);
    process.exit(1);
  });
