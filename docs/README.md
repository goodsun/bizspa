# BizenDAO Frontend Documentation

## 概要

BizenDAO Frontendは、備前焼NFTマーケットプレイスのフロントエンドアプリケーションです。

## ドキュメント一覧

### 基本ドキュメント
- [プロジェクト概要とアーキテクチャ](./ARCHITECTURE.md) - システム全体の構造と設計思想
- [開発者向けセットアップガイド](./SETUP_GUIDE.md) - 開発環境の構築手順
- [デプロイメントガイド](./DEPLOYMENT.md) - 各環境へのデプロイ方法

### 技術仕様書
- [RPCキャッシュ戦略](./RPC_Cache_Strategy.md) - キャッシュ戦略の設計思想
- [RPCキャッシュ技術仕様](./RPC_Cache_Technical_Spec.md) - キャッシュシステムの実装詳細
- [API/モジュール仕様書](./API_REFERENCE.md) - 各モジュールの詳細仕様
- [コントラクト連携仕様](./CONTRACT_INTEGRATION.md) - スマートコントラクトとの連携方法

### コンポーネント
- [UIコンポーネント一覧](./COMPONENTS.md) - フロントエンドコンポーネントの詳細
- [ルーティング仕様](./ROUTING.md) - SPAのルーティング設計

### 運用
- [トラブルシューティング](./TROUBLESHOOTING.md) - よくある問題と解決方法
- [パフォーマンス最適化](./PERFORMANCE.md) - パフォーマンス向上のための指針

## クイックスタート

1. [開発環境のセットアップ](./SETUP_GUIDE.md)を参照
2. `npm install` で依存関係をインストール
3. `npm run dev` で開発サーバーを起動
4. `http://localhost` でアプリケーションにアクセス

## プロジェクト構造

詳細は[アーキテクチャドキュメント](./ARCHITECTURE.md)を参照してください。

```
frontend/
├── src/           # ソースコード
├── public/        # 静的ファイル
├── deploy/        # デプロイスクリプト
└── docs/          # ドキュメント
```