# UIコンポーネント仕様書

## 概要
`src/module/snipet/`配下のUIコンポーネントは、Bizenフロントエンドの主要なUI要素を構成するTypeScriptモジュール群です。各コンポーネントは特定の画面や機能に対応したDOM要素の生成・管理を行います。

## コンポーネント一覧

### 1. home.ts - ホーム画面コンポーネント

#### 役割と機能
- ホーム画面の主要コンテンツを生成
- 新着アイテムのカルーセル表示
- ギャラリー情報のカルーセル表示
- マークダウンコンテンツの表示

#### 主要メソッド
- `getHome()`: ホーム画面のメインコンテナを生成
- `getHomeContents()`: マークダウンベースのホームコンテンツを取得・表示
- `getItems()`: 新着NFTアイテムをカルーセル形式で表示
- `getGallarys()`: ギャラリー情報をカルーセル形式で表示

#### 依存関係
- `caroucel.ts`: カルーセル表示機能
- `getTokenConnect`: NFTトークン情報の取得
- `utils`: ユーティリティ関数
- `router`: ルーティング情報
- `articleSnipet`: 記事表示機能

#### 生成されるHTML構造の例
```html
<div class="homeContents">
  <div class="caroucelArea">
    <h2>New Arrival</h2>
    <div class="carousel">
      <div class="carousel-container">
        <div class="carousel-item">
          <div class="carousel-item-bg">
            <div class="carousel-item-content">
              <h2>{item.name}</h2>
              <div class="contentDiv">
                <div class="itemImgDiv">
                  <img class="itemImg" src="{nft.image}">
                </div>
                <div class="itemTxtDiv">
                  <p class="carouselProfile">{nft.description}</p>
                  <p><i class="fa-solid fa-money-check-dollar"></i> {price} JPY</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. display.ts - 作品表示コンポーネント

#### 役割と機能
- NFTトークンの一覧表示
- 個別トークンの詳細表示
- 所有トークンの表示
- ミント機能のUI
- クリエイター寄付機能

#### 主要メソッド
- `displayToken()`: 個別トークンの詳細表示
- `displayOwnTokens()`: 所有トークンの一覧表示
- `displayTokens()`: トークンコレクションの表示
- `displayMintUI()`: ミントページのUI生成
- `creatorDonateList()`: クリエイター寄付フォーム
- `displayArticleCard()`: 記事カード表示

#### 依存関係
- `detailDisplay.ts`: 詳細表示機能
- `getTokenConnect`: トークン情報取得
- `getTbaConnect`: TBA(Token Bound Account)関連
- `setToken`: トークン操作
- `donateConnect`: 寄付機能

#### 生成されるHTML構造の例
```html
<div class="tokenUri_{tokenUri}">
  <p class="tokenBreadCrumb">
    <a href="/tokens/">NftCollection</a> | 
    <a href="/tokens/{ca}">{caName}</a> #{id}
    <a class="openseaLink" href="https://opensea.io/assets/matic/{ca}/{id}">
      <i class="opensea"></i>
    </a>
  </p>
  <div class="shopInfoArea">
    <h2 class="shopTitle">{type} info : {name}</h2>
    <div class="shopMainArea">
      <div class="shopThumbSquare">
        <img class="shopThumb" src="{imgUrl}">
      </div>
      <div class="shopDetail">
        <p><i class="fa-solid fa-shop"></i> : {workplace}</p>
        <p><i class="fa-solid fa-location-dot"></i> : {location}</p>
      </div>
    </div>
  </div>
</div>
```

### 3. detailDisplay.ts - 詳細表示コンポーネント

#### 役割と機能
- NFTトークンの詳細情報表示
- 送信・バーン・ミント機能のフォーム
- TBA(Token Bound Account)の登録・管理

#### 主要メソッド
- `showToken()`: トークンメタデータの詳細表示
- `sendForm()`: トークン送信フォーム
- `burnForm()`: トークンバーンフォーム
- `mintForm()`: ミントフォーム
- `tbaRegist()`: TBA登録フォーム
- `tbaSendForm()`: TBA経由の送信フォーム

#### 依存関係
- `utils`: ユーティリティ関数
- `getTbaConnect`: TBA関連機能
- `setToken`: トークン操作
- `common.ts`: 共通UI要素

#### 生成されるHTML構造の例
```html
<div class="articleArea">
  <h1>{metadata.name}</h1>
  <p>{metadata.description}</p>
  <p class="tokenOwnerInfo">
    <span>owner: </span>
    <span>{owner}</span>
    <span class="eoaCopy" data-clipboard-text="{owner}">
      <i class="fa fa-copy fa-fw"></i>
    </span>
  </p>
  <div class="nftImageArea">
    <img class="nftImage" src="{metadata.image}">
  </div>
  <div class="nftExternal">
    <!-- 外部コンテンツ -->
  </div>
