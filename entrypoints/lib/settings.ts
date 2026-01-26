// 設定管理ユーティリティ
// Chrome Storage APIを使用して設定を保存・読み込み

import type { LanguageSetting } from './i18n';

export type DefaultView = 'gemini' | 'gems' | 'custom';

export interface GeminiSettings {
  defaultView: DefaultView;
  customGemUrl: string;
  autoCopyEnabled: boolean;
  language: LanguageSetting;
}

export const DEFAULT_SETTINGS: GeminiSettings = {
  defaultView: 'gemini',
  customGemUrl: '',
  autoCopyEnabled: true,
  language: 'auto',
};

// URL定義
export const URLS = {
  gemini: 'https://gemini.google.com/app',
  gems: 'https://gemini.google.com/gems/view',
} as const;

// 設定から表示URLを解決
export function resolveUrl(settings: GeminiSettings): string {
  switch (settings.defaultView) {
    case 'gemini':
      return URLS.gemini;
    case 'gems':
      return URLS.gems;
    case 'custom':
      return settings.customGemUrl || URLS.gemini;
    default:
      return URLS.gemini;
  }
}

// 設定を読み込み
export async function loadSettings(): Promise<GeminiSettings> {
  try {
    const result = await chrome.storage.sync.get('settings');
    const stored = result.settings as GeminiSettings | undefined;
    // 既存設定がある場合はデフォルトとマージ（新しいプロパティ対応）
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// 設定を保存
export async function saveSettings(settings: GeminiSettings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

// URLバリデーション (returns error key for i18n)
export function validateGemUrl(url: string): { valid: boolean; errorKey?: string } {
  if (!url.trim()) {
    return { valid: false, errorKey: 'errorUrlRequired' };
  }

  try {
    const parsed = new URL(url);

    // gemini.google.comドメインかチェック
    if (parsed.hostname !== 'gemini.google.com') {
      return {
        valid: false,
        errorKey: 'errorUrlInvalidDomain'
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, errorKey: 'errorUrlInvalid' };
  }
}

// デフォルト画面の選択肢 (keys for i18n)
export const VIEW_OPTIONS = [
  {
    value: 'gemini' as DefaultView,
    labelKey: 'viewGemini',
    descKey: 'viewGeminiDesc'
  },
  {
    value: 'gems' as DefaultView,
    labelKey: 'viewGems',
    descKey: 'viewGemsDesc'
  },
  {
    value: 'custom' as DefaultView,
    labelKey: 'viewCustom',
    descKey: 'viewCustomDesc'
  },
] as const;

// 言語設定の選択肢 (keys for i18n)
export const LANGUAGE_OPTIONS = [
  {
    value: 'auto' as LanguageSetting,
    labelKey: 'languageAuto',
    descKey: 'languageAutoDesc'
  },
  {
    value: 'ja' as LanguageSetting,
    labelKey: 'languageJapanese',
    descKey: ''
  },
  {
    value: 'en' as LanguageSetting,
    labelKey: 'languageEnglish',
    descKey: ''
  },
] as const;
