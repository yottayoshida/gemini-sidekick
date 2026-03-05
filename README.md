# Gemini Sidekick

ChromeのサイドパネルでGeminiを使えるChrome拡張機能。

## 機能

### サイドパネルでGemini表示
- Chromeのサイドパネルに Gemini（gemini.google.com）をiframeで埋め込み表示
- ブラウジングしながらGeminiにいつでもアクセス可能
- ショートカットキー `Alt+G` でサイドパネルを開閉

### デフォルト画面の選択
サイドパネルを開いたときに表示する画面を選択可能:
- **新しいチャット画面** - 通常のGemini画面（デフォルト）
- **Gems一覧** - 作成済みのGem一覧
- **カスタムURL** - 特定のGemを直接指定（`gemini.google.com` ドメインのみ）

### テキスト自動コピー
- サイドパネルが開いている間、Webページ上のテキストを選択すると自動でクリップボードにコピー
- コピー完了の通知バーを表示
- パスワードフィールドからの選択は自動的に除外（セキュリティ配慮）
- 設定でON/OFF切り替え可能

### ズームレベル調整
- サイドパネル内のGemini表示サイズを 50%〜150% の範囲で変更可能（10%刻み）
- 設定画面のスライダーで直感的に操作
- 狭いサイドパネルでも見やすいサイズに調整できる

### Geminiスクロール修正
- サイドパネルの狭い幅でGeminiがモバイル判定され、左サイドバー（会話履歴・Gem一覧）のスクロールが無効化される問題を修正
- CSS注入によるスクロール復旧 + 細めのスクロールバー表示

### 多言語対応
- 日本語 / English 対応
- 自動検出（ブラウザの言語設定に追従）または手動選択

## 技術構成

| 項目 | 内容 |
|------|------|
| フレームワーク | [WXT](https://wxt.dev/) (Vite ベース) |
| UI | [Svelte 4](https://svelte.dev/) |
| マニフェスト | Chrome Manifest V3 |
| 言語 | TypeScript |

### エントリポイント構成

```
entrypoints/
  background.ts          # Service Worker: サイドパネル開閉管理（Port接続監視）
  content.ts             # Content Script: テキスト選択→自動コピー（全ページ）
  gemini-scroll.content.ts  # Content Script: Gemini専用スクロール修正CSS
  sidepanel/             # サイドパネルUI（Svelte）
    App.svelte           #   メイン画面 + インライン設定画面
    index.html
    main.ts
  options/               # オプションページUI（Svelte）
    App.svelte           #   フル設定画面
    index.html
    main.ts
  lib/
    settings.ts          # 設定管理（chrome.storage.sync）
    i18n.ts              # i18nユーティリティ（Svelte store ベース）
    locales/             # 翻訳ファイル
      en.ts              #   English（ベース言語・型定義元）
      ja.ts              #   日本語
      index.ts
```

### 使用しているChrome API

| API | 用途 |
|-----|------|
| `sidePanel` | サイドパネルの開閉制御 |
| `storage.sync` | 設定の永続化（デバイス間同期） |
| `storage.session` | サイドパネル開閉状態の共有 |
| `declarativeNetRequest` | Geminiのiframe表示に必要なヘッダー除去 |
| `clipboardWrite` | テキスト自動コピー |
| `runtime.connect` / `Port` | サイドパネル生存監視 |

### declarativeNetRequest について

Geminiをiframe内で表示するため、`X-Frame-Options` と `Content-Security-Policy` ヘッダーを `gemini.google.com` ドメインのサブフレームリクエストに対してのみ除去しています（`rules.json`）。

## 開発

```bash
# 依存インストール
npm install

# 開発モード（ホットリロード）
npm run dev

# ビルド
npm run build

# zip作成（配布用）
npm run zip
```

ビルド出力先: `../../chrome-ext-gemini-sidekick/chrome-mv3/`

## インストール

1. `chrome://extensions/` を開く
2. 「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」から `chrome-ext-gemini-sidekick/chrome-mv3/` を選択

## ライセンス

MIT
