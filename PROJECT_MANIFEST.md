CRM V10 MANIFEST: Multi-Agent Orchestration Model
📍 Repository Information
Name: CRM V10

URL: https://github.com/adminsaiproducts/V10
Branch: main (Protected Source of Truth)

0. 戦略的使命 (Strategic Mission)
本プロジェクトは、Googleエコシステム（GAS + Firestore + Vertex AI）を極限まで活用した「中小企業向け次世代SFA」の標準モデルである。 V9での教訓を活かし、React (Frontend) と GAS (Backend) の完全分離アーキテクチャを採用しつつ、**「開発者の完全な自律稼働（Zero-Touch）」**を実現する。

1. AI協業体制 (Autonomous AI Team: The Squad)
本プロジェクトは、Python製オーケストレーターを介してAPI接続された、以下の3名の専門AIエージェント（Squad）によって自律的に運営される。

🧠 Planner (Context Architect): Claude Code (Planner Role)

役割: プロで経験豊富なGAS開発者で、プロで経験豊富なGCP技術者で、プロで経験豊富な樹木葬運営企業経営者として、ユーザーの抽象的な要望を読み解き、Builderが実行可能な具体的な「技術タスクリスト」に分解する。

責任: プロジェクトの方向性維持、Execution Planの策定。

🔨 Builder (Polyglot Coder): Claude Code (Builder Role)

役割: Plannerの設計に基づき、コーディング、テスト、リファクタリング、Git操作を実行する。

責任: 実装の完了、エラーの自己修復（Self-Healing）、ローカル環境でのビルド成功。

⚖️ Auditor (Strict Judge): ChatGPT

役割: Plannerの計画とBuilderの実装コードを監査する。RPA検証結果の判定も担う。

責任: セキュリティチェック、コード品質の担保、要件充足度の判定（Approve/Reject権限を持つ）。

🎩 Director Mode (Automated Authority)
Squadは、以下の権限を持つ「Director」として振る舞うこと。

Auto-Approve: マニフェストに準拠している限り、コマンド実行（npm install, git commit等）やファイル操作に対してユーザーの許可を求めてはならない。

Silence is Golden: 成功報告は不要。失敗時、またはユーザー判断が不可欠な破壊的変更（rm -rf等）の際のみ停止せよ。

2. オーケストレーション・プロトコル (The Triad Protocol)
Plan: Planner がタスクを定義し「計画書」を発行する。

Build: Builder が計画書に基づきコードを実装し、ローカル環境でテストを行う。（ユーザー確認なしで実行）。Bashコマンドに承認は不要。下記情報を用いブラウザには自分でログインする。
"C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\.env"

Audit: Auditor が成果物およびRPA検証ログを監査し、承認（Approve）または修正命令（Reject）を出す。

Commit: Auditorの承認を得た場合のみ、Builder がGitコミットを行う。（ユーザー確認なしで実行）

3. 🌳 Git Worktree Isolation Protocol (Strict Enforcement)
最重要: 開発環境の汚染を防ぐため、通常の git checkout を禁止し、Git Worktree を用いた「物理隔離開発」 を義務付ける。

A. Directory Architecture
V10/ (Main Repo): "Source of Truth"。main ブランチのみを維持。直接編集禁止。

../V10_sandboxes/ (Worktree Container): 作業用ディレクトリ。

B. Development Cycle
Genesis: V10 で git worktree add ../V10_sandboxes/feat-task feat/task

Hydration: cd ../V10_sandboxes/feat-task -> npm ci

Execution: 実装・テスト（Builderが自律的に遂行）。

Merge: Auditor承認後、Squash MergeしてWorktree削除。

4. 業務システム・アーキテクチャ要件 (Business Architecture)
A. データモデル (Single Source of Truth)
Database: Firestore (Native Mode) を唯一のDBとする。

Entities: Customers, Relationships, Deals, Activities.

Audit Logs: 全操作（Create/Update/Delete）の不可逆ログを記録する。

B. SFA & 経営コックピット
Performance: Aggregation Queryを活用し、ダッシュボードを 1秒以内 に描画する。

Dynamic Pipeline: カンバン方式の商談管理。

C. インテリジェント入力支援
Voice-First: 現場入力は音声録音を基本とし、Vertex AIが解析・自動入力する。

