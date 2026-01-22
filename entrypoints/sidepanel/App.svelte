<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { loadSettings, resolveUrl, URLS, type GeminiSettings } from '../lib/settings';

  let geminiUrl = URLS.gemini;  // デフォルト
  let selectedText = '';
  let showNotification = false;
  let autoCopyEnabled = true;  // 設定から読み込む

  onMount(async () => {
    // 設定を読み込んでURLと自動コピー設定を適用
    const settings = await loadSettings();
    geminiUrl = resolveUrl(settings);
    autoCopyEnabled = settings.autoCopyEnabled;

    // サイドパネルが開いたことをBackgroundに通知（自動コピー設定を考慮）
    notifyAutoCopyState(autoCopyEnabled);

    // Content Scriptからの選択テキスト（コピー済み）を受信
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SELECTION' && message.text) {
        selectedText = message.text;

        // コピー完了通知を表示
        if (message.copied) {
          showNotification = true;
          setTimeout(() => { showNotification = false; }, 2000);
        }
      }
    });

    // 設定変更を監視して即時反映
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        const newSettings: GeminiSettings = changes.settings.newValue;
        geminiUrl = resolveUrl(newSettings);
        autoCopyEnabled = newSettings.autoCopyEnabled;
        // 設定変更時は常に状態を通知（Service Workerスリープ対策）
        notifyAutoCopyState(autoCopyEnabled);
      }
    });

    // ページを離れる前に閉じた通知を送る
    window.addEventListener('beforeunload', handleClose);
  });

  onDestroy(() => {
    handleClose();
  });

  function handleClose() {
    notifyAutoCopyState(false);
  }

  // Backgroundに自動コピーの状態を通知
  function notifyAutoCopyState(enabled: boolean) {
    chrome.runtime.sendMessage({
      type: enabled ? 'SIDEPANEL_OPENED' : 'SIDEPANEL_CLOSED'
    }).catch(() => {});
  }

  // 設定画面を開く
  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  // 選択テキストをクリア
  function clearSelection() {
    selectedText = '';
  }
</script>

<div class="container">
  <div class="toolbar">
    <button
      class="settings-btn"
      on:click={openSettings}
      title="設定を開く"
    >
      ⚙️ 設定
    </button>
  </div>

  {#if showNotification}
    <div class="notification">
      ✅ コピー完了！Geminiに貼り付けてね
    </div>
  {:else if selectedText && autoCopyEnabled}
    <div class="selection-bar">
      <div class="selection-text">
        📋 {selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText}
      </div>
      <button class="clear-btn" on:click={clearSelection}>✕</button>
    </div>
  {/if}

  <iframe
    src={geminiUrl}
    title="Gemini"
    allow="clipboard-write; clipboard-read"
  ></iframe>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html), :global(body) {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    padding: 4px 8px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }

  .settings-btn {
    background: #e8e8e8;
    border: none;
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: #555;
  }

  .settings-btn:hover {
    background: #ddd;
  }

  .notification {
    padding: 10px 16px;
    background: #4caf50;
    color: white;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .selection-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-size: 13px;
  }

  .selection-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clear-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 6px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    color: white;
    transition: background 0.2s;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  iframe {
    flex: 1;
    width: 100%;
    border: none;
  }
</style>
