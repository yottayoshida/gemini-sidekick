// Background Script - サイドパネル制御とContent Script連携

export default defineBackground(() => {
  // サイドパネルが開いているタブIDを管理
  const activeTabs = new Set<number>();

  // アイコンクリックでサイドパネルを開く
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // サイドパネルからの通知を受け取り、Content Scriptに転送
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SIDEPANEL_OPENED') {
      // サイドパネルが開いた - アクティブタブのContent Scriptを有効化
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          const tabId = tabs[0].id;
          activeTabs.add(tabId);
          chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_COPY', enabled: true })
            .catch(() => {/* Content Scriptがまだない場合は無視 */});
        }
      });
    } else if (message.type === 'SIDEPANEL_CLOSED') {
      // サイドパネルが閉じた - Content Scriptを無効化
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          const tabId = tabs[0].id;
          activeTabs.delete(tabId);
          chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_COPY', enabled: false })
            .catch(() => {});
        }
      });
    }
    return false;
  });

  // タブ切り替え時にも状態を更新
  chrome.tabs.onActivated.addListener((activeInfo) => {
    const isEnabled = activeTabs.has(activeInfo.tabId);
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'TOGGLE_COPY', enabled: isEnabled })
      .catch(() => {});
  });
});
