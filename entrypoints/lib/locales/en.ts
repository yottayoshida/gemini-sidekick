// English translations (base language)
// This is the source of truth for translation keys

export const en = {
  // === Common ===
  settings: 'Settings',
  save: 'Save',
  saved: 'Saved',
  saving: 'Saving...',
  back: 'Back',

  // === Sidepanel ===
  openSettings: 'Open Settings',
  copySuccess: 'Copied! Paste into Gemini',

  // === Settings: Default View ===
  settingsTitle: 'Settings',
  defaultView: 'Default View',
  defaultViewDesc: 'Screen to show when opening the side panel',
  viewGemini: 'New Chat',
  viewGeminiDesc: 'Standard Gemini screen',
  viewGems: 'Gems List',
  viewGemsDesc: 'Show list of Gems',
  viewCustom: 'Specific Gem (enter URL)',
  viewCustomDesc: 'Open a specific Gem directly',
  currentSetting: 'Current',
  customUrlPlaceholder: 'https://gemini.google.com/gem/...',
  openGemini: 'Check URL in Gemini →',

  // === Settings: URL Validation ===
  errorUrlRequired: 'Please enter a URL',
  errorUrlInvalidDomain: 'Please enter a gemini.google.com URL',
  errorUrlInvalid: 'Please enter a valid URL',

  // === Settings: Display ===
  displaySettings: 'Display',
  zoomLevel: 'Zoom Level',
  zoomLevelDesc: 'Adjust the display size of Gemini in the side panel',
  zoomLevelValue: '{value}%',

  // === Settings: Behavior ===
  behaviorSettings: 'Behavior',
  autoCopyEnabled: 'Auto-copy on text selection',
  autoCopyDesc: 'Automatically copies selected text to clipboard',

  // === Settings: Language ===
  languageSettings: 'Language',
  languageAuto: 'Auto',
  languageAutoDesc: 'Follow browser language',
  languageAutoCurrent: 'Auto (Current: {lang})',
  languageJapanese: '日本語',
  languageEnglish: 'English',

  // === Settings: Shortcut ===
  shortcutSettings: 'Shortcut',
  shortcutOpenSidePanel: 'Open side panel:',
  shortcutChangeInChrome: 'Change in Chrome settings →',
  shortcutNote: '* Opens settings in a new tab',

  // === Options Page ===
  optionsTitle: 'Gemini Sidekick Settings',
} as const;

export type TranslationKeys = keyof typeof en;
