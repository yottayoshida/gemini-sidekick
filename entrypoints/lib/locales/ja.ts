// Japanese translations
// Type-checked against en.ts to prevent missing keys

import type { TranslationKeys } from './en';

export const ja: Record<TranslationKeys, string> = {
  // === Common ===
  settings: '設定',
  save: '保存する',
  saved: '✓ 保存しました',
  saving: '保存中...',
  back: '← 戻る',

  // === Sidepanel ===
  openSettings: '⚙️ 設定',
  copySuccess: '✅ コピー完了！Geminiに貼り付けてね',

  // === Settings: Default View ===
  settingsTitle: '設定',
  defaultView: 'デフォルト画面',
  defaultViewDesc: 'サイドパネルを開いたときに表示する画面',
  viewGemini: '新しいチャット画面',
  viewGeminiDesc: 'Geminiの通常画面',
  viewGems: 'Gemsの一覧画面',
  viewGemsDesc: 'Gemの一覧を表示',
  viewCustom: '指定したGem（URLを入力）',
  viewCustomDesc: '特定のGemを直接開く',
  currentSetting: '現在の設定',
  customUrlPlaceholder: 'https://gemini.google.com/gem/...',
  openGemini: 'GeminiでURLを確認 →',

  // === Settings: URL Validation ===
  errorUrlRequired: 'URLを入力してください',
  errorUrlInvalidDomain: 'gemini.google.com のURLを入力してください',
  errorUrlInvalid: '有効なURLを入力してください',

  // === Settings: Display ===
  displaySettings: '表示設定',
  zoomLevel: 'ズームレベル',
  zoomLevelDesc: 'サイドパネル内のGeminiの表示サイズを調整します',
  zoomLevelValue: '{value}%',

  // === Settings: Behavior ===
  behaviorSettings: '動作設定',
  autoCopyEnabled: 'テキスト選択時に自動コピー',
  autoCopyDesc: 'ページ上でテキストを選択すると自動でクリップボードにコピーします',

  // === Settings: Language ===
  languageSettings: '表示言語',
  languageAuto: '自動',
  languageAutoDesc: 'ブラウザの言語設定に合わせる',
  languageAutoCurrent: '自動（現在: {lang}）',
  languageJapanese: '日本語',
  languageEnglish: 'English',

  // === Settings: Shortcut ===
  shortcutSettings: 'ショートカット',
  shortcutOpenSidePanel: 'サイドパネルを開く:',
  shortcutChangeInChrome: 'Chrome設定で変更 →',
  shortcutNote: '※ 新しいタブで設定画面が開きます',

  // === Options Page ===
  optionsTitle: 'Gemini Sidekick 設定',
};
