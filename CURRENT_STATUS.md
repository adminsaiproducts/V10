
| プロパティ名 | 設定値 |
| :--- | :--- |
| `FIRESTORE_PROJECT_ID` | `crm-appsheet-v7` |
| `FIRESTORE_DATABASE_ID` | `crm-database-v9` |
| `FIRESTORE_EMAIL` | `crm-v7-automation@crm-appsheet-v7.iam.gserviceaccount.com` |
| `FIRESTORE_KEY` | `config/serviceAccount.json` の `private_key` 全文 |

## 🏗️ ビルドシステム構成 (3-File Pattern)

**採用戦略:** Separated Assets Pattern (GAS Size Limitation対応)

### 技術スタック
- **Frontend Build:** Vite + React + TypeScript
- **Backend Build:** Webpack + gas-webpack-plugin
- **GAS Template:** 3-File Pattern (`index.html` + `javascript.html` + `stylesheet.html`)

### ファイル構成
```
dist/
├── index.html          (305 B)   - GAS template with <?!= include() ?> tags
├── javascript.html     (196 KB)  - All JS wrapped in <script> tags
├── stylesheet.html     (959 B)   - All CSS wrapped in <style> tags
├── bundle.js          (18.8 KB) - Backend GAS code (with CustomerService)
└── appsscript.json    (240 B)   - GAS manifest
```

### 技術的知見
- **Vite + SingleFile 戦略の制約:** GAS `HtmlService` には HTML サイズ制限（推定 < 500 KB）が存在し、1MB超の単一HTMLファイルはデプロイ時にクラッシュする。
- **採用理由:** `PROJECT_MANIFEST.md` Section 5.B の例外条項に基づき、3ファイルパターンを採用。
- **実装詳細:** `scripts/gas-build.js` でViteビルド後のJS/CSSを `<script>`/`<style>` タグでラップし、`include()` 関数で動的結合。
- **Global Scope Exposure:** Webpack バンドル内の関数を `globalThis` に明示的に代入し、GAS ランタイムが認識できるようにする。

## 🏁 完了したマイルストーン

### Phase 1: Database Setup ✅
1.  **Firestore データベース作成:** `crm-database-v9` (Tokyo)
2.  **データ移行 (ETL):** 10,852件 (検証完了)
3.  **機能実装:** AuditLog, REST API Endpoint
4.  **パフォーマンス:** 58ms/request (High Speed)

### Phase 2: Infrastructure Setup ✅
5.  **Technical Debt:** Removed `any` types (Strict TypeScript Compliance)
6.  **Infrastructure:** Added `AICacheService` & `scripts/setup.ts` (Zero-Touch)
7.  **Build System:** Vite + Webpack ハイブリッド構成
8.  **Frontend Foundation:** Vite + React + TypeScript
9.  **3-File Pattern Migration:** GAS制限回避のため Separated Assets 戦略を実装
10. **Deployment Pipeline:** `npm run build` → `clasp push -f` → `clasp deploy` 自動化

### Phase 3: Real Data Connection ✅
11. **Code Consolidation:** `globalThis` 露出コードの永続化（v113）
12. **Firestore Integration:** `CustomerService` を使用した実データ取得（v116）
13. **Type Mapping:** Customer型の正しいマッピング（`nameKana`, 構造化address）
14. **Verification:** ブラウザで実データ表示を確認（10,852件の顧客データ）
15. **Bridge Injection:** `doPost` 実装と `add-bridge.js` による自動注入の完全化（v133）

### Phase 4: Usability Enhancement ✅
16. **Search Functionality:** 顧客検索機能の実装（Backend: `searchCustomers`, Frontend: Search UI）

### Phase 5: Frontend Modernization ✅
17. **Material UI Integration:** Material UI v5 の導入（@mui/material, @emotion/react, @emotion/styled, @mui/icons-material）
18. **React Router Integration:** React Router v6 の導入（react-router-dom）
19. **Build Verification:** Frontend + Backend 統合ビルドの成功確認
20. **Deployment:** GAS プロジェクトへのデプロイ成功（デプロイID: @5）
21. **RPA Infrastructure:** Playwright ベースの自動検証スクリプト作成（scripts/verify-deployment.js）

## 📝 次のステップ (Phase 6: UI Enhancement)

### 優先タスク
1.  **Pagination:** 50件制限の解除、ページネーション実装 ✅
2.  **Customer Detail View:** 顧客詳細画面の実装 ✅
3.  **Error Handling:** フロントエンドのエラー表示改善 ✅

### 将来的な拡張
- **CRUD Operations:** 顧客の作成・更新・削除機能
- **Relationships Display:** 顧客間の関係性表示
- **Deals Integration:** 顧客に紐づく案件表示
- **Performance Optimization:** Virtual Scrolling, Cache最適化

## 🔧 既知の課題

### Critical Issues (from deployment_handover_report.md)
- **Deployment Error:** Web App URLアクセス時に500エラーが発生し、「Google ドキュメント内でエラーが発生しました」と表示される。
    - **原因:** GAS環境とビルドアーティファクトの適合性問題（特にTS構成とWebpack出力の不整合）。
    - **対策:** `PROJECT_MANIFEST.md` (Sec 5.C) に基づき、V9構成（`module: "None"`, IIFE出力）への完全回帰を実施する。

### Technical Debt
- `clasp push` が "already up to date" を返し続ける問題（手動確認が必要）

### 改善候補
- Material UI コンポーネントへの既存UIのリファクタリング
- React Router によるページ遷移の実装
- RPA 検証の自動化（CI/CD パイプライン統合）

## 🕒 最新の変更履歴 (Changelog)
| Date | Type | Details | Status |
| :--- | :--- | :--- | :--- |
| 2025-11-29 | SETUP | `CURRENT_STATUS.md` に変更履歴セクションを追加 | ✅ Done |
| 2025-11-30 | FEAT | `searchCustomers` API と フロントエンド検索UIの実装 | ✅ Done |
| 2025-11-30 | FIX | `PROJECT_MANIFEST.md` に基づくスクリプト名変更 (`add-bridge.js` -> `inject-stubs.js`, `build.js` -> `gas-build.js`) と TS/Webpack設定の修正 | ✅ Done |
| 2025-11-30 | FEAT | 顧客一覧のページネーション実装 (Backend API & Frontend UI) | ✅ Done |
| 2025-11-30 | FEAT | 顧客詳細画面の実装 (Backend API & Frontend UI) | ✅ Done |
| 2025-11-30 | FEAT | エラーハンドリングの強化 (ErrorBanner追加, APIエラー対応) | ✅ Done |
| 2025-11-30 | FIX | `api_getCustomerById` のGASブリッジ欠落修正 (`scripts/inject-stubs.js`) | ✅ Done |
| 2025-11-30 | FEAT | 顧客作成機能の実装 (Backend: `api_createCustomer`, Frontend: `CustomerForm`) | ✅ Done |
| 2025-11-30 | FEAT | 顧客更新機能の実装 (Backend: `api_updateCustomer`, Frontend: Edit UI) | ✅ Done |
| 2025-12-01 | FEAT | 住所自動入力機能 (Zipcode Lookup) と住所フィールドの実装 | ✅ Done |
| 2025-12-02 | FEAT | Phase 5: Frontend Modernization - Material UI & React Router の導入 | ✅ Done |
| 2025-12-02 | INFRA | Playwright ベースの RPA 検証スクリプト作成 (scripts/verify-deployment.js) | ✅ Done |
| 2025-12-02 | DEPLOY | GAS プロジェクトへのデプロイ成功（デプロイID: @5） | ✅ Done |