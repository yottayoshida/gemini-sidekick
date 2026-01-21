// 設定管理ユーティリティ
// Chrome Storage APIを使用して設定を保存・読み込み

export type DefaultView = 'gemini' | 'gems' | 'custom';

export interface GeminiSettings {
  defaultView: DefaultView;
  customGemUrl: string;
  autoCopyEnabled: boolean;
}

export const DEFAULT_SETTINGS: GeminiSettings = {
  defaultView: 'gemini',
  customGemUrl: '',
  autoCopyEnabled: true,
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
    return result.settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// 設定を保存
export async function saveSettings(settings: GeminiSettings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

// URLバリデーション
export function validateGemUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: false, error: 'URLを入力してください' };
  }

  try {
    const parsed = new URL(url);

    // gemini.google.comドメインかチェック
    if (parsed.hostname !== 'gemini.google.com') {
      return {
        valid: false,
        error: 'gemini.google.com のURLを入力してください'
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: '有効なURLを入力してください' };
  }
}

// デフォルト画面の選択肢
export const VIEW_OPTIONS = [
  {
    value: 'gemini' as DefaultView,
    label: '新しいチャット画面',
    description: 'Geminiの通常画面'
  },
  {
    value: 'gems' as DefaultView,
    label: 'Gemsの一覧画面',
    description: 'Gemの一覧を表示'
  },
  {
    value: 'custom' as DefaultView,
    label: '指定したGem（URLを入力）',
    description: '特定のGemを直接開く'
  },
] as const;
