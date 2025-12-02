# Google Maps API Key セットアップガイド

## 📋 概要

住所から郵便番号を検索する逆引き機能を使用するには、Google Maps Geocoding API が必要です。
このガイドでは、API Key の取得から GAS への設定まで、すべての手順を説明します。

---

## 🔑 Step 1: Google Cloud Console で API Key を取得

### 1-1. Google Cloud Console にアクセス

1. ブラウザで以下のURLを開きます:
   ```
   https://console.cloud.google.com/
   ```

2. Google アカウントでログインします（GAS で使用しているアカウント）

### 1-2. プロジェクトを選択

1. 画面上部のプロジェクト選択ドロップダウンをクリック
2. 既存のプロジェクト `crm-appsheet-v7` を選択
   - プロジェクトが存在しない場合は、「新しいプロジェクト」を作成

### 1-3. Geocoding API を有効化

1. 左側メニューから「APIとサービス」→「ライブラリ」をクリック
2. 検索バーに「Geocoding API」と入力
3. 「Geocoding API」をクリック
4. 「有効にする」ボタンをクリック

**または、直接アクセス:**
```
https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
```

### 1-4. API Key を作成

1. 左側メニューから「APIとサービス」→「認証情報」をクリック
2. 画面上部の「+ 認証情報を作成」ボタンをクリック
3. 「APIキー」を選択
4. 生成されたAPIキーをコピーして保存（重要！）

**セキュリティのための制限（推奨）:**
1. 生成されたAPIキーの右側にある「編集」アイコンをクリック
2. 「アプリケーションの制限」セクション:
   - 「HTTPリファラー」を選択
   - 許可するリファラーに GAS の実行URLを追加:
     ```
     https://script.google.com/*
     https://script.googleusercontent.com/*
     ```
3. 「APIの制限」セクション:
   - 「キーを制限」を選択
   - 「Geocoding API」のみを有効化
4. 「保存」をクリック

---

## ⚙️ Step 2: GAS Script Properties に API Key を設定

### 方法1: GAS Editor から設定（推奨）

#### 2-1. GAS Editor を開く

PowerShell で以下を実行:
```powershell
cd "C:\Users\satos\OneDrive\○大西\〇新CRMプロジェクト\Githubとの連携リポジトリ宛先\V10_sandboxes\phase3-frontend"
clasp open
```

または、直接ブラウザで開く:
```
https://script.google.com/home/projects/1uitddYvEeSeAI6VL4-akEVgIF6Ms3t7JGAYPfEWHfgXmdYqm9zz-DCNK
```

#### 2-2. Script Properties を開く

1. GAS Editor で、左側メニューの「プロジェクトの設定」（⚙️ 歯車アイコン）をクリック
2. 「スクリプトのプロパティ」セクションまでスクロール
3. 「プロパティを追加」ボタンをクリック

#### 2-3. API Key を追加

1. **プロパティ名**: `GOOGLE_MAPS_API_KEY`
2. **値**: Step 1-4 でコピーしたAPIキーを貼り付け
3. 「スクリプトのプロパティを保存」ボタンをクリック

