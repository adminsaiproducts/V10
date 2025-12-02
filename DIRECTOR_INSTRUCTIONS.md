# Director Instructions: Address Lookup Demo Deployment

**作成日**: 2025-12-02
**対象**: Director (RPA または ユーザー)
**作成者**: Planner (Claude Code)

---

## 📋 ミッション

CRM V9 System に住所検索デモページをデプロイし、動作確認を行ってください。

---

## ✅ 前提条件の確認

以下が完了していることを確認:

- [ ] CRM V9 System にログイン可能
- [ ] `AddressLookup.gs` が既に存在する
- [ ] Script Properties に `GOOGLE_MAPS_API_KEY` が設定済み
- [ ] Google Maps Geocoding API が有効化済み

確認方法:
1. [CRM V9 System](https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjlK2qG9FcQ/edit) を開く
2. 左側のファイルリストで `AddressLookup.gs` を確認
3. **プロジェクトの設定** (⚙️) → **スクリプト プロパティ** → `GOOGLE_MAPS_API_KEY` を確認

---

## 📝 タスク 1: HTMLファイルの追加

### ステップ 1.1: ソースファイルを開く

1. ローカルPCで以下のファイルを開く:
   ```
   C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\address_lookup_demo.html
   ```

2. **Ctrl+A** (すべて選択) → **Ctrl+C** (コピー)

### ステップ 1.2: GASエディタで新規ファイル作成

1. CRM V9 System を開く
2. メニュー: **ファイル** → **新規** → **HTMLファイル**
3. ファイル名を入力: `address_lookup_demo`
4. **OK** をクリック

### ステップ 1.3: コードを貼り付け

1. エディタに **Ctrl+V** (貼り付け)
2. **Ctrl+S** (保存) または メニュー: **ファイル** → **保存**

### ステップ 1.4: スクリーンショット取得

**📸 SS1**: ファイルリストに `address_lookup_demo.html` が追加されたことを確認
- 左側のファイルリスト全体をキャプチャ
- ファイル名: `SS1_file_added.png`

---

## 📝 タスク 2: doGet関数の更新 (オプション)

**注意**: この手順は既存の `doGet` 関数を変更します。慎重に行ってください。

### ステップ 2.1: bundle.gs を開く

1. 左側のファイルリストで `bundle.gs` をクリック

### ステップ 2.2: doGet関数を探す

1. **Ctrl+F** で検索窓を開く
2. `function doGet` を検索
3. 既存の `doGet` 関数を確認

### ステップ 2.3: コードを追加

既存の `doGet` 関数の**先頭**に以下のコードを追加:

```javascript
function doGet(e) {
  // Demo parameter check for address lookup
  if (e && e.parameter && e.parameter.demo === 'address') {
    return HtmlService.createHtmlOutputFromFile('address_lookup_demo')
      .setTitle('住所検索デモ - CRM V9')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // [既存のコードはそのまま維持]
  // ...
}
```

**重要**: 既存のコードを削除せず、上記を追加してください。

### ステップ 2.4: 保存

**Ctrl+S** で保存

### ステップ 2.5: スクリーンショット取得

**📸 SS2**: 編集後の `doGet` 関数
- `doGet` 関数全体をキャプチャ
- ファイル名: `SS2_doGet_updated.png`

---

## 📝 タスク 3: デプロイ

### ステップ 3.1: 新しいデプロイを作成

1. 右上の **デプロイ** ボタンをクリック
2. **新しいデプロイ** を選択

### ステップ 3.2: デプロイ設定

1. **種類の選択**: **ウェブアプリ** (歯車アイコン)
2. **説明**: `Address Lookup Demo - 2025-12-02` と入力
3. **次のユーザーとして実行**: **自分** を選択
4. **アクセスできるユーザー**: **全員** を選択
5. **デプロイ** ボタンをクリック

### ステップ 3.3: 承認 (初回のみ)

承認ダイアログが表示された場合:

1. **承認** をクリック
2. Google アカウントを選択
3. **詳細** → **[プロジェクト名] に移動** をクリック
4. **許可** をクリック

### ステップ 3.4: デプロイURLを取得

1. デプロイ完了後、**ウェブアプリ URL** が表示される
2. URLを **コピー** (クリップボードアイコン)
3. メモ帳などにペーストして保存

### ステップ 3.5: スクリーンショット取得

**📸 SS3**: デプロイ完了画面
- デプロイIDとURLが表示された画面をキャプチャ
- ファイル名: `SS3_deploy_complete.png`

---

## 📝 タスク 4: 動作確認

### ステップ 4.1: デモページにアクセス

1. ブラウザで新しいタブを開く
2. コピーしたURLに `?demo=address` を追加:
   ```
   [デプロイURL]?demo=address
   ```
   例:
   ```
   https://script.google.com/macros/s/AKfycbwzB18LAYAHR2RShwd_DlL0HQAGjz6W-HHPbS76Uwvm6IUk2RENCCuC1j9-toc2Ioa4/exec?demo=address
   ```

