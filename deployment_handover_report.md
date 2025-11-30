# CRM V10 デプロイメント・トラブルシューティング引き継ぎ書

**作成日時:** 2025-11-30 14:08 (JST)
**作成者:** Antigravity (AI Assistant)

## 1. 現状の概要
CRM V10（新規GASプロジェクト）へのデプロイにおいて、Webアプリケーションとしてのアクセス時に **500 Internal Server Error** および **「Google ドキュメント内でエラーが発生しました」** というエラーが継続して発生しています。
最小構成（Hello World）のデプロイでも同様のエラーが発生しており、アプリケーションコード以前の、GAS環境とビルドアーティファクトの適合性に根本的な問題があると考えられます。

## 2. 環境詳細
*   **OS:** Windows
*   **開発環境:**
    *   Node.js / npm
    *   PowerShell
    *   Git Worktreeによるプロジェクト分離 (`V9` ディレクトリと `V10` ディレクトリ)
*   **ビルドツール:**
    *   Backend: Webpack 5
    *   Frontend: Vite (React)
    *   Deployment: Clasp (Google Apps Script CLI)
*   **GAS環境:**
    *   Runtime: V8
    *   Project Type: Standalone Script (Web App)
    *   Deployment ID: `@13` (最新)

## 3. 直面している問題
*   **症状:** Web App URLにアクセスすると、GASの標準エラーページ（「Google ドキュメント内でエラーが発生しました」）が表示される。
*   **エラーコード:** 500 Internal Server Error (ブラウザコンソールおよびネットワークタブで確認)
*   **発生箇所:** `doGet` 関数の実行時。
*   **特記事項:**
    *   `clasp push` および `clasp deploy` は正常に完了している。
    *   `dist/bundle.js` は生成されており、空ではない（約1KB）。
    *   `appsscript.json` の設定（`webapp` アクセス権限など）は正しい。

## 4. 実施した対策と結果（時系列）

| 試行 | 対策内容 | 結果 | 考察 |
| :--- | :--- | :--- | :--- |
| **初期** | `HtmlService.createTemplateFromFile` を使用 | 500 Error | テンプレート評価時のエラーを疑った。 |
| **修正1** | `createHtmlOutputFromFile` に変更 | 500 Error | テンプレートエンジンを回避したが解決せず。 |
| **修正2** | `DOMContentLoaded` イベントリスナー追加 | 500 Error | JS実行タイミングの問題を疑ったが解決せず。 |
| **修正3** | **Minimal Test** (Hello World) | 500 Error | アプリコードの問題ではなく、GAS実行環境の問題と判明。 |
| **修正4** | `add-bridge.js` (V9パターン) 導入 | 500 Error | GASが `doGet` を認識していない可能性を考慮したが解決せず。 |
| **修正5** | `gas-webpack-plugin` 導入 | 500 Error | Webpackのモジュール化によるスコープ問題を疑ったが解決せず。 |
| **修正6** | `gas-webpack-plugin` + `add-bridge.js` | 500 Error | V9と同じ構成を試みたが解決せず。 |
| **修正7** | 手動 `globalThis` 割り当て + 手動ブリッジ | 500 Error | プラグインの不具合を疑い、完全手動制御を試みたが解決せず。 |

## 5. V9プロジェクトとの比較分析
現在稼働中の **CRM V9** と、開発中の **CRM V10** の構成比較です。

| 項目 | CRM V9 (稼働中) | CRM V10 (エラー) | 備考 |
| :--- | :--- | :--- | :--- |
| **Entry Point** | `src/main.ts` | `src/server.ts` | ファイル名の違いが影響？ |
| **Webpack Plugin** | `gas-webpack-plugin` あり | あり/なし (両方試行) | V9はプラグインを使用。 |
| **Bridge Script** | `scripts/add-bridge.js` あり | あり/なし (両方試行) | V9はプラグインと併用。 |
| **TypeScript Config** | `"module": "None"` | `"module": "ESNext"` | **最大の相違点**。 |
| **Global Assign** | なし (プラグイン任せ) | 手動/なし (両方試行) | |
| **GAS Project** | 既存プロジェクト | **新規作成プロジェクト** | プロジェクト自体の破損の可能性。 |

## 6. 次のステップ（推奨）
「V9完全模倣作戦」を実行することを強く推奨します。

1.  **ファイル構成の統一:** `src/server.ts` を `src/main.ts` にリネーム。
2.  **設定の統一:** `tsconfig.json` を V9 と同じ `"module": "None"` に変更（これがWebpackの出力に大きく影響している可能性大）。
3.  **ビルドパイプラインの統一:** V9の `webpack.config.js` と `scripts/add-bridge.js` をそのまま使用。

もしこれでも解決しない場合、**新規作成したGASプロジェクト自体が破損している**可能性が高いため、以下の手順を検討してください。
*   別の新規GASプロジェクトを作成し直す。
*   （リスク許容可能であれば）V9プロジェクトの別バージョンとしてデプロイを試す。

## 7. 関連ファイル
*   `V10/.worktrees/feat/phase1-init/src/server.ts` (現在のエントリーポイント)
*   `V10/.worktrees/feat/phase1-init/webpack.config.js`
*   `V10/.worktrees/feat/phase1-init/scripts/build.js`
*   `V10/.worktrees/feat/phase1-init/dist/bundle.js` (生成物)
