# Address Lookup Demo - Deployment Guide

## 概要

`address_lookup_demo.html`をCRM V9 Systemにデプロイして、住所検索機能をテストする手順です。

## デプロイ手順

### ステップ1: CRM V9 Systemを開く

1. [CRM V9 System GAS Editor](https://script.google.com/home/projects/1m6iWE31As4iAwAcRTVVK51zCucN8V0qxPYw1WtmPD0uLzGjlK2qG9FcQ/edit) を開く
2. 既存のファイル構成を確認:
   - `bundle.gs` - バックエンドロジック
   - `AddressLookup.gs` - 住所検索API ✅
   - `index.html`, `javascript.html`, `stylesheet.html` - 既存のUI

### ステップ2: 新しいHTMLファイルを追加

1. GASエディタで: **ファイル** → **新規** → **HTMLファイル**
2. ファイル名: `address_lookup_demo`
3. `address_lookup_demo.html`の内容を全てコピー&ペースト
4. **Ctrl+S** (または **Cmd+S**) で保存

### ステップ3: サービング関数を追加

`bundle.gs`に以下の関数を追加:

```javascript
/**
 * Serve address lookup demo page
 */
function doGet(e) {
  // Check if demo parameter is present
  if (e && e.parameter && e.parameter.demo === 'address') {
    return HtmlService.createHtmlOutputFromFile('address_lookup_demo')
      .setTitle('住所検索デモ - CRM V9')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Default: serve main app
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('CRM V10')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

**注意**: 既存の`doGet`関数がある場合は、上記のデモチェックを追加してください。

### ステップ4: デプロイ

1. **デプロイ** → **新しいデプロイ**
2. **種類の選択**: ウェブアプリ
3. **説明**: "Address Lookup Demo Added"
4. **次のユーザーとして実行**: 自分
5. **アクセスできるユーザー**: 全員
6. **デプロイ** をクリック
7. **承認** → Google アカウントでログイン → **許可**
8. デプロイURLをコピー

### ステップ5: デモページにアクセス

デプロイURLに `?demo=address` パラメータを追加:

```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?demo=address
```

例:
```
https://script.google.com/a/macros/saiproducts.co.jp/s/AKfycbwzB18LAYAHR2RShwd_DlL0HQAGjz6W-HHPbS76Uwvm6IUk2RENCCuC1j9-toc2Ioa4/exec?demo=address
```

## 使用方法

### 郵便番号→住所検索

1. 郵便番号を入力 (例: `100-0005`)
2. **住所を検索** ボタンをクリック
3. 結果が表示されます

**テスト用郵便番号**:
- `100-0005` - 東京都千代田区丸の内
- `060-0000` - 北海道札幌市中央区 (複数結果)
- `541-0041` - 大阪府大阪市中央区

### 住所→郵便番号検索

1. 都道府県を入力 (例: `東京都`)
2. 市区町村を入力 (例: `千代田区`)
3. 町域・番地を入力 (例: `丸の内1-9-1`) - オプション
4. **郵便番号を検索** ボタンをクリック
5. 結果が表示されます

**テスト用住所**:
- 東京都 + 千代田区 + 丸の内1-9-1 → 100-6701
- 大阪府 + 大阪市中央区 + 道修町1-1-1 → 541-0045
- 北海道 + 札幌市中央区 + 北1条西2丁目 → 060-0001

## トラブルシューティング

### エラー: "スクリプト関数が見つかりません"

**原因**: `api_getAddressByZipCode` または `api_getZipCodeByAddress` が見つからない

**解決策**:
1. `AddressLookup.gs` が存在することを確認
2. 関数名のスペルミスを確認
3. デプロイを再実行

### エラー: "REQUEST_DENIED"

**原因**: Google Maps Geocoding API が有効化されていない

**解決策**: `GOOGLE_MAPS_API_SETUP.md` を参照してAPIを有効化

### エラー: "GOOGLE_MAPS_API_KEY is not configured"

**原因**: Script Properties に API Key が設定されていない

**解決策**:
1. **プロジェクトの設定** (⚙️) を開く
2. **スクリプト プロパティ** セクション
3. `GOOGLE_MAPS_API_KEY` を追加

### 結果が表示されない

**原因**: ブラウザの JavaScript エラー

**解決策**:
1. ブラウザのコンソール (F12) を開く
2. エラーメッセージを確認
3. ページをリロード

## 代替方法: スタンドアロンデプロイ

`doGet`を変更したくない場合、スタンドアロンHTMLとしてデプロイ:

```javascript
// 新しいファイル: serveAddressLookupDemo.gs
function doGet() {
  return HtmlService.createHtmlOutputFromFile('address_lookup_demo')
    .setTitle('住所検索デモ - CRM V9')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

この場合、別のGASプロジェクトとして作成し、`AddressLookup.gs`の関数をコピーする必要があります。

## 次のステップ

デモページが正常に動作したら:

1. **Phase 3 Frontend統合**: 顧客作成/編集フォームに住所検索UIを追加
2. **Material UI化**: デザインを Phase 3 Frontend のスタイルに統一
3. **自動入力**: 検索結果を直接フォームフィールドに入力

## 関連ファイル

- `address_lookup_demo.html` - デモページHTML
- `AddressLookup.gs` - バックエンドAPI
- `GOOGLE_MAPS_API_SETUP.md` - API設定ガイド
- `test_address_lookup.gs` - テスト関数

## 実装日

- **作成日**: 2025-12-02
- **作成者**: Claude Code
- **ステータス**: デプロイ待ち