### ステップ 4.2: ページ表示を確認

期待される表示:
- 紫色のグラデーション背景
- 白いカードに「住所検索デモ」のタイトル
- 2つのセクション:
  1. 郵便番号から住所を検索
  2. 住所から郵便番号を検索

### ステップ 4.3: スクリーンショット取得

**📸 SS4**: デモページ初期表示
- ページ全体をキャプチャ
- ファイル名: `SS4_demo_page_initial.png`

---

## 📝 タスク 5: 機能テスト

### テスト 5.1: 郵便番号 → 住所検索

1. 郵便番号フィールドに `100-0005` を入力
2. **住所を検索** ボタンをクリック
3. 結果が表示されることを確認:
   - 緑色の成功メッセージ
   - 「東京都千代田区丸の内」が表示される

**📸 SS5**: 郵便番号検索結果
- 結果が表示された画面をキャプチャ
- ファイル名: `SS5_zipcode_result.png`

### テスト 5.2: 住所 → 郵便番号検索

1. 以下を入力:
   - 都道府県: `東京都`
   - 市区町村: `千代田区`
   - 町域・番地: `丸の内1-9-1`
2. **郵便番号を検索** ボタンをクリック
3. 結果が表示されることを確認:
   - 緑色の成功メッセージ
   - 「100-6701」が表示される

**📸 SS6**: 住所検索結果
- 結果が表示された画面をキャプチャ
- ファイル名: `SS6_address_result.png`

### テスト 5.3: エラーハンドリング

1. 郵便番号フィールドに `123` (不正な値) を入力
2. **住所を検索** ボタンをクリック
3. エラーメッセージが表示されることを確認:
   - 赤色のエラーメッセージ
   - 「Address not found or invalid zip code」

**📸 SS7**: エラー表示
- エラーメッセージが表示された画面をキャプチャ
- ファイル名: `SS7_error_handling.png`

---

## 📝 タスク 6: レポート作成

### ステップ 6.1: 結果をまとめる

以下の情報を含むテキストファイルを作成:

```
# Address Lookup Demo Deployment Report

実行日: [YYYY-MM-DD HH:MM]
実行者: [あなたの名前]

## デプロイ情報
- デプロイURL: [URLを記載]
- デプロイID: [IDを記載]
- デモURL: [URLを記載]?demo=address

## チェックリスト
- [ ] HTMLファイル追加完了
- [ ] doGet関数更新完了 (またはスキップ)
- [ ] デプロイ完了
- [ ] デモページ表示確認
- [ ] 郵便番号検索テスト成功
- [ ] 住所検索テスト成功
- [ ] エラーハンドリング確認

## 問題・エラー
[発生した問題があれば記載]

## スクリーンショット
- SS1: ファイル追加確認
- SS2: doGet関数更新
- SS3: デプロイ完了
- SS4: デモページ初期表示
- SS5: 郵便番号検索結果
- SS6: 住所検索結果
- SS7: エラーハンドリング

## 次のステップ
Auditor (ChatGPT) にレビューを依頼
```

ファイル名: `deployment_report_[YYYYMMDD].txt`

---

## 📝 タスク 7: Auditorへの引き継ぎ

### ステップ 7.1: レポートとスクリーンショットを送信

ChatGPTに以下を送信:

1. `deployment_report_[YYYYMMDD].txt`
2. すべてのスクリーンショット (SS1〜SS7)
3. 以下のメッセージ:

```
@Auditor (ChatGPT)

Address Lookup Demoのデプロイが完了しました。
レビューをお願いします。

添付ファイル:
- デプロイレポート
- スクリーンショット x 7枚

レビュー観点:
1. デプロイ手順が正しく実行されたか
2. 機能が正常に動作しているか
3. エラーハンドリングが適切か
4. UIの表示に問題がないか
5. 改善すべき点はあるか

AUDITOR_CHECKLIST.md を参照してレビューしてください。
```

---

## 🆘 トラブルシューティング

### エラー: "スクリプト関数が見つかりません"

**原因**: `AddressLookup.gs` が存在しない

**解決策**:
1. `AddressLookup.gs` ファイルを確認
2. 存在しない場合、Plannerに連絡

### エラー: "REQUEST_DENIED"

**原因**: Google Maps API が有効化されていない

**解決策**: `GOOGLE_MAPS_API_SETUP.md` を参照して設定

### ページが表示されない

**原因**: `doGet` 関数の問題

**解決策**:
1. ブラウザのコンソール (F12) を開く
2. エラーメッセージをコピー
3. Plannerに報告

---

## 📞 サポート

問題が発生した場合:

1. **スクリーンショット**を撮影
2. **エラーメッセージ**をコピー
3. **実行した手順**をメモ
4. Planner (Claude Code) に報告

---

## ✅ 完了

すべてのタスクが完了したら:

- [ ] デプロイレポートを作成
- [ ] スクリーンショットを保存
- [ ] Auditorに引き継ぎ

**お疲れ様でした!**
