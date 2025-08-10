# BizenDAO Frontend ルーティング仕様

## 概要

BizenDAO Frontendは、クライアントサイドルーティングを実装したSingle Page Application (SPA)です。URLパスに基づいて適切なコンポーネントを動的に表示します。

## ルーティングアーキテクチャ

### 基本構造

```
┌─────────────────────────────────────────────────────────┐
│                    ブラウザURL                           │
│              (例: /tokens/0x123/1)                      │
└─────────────────────────┬───────────────────────────────┘
                          ▼
                   ┌──────────────┐
                   │  router.ts   │
                   │ (URL解析)    │
                   └──────┬───────┘
                          ▼
                   ┌──────────────┐
                   │   main.ts    │
                   │(ルート判定)  │
                   └──────┬───────┘
                          ▼
                   ┌──────────────┐
                   │ コンポーネント │
                   │   (表示)     │
                   └──────────────┘
```

### router.ts の実装

```typescript
export const router = {
  lang: string,        // 言語設定 (ja/en/idn)
  langSet: string[],   // 対応言語リスト
  fullUrl: string,     // 完全なURL
  path: string,        // パス部分
  host: string,        // ホスト名
  queryString: string, // クエリ文字列
  params: string[],    // パスパラメータ配列
  
  getParams(): string[] {
    // URLパスを"/"で分割してパラメータ配列を返す
    // params[0] は常に空文字列
    // params[1] が第1階層、params[2]が第2階層...
  }
};
```

## ルーティングテーブル

### 基本ルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/` | ホーム画面 | `setHome()` | なし |
| `/article` | 記事表示 | `setArticle()` | なし |
| `/donate` | 寄付ページ | `setDonate()` | params |
| `/meta` | メタビルダー | `metabuilder()` | なし |
| `/regist` | Discord登録 | `discordRegist()` | なし |
| `/editor` | エディタ連携 | `editorLink()` | なし |
| `/disconnect` | 切断 | `disconnect()` | なし |
| `/membersbt` | メンバーSBT | `memberSbt()` | なし |
| `/setting` | 設定画面 | `adminSetting()` | なし |

### コンテンツルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/contents` | コンテンツ一覧 | `setContents()` | なし |
| `/contents/{dir}` | ディレクトリ表示 | `setArticleDir()` | dir |
| `/contents/{dir}/{file}` | 記事表示 | `setArticle()` | dir, file |

### NFT/トークンルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/tokens` | トークン一覧 | `setTokenContracts()` | なし |
| `/tokens/{ca}` | 特定コントラクトのトークン | `setTokens()` | ca |
| `/tokens/{ca}/mint` | ミント画面 | `mintToken()` | ca |
| `/tokens/{ca}/{id}` | トークン詳細 | `setToken()` | ca, id |

### アカウントルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/account` | 自分のアセット | `setAssets()` | なし |
| `/account/{eoa}` | 特定アカウント情報 | `setOwner()` | eoa |

### 管理ルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/admins` | 管理者一覧 | `setAdmins()` | なし |
| `/admins/{mode}` | 管理モード | `setCreator()` | mode |
| `/admins/{mode}/{sub}` | 2階層管理 | `control2Set()` | mode, sub |
| `/admins/{mode}/{sub}/{ca}` | 3階層管理 | `control3Set()` | mode, sub, ca |
| `/admins/{mode}/{sub}/{ca}/{arg}` | 4階層管理 | `control4Set()` | mode, sub, ca, arg |

### その他のルート

| パス | 説明 | 関数 | パラメータ |
|-----|------|------|----------|
| `/creators` | クリエイター一覧 | `setCreators()` | なし |
| `/creators/{eoa}` | クリエイター詳細 | `setCreator()` | eoa |
| `/contract1` | コントラクト一覧（旧） | `setContracts()` | なし |

## パラメータ解析

### URLパラメータの取得方法

