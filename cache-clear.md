# キャッシュクリア方法

## ブラウザキャッシュのクリア

### デスクトップブラウザ

#### Chrome / Edge
1. `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows) - ハードリフレッシュ
2. デベロッパーツール開いた状態で、リロードボタンを長押し → 「キャッシュの消去とハード再読み込み」

#### Safari
1. `Cmd + Option + R` - キャッシュを無視してリロード
2. 開発メニュー → 「キャッシュを空にする」

#### Firefox
1. `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows)

### スマートフォンブラウザ

#### iPhone Safari
1. 設定アプリを開く
2. 「Safari」をタップ
3. 下にスクロールして「履歴とWebサイトデータを消去」をタップ
4. 「履歴とデータを消去」を確認

**特定のサイトのみクリア:**
1. 設定 → Safari → 詳細 → Webサイトデータ
2. 該当サイトを左にスワイプして「削除」

#### Android Chrome
1. Chromeアプリを開く
2. 右上の「⋮」メニューをタップ
3. 「履歴」→「閲覧データを削除」
4. 「キャッシュされた画像とファイル」にチェック
5. 期間を選択（「過去1時間」など）
6. 「データを削除」をタップ

**簡易的な方法:**
- URLバーに `chrome://settings/privacy` を入力してアクセス

## 開発時のキャッシュ無効化

### Chrome DevTools
1. F12でDevToolsを開く
2. Network タブ
3. 「Disable cache」にチェック（DevTools開いている間のみ有効）

## ファイルバージョニング

現在、main.bundle.js は以下のようにバージョン付きで読み込まれています：
```html
<script src="/js/main.bundle.js?ver=d4381d1"></script>
```

新しいビルド後は、このバージョン番号を更新することで強制的に新しいファイルを読み込ませることができます。

## 一時的な解決策

URLに以下を追加してアクセス：
```
http://localhost/?nocache=1
```

または開発中は：
```bash
# ローカルサーバーを再起動
npm run local
```