</div>
```

### 4. account.ts - アカウント管理コンポーネント

#### 役割と機能
- アカウント情報の表示
- EOA(Externally Owned Account)とTBAの判別表示
- Discord連携アカウントの表示

#### 主要メソッド
- `showAccount()`: アカウント情報の表示

#### 依存関係
- `getTbaConnect`: TBA情報取得
- `getTokenConnect`: トークン情報取得
- `utils`: ユーティリティ関数
- `common.ts`: 共通スニペット

#### 生成されるHTML構造の例
```html
<div class="accountElm">
  <img class="ownerProfPictIcon" src="{icon}">
  <div class="accountInfo">
    <span>EOA : </span>
    <span>{eoa}</span>
    <br>
    <span>Discord :</span>
    <span class="discordNameDisp">{discordName}</span>
  </div>
</div>
```

### 5. common.ts - 共通コンポーネント

#### 役割と機能
- 共通UI要素の生成
- リンク、コピーボタン、アドレス表示などの汎用部品

#### 主要メソッド
- `link()`: リンク要素生成
- `linkCopy()`: コピー機能付きリンク
- `eoa()`: EOAアドレス表示（短縮形）
- `scan()`: Polygonscanへのリンク付きアドレス表示
- `dispTbaOwner()`: TBAオーナー情報表示
- `dispDiscordUser()`: Discordユーザー情報表示
- `labeledElm()`: アイコン付きラベル要素
- `span()`, `bold()`, `thin()`: テキスト装飾要素
- `br()`, `hr()`: 改行・区切り線

#### 依存関係
- `dynamoConnect`: ユーザー情報取得
- `utils`: ユーティリティ関数

#### 生成されるHTML構造の例
```html
<span>
  <a href="{link}">{text}</a>
  <span class="eoaCopy" data-clipboard-text="{eoa}">
    <i class="fa fa-copy fa-fw"></i>
  </span>
</span>
```

### 6. rpcModal.ts - モーダル表示コンポーネント

#### 役割と機能
- ブロックチェーンRPC通信中のモーダル表示
- 通信状態と経過時間の表示
- パラメータの詳細表示

#### 主要メソッド
- `showRPCModal()`: モーダルの表示開始
- `hideRPCModal()`: モーダルの非表示
- `createModal()`: モーダルDOM要素の生成
- `updateModalContent()`: モーダル内容の更新

#### 生成されるHTML構造の例
```html
<div class="rpc-modal-overlay">
  <div class="rpc-modal-content">
    <div class="rpc-modal-header">
      <div class="rpc-spinner"></div>
      <span id="rpc-status-text">ブロックチェーンに問い合わせています 経過時間:1.5秒</span>
    </div>
    <div class="rpc-modal-body">
      <div class="rpc-details">
        <div class="rpc-detail-item">
          <span class="rpc-label">CA:</span>
          <span class="rpc-value">{contractAddress}</span>
        </div>
        <div class="rpc-detail-item">
          <span class="rpc-label">method:</span>
          <span class="rpc-value">{method}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 7. setElement.ts - フォーム要素生成ヘルパー

#### 役割と機能
- フォーム要素の統一的な生成
- 入力フィールド、ボタン、セレクトボックスなどの生成

#### 主要メソッド
- `makeElement()`: 汎用要素生成
- `setChild()`: 子要素の追加
- `makeInput()`: input要素生成
- `makeSelect()`: select要素生成
- `makeFileSelect()`: ファイル選択要素生成
- `makeTextarea()`: textarea要素生成

#### 生成されるHTML構造の例
```html
<input id="{id}" class="BaseInput" type="text" placeholder="{placeholder}" value="{value}">
<select id="{id}" class="BaseInput">
  <option value="">選択してください</option>
</select>
```

