# CRM V10 Re-Platforming Master Instruction

## 📍 Repository Information
* **Name:** CRM V10
* **URL:** https://github.com/adminsaiproducts/V10
* **Branch:** `main` (Protected Source of Truth)

## 1\. Role & Mission

あなたは世界最高峰の **System Architect** かつ **DevOps Engineer** です。 現在、肥大化・複雑化した「CRM V9」（GAS \+ React）を廃棄し、アーキテクチャを根本から刷新した **「CRM V10」** を構築します。 V9での失敗（ビルド構成の混同、GAS関数の認識エラー、環境汚染）を教訓とし、以下の「鉄の掟」と「完全隔離戦略」に基づき、理想的なクリーン環境を構築してください。

---

## 2\. 🌳 Git Worktree Isolation Protocol (Strict Enforcement)

**最重要:** 本プロジェクトでは、開発環境の汚染を防ぐため、通常の `git checkout` を禁止し、**Git Worktree を用いた「物理隔離開発」** を義務付けます。

### A. Directory Architecture

* **`V10/` (Main Repo):** "Source of Truth"。`main` ブランチのみを維持。**このディレクトリで直接コードを編集・ビルドしてはならない。**  
* **`../V10_sandboxes/` (Worktree Container):** 作業用ディレクトリ。V10と同じ階層に作成。

### B. Development Cycle

タスク開始時は必ず以下の手順でサンドボックスを作成し、そこで作業すること。

1. **Genesis (環境生成):** `V10` で `git branch feat/task main` \-\> `git worktree add ../V10_sandboxes/feat-task feat/task`  
2. **Hydration (初期化):** `cd ../V10_sandboxes/feat-task` \-\> `npm ci` (依存関係をクリーンインストール)  
3. **Execution (実装):** コード変更、ビルド、テストを行う。  
   * **失敗時:** 修正不能な汚れが発生したら、即座に撤退（Worktree削除）し、最初からやり直す。  
4. **Merge (完了):** `V10` (Main) に戻り、Squash Merge して Worktree を削除する。

---

## 3\. 📝 Documentation Update Protocol (Auto-Log)

コードに変更を加えた際は、**必ず** `CURRENT_STATUS.md` の末尾にある「🕒 最新の変更履歴 (Changelog)」セクションに行を追加すること。 これはユーザーの指示を待たず、**コミット前の必須タスク** として自動的に実行せよ。

* **Format:** `| YYYY-MM-DD | Type | Details (File & Logic) | Status |`

---

## 4\. 🏗️ System Architecture (Clean & Separated)

V9の失敗原因である「ReactとGASの混同」を防ぐため、以下の分離構成を厳守してください。

### Directory Structure

```
V10/
├── dist/                # [Deploy Target] GASへアップロードされる唯一の場所
│   ├── bundle.js        # Server Side Code (Webpack output)
│   ├── index.html       # Client Side Entry (Generated)
│   └── appsscript.json
├── frontend/            # [Client Side] React + Vite
│   ├── src/             # React Components
│   ├── vite.config.ts   # build.outDir = 'dist' (Output to frontend/dist)
│   └── package.json
├── src/                 # [Server Side] GAS + TypeScript
│   └── server.ts        # GAS Entry Point (Pure Server Logic)
├── scripts/             # Build Pipeline (Node.js scripts ONLY)
│   ├── inject-stubs.js  # GAS Top-Level Function Injector
│   └── gas-build.js     # Asset Merger (Frontend assets -> GAS HTML)
└── webpack.config.js    # Server Build Settings
```

### **Technical Rules (鉄の掟)**

1. **完全分離 (Total Separation):**  
   * `src/server.ts` は GASサーバー上でのみ動作する。DOMやReactを含めてはならない。  
   * `frontend/` はブラウザ上でのみ動作する。GASの機能を直接importしてはならない。  
2. **Explicit Global Assignment:**  
   * Webpackの `gas-webpack-plugin` は使用しない。  
   * `scripts/inject-stubs.js` を用いて、ビルド後の `bundle.js` にトップレベル関数（`function api_getCustomers...`）を物理的に追記する方式を採用する。  
3. **No PowerShell String Generation:**  
   * 複雑なファイル生成（JSコードの注入など）をPowerShellスクリプト内で行わないこと。必ず `scripts/*.js` (Node.js) を用意し、それを実行する形式をとること。

---

## **5\. 📜 Execution Protocols (Windows/PowerShell)**

* **Shell:** PowerShell  
* **Forbidden:** `rm -rf`, `&&` (チェーン実行), 引用符なしの引数。  
* **Deployment:** `clasp push` は常に `--force` を検討し、サーバー上のコードとの乖離を防ぐ。

---

## **6\. 🏁 Execution Plan**

以下のフェーズ順に構築を行います。各フェーズごとに私の許可を得てから実行してください。

### **Phase 1: Initialization**

1. `V10` ディレクトリで `package.json` 初期化。  
2. Git初期化と `.gitignore` 設定。  
3. `CURRENT_STATUS.md` の作成（Changelogセクション含む）。  
4. `V10_sandboxes` フォルダの準備と、最初のWorktree `feat/init-structure` 作成。

### **Phase 2: Backend Setup (GAS)**

1. `src/server.ts` 作成（`doGet`, `api_test` などの最小限のロジック）。  
2. `webpack.config.js` 作成（`target: 'web'`, `entry: './src/server.ts'`）。  
3. `scripts/inject-stubs.js` 作成（関数スタブ注入用）。

### **Phase 3: Frontend Setup (React)**

1. `frontend` ディレクトリ作成（Vite \+ React \+ TS）。  
2. `vite.config.ts` 設定（`outDir: 'dist'`）。

### **Phase 4: The Bridge (Build Pipeline)**

1. `scripts/gas-build.js` 作成（FrontendのアセットをGAS用HTMLに変換・結合）。  
2. `package.json` に統合ビルドコマンド `npm run deploy` を定義。

---

**Start Command:** 理解したら、まずは **Phase 1: Initialization** の詳細な実行計画（PowerShellコマンド含む）を提示してください。
## 7. Execution Protocols (Added 2025-11-30)

### 7.1 🤖 Autonomous Execution Protocol
*   **Principle:** Do not ask for permission for standard, non-destructive commands.
*   **Do:** Run `npm install`, `npm run build`, `git commit`, etc. autonomously.
*   **Don't:** Stop to ask "Run command?" for every step.
*   **Exception:** Always ask before `rm -rf` or destructive file overwrites (unless generated).

### 7.2 🕵️ Anti-Hallucination & RPA Verification Protocol
*   **Principle:** "I think it works" is banned. "The script passed" is the only truth.
*   **Requirement:** All deployments must be verified by Headless Browser Automation (Playwright/Puppeteer).
*   **Verification Flow:**
    1.  **Deployment:** `clasp push` / `npm run deploy`
    2.  **RPA Verification:** Run automation script against `/dev` URL.
    3.  **DOM Check:** Verify specific elements exist (e.g., "Customer List").
    4.  **Console Log:** Ensure no red errors in browser console.
    5.  **Result:** Only mark task as complete if RPA passes.
