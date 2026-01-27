<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    loadSettings,
    saveSettings,
    resolveUrl,
    validateGemUrl,
    URLS,
    VIEW_OPTIONS,
    LANGUAGE_OPTIONS,
    type GeminiSettings,
    type DefaultView,
    DEFAULT_SETTINGS,
  } from '../lib/settings';
  import {
    t,
    initLocale,
    updateLocale,
    getLocaleDisplayName,
    resolveLocale,
    type LanguageSetting,
  } from '../lib/i18n';

  let geminiUrl = URLS.gemini;
  let selectedText = '';
  let showNotification = false;
  let autoCopyEnabled = true;

  // 設定画面表示フラグ
  let showSettings = false;

  // 設定フォーム用
  let settings: GeminiSettings = { ...DEFAULT_SETTINGS };
  let urlErrorKey = ''; // i18n key for error message
  let showSaveSuccess = false;

  // Background Scriptとのポート接続（サイドパネル生存監視用）
  let port: chrome.runtime.Port | null = null;

  onMount(async () => {
    // 設定を読み込んでURLと自動コピー設定を適用
    const loadedSettings = await loadSettings();
    settings = { ...loadedSettings };
    geminiUrl = resolveUrl(loadedSettings);
    autoCopyEnabled = loadedSettings.autoCopyEnabled;

    // i18n初期化（設定の言語に合わせる）
    initLocale(loadedSettings.language);

    // Background ScriptにPort接続してサイドパネルが開いていることを通知
    // Port切断時にBackground側で sidePanelOpen: false が設定される
    port = chrome.runtime.connect({ name: 'sidepanel' });

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
        // 言語設定も即時反映
        updateLocale(newSettings.language);
      }
    });
  });

  onDestroy(() => {
    // Port切断（念のため明示的に切断、通常はページ終了時に自動切断される）
    port?.disconnect();
  });

  // 設定画面を開く
  function openSettings() {
    showSettings = true;
  }

  // 設定画面を閉じてGeminiに戻る
  function closeSettings() {
    showSettings = false;
    showSaveSuccess = false;
  }

  // 設定を保存
  async function handleSave() {
    if (settings.defaultView === 'custom' && urlErrorKey) {
      return;
    }

    await saveSettings(settings);
    geminiUrl = resolveUrl(settings);
    autoCopyEnabled = settings.autoCopyEnabled;

    // 言語設定を即時反映
    updateLocale(settings.language);

    showSaveSuccess = true;
    setTimeout(() => {
      showSaveSuccess = false;
      showSettings = false; // 保存後に自動で戻る
    }, 1000);
  }

  // デフォルト画面の変更
  function handleViewChange(value: DefaultView) {
    settings.defaultView = value;
    if (value !== 'custom') {
      urlErrorKey = '';
    } else {
      validateUrl();
    }
  }

  // URL入力
  function handleUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    settings.customGemUrl = target.value;
    validateUrl();
  }

  // URLバリデーション
  function validateUrl() {
    if (settings.defaultView !== 'custom') {
      urlErrorKey = '';
      return;
    }
    const result = validateGemUrl(settings.customGemUrl);
    urlErrorKey = result.errorKey || '';
  }

  // 言語設定の変更
  function handleLanguageChange(value: LanguageSetting) {
    settings.language = value;
  }

  // 選択テキストをクリア
  function clearSelection() {
    selectedText = '';
  }

  // ショートカット設定を開く
  function openShortcutSettings() {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }

  // GeminiのGem一覧を開く
  function openGemini() {
    chrome.tabs.create({ url: URLS.gems });
  }

  $: canSave = settings.defaultView !== 'custom' || !urlErrorKey;
</script>

