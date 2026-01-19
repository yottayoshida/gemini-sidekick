# Gemini Sidekick セキュリティFAQ

IT Securityレビュー時に想定される質問と回答

---

## Q1: なぜX-Frame-Optionsを削除する必要があるのですか？

**A:** gemini.google.comは標準でiframe埋め込みを禁止しています（`X-Frame-Options: SAMEORIGIN`）。サイドパネル内でGeminiを表示するためには、このヘッダーを削除する必要があります。

**補足:**
- 削除対象はgemini.google.comドメインのみ
- 他のサイトには影響しません
- ユーザーが拡張機能を有効にした場合のみ適用

---

## Q2: Clickjacking攻撃のリスクはありませんか？

**A:** リスクは限定的です。理由：

1. **スコープ限定**: gemini.google.comのみに適用
2. **認証保護**: GeminiはGoogle認証が必要（未ログインでは使用不可）
3. **ユーザー主導**: 拡張機能をインストールしたユーザーのみ影響
4. **信頼されたコンテキスト**: Chrome拡張機能のサイドパネルという管理された環境内

**攻撃シナリオの検討:**
- 悪意あるサイトがこの拡張機能を悪用してGeminiをiframeで埋め込む → **不可能**（ヘッダー削除はこの拡張機能のサイドパネルからのリクエストのみに適用）

---

## Q3: Content Scriptで全サイトにアクセスしていますが、なぜですか？

**A:** ユーザーがどのサイトでテキストを選択しても、それをコピーしてGeminiに貼り付けられるようにするためです。

**Content Scriptの処理内容:**
```javascript
// これだけ
document.addEventListener('mouseup', () => {
  const text = window.getSelection()?.toString();
  if (text) {
    navigator.clipboard.writeText(text);  // コピー
    chrome.runtime.sendMessage({...});     // 通知
  }
});
```

**やっていないこと:**
- ❌ ページの内容を外部に送信
- ❌ DOMの改変
- ❌ フォーム入力の監視
- ❌ Cookie/Storage/認証情報へのアクセス

---

## Q4: クリップボードへの書き込み権限は安全ですか？

**A:** はい。理由：

1. **読み取り権限なし**: `clipboardWrite`のみ（`clipboardRead`は不要）
2. **ユーザー操作起点**: テキスト選択（mouseup）時のみ発動
3. **選択テキストのみ**: ユーザーが選択した内容をそのままコピー
4. **加工・送信なし**: コピーしたテキストは外部に送信されない

---

## Q5: 外部サーバーへの通信はありますか？

**A:** いいえ、ありません。

| 通信 | 有無 | 説明 |
|------|------|------|
| 独自APIサーバー | ❌ なし | |
| 分析/トラッキング | ❌ なし | Google Analytics等未使用 |
| 広告ネットワーク | ❌ なし | |
| gemini.google.com | ✅ あり | iframeで表示（ユーザーセッション内） |

**重要:** Geminiとの通信はユーザーのブラウザセッション内で行われ、拡張機能が中継することはありません。

---

## Q6: ユーザーのGoogleアカウント情報にアクセスしますか？

**A:** いいえ、アクセスしません。

- `identity` 権限は使用していません
- OAuth認証は行っていません
- Geminiへのログインはユーザーのブラウザセッションを使用（拡張機能は関与しない）

---

## Q7: データはどこに保存されますか？

**A:** 保存されません。

- `chrome.storage` は使用していません
- ローカルファイルへの書き込みもありません
- 選択テキストはクリップボードに一時的にコピーされるのみ

---

## Q8: 悪意あるサイトからの攻撃を受ける可能性はありますか？

**A:** 考慮済みの攻撃ベクトルと対策：

| 攻撃 | 対策 |
|------|------|
| XSS | Content Scriptはページのコンテキストと分離（isolated world） |
| CSRF | 外部API呼び出しがないため該当なし |
| Clickjacking | gemini.google.comのみ、かつ認証保護下 |
| データ漏洩 | 外部送信なし、ストレージ保存なし |

---

## Q9: 拡張機能のアップデートはどのように管理されますか？

**A:** 以下の方法で管理可能：

1. **Chrome Web Store経由**: 自動アップデート、Googleの審査あり
2. **社内配布（MDM）**: 管理者が配布バージョンを制御可能
3. **ソースコード管理**: Gitリポジトリで変更履歴を追跡

---

## Q10: 将来的に機能が追加された場合、権限が増える可能性はありますか？

**A:** 現在の設計では追加権限は不要です。

**追加しない方針の権限:**
- `webRequest` / `webRequestBlocking`
- `tabs`（URLの読み取り等）
- `history`
- `cookies`
- `identity`

**理由:** この拡張機能はGeminiをサイドパネルで表示するだけの単機能ツールであり、複雑な機能拡張は想定していません。

---

## Q11: 開発者以外がソースコードを改ざんする可能性はありますか？

**A:** 以下で防止：

1. **Gitリポジトリ管理**: コミット履歴で変更追跡
2. **ビルドプロセス**: `npm run build` で一貫したビルド
3. **Chrome Web Store**: パッケージ署名で改ざん検知
4. **MDM配布**: 管理者のみがパッケージを配布可能

---

## Q12: この拡張機能を無効化/削除する方法は？

**A:**

**ユーザー操作:**
1. `chrome://extensions` を開く
2. 「Gemini Sidekick」を見つけて無効化/削除

**管理者操作（MDM）:**
- グループポリシーで強制削除可能
- `ExtensionInstallBlocklist` で拡張機能IDを指定

---

## 技術的な補足資料

### manifest.json（主要部分）
```json
{
  "permissions": [
    "sidePanel",
    "declarativeNetRequest",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://gemini.google.com/*"
  ]
}
```

### コードの行数
```
entrypoints/background.ts     - 9行
entrypoints/content.ts        - 30行
entrypoints/sidepanel/App.svelte - 130行（UIスタイル含む）
public/rules.json             - 27行
```

**合計: 約200行の小規模な拡張機能**

---

## お問い合わせ

追加の質問や懸念がある場合は、開発チームまでご連絡ください。
