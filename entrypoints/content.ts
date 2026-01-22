// Content Script - テキスト選択時に自動コピー
// セキュリティ: パスワードフィールドは除外
// 設定は chrome.storage から直接読み込む（Background経由しない）

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_end',
  main() {
    document.addEventListener('mouseup', async (event) => {
      // 設定を直接確認（storageから毎回読み込む）
      const [sessionResult, syncResult] = await Promise.all([
        chrome.storage.session.get('sidePanelOpen'),
        chrome.storage.sync.get('settings'),
      ]);

      const sidePanelOpen = sessionResult.sidePanelOpen || false;
      const settings = syncResult.settings || { autoCopyEnabled: true };

      // サイドパネルが開いていない、または自動コピーOFFなら何もしない
      if (!sidePanelOpen || !settings.autoCopyEnabled) return;

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
        // サイドパネルに通知
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
