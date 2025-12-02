# 🚀 CRM V10 Phase 3 開始指示書
**VS Code Claude Code (Planner) への初回指示**

---

## 📋 あなたの役割

あなたは **CRM V10 プロジェクトの Planner (System Architect 兼 DevOps Engineer)** です。
Phase 3 以降の開発を担当し、**完全自律稼働 (Zero-Touch)** で作業を進めてください。

---

## 📚 必読ドキュメント (最優先)

### 1. HANDOVER_DOCUMENT.md を完全に読み込んでください

**ファイルパス:**
```
C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\HANDOVER_DOCUMENT.md
```

**このドキュメントは「憲法」です。**
- V5 から V10 までの全歴史
- 技術アーキテクチャの詳細
- 認証情報・アカウント情報
- 既知の問題と教訓
- Phase 3 以降の推奨アプローチ
- 重要な開発ルール (鉄の掟)

### 2. PROJECT_MANIFEST.md を読み込んでください

**ファイルパス:**
```
C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\PROJECT_MANIFEST.md
```

**このドキュメントは「開発ルールの詳細」です。**
- AI協業体制 (Squad)
- Git Worktree Isolation Protocol
- Technical Rules (鉄の掟)
- Autonomous Execution Protocol

### 3. CURRENT_STATUS.md を読み込んでください

**ファイルパス:**
```
C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\CURRENT_STATUS.md
```

**このドキュメントは「現在の状態記録」です。**
- 完了したマイルストーン
- 既知の課題
- 最新の変更履歴

---

## 🎯 Phase 3: Frontend Setup の目標

### 実施内容

1. **Material UI の再導入**
   - `@mui/material`, `@emotion/react`, `@emotion/styled` をインストール
   - 既存コンポーネントを Material UI でリファクタリング

2. **React Router の再導入**
   - `react-router-dom` をインストール
   - ページ遷移機能を実装

3. **Frontend ビルドの検証**
   - `npm run build:frontend` の成功確認
   - 統合ビルド (`npm run build`) の成功確認

4. **デプロイと動作確認**
   - `clasp push -f` でデプロイ
   - ブラウザで動作確認 (RPA 検証)

5. **ドキュメント更新**
   - `CURRENT_STATUS.md` の Changelog 更新
   - Git コミット & プッシュ

---

## 🔧 作業開始手順 (ステップ・バイ・ステップ)

### Step 1: ドキュメントの読み込み

```
以下の3つのドキュメントを読み込み、内容を完全に理解してください:
1. HANDOVER_DOCUMENT.md
2. PROJECT_MANIFEST.md
3. CURRENT_STATUS.md

読み込み完了後、「ドキュメントの読み込みが完了しました。Phase 3 の作業を開始します。」と報告してください。
```

### Step 2: Git Worktree の作成

```
Git Worktree Isolation Protocol に従い、Phase 3 用の Worktree を作成してください。

実行するコマンド:
1. cd "C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10"
2. git worktree add ..\V10_sandboxes\phase3-frontend -b feat/phase3-frontend
3. cd ..\V10_sandboxes\phase3-frontend
4. npm ci

注意事項:
- 通常の `git checkout` は禁止です
- 必ず Worktree を使用してください
- コマンドはユーザー確認なしで自動実行してください (Autonomous Execution Protocol)
```

### Step 3: Material UI のインストール

```
Frontend ディレクトリに移動し、Material UI をインストールしてください。

実行するコマンド:
1. cd frontend
2. npm install @mui/material @emotion/react @emotion/styled
3. npm install @mui/icons-material (アイコン用)

注意事項:
- インストール完了後、package.json を確認してください
- エラーが発生した場合は、依存関係の競合を解決してください
```

### Step 4: React Router のインストール

```
React Router をインストールしてください。

実行するコマンド:
1. npm install react-router-dom

注意事項:
- TypeScript の型定義も自動的にインストールされます
```

### Step 5: Frontend ビルドの検証

```
Frontend のビルドが正常に動作することを確認してください。

実行するコマンド:
1. npm run build

注意事項:
- ビルドエラーが発生した場合は、エラーメッセージを確認し、修正してください
- 成功した場合、dist/ ディレクトリが生成されることを確認してください
```

### Step 6: 統合ビルドの実行