### 8. caroucel.ts - カルーセルコンポーネント

#### 役割と機能
- スライド式カルーセルの生成
- タッチスワイプ対応
- 前後ナビゲーション

#### 主要メソッド
- `setCaroucel()`: カルーセルの生成と初期化

#### 生成されるHTML構造の例
```html
<div class="caroucelArea">
  <h2>{title}</h2>
  <div id="carousel" class="carousel">
    <div class="carousel-container">
      <div class="carousel-item">{slideContent}</div>
    </div>
  </div>
  <div class="carousel-control">
    <button class="prev">Prev</button>
    <button class="next">Next</button>
  </div>
</div>
```

### 9. article.ts - 記事表示コンポーネント

#### 役割と機能
- マークダウン記事の取得と表示
- 記事一覧の生成
- ディレクトリ構造の表示

#### 主要メソッド
- `getMdSiteMap()`: サイトマップの生成
- `getMdDir()`: ディレクトリ内記事一覧
- `getMdPath()`: 個別記事の取得
- `parseMdPage()`: マークダウンのパース・表示

#### 依存関係
- `marked`: マークダウンパーサー
- `router`: ルーティング情報
- `display.ts`: 記事カード表示

#### 生成されるHTML構造の例
```html
<div class="contentsDirArea">
  <h2 class="contentParentTitle">Contents</h2>
  <div class="staticDirArea">
    <!-- 静的メニュー -->
  </div>
  <h2 class="contentDirTitle">
    <a href="/contents/{dir}">{dirName}</a>
  </h2>
  <div class="contentChildList">
    <a href="/contents/{dir}/{file}">{title}</a>
  </div>
</div>
```

### 10. manager.ts - 管理機能コンポーネント

#### 役割と機能
- 管理者向け設定機能
- クリエイター・コントラクト管理

#### 主要メソッド
- `control1Set()`: 単一パラメータ設定
- `control2Set()`: 2パラメータ設定
- `control3Set()`: 3パラメータ設定
- `control4Set()`: 4パラメータ設定

#### 依存関係
- `setManager`: 管理機能API

## ルーティングパターン

各コンポーネントは以下のルーティングパターンに対応：

- `/` - ホーム画面（home.ts）
- `/tokens/` - トークン一覧（display.ts）
- `/tokens/{ca}` - コントラクト別一覧（display.ts）
- `/tokens/{ca}/{id}` - トークン詳細（display.ts, detailDisplay.ts）
- `/tokens/{ca}/mint` - ミント画面（display.ts）
- `/account/{eoa}` - アカウント詳細（account.ts）
- `/contents/` - コンテンツ一覧（article.ts）
- `/contents/{dir}/` - ディレクトリ別記事一覧（article.ts）
- `/contents/{dir}/{file}` - 個別記事（article.ts）
- `/creators/{eoa}` - クリエイター詳細（display.ts）
- `/donate` - 寄付画面（display.ts）

## スタイルクラスの使用パターン

### 共通クラス
- `.BaseInput` - 基本入力フィールド
- `.BaseSubmit` - 基本送信ボタン
- `.wfull` - 幅100%
- `.w7p` - 幅70%
- `.w5p` - 幅50%
- `.w3p` - 幅30%

### コンポーネント固有クラス
- `.homeContents` - ホーム画面コンテナ
- `.caroucelArea` - カルーセルエリア
- `.carousel-item` - カルーセルアイテム
- `.nftImageArea` - NFT画像表示エリア
- `.tokenOwnerInfo` - トークン所有者情報
- `.accountElm` - アカウント要素
- `.rpc-modal-overlay` - RPCモーダルオーバーレイ
- `.articleSection` - 記事セクション

## 特記事項

1. **TBA（Token Bound Account）対応**
   - NFTをウォレットとして機能させる仕組み
   - 通常のEOAと区別して表示

2. **Discord連携**
   - Discordアカウントとウォレットの紐付け表示
   - ユーザーアイコンと名前の表示

3. **国際化対応**
   - `LANGSET`関数による多言語対応
   - ルーターの言語設定に基づく表示切替

4. **非同期処理**
   - ブロックチェーンとの通信は非同期
   - RPCモーダルによる通信状態の可視化