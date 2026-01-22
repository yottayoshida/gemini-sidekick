// Background Script - サイドパネル制御
// Content Scriptは直接storageを見るのでメッセージ転送は不要

export default defineBackground(() => {
  // Content ScriptからもStorage Sessionにアクセスできるようにする
  chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
  });

  // アイコンクリックでサイドパネルを開く
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });
});
