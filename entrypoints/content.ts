// Content Script - テキスト選択時に自動コピー
// セキュリティ: パスワードフィールドは除外

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_end',
  main() {
    // サイドパネルが開いているかどうかのフラグ
    let isEnabled = false;

    // Background Scriptから有効/無効の通知を受け取る
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'TOGGLE_COPY') {
        isEnabled = message.enabled;
      }
    });

    document.addEventListener('mouseup', (event) => {
      // 機能が無効なら何もしない
      if (!isEnabled) return;

      // パスワードフィールドからの選択は除外
      const target = event.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.type === 'password') {
        return;
      }

      // 選択範囲にパスワードフィールドが含まれていないか確認
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      // 親要素がパスワードフィールドの場合は除外
      if (container instanceof HTMLInputElement && container.type === 'password') {
        return;
      }
      if (container.parentElement instanceof HTMLInputElement &&
          container.parentElement.type === 'password') {
        return;
      }

      const text = selection.toString().trim();

      // 空文字や短すぎるテキストは除外
      if (!text || text.length < 2) return;

      // クリップボードにコピー
      navigator.clipboard.writeText(text).then(() => {
        // サイドパネルに通知（ログ出力なし）
        chrome.runtime.sendMessage({
          type: 'SELECTION',
          text: text,
          copied: true,
        }).catch(() => {
          // サイドパネルが開いていない場合は無視
        });
      }).catch(() => {
        // コピー失敗時は無視
      });
    });
  },
});
