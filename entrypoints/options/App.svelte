<script lang="ts">
  import { onMount } from 'svelte';
  import {
    type GeminiSettings,
    type DefaultView,
    DEFAULT_SETTINGS,
    VIEW_OPTIONS,
    loadSettings,
    saveSettings,
    validateGemUrl,
  } from '../lib/settings';

  let settings: GeminiSettings = { ...DEFAULT_SETTINGS };
  let originalSettings: GeminiSettings = { ...DEFAULT_SETTINGS };
  let urlError = '';
  let showSaveSuccess = false;
  let isSaving = false;

  onMount(async () => {
    settings = await loadSettings();
    originalSettings = { ...settings };
    validateUrl();
  });

  function handleViewChange(value: DefaultView) {
    settings.defaultView = value;
    if (value !== 'custom') {
      urlError = '';
    } else {
      validateUrl();
    }
  }

  function handleUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    settings.customGemUrl = target.value;
    validateUrl();
  }

  function validateUrl() {
    if (settings.defaultView !== 'custom') {
      urlError = '';
      return;
    }
    const result = validateGemUrl(settings.customGemUrl);
    urlError = result.error || '';
  }

  async function handleSave() {
    if (settings.defaultView === 'custom' && urlError) {
      return;
    }

    isSaving = true;
    try {
      await saveSettings(settings);
      originalSettings = { ...settings };
      showSaveSuccess = true;
      setTimeout(() => {
        showSaveSuccess = false;
      }, 2000);
    } finally {
      isSaving = false;
    }
  }

  function openShortcutSettings() {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }

  function openGemini() {
    chrome.tabs.create({ url: 'https://gemini.google.com/gems' });
  }

  $: hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
  $: canSave = hasChanges && (settings.defaultView !== 'custom' || !urlError);
</script>

<div class="container">
  <h1>Gemini Sidekick 設定</h1>

  <section class="section">
    <h2>デフォルト画面</h2>
    <p class="description">サイドパネルを開いたときに表示する画面</p>

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
          <div class="option-content">
            <span class="option-label">
              {option.label}
              {#if originalSettings.defaultView === option.value}
                <span class="current-badge">現在の設定</span>
              {/if}
            </span>
            <span class="option-desc">{option.description}</span>
          </div>
        </label>

        {#if option.value === 'custom'}
          <div class="custom-url-section" class:visible={settings.defaultView === 'custom'}>
            <input
              type="url"
              class="url-input"
              class:error={urlError}
              placeholder="https://gemini.google.com/gem/..."
              value={settings.customGemUrl}
              on:input={handleUrlInput}
              disabled={settings.defaultView !== 'custom'}
            />
            {#if urlError && settings.defaultView === 'custom'}
              <p class="error-message">⚠️ {urlError}</p>
            {/if}
            <button class="help-link" on:click={openGemini} type="button">
              GeminiでURLを確認 →
            </button>
          </div>
        {/if}
      {/each}
    </div>
  </section>

  <section class="section">
    <h2>動作設定</h2>
    <label class="toggle-option">
      <input
        type="checkbox"
        bind:checked={settings.autoCopyEnabled}
      />
      <div class="toggle-content">
        <span class="toggle-label">テキスト選択時に自動コピー</span>
        <span class="toggle-desc">ページ上でテキストを選択すると自動でクリップボードにコピーします</span>
      </div>
    </label>
  </section>

  <section class="section">
    <h2>ショートカット</h2>
    <div class="shortcut-info">
      <p>サイドパネルを開く: <kbd>Alt</kbd> + <kbd>G</kbd></p>
      <button class="link-button" on:click={openShortcutSettings} type="button">
        Chrome設定で変更 →
      </button>
      <p class="note">※ 新しいタブで設定画面が開きます</p>
    </div>
  </section>

  <div class="save-section">
    <button
      class="save-button"
      class:success={showSaveSuccess}
      disabled={!canSave || isSaving}
      on:click={handleSave}
    >
      {#if showSaveSuccess}
        ✓ 保存しました
      {:else if isSaving}
        保存中...
      {:else}
        保存する
      {/if}
    </button>
  </div>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .container {
    max-width: 500px;
    margin: 0 auto;
    padding: 24px;
  }

  h1 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
  }

  .section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .description {
    font-size: 12px;
    color: #666;
    margin-bottom: 16px;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
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
    margin-top: 2px;
    accent-color: #667eea;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .current-badge {
    font-size: 10px;
    font-weight: 500;
    color: #667eea;
    background: #e8ebff;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .option-desc {
    font-size: 12px;
    color: #666;
  }

  .custom-url-section {
    margin-left: 32px;
    margin-top: -4px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    display: none;
  }

  .custom-url-section.visible {
    display: block;
  }

  .url-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
    transition: border-color 0.2s;
  }

  .url-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .url-input.error {
    border-color: #e53935;
  }

  .url-input:disabled {
    background: #f5f5f5;
    color: #999;
  }

  .error-message {
    font-size: 12px;
    color: #e53935;
    margin-top: 6px;
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

  .shortcut-info p {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  kbd {
    display: inline-block;
    padding: 2px 6px;
    font-size: 12px;
    font-family: monospace;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 1px 0 #ccc;
  }

  .link-button {
    font-size: 13px;
    color: #667eea;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .link-button:hover {
    text-decoration: underline;
  }

  .note {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
  }

  .save-section {
    margin-top: 8px;
  }

  .save-button {
    width: 100%;
    padding: 14px;
    font-size: 15px;
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
    transform: translateY(-1px);
  }

  .save-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  .save-button.success {
    background: #4caf50;
  }

  .toggle-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
  }

  .toggle-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: #667eea;
    cursor: pointer;
  }

  .toggle-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .toggle-desc {
    font-size: 12px;
    color: #666;
  }
</style>
