# Director Quick Start: 今すぐデプロイを開始

**所要時間**: 10-15分
**対象**: あなた（Director）
**目的**: 住所検索デモをCRM V9 Systemにデプロイ

---

## 📋 準備（30秒）

### 必要なファイル
✅ `address_lookup_demo.html` - このリポジトリに存在

### 必要なアクセス
✅ [CRM V9 System](https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjlK2qG9FcQ/edit)

---

## 🚀 3ステップでデプロイ

### ステップ1: HTMLファイルを追加（3分）

1. **address_lookup_demo.htmlを開く**
   ```
   C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10\address_lookup_demo.html
   ```

2. **全選択してコピー**
   - Ctrl+A → Ctrl+C

3. **CRM V9 System を開く**
   - https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjlK2qG9FcQ/edit

4. **新規HTMLファイルを作成**
   - メニュー: ファイル → 新規 → HTMLファイル
   - ファイル名: `address_lookup_demo`
   - OK

5. **コードを貼り付けて保存**
   - Ctrl+V → Ctrl+S

---

### ステップ2: doGet関数を更新（2分）

1. **bundle.gs を開く**
   - 左側のファイルリストで `bundle.gs` をクリック

2. **doGet関数を探す**
   - Ctrl+F で `function doGet` を検索

3. **既存のdoGet関数の先頭に追加**

   既存コードの**前**に以下を挿入:
   ```javascript
   function doGet(e) {
     // Demo parameter check for address lookup
     if (e && e.parameter && e.parameter.demo === 'address') {
       return HtmlService.createHtmlOutputFromFile('address_lookup_demo')
         .setTitle('住所検索デモ - CRM V9')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
     }

     // [既存のコードはそのまま]
   ```

4. **保存**
   - Ctrl+S

---

### ステップ3: デプロイ（5分）

1. **デプロイボタンをクリック**
   - 右上の「デプロイ」ボタン

2. **新しいデプロイを選択**

3. **設定**
   - 種類: ウェブアプリ
   - 説明: `Address Lookup Demo - 2025-12-02`
   - 実行: 自分
   - アクセス: 全員

4. **デプロイをクリック**

5. **URLをコピー**
   - 表示されたウェブアプリURLをコピー

---

## ✅ テスト（5分）

### デモページにアクセス

コピーしたURLに `?demo=address` を追加してブラウザで開く:

```
[あなたのデプロイURL]?demo=address
```

例:
```
https://script.google.com/macros/s/AKfycbwzB18LAYAHR2RShwd_DlL0HQAGjz6W-HHPbS76Uwvm6IUk2RENCCuC1j9-toc2Ioa4/exec?demo=address
```

### 動作確認

**テスト1: 郵便番号→住所**
- 入力: `100-0005`
- 期待結果: 東京都千代田区丸の内

**テスト2: 住所→郵便番号**
- 都道府県: `東京都`
- 市区町村: `千代田区`
- 町域: `丸の内1-9-1`
- 期待結果: 100-6701

**テスト3: エラー**
- 入力: `123` (不正な郵便番号)
- 期待結果: 赤色のエラーメッセージ

---

## 📝 完了報告

すべて成功したら、Plannerに報告:

```
✅ デプロイ完了
- デプロイURL: [URL]
- デモURL: [URL]?demo=address
- テスト結果: すべて成功
```

問題が発生した場合:
- エラーメッセージをコピー
- スクリーンショットを撮影
- Plannerに報告

---

## 🆘 トラブルシューティング

### エラー: "スクリプト関数が見つかりません"
→ `AddressLookup.gs` が存在することを確認

### エラー: "REQUEST_DENIED"
→ Google Maps Geocoding APIが有効化されているか確認

### ページが表示されない
→ ブラウザのコンソール (F12) を開いてエラーを確認

---

**次のステップ**: 成功したらAuditor (ChatGPT) にレビューを依頼
