# Gemini Sidekick セキュリティ概要

## 拡張機能の目的
Google Workspaceで利用可能なGemini（gemini.google.com）をChromeのサイドパネルで使用できるようにする。

## 権限一覧と用途

| 権限 | 用途 | リスク |
|------|------|--------|
| `sidePanel` | サイドパネルUIの表示 | 低 - UI表示のみ |
| `declarativeNetRequest` | X-Frame-Optionsヘッダー削除 | 中 - 下記で詳細説明 |
| `clipboardWrite` | 選択テキストの自動コピー | 低 - 書き込みのみ |

## Host Permissions

```
https://gemini.google.com/*
```

- **用途**: gemini.google.comへのiframe埋め込みを許可
- **スコープ**: Geminiドメインのみに限定

## declarativeNetRequestの詳細

### 目的
gemini.google.comは`X-Frame-Options: SAMEORIGIN`ヘッダーを返すため、通常はiframeでの埋め込みがブロックされる。このヘッダーを削除することで、サイドパネル内でのGemini表示を実現。

### ルール定義（rules.json）
```json
{
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [
      { "header": "X-Frame-Options", "operation": "remove" },
      { "header": "Content-Security-Policy", "operation": "remove" },
      { "header": "X-Content-Type-Options", "operation": "remove" }
    ]
  },
  "condition": {
    "urlFilter": "*://gemini.google.com/*",
    "resourceTypes": ["sub_frame"]
  }
}
```

### セキュリティ考慮事項
- **スコープ限定**: gemini.google.comドメインのみに適用
- **リソースタイプ限定**: `sub_frame`（iframe）のみに適用
- **影響範囲**: この拡張機能のサイドパネルからのリクエストのみ

## Content Script

### 対象
```
matches: ['http://*/*', 'https://*/*']
```

### 処理内容
1. `mouseup`イベントでテキスト選択を検知
2. 選択テキストをクリップボードにコピー
3. サイドパネルに通知を送信

### セキュリティ考慮事項
- **読み取りのみ**: DOM操作は`window.getSelection()`のみ
- **書き込み先**: クリップボードのみ（ユーザーの意図した操作）
- **通信先**: 拡張機能内部のみ（外部サーバーへの送信なし）

## データフロー

```
[Webページ]
    ↓ テキスト選択（mouseup）
[Content Script]
    ↓ clipboard.writeText()
[クリップボード]
    ↓ chrome.runtime.sendMessage()
[サイドパネル]
    ↓ 通知表示
[iframe: gemini.google.com]
    ↓ ユーザーが手動でペースト
[Gemini]
```

## 外部通信

| 通信先 | プロトコル | 用途 |
|--------|------------|------|
| gemini.google.com | HTTPS | Gemini UIの表示（iframe） |

**注意**:
- 外部APIへの独自通信は**なし**
- すべてのGemini通信はユーザーのブラウザセッション内で完結
- 認証はユーザーのGoogle Workspaceアカウントを使用

## ストレージ使用

**なし** - この拡張機能はchrome.storageを使用しない

## ネットワークリクエスト

拡張機能から直接行うネットワークリクエストは**なし**
（iframeでGeminiを表示するのみ）

## コード署名・配布

- ソースコードはGitで管理
- Chrome Web Storeまたは社内配布

## 既知のリスクと緩和策

### リスク1: X-Frame-Options削除
- **リスク**: Clickjacking攻撃の可能性
- **緩和策**:
  - gemini.google.comドメインのみに限定
  - ユーザーが自ら拡張機能を有効化した場合のみ適用
  - Gemini自体がGoogle認証で保護されている

### リスク2: クリップボード書き込み
- **リスク**: 意図しないデータがクリップボードにコピーされる
- **緩和策**:
  - ユーザーのテキスト選択操作（mouseup）時のみ発動
  - 選択したテキストのみをコピー（加工・送信なし）

## ファイル構成

```
gemini-sidekick/
├── entrypoints/
│   ├── background.ts        # サイドパネル制御のみ
│   ├── content.ts           # テキスト選択→コピー
│   └── sidepanel/
│       └── App.svelte       # iframe表示
├── public/
│   └── rules.json           # ヘッダー削除ルール
└── wxt.config.ts            # manifest定義
```

## 監査用チェックリスト

- [x] 外部サーバーへのデータ送信なし
- [x] ユーザー認証情報の取得・保存なし
- [x] センシティブなAPIの使用なし（webRequest等）
- [x] 権限は最小限に限定
- [x] Host Permissionsは必要なドメインのみ
- [x] Content Scriptは読み取りのみ

## 連絡先

- 開発者: [あなたの名前]
- 部署: [部署名]
