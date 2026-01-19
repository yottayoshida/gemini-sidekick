<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const GEMINI_URL = 'https://gemini.google.com/app';

  let selectedText = '';
  let showNotification = false;
  let autoCopyEnabled = true;  // 自動コピーON/OFF

  onMount(() => {
    // サイドパネルが開いたことをBackgroundに通知
    notifyPanelState(true);

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

    // ページを離れる前に閉じた通知を送る
    window.addEventListener('beforeunload', handleClose);
  });

  onDestroy(() => {
    handleClose();
  });

  function handleClose() {
    notifyPanelState(false);
  }

  // Backgroundにサイドパネルの状態を通知
  function notifyPanelState(opened: boolean) {
    chrome.runtime.sendMessage({
      type: opened ? 'SIDEPANEL_OPENED' : 'SIDEPANEL_CLOSED'
    }).catch(() => {});
  }

  // 自動コピーのON/OFF切り替え
  function toggleAutoCopy() {
    autoCopyEnabled = !autoCopyEnabled;
    chrome.runtime.sendMessage({
      type: autoCopyEnabled ? 'SIDEPANEL_OPENED' : 'SIDEPANEL_CLOSED'
    }).catch(() => {});
  }

  // 選択テキストをクリア
  function clearSelection() {
    selectedText = '';
  }
</script>

<div class="container">
  <div class="toolbar">
    <button
      class="toggle-btn"
      class:enabled={autoCopyEnabled}
      on:click={toggleAutoCopy}
      title={autoCopyEnabled ? '自動コピーON' : '自動コピーOFF'}
    >
      {autoCopyEnabled ? '📋 自動コピーON' : '📋 自動コピーOFF'}
    </button>
  </div>

  {#if showNotification}
    <div class="notification">
      ✅ コピー完了！Geminiに貼り付けてね
    </div>
  {:else if selectedText}
    <div class="selection-bar">
      <div class="selection-text">
        📋 {selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText}
      </div>
      <button class="clear-btn" on:click={clearSelection}>✕</button>
    </div>
  {/if}

  <iframe
    src={GEMINI_URL}
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

  .toggle-btn {
    background: #e0e0e0;
    border: none;
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
  }

  .toggle-btn.enabled {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .toggle-btn:hover {
    opacity: 0.9;
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
