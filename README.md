# symbol-sample

Symbol ブロックチェーンのアカウントが保有するモザイク（トークン）一覧を表示する Web アプリです。
Hono をバックエンドとして使用し、Symbol REST API へのアクセスをサーバー側でプロキシします。

---

## 起動方法

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

ファイルを変更すると自動でサーバーが再起動します（`tsx watch` による Hot Reload）。

### 本番起動

```bash
pnpm start
```

### ポートの変更

環境変数 `PORT` で変更できます。

```bash
PORT=8080 pnpm dev
```

---

## 使い方

1. **Network** でネットワークを選択する
   - `Mainnet` — 本番ネットワーク
   - `Testnet` — テスト用ネットワーク

2. **Account Address** に Symbol のアカウントアドレスを入力する
   - ハイフンあり・なし両方対応（例: `NAUDKL-XAJPNA-...` でも `NAUDKLXAJPNA...` でも可）

3. **Search** ボタンを押す（Enter キーでも可）

4. 保有モザイクの一覧が表示される

| 列 | 内容 |
|----|------|
| Name | モザイクに登録されたネームスペース名（未登録は「名前なし」） |
| Mosaic ID | 16進数のモザイク識別子 |
| Amount | 保有量（divisibility に基づいて小数フォーマット済み） |

---

## ファイル構成

```
symbol-sample/
├── src/
│   ├── server.ts          # Hono サーバーエントリーポイント
│   └── routes/
│       └── symbol.ts      # Symbol REST API プロキシルート
├── public/
│   └── index.html         # フロントエンド
├── index.ts               # TypeScript サンプルコード
├── symbol-api-guide.md    # Symbol REST API リファレンスまとめ
├── tsconfig.json
├── package.json
└── README.md
```

### API ルート

| メソッド | パス | 説明 |
|---------|------|------|
| GET  | `/api/accounts/:address?network=` | アカウント情報取得 |
| POST | `/api/mosaics?network=` | モザイク詳細取得 |
| POST | `/api/namespaces/mosaic/names?network=` | モザイク名取得 |

---

## 接続先ノード

`network` クエリパラメータに応じてサーバー側で切り替えます。

| ネットワーク | ノード URL |
|-------------|-----------|
| mainnet | `https://symbol-sakura-16.next-web-technology.com:3001` |
| testnet | `https://001-sai-dual.symboltest.net:3001` |

---

## 参考

- [Symbol API ガイド](./symbol-api-guide.md) — 本プロジェクトで使用している REST API の詳細
- [Symbol Documentation](https://docs.symbol.dev/)
- [Symbol Explorer](https://symbol.fyi/) — 公開ノード一覧・ブロックエクスプローラー
- [Hono](https://hono.dev/) — Web フレームワーク