```typescript
const params = router.params;
// URLが "/tokens/0x123/456" の場合:
// params[0] = ""        (空文字列)
// params[1] = "tokens"  (第1階層)
// params[2] = "0x123"   (第2階層：コントラクトアドレス)
// params[3] = "456"     (第3階層：トークンID)
```

### クエリパラメータ

```typescript
// URLが "/?lang=en" の場合
const urlParams = new URLSearchParams(router.queryString);
const lang = urlParams.get('lang'); // "en"
```

## 言語設定

### 対応言語
- `ja` - 日本語（デフォルト）
- `en` - 英語
- `idn` - インドネシア語（現在は英語で代用）

### 言語の決定順序
1. URLパラメータ (`?lang=en`)
2. ローカルストレージ
3. ブラウザ言語設定
4. デフォルト（日本語）

```typescript
// 言語設定の例
if (urlParams.has('lang')) {
  router.lang = urlParams.get('lang');
  localStorage.setItem('lang', router.lang);
}
```

## ルーティング実装例

### main.ts の checkRoute関数

```typescript
const checkRoute = () => {
  const params = router.params;
  const param1 = params[1];
  const param2 = params[2];
  const param3 = params[3];
  
  if (param1 == "") {
    setHome();
  } else if (param1 === "tokens" && param2 && param3) {
    setToken();
  } else if (param1 === "tokens" && param2) {
    setTokens();
  } else if (param1 === "tokens") {
    setTokenContracts();
  }
  // ... 他のルート判定
};
```

## Apache設定（.htaccess）

SPAのルーティングを有効にするための設定：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## フィルタリング機能

一部のルートではフィルタ関数を使用：

```typescript
// アセット表示時のフィルタ例
setAssets((filter) => {
  return filter[3] == true; // openフラグがtrueのもののみ
});

// トークンコントラクト表示時のフィルタ
setTokenContracts((filter) => {
  return filter[3] == true; // 公開されているもののみ
});
```

## ナビゲーション実装

### プログラムによるナビゲーション

```typescript
// JavaScriptでのページ遷移
window.location.href = "/tokens";

// 新しいタブで開く
window.open("/tokens/0x123/1", "_blank");
```

### リンク生成

```typescript
// common.tsのlink関数を使用
const tokenLink = cSnip.link("View Token", `/tokens/${ca}/${id}`);
```

## エラーハンドリング

### 不正なルートの処理

現在の実装では、マッチしないルートは無視されます。将来的には404ページの実装を推奨：

```typescript
// 将来の実装例
if (!routeMatched) {
  show404Page();
}
```

### 権限チェック

一部のルートでは権限チェックを実施：

```typescript
// 設定画面へのアクセス時
async function adminSetting() {
  const userType = await setManagerConnect.setManager("checkUser");
  if (userType !== "admin" && userType !== "creator") {
    alert("権限がありません");
    window.location.href = "/";
    return;
  }
  await adminSettings.getUI();
}
```

## パフォーマンス最適化

### 遅延読み込み

将来的な実装として、動的インポートによる遅延読み込みを推奨：

```typescript
// 将来の実装例
if (param1 === "admin") {
  const { adminSettings } = await import('./module/admin/settings');
  await adminSettings.getUI();
}
```

### プリフェッチ

重要なルートのリソースを事前読み込み：

```html
<link rel="prefetch" href="/js/bundle.js">
<link rel="preconnect" href="https://polygon-rpc.com">
```

## デバッグ

### ルーティング情報の確認

```javascript
// ブラウザコンソールで実行
console.log('Current route:', router.path);
console.log('Parameters:', router.params);
console.log('Language:', router.lang);
```

### ルート一覧の取得

```javascript
// 実装されているルートパターンを確認
// main.tsのcheckRoute関数を参照
```

## まとめ

BizenDAO Frontendのルーティングシステムは、シンプルながら柔軟な設計となっています。URLパスを配列に分解し、階層的にルートを判定することで、複雑なルーティングパターンにも対応しています。今後の拡張として、ルートガード、動的インポート、エラーページの実装などが考えられます。