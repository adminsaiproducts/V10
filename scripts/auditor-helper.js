/**
 * Auditor レビュー依頼ファイル生成スクリプト
 * Claude Code の報告内容を整形し、ChatGPT に渡しやすい形式で保存します。
 */

const fs = require('fs');
const path = require('path');

// 設定
const REVIEW_DIR = path.join(__dirname, '..', 'auditor_reviews');
const TEMPLATE_PATH = path.join(__dirname, '..', 'AUDITOR_REVIEW_TEMPLATE.md');

// レビュー依頼ディレクトリの作成
if (!fs.existsSync(REVIEW_DIR)) {
    fs.mkdirSync(REVIEW_DIR, { recursive: true });
}

/**
 * レビュー依頼ファイルを生成
 * @param {Object} report - Claude Code からの報告内容
 * @param {string} report.taskName - タスク名
 * @param {string} report.implementation - 実施内容
 * @param {string[]} report.changedFiles - 変更ファイル一覧
 * @param {string} report.testResults - テスト結果
 */
function generateReviewRequest(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `review_request_${timestamp}.md`;
    const filepath = path.join(REVIEW_DIR, filename);

    // テンプレート読み込み
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

    // プレースホルダーを置換
    const content = template
        .replace('[タスク名を記入]', report.taskName)
        .replace('[実施内容を記入]', report.implementation)
        .replace('[変更ファイル一覧を記入]', report.changedFiles.join('\n'))
        .replace('[テスト結果を記入]', report.testResults);

    // ファイル保存
    fs.writeFileSync(filepath, content, 'utf-8');

    console.log('✅ Auditor レビュー依頼ファイルを生成しました:');
    console.log(`   ${filepath}`);
    console.log('');
    console.log('📋 次のステップ:');
    console.log('   1. このファイルを開く');
    console.log('   2. 内容をコピー');
    console.log('   3. ChatGPT に貼り付けてレビュー依頼');
    console.log('');

    return filepath;
}

/**
 * レビュー結果を保存
 * @param {string} result - ChatGPT からのレビュー結果
 */
function saveReviewResult(result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `review_result_${timestamp}.md`;
    const filepath = path.join(REVIEW_DIR, filename);

    fs.writeFileSync(filepath, result, 'utf-8');

    console.log('✅ Auditor レビュー結果を保存しました:');
    console.log(`   ${filepath}`);
    console.log('');

    return filepath;
}

// コマンドライン引数から実行モードを判定
const mode = process.argv[2];

if (mode === 'request') {
    // レビュー依頼の生成
    const report = {
        taskName: process.argv[3] || 'Phase 3: Frontend Setup',
        implementation: process.argv[4] || '実施内容を記入してください',
        changedFiles: (process.argv[5] || '').split(',').filter(f => f),
        testResults: process.argv[6] || 'テスト結果を記入してください'
    };

    generateReviewRequest(report);

} else if (mode === 'result') {
    // レビュー結果の保存（標準入力から読み取り）
    let result = '';
    process.stdin.on('data', chunk => {
        result += chunk;
    });
    process.stdin.on('end', () => {
        saveReviewResult(result);
    });

} else {
    console.log('使用方法:');
    console.log('');
    console.log('1. レビュー依頼ファイルの生成:');
    console.log('   node scripts/auditor-helper.js request "タスク名" "実施内容" "file1.ts,file2.ts" "テスト結果"');
    console.log('');
    console.log('2. レビュー結果の保存:');
    console.log('   echo "ChatGPTの結果" | node scripts/auditor-helper.js result');
    console.log('');
}

module.exports = { generateReviewRequest, saveReviewResult };
