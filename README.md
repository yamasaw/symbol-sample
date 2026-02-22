# symbol-sample

Symbol ブロックチェーンのアカウントが保有するモザイク（トークン）一覧を表示する Web アプリです。

---

## 起動方法

### ブラウザで直接開く（最も簡単）

ビルドや依存インストールは不要です。`index.html` をブラウザで直接開いてください。

```bash
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

または Finder / エクスプローラーから `index.html` をダブルクリックするだけで動作します。

---

### ローカルサーバーで起動する（推奨）

`file://` プロトコルでは一部のブラウザでセキュリティ制限が発生することがあります。
その場合はローカルサーバーを使ってください。

**Python（インストール不要・標準搭載）:**

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Node.js がある場合:**

```bash
npx serve .
```

起動後、ブラウザで以下にアクセスします。

```
http://localhost:8080
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
├── index.html          # Web アプリ本体（これだけで動作します）
├── index.ts            # TypeScript サンプルコード
├── symbol-api-guide.md # Symbol REST API リファレンスまとめ
├── package.json
└── README.md
```

---

## 接続先ノード

アプリは以下の公開ノードを使用します。ノードが応答しない場合はしばらく待ってから再試行してください。

| ネットワーク | ノード URL |
|-------------|-----------|
| Mainnet | `https://symbol-sakura-16.next-web-technology.com:3001` |
| Testnet | `https://001-sai-dual.symboltest.net:3001` |

---

## 参考

- [Symbol API ガイド](./symbol-api-guide.md) — 本プロジェクトで使用している REST API の詳細
- [Symbol Documentation](https://docs.symbol.dev/)
- [Symbol Explorer](https://symbol.fyi/) — 公開ノード一覧・ブロックエクスプローラー