**設定例:**
```
プロパティ: GOOGLE_MAPS_API_KEY
値: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2-4. 既存のプロパティを確認

以下のプロパティがすでに設定されていることを確認してください:
- `FIRESTORE_PROJECT_ID`
- `FIRESTORE_DATABASE_ID`
- `FIRESTORE_EMAIL`
- `FIRESTORE_KEY`

---

### 方法2: Apps Script API で設定（上級者向け）

GAS の Apps Script API を使用してプログラムで設定することも可能です。

```javascript
// GAS Editor で実行
function setGoogleMapsApiKey() {
  const apiKey = 'YOUR_API_KEY_HERE'; // ここにAPIキーを貼り付け
  PropertiesService.getScriptProperties().setProperty('GOOGLE_MAPS_API_KEY', apiKey);
  Logger.log('API Key has been set successfully');
}
```

**実行手順:**
1. GAS Editor で新しいスクリプトファイルを作成
2. 上記コードを貼り付け
3. `YOUR_API_KEY_HERE` を実際のAPIキーに置き換え
4. 関数 `setGoogleMapsApiKey` を実行
5. ログで "API Key has been set successfully" を確認

---

## ✅ Step 3: 動作確認

### 3-1. Web App で確認

1. デプロイされた Web App にアクセス
2. 顧客作成/編集ページを開く
3. 以下の手順で逆引きをテスト:
   - 郵便番号フィールドを空にする
   - 都道府県フィールドに「東京都」を入力
   - 市区町村フィールドに「千代田区」を入力
   - 「← Lookup Zip Code」ボタンが表示されることを確認
   - ボタンをクリック
   - 郵便番号が自動入力されることを確認

### 3-2. ログで確認

GAS Editor で以下のテスト関数を実行:

```javascript
function testGeocodingAPI() {
  const service = new CustomerService();
  const zipCode = service.getZipCodeByAddress('東京都', '千代田区', '丸の内');

  if (zipCode) {
    Logger.log('✅ Success! Zip Code: ' + zipCode);
  } else {
    Logger.log('❌ Failed to get zip code');
  }
}
```

**実行結果:**
```
✅ Success! Zip Code: 1000005
```

---

## 🚨 トラブルシューティング

### 問題1: API Key が認識されない

**症状:**
- 逆引きボタンをクリックしても郵便番号が取得できない
- アラート: "Failed to lookup zip code. Make sure GOOGLE_MAPS_API_KEY is configured."

**解決策:**
1. Script Properties で `GOOGLE_MAPS_API_KEY` が正しく設定されているか確認
2. APIキーにスペースや改行が含まれていないか確認
3. GAS Editor を再読み込み（Ctrl + Shift + R）
4. Web App を再デプロイ:
   ```powershell
   clasp push -f
   clasp deploy --description "Update with API Key"
   ```

### 問題2: Geocoding API のクォータエラー

**症状:**
- GAS ログに "OVER_QUERY_LIMIT" エラー

**解決策:**
1. Google Cloud Console で現在の使用量を確認:
   ```
   https://console.cloud.google.com/apis/api/geocoding-backend.googleapis.com/quotas
   ```
2. 無料枠: 1日40,000リクエスト
3. 必要に応じて課金を有効化

### 問題3: API Key の制限設定エラー

**症状:**
- "API key not valid" エラー

**解決策:**
1. Google Cloud Console で API Key の制限を確認
2. 「HTTPリファラー」制限が正しく設定されているか確認:
   ```
   https://script.google.com/*
   https://script.googleusercontent.com/*
   ```
3. 「APIの制限」で "Geocoding API" が有効になっているか確認

---

## 💰 料金について

### 無料枠
- **Geocoding API**: 月$200の無料クレジット（約40,000リクエスト）
- **追加料金**: $5 per 1,000 requests（無料枠超過後）

### 使用量の確認
```
https://console.cloud.google.com/apis/dashboard
```

### コスト最適化のヒント
1. **キャッシュの活用**: 同じ住所の検索結果をキャッシュ
2. **入力検証**: 不完全な住所での検索を避ける
3. **アラート設定**: 予算超過を防ぐためのアラートを設定

---

## 📚 参考リンク

- [Geocoding API ドキュメント](https://developers.google.com/maps/documentation/geocoding/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Geocoding API 料金](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
- [Apps Script Script Properties](https://developers.google.com/apps-script/reference/properties/properties-service)

---

## 🎯 次のステップ

API Key の設定が完了したら:
1. Web App で逆引き機能をテスト
2. エラーが発生した場合は、GAS ログを確認: `clasp logs`
3. 問題が解決しない場合は、このドキュメントのトラブルシューティングを参照

---

**作成日:** 2025-12-02
**作成者:** Claude Code
**最終更新:** 2025-12-02
