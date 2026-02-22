# Symbol REST API ガイド

> 参考: [Symbol Documentation](https://docs.symbol.dev/) / [REST Gateway](https://docs.symbol.dev/api.html) / [OpenAPI仕様](https://symbol.github.io/symbol-openapi/v1.0.4/)

---

## 1. 概要

Symbol の REST API（Catapult REST）は HTTP/HTTPS と WebSocket の2種類の接続方法を提供します。認証は不要で、パブリックノードに対してリクエストを送るだけで利用できます。

---

## 2. 接続方法

### HTTP / HTTPS

| プロトコル | ポート | 例 |
|-----------|-------|-----|
| HTTP      | 3000  | `http://<node-host>:3000/<endpoint>` |
| HTTPS     | 3001  | `https://<node-host>:3001/<endpoint>` |

```bash
# 例: ノード情報を取得
curl http://node.example.com:3000/node/info
```

### 公開ノードの探し方

- [Symbol Explorer](https://symbol.fyi/) のノード一覧からホストを取得する
- `GET /node/peers` で接続中ピア一覧を取得できる

---

## 3. 認証

**認証は不要です。** Symbol REST API はオープンな API であり、APIキーやトークンなどの認証機構はありません。
トランザクションの送信（書き込み操作）にはネットワーク秘密鍵で署名したペイロードを PUT で送りますが、それ自体が認証の仕組みです（HTTPレベルの認証ではなく暗号署名による認証）。

---

## 4. HTTPメソッドと使い分け

| メソッド | 用途 |
|---------|------|
| GET     | データ取得（単一リソース・検索） |
| POST    | 複数IDを指定してまとめて取得 |
| PUT     | トランザクションの送信（書き込み） |

---

## 5. レスポンスコード

| コード | 意味 |
|-------|------|
| 200   | 成功 |
| 202   | 受理済み（非同期処理） |
| 400   | リクエスト内容が不正 |
| 404   | リソースが見つからない |
| 409   | 競合（すでに存在するなど） |
| 500   | ノード内部エラー |

---

## 6. ページネーション

複数件を返すエンドポイントはデフォルトでページネーションされます。

| パラメータ | 説明 | デフォルト |
|-----------|------|-----------|
| `pageSize`   | 1ページあたりの件数（1〜100） | 10 |
| `pageNumber` | ページ番号 | 1 |
| `offset`     | スキップするエントリ数 | - |
| `order`      | `asc` / `desc` | - |
| `orderBy`    | ソート対象プロパティ | エンドポイント依存 |

```bash
# 例: 確認済みトランザクションを20件ずつ2ページ目で取得
GET /transactions/confirmed?pageSize=20&pageNumber=2&order=desc
```

---

## 7. APIエンドポイント一覧

### Account（アカウント）

| メソッド | パス | 説明 |
|---------|------|------|
| GET  | `/accounts` | アカウント検索 |
| POST | `/accounts` | 複数アカウント情報取得 |
| GET  | `/accounts/{accountId}` | アカウント情報取得 |
| GET  | `/accounts/{accountId}/merkle` | アカウントのマークル情報取得 |

### Block（ブロック）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/blocks` | ブロック検索 |
| GET | `/blocks/{height}` | 指定高さのブロック取得 |
| GET | `/blocks/{height}/transactions/{hash}/merkle` | トランザクションのマークルパス取得 |
| GET | `/blocks/{height}/statements/{hash}/merkle` | レシートのマークルパス取得 |

### Chain（チェーン）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/chain/info` | 最新ブロック高さ・スコアなどのチェーン情報 |

### Finalization（ファイナリティ）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/finalization/proof/epoch/{epoch}` | エポック別ファイナライゼーション証明取得 |
| GET | `/finalization/proof/height/{height}` | 高さ別ファイナライゼーション証明取得 |

### Network（ネットワーク）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/network` | ネットワークタイプ取得 |
| GET | `/network/fees/rental` | レンタル手数料情報 |
| GET | `/network/fees/transaction` | トランザクション手数料情報 |
| GET | `/network/properties` | ネットワーク設定プロパティ |
| GET | `/network/inflation` | インフレーションスケジュール |
| GET | `/network/inflation/at/{height}` | 指定高さでのインフレーション量 |

### Node（ノード）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/node/health` | ノードのヘルス状態 |
| GET | `/node/info` | ノード情報（公開鍵・バージョン等） |
| GET | `/node/peers` | 接続中ピア一覧 |
| GET | `/node/storage` | ストレージ使用状況 |
| GET | `/node/time` | ノードの現在時刻 |
| GET | `/node/server` | REST コンポーネントバージョン |
| GET | `/node/unlockedaccount` | アンロック中ハーベスティングアカウント |
| GET | `/node/metadata` | ノードメタデータ |

### Transaction（トランザクション）

| メソッド | パス | 説明 |
|---------|------|------|
| PUT  | `/transactions` | トランザクション送信 |
| GET  | `/transactions/confirmed` | 確認済みトランザクション検索 |
| POST | `/transactions/confirmed` | 複数確認済みトランザクション取得 |
| GET  | `/transactions/confirmed/{transactionId}` | 確認済みトランザクション取得 |
| GET  | `/transactions/unconfirmed` | 未確認トランザクション検索 |
| POST | `/transactions/unconfirmed` | 複数未確認トランザクション取得 |
| GET  | `/transactions/unconfirmed/{transactionId}` | 未確認トランザクション取得 |
| GET  | `/transactions/partial` | 部分トランザクション（アグリゲートボンド）検索 |
| PUT  | `/transactions/partial` | アグリゲートボンドトランザクション送信 |
| POST | `/transactions/partial` | 複数部分トランザクション取得 |
| GET  | `/transactions/partial/{transactionId}` | 部分トランザクション取得 |
| PUT  | `/transactions/cosignature` | 連署（コサイン）トランザクション送信 |

### Transaction Status（トランザクションステータス）

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/transactionStatus` | 複数トランザクションのステータス取得 |
| GET  | `/transactionStatus/{hash}` | トランザクションステータス取得 |

### Hash Lock（ハッシュロック）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/lock/hash` | ハッシュロック検索 |
| GET | `/lock/hash/{hash}` | ハッシュロック情報取得 |
| GET | `/lock/hash/{hash}/merkle` | ハッシュロックのマークル情報 |

### Secret Lock（シークレットロック）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/lock/secret` | シークレットロック検索 |
| GET | `/lock/secret/{compositeHash}` | シークレットロック情報取得 |
| GET | `/lock/secret/{compositeHash}/merkle` | シークレットロックのマークル情報 |

### Metadata（メタデータ）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/metadata` | メタデータエントリ検索 |
| GET | `/metadata/{compositeHash}` | メタデータ情報取得 |
| GET | `/metadata/{compositeHash}/merkle` | メタデータのマークル情報 |

### Mosaic（モザイク / トークン）

| メソッド | パス | 説明 |
|---------|------|------|
| GET  | `/mosaics` | モザイク検索 |
| POST | `/mosaics` | 複数モザイク情報取得 |
| GET  | `/mosaics/{mosaicId}` | モザイク情報取得 |
| GET  | `/mosaics/{mosaicId}/merkle` | モザイクのマークル情報 |

### Multisig（マルチシグ）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/account/{address}/multisig` | マルチシグ情報取得 |
| GET | `/account/{address}/multisig/merkle` | マルチシグのマークル情報 |
| GET | `/account/{address}/multisig/graph` | マルチシグ構成グラフ取得 |

### Namespace（ネームスペース）

| メソッド | パス | 説明 |
|---------|------|------|
| GET  | `/namespaces` | ネームスペース検索 |
| GET  | `/namespaces/{namespaceId}` | ネームスペース情報取得 |
| GET  | `/namespaces/{namespaceId}/merkle` | ネームスペースのマークル情報 |
| POST | `/namespaces/names` | ネームスペース名取得 |
| POST | `/namespaces/account/names` | アカウント名取得 |
| POST | `/namespaces/mosaic/names` | モザイク名取得 |

### Receipt（レシート）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/statements/transaction` | トランザクションステートメント検索 |
| GET | `/statements/resolutions/address` | アドレス解決ステートメント検索 |
| GET | `/statements/resolutions/mosaic` | モザイク解決ステートメント検索 |

### Restriction Account（アカウント制限）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/restrictions/account` | アカウント制限検索 |
| GET | `/restrictions/account/{address}` | アカウント制限情報取得 |
| GET | `/restrictions/account/{address}/merkle` | アカウント制限のマークル情報 |

### Restriction Mosaic（モザイク制限）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/restrictions/mosaic` | モザイク制限検索 |
| GET | `/restrictions/mosaic/{compositeHash}` | モザイク制限情報取得 |
| GET | `/restrictions/mosaic/{compositeHash}/merkle` | モザイク制限のマークル情報 |

---

## 8. WebSocket（リアルタイム通知）

ポーリングなしでリアルタイムにブロックチェーンのイベントを受信できます。

### 接続

```
ws://<node-host>:3000/ws
```

### フロー

1. WebSocket 接続を開く
2. サーバーから `{"uid": "<unique-id>"}` が返される
3. そのUIDを使ってチャンネルを subscribe する
4. イベント発生時にサーバーからメッセージが push される

### Subscribeリクエスト形式

```json
{
  "uid": "<接続時に取得したUID>",
  "subscribe": "<チャンネル名>"
}
```

### 利用可能なチャンネル

| チャンネル | 説明 |
|-----------|------|
| `block` | 新規ブロック生成時に通知 |
| `finalizedBlock` | ブロック確定（ファイナリティ）時に通知 |
| `confirmedAdded/{address}` | 指定アドレスの確認済みトランザクション追加時 |
| `unconfirmedAdded/{address}` | 指定アドレスの未確認トランザクション追加時 |
| `unconfirmedRemoved/{address}` | 未確認→確認済みまたはドロップ時 |
| `partialAdded/{address}` | 指定アドレスのアグリゲートボンドトランザクション追加時 |
| `partialRemoved/{address}` - | 部分トランザクション削除時 |
| `cosignature/{address}` | 連署トランザクション受信時 |
| `status/{address}` | トランザクションエラー発生時 |

### WebSocket サンプル（JavaScript）

```javascript
const ws = new WebSocket('ws://node.example.com:3000/ws');

ws.onopen = () => console.log('Connected');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // 初回接続でUIDを受け取る
  if (data.uid) {
    // ブロック生成を購読
    ws.send(JSON.stringify({ uid: data.uid, subscribe: 'block' }));

    // 特定アドレスの確認済みトランザクションを購読
    const address = 'TADDRESS...';
    ws.send(JSON.stringify({ uid: data.uid, subscribe: `confirmedAdded/${address}` }));
  } else {
    console.log('Event:', data);
  }
};
```

---

## 9. トランザクション送信の流れ

認証の代わりに、秘密鍵による暗号署名がトランザクションの正当性を保証します。

```
1. トランザクションオブジェクトを構築
2. 送信者の秘密鍵で署名（Symbol SDK を使用）
3. 署名済みペイロードを PUT /transactions で送信
4. /transactionStatus/{hash} またはWebSocketで確認
```

### トランザクション送信リクエスト例

```bash
curl -X PUT http://node.example.com:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"payload": "<署名済み16進数ペイロード>"}'
```

---

## 10. SDK

直接 REST を叩く代わりに、公式 SDK を使うと署名やシリアライゼーションを自動化できます。

| 言語 | パッケージ |
|-----|-----------|
| TypeScript / JavaScript | `symbol-sdk` |
| Java | `symbol-sdk-java` |
| Python | `symbol-sdk-python` |

```bash
# TypeScript/JavaScript
npm install symbol-sdk
```

---

## 11. 参考リンク

- [REST Gateway ドキュメント](https://docs.symbol.dev/api.html)
- [OpenAPI仕様 v1.0.4](https://symbol.github.io/symbol-openapi/v1.0.4/)
- [symbol-sdk (npm)](https://www.npmjs.com/package/symbol-sdk)
- [Symbol Explorer（公開ノード一覧）](https://symbol.fyi/)
