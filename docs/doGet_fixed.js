// ============================================
// 正しい doGet 関数（bundle.gs の 580行目あたりに配置）
// ============================================

function doGet(e) {
    var _a, _b, _c;
    try {
        // Demo parameter check for address lookup
        const demo = (_c = e === null || e === void 0 ? void 0 : e.parameter) === null || _c === void 0 ? void 0 : _c.demo;
        if (demo === 'address') {
            var template = HtmlService.createTemplateFromFile('address_lookup_demo');
            return template.evaluate()
                .setTitle('住所検索デモ - CRM V9')
                .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
        }

        const action = (_a = e === null || e === void 0 ? void 0 : e.parameter) === null || _a === void 0 ? void 0 : _a.action;
        const id = (_b = e === null || e === void 0 ? void 0 : e.parameter) === null || _b === void 0 ? void 0 : _b.id;

        // Serve React App (index.html)
        if (!action) {
            return HtmlService.createTemplateFromFile('index').evaluate()
                .setTitle('CRM V9')
                .addMetaTag('viewport', 'width=device-width, initial-scale=1');
        }

        const customerService = getCustomerService();
        const dealService = getDealService();
        let result = null;

        switch (action) {
            case 'getCustomer':
                if (!id) throw new Error('Missing id parameter');
                result = customerService.getCustomer(id);
                break;
            case 'getDeal':
                if (!id) throw new Error('Missing id parameter');
                result = dealService.getDeal(id);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }
        return createResponse(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return createResponse(null, false, errorMessage);
    }
}

// ============================================
// 注意事項
// ============================================
// 1. このコードで bundle.gs の line 580 あたりの doGet 関数を完全に置き換えてください
// 2. ファイル末尾の「GAS Editor Recognition Bridge」の doGet はそのまま残してください:
//    function doGet(e) { return globalThis.doGet(e); }
// 3. 重要な変更点:
//    - createHtmlOutputFromFile → createTemplateFromFile に変更（両方の分岐で）
//    - try-catch ブロックの構造を正しく保持
//    - すべての } の閉じ括弧が正しく配置されている