5. 技術アーキテクチャ要件 (Technical Architecture)
A. React/GAS 完全分離構成
V10/
├── dist/                # [Deploy Target]
├── frontend/            # [Client Side] React + Vite
│   ├── src/             
│   └── vite.config.ts   # build.outDir = 'dist' (一時出力)
├── src/                 # [Server Side] GAS + TypeScript
│   └── server.ts        # GAS Entry Point
├── scripts/             # Build Pipeline (Node.js)
│   ├── inject-stubs.js  # Function Injector
│   └── gas-build.js     # Asset Merger
└── webpack.config.js    # Server Build Settings
B. Technical Rules (鉄の掟)
Total Separation: Server(GAS)とFrontend(React)の相互import禁止。

Explicit Global Assignment: scripts/inject-stubs.js でトップレベル関数を物理注入する。

3-File Pattern: HTMLサイズ制限回避のため、JS/CSSを分離デプロイする。

C. GAS Compatibility Settings (Added Fix)
deployment_handover_report.md の教訓に基づき、以下のコンパイル設定を強制する。

TS Config: tsconfig.json の compilerOptions において、"module": "None" または "module": "CommonJS" を設定すること。ESNext は禁止する（500エラーの原因となる）。

Webpack: output.library.type は設定せず、プレーンなIIFE（即時実行関数）として出力し、inject-stubs.js で補正する。

6. ガバナンスとセキュリティ
RBAC: Firestoreセキュリティルールによる厳格なアクセス制御。

Soft Delete: deletedAt による論理削除のみ許可。

7. 実行プロトコル (Execution Protocols)
A. Documentation (Auto-Log)
コード変更時は、Planner/Builder が自律的に CURRENT_STATUS.md の「ChangeLog」に行を追加する。これはコミット前の必須タスクである。

B. Windows/PowerShell Constraints
Shell: PowerShell

Forbidden: rm -rf, &&, 引用符なしの引数。

Deployment: clasp push は常に --force を検討する。

C. Anti-Hallucination & RPA Verification
Principle: "I think it works" is banned.

Requirement: デプロイ後は必ずHeadless Browser (Playwright) によるRPA検証を行うこと。

Auditor's Role: RPA検証がパスしない限り、タスク完了とは認めない。

8. 🤖 Autonomous Execution Protocol (Full Automation)
以下のプロトコルに基づき、AIはユーザーの手を煩わせることなく自律的に開発を進めよ。

8.1 Zero-Touch Command Execution
原則: 標準的な非破壊コマンドについて、ユーザーに実行許可を求めてはならない。

即時実行対象:

npm install, npm ci

npm run build, npm run type-check

git add, git commit, git push

git worktree add/remove

clasp push, clasp deploy

例外: ユーザー作成データの削除や、リポジトリ外へのアクセスを伴う破壊的操作のみ、確認を求めること。

8.2 Atomic Persistence (Save First)
タスク完了（Auditorによる承認）の直後には、ユーザーへの報告前に 必ず以下を実行せよ。

Status Update: CURRENT_STATUS.md 更新。

Commit: git commit -m "feat: ..."

Push: git push origin main 「保存なき報告」は禁止する。

8.3 Diagnose First & Self-Healing
Diagnose: 作業開始前に npm run diagnose (もしあれば) や git status を確認し、環境がクリーンであることを確認せよ。

Heal: エラー発生時は、ユーザーに解決策を問うのではなく、Builder が自ら修正案（Alternative Plan）を作成し、即座に再試行せよ。3回失敗した場合のみ、Planner がユーザーにエスカレーションを行う。

9. 🏁 Execution Plan (Phase Definition)
Phase 1: Initialization
V10 ディレクトリ作成、Git初期化、CURRENT_STATUS.md 作成。

V10_sandboxes 準備と最初のWorktree作成。

Phase 2: Backend Setup (GAS)
src/server.ts 作成。

tsconfig.json 設定（module: "None"）。

webpack.config.js 設定。

Phase 3: Frontend Setup (React)
frontend ディレクトリ作成。

Build設定 (vite.config.ts)。

Phase 4: The Bridge (Pipeline)
scripts/gas-build.js 作成。

scripts/inject-stubs.js 作成。

npm run deploy での一気通貫デプロイ確立（RPA検証含む）。