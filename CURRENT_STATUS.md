
| プロパティ名 | 設定値 | 用途 |
| :--- | :--- | :--- |
| `FIRESTORE_PROJECT_ID` | `crm-appsheet-v7` | Firestoreプロジェクト識別 |
| `FIRESTORE_DATABASE_ID` | `crm-database-v9` | Firestoreデータベース識別 |
| `FIRESTORE_EMAIL` | `crm-v7-automation@crm-appsheet-v7.iam.gserviceaccount.com` | サービスアカウント認証 |
| `FIRESTORE_KEY` | `config/serviceAccount.json` の `private_key` 全文 | サービスアカウント秘密鍵 |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyAYUikfoE-EUb187g-5ZemY-P4ZfdMQzlw` | 住所検索 (Geocoding API) |

**注意**: `GOOGLE_MAPS_API_KEY` は CRM V9 System のみに設定されています。Phase 3 Frontend (V10) では未設定です。

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

### Phase 5: Advanced Features (In Progress)
17. **Address Lookup Backend:** 双方向住所検索API実装 (CRM V9 System) ✅
    - **実装日**: 2025-12-02
    - **場所**: CRM V9 System (`AddressLookup.gs`)
    - **API機能**:
      - `api_getAddressByZipCode(zipCode)`: 郵便番号→住所 (Zipcloud API使用、無料)
      - `api_getZipCodeByAddress(prefecture, city, address1)`: 住所→郵便番号 (Google Maps Geocoding API使用)
    - **設定完了**:
      - Google Cloud Platform: Geocoding API有効化済み
      - Script Properties: `GOOGLE_MAPS_API_KEY` 設定済み
      - API Key制限: `script.google.com` のみ許可
    - **テスト結果**: 全5テスト合格
      - ✅ 郵便番号→住所検索 (100-0005 → 東京都千代田区丸の内)
      - ✅ 住所→郵便番号検索 (東京都千代田区丸の内1-9-1 → 1006701)
      - ✅ 不正入力のエラーハンドリング
      - ✅ Nullパラメータ処理
      - ✅ API Key設定確認
    - **ドキュメント**: `GOOGLE_MAPS_API_SETUP.md`, `ADDRESS_LOOKUP_IMPLEMENTATION.md`

18. **Address Lookup Frontend Demo:** デモページ作成 (AI Squad体制) ✅
    - **実装日**: 2025-12-02
    - **ファイル**: `address_lookup_demo.html` (紫色グラデーションUI、モダンデザイン)
    - **Planner (Claude Code) 担当**:
      - ✅ `address_lookup_demo.html` 作成 (双方向検索UI)
      - ✅ `DIRECTOR_INSTRUCTIONS.md` 作成 (デプロイ手順書、7タスク、SS1-SS7)
      - ✅ `AUDITOR_CHECKLIST.md` 作成 (ChatGPT向けレビューチェックリスト)
      - ✅ `ADDRESS_LOOKUP_DEPLOYMENT.md` 作成 (技術ガイド)
      - ✅ Git記録 (branch: `feat/address-lookup`, 3 commits)
    - **Director (Claude Code) 担当**:
      - ✅ CRM V9 System へのHTMLファイル追加 (address_lookup_demo.html)
      - ✅ `doGet` 関数の更新 (デモパラメータ対応、既存コード確認済み)
      - ✅ デプロイとURL取得 (v12, AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV)
      - ✅ UI表示確認 (Playwright検証、SS4スクリーンショット取得)
      - ✅ デプロイレポート作成 (`DEPLOYMENT_REPORT.md`)
      - ✅ Git記録 (commit 1b5505f, 30 files changed, 4577 insertions)
      - ⏳ 機能テスト実行 (郵便番号検索、住所検索、エラーハンドリング) - Auditorレビュー待ち
    - **Auditor (ChatGPT) 担当**:
      - ⏳ Director作業のレビュー実施
      - ⏳ セキュリティ・パフォーマンス・ユーザビリティの検証
      - ⏳ 改善提案の作成
      - ⏳ レビューレポート作成
    - **AI Squad体制**: `PROJECT_MANIFEST.md` Section 1 に基づく役割分担を明確化

## 📝 次のステップ (Phase 5: Advanced Features - Continued)

### 優先タスク
1.  **Address Lookup Demo Deployment:** Director によるデプロイ実行 ✅
    - **実行者**: Director (Claude Code)
    - **デプロイURL**: https://script.google.com/macros/s/AKfycbwTIZxHE1Ekqzq6J76hjsFDO4jUOcbeGITrUFzYC1DSc4k2RAccC5NVb5_wWcrH3eVV/exec?demo=address
    - **成果物**:
      - ✅ デプロイレポート (`DEPLOYMENT_REPORT.md`)
      - ✅ スクリーンショット (SS4 - 初期ページ表示)
      - ✅ Playwright検証スクリプト (`scripts/verify-address-demo.js`)
      - ✅ RPA自動化スクリプト (`scripts/deploy-to-crm-v9.js`)
    - **完了日**: 2025-12-02
    - **次のステップ**: Auditor (ChatGPT) によるレビュー

2.  **Address Lookup Demo Review:** Auditor によるレビュー実行 ⏳
    - **実行者**: Auditor (ChatGPT)
    - **チェックリスト**: `AUDITOR_CHECKLIST.md` を参照
    - **成果物**: レビューレポート + 改善提案
    - **次のステップ**: Phase 3 Frontend への統合検討

3.  **Phase 3 Frontend Integration:** 顧客フォームへの住所検索統合 ⏸️
    - **前提条件**: デモが成功し、Auditor承認済み
    - **実装内容**: 顧客作成/編集フォームに住所検索UIを追加
    - **Material UI化**: デザインを Phase 3 Frontend のスタイルに統一

### 完了した優先タスク
1.  **Pagination:** 50件制限の解除、ページネーション実装 ✅
2.  **Customer Detail View:** 顧客詳細画面の実装 ✅
3.  **Error Handling:** フロントエンドのエラー表示改善 ✅
4.  **CRUD Operations:** 顧客の作成・更新機能 ✅

### 将来的な拡張
- **Address Lookup Integration:** 顧客フォームへの住所検索統合 (Backend完了、Frontend保留)
- **Relationships Display:** 顧客間の関係性表示
- **Deals Integration:** 顧客に紐づく案件表示
- **Performance Optimization:** Virtual Scrolling, Cache最適化
- **Customer Delete:** 顧客削除機能の実装

## 🔧 既知の課題

### Critical Issues (from deployment_handover_report.md)
- **Deployment Error:** Web App URLアクセス時に500エラーが発生し、「Google ドキュメント内でエラーが発生しました」と表示される。
    - **原因:** GAS環境とビルドアーティファクトの適合性問題（特にTS構成とWebpack出力の不整合）。
    - **対策:** `PROJECT_MANIFEST.md` (Sec 5.C) に基づき、V9構成（`module: "None"`, IIFE出力）への完全回帰を実施する。

### Technical Debt
- `clasp push` が "already up to date" を返し続ける問題（手動確認が必要）
- フロントエンドが Material UI を含まない簡易版（Phase 3 で簡略化）

### 改善候補
- Material UI の再導入（デザイン改善）
- React Router の再導入（ページ遷移）
- エラーハンドリングの強化

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
| 2025-12-02 | FEAT | 双方向住所検索API実装 (CRM V9 System) - Backend完了 | ✅ Done |
| 2025-12-02 | FEAT | 住所検索デモUI作成 (`address_lookup_demo.html`) | ✅ Done |
| 2025-12-02 | DOC | AI Squad体制の明確化 (`DIRECTOR_INSTRUCTIONS.md`, `AUDITOR_CHECKLIST.md`) | ✅ Done |
| 2025-12-02 | DEPLOY | 住所検索デモのCRM V9 Systemへのデプロイ完了 (v12, commit 1b5505f) | ✅ Done |
| 2025-12-02 | DOC | デプロイレポート作成 (`DEPLOYMENT_REPORT.md`) + Playwright検証スクリプト | ✅ Done |
| 2025-12-02 | MERGE | Phase 2 (Address Lookup Demo) を mainブランチにマージ完了 | ✅ Done |
| 2025-12-02 | SETUP | Phase 3 Frontend Setup 開始 - Git Worktree作成、依存関係同期 | ✅ Done |
| 2025-12-02 | FEAT | Material UI & React Router インストール完了 (frontend: 46 packages added) | ✅ Done |
| 2025-12-02 | BUILD | Frontend ビルド検証完了 (Vite: 1.20s, Bundle: 462.69 KB) | ✅ Done |
| 2025-12-02 | BUILD | 統合ビルド検証完了 (Backend 18.8 KiB, 10 API functions bridged) | ✅ Done |