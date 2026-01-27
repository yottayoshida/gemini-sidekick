// Background Script - サイドパネル制御
// Content Scriptは直接storageを見るのでメッセージ転送は不要

export default defineBackground(() => {
  // Content ScriptからもStorage Sessionにアクセスできるようにする
  chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
  });

  // 初期化: サイドパネルは閉じている状態
  chrome.storage.session.set({ sidePanelOpen: false });

  // サイドパネルからのPort接続を監視
  // Port接続中 = サイドパネル開いている、切断 = 閉じた
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'sidepanel') {
      // サイドパネルが開いた
      chrome.storage.session.set({ sidePanelOpen: true });

      // サイドパネルが閉じた（Port切断）
      port.onDisconnect.addListener(() => {
        chrome.storage.session.set({ sidePanelOpen: false });
      });
    }
  });

  // アイコンクリックでサイドパネルを開く
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });
});
