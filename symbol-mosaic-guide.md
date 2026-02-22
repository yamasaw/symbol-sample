# Symbol モザイク発行ガイド

> 参考: [Symbol Documentation](https://docs.symbol.dev/) / [Symbol Community Documents](https://docs.symbol-community.com/symbol_sdk/v2/mosaic) / [Creating a mosaic](https://symbolplatform.com/docs-sub/guides/mosaic/creating-a-mosaic/)

---

## 1. モザイクとは

Symbol ブロックチェーンにおけるトークン（デジタル資産）の単位。
独自トークンの発行・管理・転送が可能で、NFT や FT（代替可能トークン）の両方を表現できる。

---

## 2. 署名方式の選択

モザイクを発行するには秘密鍵で署名する必要がある。署名方式は用途によって2つに分かれる。

| 方式 | 概要 | 用途 |
|------|------|------|
| **直接署名（秘密鍵）** | サーバーサイドコードで秘密鍵を保持して署名 | バックエンドサービス、管理スクリプト |
| **SSS Extension** | ブラウザ拡張機能がユーザーの代わりに署名（MetaMask 相当） | dApp（ユーザーが自分のウォレットで署名するフロントエンド） |

> **このプロジェクトのような Node.js バックエンド構成では SSS Extension は不要。**
> SSS Extension はブラウザ上でエンドユーザーに秘密鍵を晒さず署名させたい場合に使う。

---

## 3. モザイク発行に必要なトランザクション

モザイクの発行には **2つのトランザクションをアグリゲートトランザクションにまとめて** 一度にアナウンスする。

```
1. MosaicDefinitionTransaction    ← モザイクのプロパティ定義
2. MosaicSupplyChangeTransaction  ← 初期供給量の設定
         ↓
   AggregateTransaction にまとめる
         ↓
   秘密鍵で署名
         ↓
   PUT /transactions でアナウンス
```

---

## 4. MosaicFlags（モザイクの権限設定）

| フラグ | 説明 | `true` の意味 |
|--------|------|--------------|
| `supplyMutable` | 供給量変更可否 | 後から増減できる |
| `transferable` | 転送可否 | 発行者以外も他者へ転送できる |
| `restrictable` | 制限適用可否 | グローバル制限ルールを設定できる |
| `revokable` | 回収可否 | 発行者がモザイクを強制回収できる（SDK v3以降） |

---

## 5. 主要パラメータ

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| `nonce` | モザイクIDを生成するランダム値 | `MosaicNonce.createRandom()` |
| `mosaicId` | nonce とアドレスから生成される一意のID | `MosaicId.createFromNonce(nonce, address)` |
| `divisibility` | 小数点以下の桁数（0〜6） | `2` → 100単位 = 1.00枚 |
| `duration` | 有効期限（ブロック数、0で永続） | `UInt64.fromUint(0)` |
| `delta` | 供給量（絶対値 = 相対量 × 10^divisibility） | `1_000_000` → divisibility:2 なら 10,000.00枚 |

---

## 6. TypeScript 実装例（symbol-sdk v2系）

```typescript
import {
  Account,
  AggregateTransaction,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  NetworkType,
  RepositoryFactoryHttp,
  UInt64,
} from 'symbol-sdk';

async function issueMosaic(privateKey: string, nodeUrl: string) {
  // ノード接続
  const repo = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repo.getEpochAdjustment().toPromise();
  const networkType = await repo.getNetworkType().toPromise();
  const generationHash = await repo.getGenerationHash().toPromise();

  const account = Account.createFromPrivateKey(privateKey, networkType);

  // ---- Step 1: モザイク定義 ----
  const nonce = MosaicNonce.createRandom();
  const mosaicId = MosaicId.createFromNonce(nonce, account.address);

  const mosaicDefinitionTx = MosaicDefinitionTransaction.create(
    Deadline.create(epochAdjustment),
    nonce,
    mosaicId,
    MosaicFlags.create(
      true,   // supplyMutable: 供給量を後から変更できる
      true,   // transferable: 第三者への転送を許可
      false,  // restrictable: グローバル制限は使わない
    ),
    2,                  // divisibility: 小数点以下2桁
    UInt64.fromUint(0), // duration: 0 = 永続
    networkType,
  );

  // ---- Step 2: 供給量設定 ----
  const divisibility = 2;
  const relativeAmount = 10_000; // 10,000.00 枚
  const absoluteAmount = relativeAmount * Math.pow(10, divisibility); // = 1,000,000

  const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
    Deadline.create(epochAdjustment),
    mosaicDefinitionTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(absoluteAmount),
    networkType,
  );

  // ---- Step 3: アグリゲートトランザクションにまとめる ----
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      mosaicDefinitionTx.toAggregate(account.publicAccount),
      mosaicSupplyChangeTx.toAggregate(account.publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2_000_000), // 手数料（マイクロXYM単位）
  );

  // ---- Step 4: 署名してアナウンス ----
  const signedTx = account.sign(aggregateTx, generationHash);
  const txRepo = repo.createTransactionRepository();
  await txRepo.announce(signedTx).toPromise();

  console.log('MosaicId:', mosaicDefinitionTx.mosaicId.toHex());
  console.log('TxHash  :', signedTx.hash);

  return {
    mosaicId: mosaicDefinitionTx.mosaicId.toHex(),
    txHash: signedTx.hash,
  };
}
```

---

## 7. 発行確認

トランザクションがブロックに取り込まれたか確認する方法。

### REST API で確認

```bash
# トランザクションステータス確認
GET /transactionStatus/{txHash}

# 発行されたモザイク情報確認
GET /mosaics/{mosaicId}
```

### WebSocket で確認（リアルタイム）

```javascript
ws.send(JSON.stringify({
  uid: data.uid,
  subscribe: `confirmedAdded/${address}`,
}));
```

---

## 8. よくある注意点

| 注意点 | 詳細 |
|--------|------|
| **絶対量と相対量の換算** | `divisibility:2` なら 1枚 = 100単位。供給量は絶対量（整数）で指定する |
| **supplyMutable: false の場合** | 一度でも他アカウントに転送すると以後供給量の変更不可 |
| **nonce はランダム生成** | 同じ秘密鍵で複数モザイクを発行する場合も nonce が異なれば別IDになる |
| **アグリゲート必須** | Definition と SupplyChange は必ずセットで発行する（個別送信も可だが非推奨） |
| **generationHash はネットワーク依存** | テストネットと本番ネットで異なる。ノードの `/network/properties` から取得 |

---

## 9. SSS Extension を使う場合（dApp 向け）

ブラウザ上でユーザーが署名するケースでは、秘密鍵を直接扱わず SSS Extension 経由で署名する。

```javascript
// SSS Extension がインストールされている場合
const account = await SSS.getActiveAccount(); // ユーザーのアカウント情報取得

// トランザクション構築（上記と同様）
const aggregateTx = AggregateTransaction.createComplete(...);

// SSS Extension で署名
const signedTx = await SSS.requestSign(aggregateTx, { comment: 'モザイク発行' });

// アナウンス
await txRepo.announce(signedTx).toPromise();
```

> SSS Extension のドキュメント: https://docs.sss-symbol.com/

---

## 10. 参考リンク

- [Symbol Documentation - Mosaic Concepts](https://docs.symbol.dev/concepts/mosaic.html)
- [Creating a mosaic ガイド](https://symbolplatform.com/docs-sub/guides/mosaic/creating-a-mosaic/)
- [Symbol Community Documents - Mosaic](https://docs.symbol-community.com/symbol_sdk/v2/mosaic)
- [SSS Extension ドキュメント](https://docs.sss-symbol.com/)
- [SSS Extension GitHub](https://github.com/SafelySignSymbol/SSS-Extension)
- [Symbol Explorer（公開ノード一覧）](https://symbol.fyi/)
