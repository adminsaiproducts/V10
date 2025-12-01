# Address Lookup Implementation Notes

## Overview

住所検索機能の実装記録と今後の作業手順。

## 完了した作業

### 1. バックエンドAPI実装 ✅

**実装場所**: CRM V9 System - `AddressLookup.gs`

**実装した関数**:

```javascript
// API エンドポイント
function api_getAddressByZipCode(zipCode)
function api_getZipCodeByAddress(prefecture, city, address1)

// サービス関数
function getAddressByZipCode(zipCode)      // Zipcloud API使用
function getZipCodeByAddress(prefecture, city, address1)  // Google Maps API使用
```

**テスト結果**: ✅ All 5 tests passed
- Test 1: 郵便番号→住所 (100-0005 → 東京都千代田区丸の内)
- Test 2: 住所→郵便番号 (東京都千代田区丸の内1-9-1 → 1006701)
- Test 3: 不正な郵便番号のエラーハンドリング
- Test 4: nullパラメータの処理
- Test 5: API Key設定確認

### 2. Google Maps API設定 ✅

**プロジェクト**: CRM AppSheet V7 (`crm-appsheet-v7`)

**有効化したAPI**:
- Geocoding API ✅

**Script Properties** (CRM V9 System):
- `GOOGLE_MAPS_API_KEY`: `AIzaSyAYUikfoE-EUb187g-5ZemY-P4ZfdMQzlw` ✅
- `FIRESTORE_PROJECT_ID`: `crm-appsheet-v7` ✅
- `FIRESTORE_DATABASE_ID`: `crm-database-v9` ✅
- `FIRESTORE_EMAIL`: `crm-v7-automation@crm-appsheet-v7.iam.gserviceaccount.com` ✅
- `FIRESTORE_KEY`: (serviceAccount.json private_key) ✅

### 3. ドキュメント作成 ✅

- `GOOGLE_MAPS_API_SETUP.md` - API設定手順
- `test_address_lookup.gs` - テスト関数
- `ADDRESS_LOOKUP_IMPLEMENTATION.md` - この実装ノート

## 未完了の作業

### 4. フロントエンド実装 ⏳

**選択肢**:

#### オプションA: シンプルな独立型デモページ (推奨)
- 新しいHTMLファイル `address_lookup_demo.html` を作成
- GASの`AddressLookup.gs`を直接呼び出す
- 既存のCRM V9を変更しない
- **所要時間**: 15分
- **リスク**: 低

**実装内容**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>住所検索デモ</title>
</head>
<body>
  <h1>住所検索機能</h1>

  <!-- 郵便番号→住所検索 -->
  <section>
    <h2>郵便番号から住所を検索</h2>
    <input type="text" id="zipcode" placeholder="100-0005">
    <button onclick="lookupAddress()">検索</button>
    <div id="addressResult"></div>
  </section>

  <!-- 住所→郵便番号検索 -->
  <section>
    <h2>住所から郵便番号を検索</h2>
    <input type="text" id="prefecture" placeholder="東京都">
    <input type="text" id="city" placeholder="千代田区">
    <input type="text" id="address1" placeholder="丸の内1-9-1">
    <button onclick="lookupZipCode()">検索</button>
    <div id="zipcodeResult"></div>
  </section>

  <script>
    function lookupAddress() {
      const zipcode = document.getElementById('zipcode').value;
      google.script.run
        .withSuccessHandler(displayAddress)
        .withFailureHandler(displayError)
        .api_getAddressByZipCode(zipcode);
    }

    function lookupZipCode() {
      const prefecture = document.getElementById('prefecture').value;
      const city = document.getElementById('city').value;
      const address1 = document.getElementById('address1').value;
      google.script.run
        .withSuccessHandler(displayZipCode)
        .withFailureHandler(displayError)
        .api_getZipCodeByAddress(prefecture, city, address1);
    }

    // Display functions...
  </script>
</body>
</html>
```

#### オプションB: Phase 3 Frontendに統合
- Reactコンポーネントとして実装
- Material UIを使用
- 顧客作成/編集フォームに統合
- **所要時間**: 30-45分
- **リスク**: 中 (サイズ問題の可能性)

### 5. デプロイとテスト ⏳

- [ ] フロントエンド実装完了後、CRM V9 Systemにデプロイ
- [ ] 実際のユーザーワークフローでテスト
- [ ] エラーハンドリングの確認
- [ ] レスポンス速度の確認

## 技術的な注意事項

### API制限

**Zipcloud API**:
- 制限: なし (無料、無制限)
- レスポンス: JSON
- エラーレート: 低い

**Google Maps Geocoding API**:
- 無料枠: $200/月 (≈40,000リクエスト)
- 超過料金: $5/1,000リクエスト
- レート制限: あり (QPSに注意)

### エラーハンドリング

実装済み:
- 不正な郵便番号 (短すぎる、空)
- APIエラー (タイムアウト、ネットワークエラー)
- 結果が見つからない場合
- Google Maps API Key未設定

### セキュリティ

- ✅ API Keyは Script Properties に保存 (ハードコードしない)
- ✅ API Key制限設定済み (script.google.com のみ)
- ✅ HTTPSのみ使用

## 次回の作業開始時

1. このドキュメントを読む
2. `test_address_lookup.gs` を実行して動作確認
3. オプションA または オプションB を選択
4. フロントエンド実装開始

## 参考リンク

- [Zipcloud API Documentation](https://zipcloud.ibsnet.co.jp/doc/api)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [CRM V9 System (GAS)](https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjlK2qG9FcQ/edit)

## 実装日

- **開始日**: 2025-12-02
- **バックエンド完了**: 2025-12-02
- **API設定完了**: 2025-12-02
- **テスト完了**: 2025-12-02
- **フロントエンド**: 未着手