```
Backend と Frontend を統合ビルドしてください。

実行するコマンド:
1. cd .. (プロジェクトルートに戻る)
2. npm run build

注意事項:
- scripts/gas-build.js が実行されます
- dist/ ディレクトリに以下のファイルが生成されることを確認してください:
  - bundle.js (Backend)
  - index.html (GAS テンプレート)
  - javascript.html (Frontend JS)
  - stylesheet.html (Frontend CSS)
  - appsscript.json
```

### Step 7: デプロイ

```
GAS プロジェクトにデプロイしてください。

実行するコマンド:
1. clasp push -f
2. clasp deploy --description "Phase 3: Frontend Setup - Material UI & React Router"

### 絶対に守るべきルール (鉄の掟)

1. **Git Worktree Isolation Protocol**
   - ❌ `git checkout` は禁止
   - ✅ `git worktree add` を使用

2. **Autonomous Execution Protocol**
   - 以下のコマンドはユーザー確認なしで実行:
     - `npm install`, `npm ci`
     - `npm run build`
     - `git add`, `git commit`, `git push`
     - `clasp push`, `clasp deploy`
   - 破壊的操作のみ確認を求める

3. **TypeScript 設定の厳守**
   - `tsconfig.json`: `"module": "None"` (Backend)
   - `webpack.config.js`: `library` 設定なし (IIFE)

4. **3-File Pattern の維持**
   - `index.html` + `javascript.html` + `stylesheet.html`
   - 単一 HTML ファイルは禁止 (GAS サイズ制限)

5. **Documentation Protocol**
   - コミット前に必ず `CURRENT_STATUS.md` を更新
   - Changelog に変更内容を記載

### トラブルシューティング

**問題が発生した場合:**
1. `HANDOVER_DOCUMENT.md` の「7.3 トラブルシューティングガイド」を参照
2. `clasp logs` でエラーログを確認
3. V9 の構成を参考にする (成功パターン)

---

## 📊 成功の定義

Phase 3 が成功したと判断する基準:

- ✅ Material UI が正常にインストールされている
- ✅ React Router が正常にインストールされている
- ✅ Frontend ビルドがエラーなく完了する
- ✅ 統合ビルドがエラーなく完了する
- ✅ GAS へのデプロイが成功する
- ✅ Web App URL にアクセスして正常に表示される
- ✅ Material UI のスタイルが適用されている
- ✅ `CURRENT_STATUS.md` が更新されている
- ✅ Git コミット & プッシュが完了している

---

## 🎯 作業開始の合図

**以下のメッセージを VS Code Claude Code に送信してください:**

```
# CRM V10 Phase 3 開始

あなたは CRM V10 プロジェクトの Planner (System Architect 兼 DevOps Engineer) です。
Phase 3: Frontend Setup を開始してください。

## 最初のタスク

1. 以下の3つのドキュメントを読み込み、内容を完全に理解してください:
   - HANDOVER_DOCUMENT.md
   - PROJECT_MANIFEST.md
   - CURRENT_STATUS.md

2. 読み込み完了後、Phase 3 の作業を開始してください。

3. 作業手順は PHASE3_STARTUP_INSTRUCTIONS.md に記載されています。

## 重要な注意事項

- Git Worktree Isolation Protocol を厳守してください (git checkout 禁止)
- Autonomous Execution Protocol に従い、標準的なコマンドはユーザー確認なしで実行してください
- HANDOVER_DOCUMENT.md を「憲法」として扱い、全ての判断の基準としてください

作業を開始してください。
```

---

## 📝 補足情報

### VS Code での作業環境

**推奨設定:**
- **ワークスペース:** `V10` ディレクトリを開く
- **ターミナル:** PowerShell を使用
- **拡張機能:** 
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier

### 質問がある場合

**参照順序:**
1. `HANDOVER_DOCUMENT.md` (最優先)
2. `PROJECT_MANIFEST.md` (開発ルール)
3. `CURRENT_STATUS.md` (現在の状態)
4. `deployment_handover_report.md` (過去の失敗記録)

---

**Good luck with Phase 3! 🚀**

---

**作成者:** Antigravity AI (Planner Role)  
**作成日:** 2025-12-01  
**対象:** VS Code Claude Code (Planner として Phase 3 を担当)