<div class="container">
  {#if showSettings}
    <!-- 設定画面 -->
    <div class="settings-container">
      <div class="settings-header">
        <button class="back-btn" on:click={closeSettings}>{$t('back')}</button>
        <h1>{$t('settingsTitle')}</h1>
      </div>

      <div class="settings-content">
        <section class="section">
          <h2>{$t('defaultView')}</h2>
          <div class="options">
            {#each VIEW_OPTIONS as option}
              <label class="option" class:selected={settings.defaultView === option.value}>
                <input
                  type="radio"
                  name="defaultView"
                  value={option.value}
                  checked={settings.defaultView === option.value}
                  on:change={() => handleViewChange(option.value)}
                />
                <span class="option-label">{$t(option.labelKey)}</span>
              </label>

              {#if option.value === 'custom' && settings.defaultView === 'custom'}
                <div class="custom-url-section">
                  <input
                    type="url"
                    class="url-input"
                    class:error={urlErrorKey}
                    placeholder={$t('customUrlPlaceholder')}
                    value={settings.customGemUrl}
                    on:input={handleUrlInput}
                  />
                  {#if urlErrorKey}
                    <p class="error-message">⚠️ {$t(urlErrorKey)}</p>
                  {/if}
                  <button class="help-link" on:click={openGemini}>
                    {$t('openGemini')}
                  </button>
                </div>
              {/if}
            {/each}
          </div>
        </section>

        <section class="section">
          <h2>{$t('behaviorSettings')}</h2>
          <label class="toggle-option">
            <input type="checkbox" bind:checked={settings.autoCopyEnabled} />
            <span class="toggle-label">{$t('autoCopyEnabled')}</span>
          </label>
        </section>

        <section class="section">
          <h2>{$t('languageSettings')}</h2>
          <div class="options">
            {#each LANGUAGE_OPTIONS as option}
              <label class="option" class:selected={settings.language === option.value}>
                <input
                  type="radio"
                  name="language"
                  value={option.value}
                  checked={settings.language === option.value}
                  on:change={() => handleLanguageChange(option.value)}
                />
                <span class="option-label">
                  {#if option.value === 'auto'}
                    {$t('languageAutoCurrent', { lang: getLocaleDisplayName(resolveLocale('auto')) })}
                  {:else}
                    {$t(option.labelKey)}
                  {/if}
                </span>
              </label>
            {/each}
          </div>
        </section>

        <section class="section">
          <h2>{$t('shortcutSettings')}</h2>
          <p class="shortcut-text">{$t('shortcutOpenSidePanel')} <kbd>Alt</kbd>+<kbd>G</kbd></p>
          <button class="link-btn" on:click={openShortcutSettings}>{$t('shortcutChangeInChrome')}</button>
        </section>

        <button
          class="save-button"
          class:success={showSaveSuccess}
          disabled={!canSave}
          on:click={handleSave}
        >
          {showSaveSuccess ? $t('saved') : $t('save')}
        </button>
      </div>
    </div>
  {:else}
    <!-- メイン画面 -->
    <div class="toolbar">
      <button class="settings-btn" on:click={openSettings} title={$t('settings')}>
        {$t('openSettings')}
      </button>
    </div>

    {#if showNotification}
      <div class="notification">
        {$t('copySuccess')}
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
  {/if}
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

  /* メイン画面 */
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
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
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

  /* 設定画面 */
  .settings-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f5f5;
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
  }

  .back-btn {
    background: none;
    border: none;
    font-size: 14px;
    color: #667eea;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .back-btn:hover {
    background: #f0f0f0;
  }

  .settings-header h1 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .section {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .section h2 {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option:hover {
    border-color: #ccc;
  }

  .option.selected {
    border-color: #667eea;
    background: #f8f9ff;
  }

  .option input[type="radio"] {
    accent-color: #667eea;
  }

  .option-label {
    font-size: 13px;
    color: #333;
  }

  .custom-url-section {
    margin-left: 24px;
    margin-top: 4px;
  }

  .url-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 12px;
  }

  .url-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .url-input.error {
    border-color: #e53935;
  }

  .error-message {
    font-size: 11px;
    color: #e53935;
    margin-top: 4px;
  }

  .help-link {
    display: inline-block;
    margin-top: 8px;
    font-size: 12px;
    color: #667eea;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .help-link:hover {
    text-decoration: underline;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .toggle-option input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #667eea;
  }

  .toggle-label {
    font-size: 13px;
    color: #333;
  }

  .shortcut-text {
    font-size: 13px;
    color: #333;
    margin-bottom: 8px;
  }

  kbd {
    display: inline-block;
    padding: 2px 5px;
    font-size: 11px;
    font-family: monospace;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 3px;
  }

  .link-btn {
    font-size: 12px;
    color: #667eea;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .save-button {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .save-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .save-button.success {
    background: #4caf50;
  }
</style>
