// i18n utility for Svelte components
// Supports language override via settings

import { writable, derived, get } from 'svelte/store';
import { en, ja, type TranslationKeys } from './locales';

// Supported locales
export type Locale = 'en' | 'ja';
export type LanguageSetting = 'auto' | Locale;

// Locale data
const locales = { en, ja } as const;

// Current locale store (reactive)
export const currentLocale = writable<Locale>('en');

// Normalize locale code (e.g., 'ja-JP' -> 'ja')
export function normalizeLocale(locale: string): Locale {
  if (locale.startsWith('ja')) return 'ja';
  return 'en'; // Default to English for all other languages
}

// Get browser/Chrome locale
export function getBrowserLocale(): Locale {
  try {
    const uiLang = chrome.i18n.getUILanguage();
    return normalizeLocale(uiLang);
  } catch {
    // Fallback for non-extension context (e.g., testing)
    return normalizeLocale(navigator.language);
  }
}

// Resolve effective locale from language setting
export function resolveLocale(languageSetting: LanguageSetting): Locale {
  if (languageSetting === 'auto') {
    return getBrowserLocale();
  }
  return languageSetting;
}

// Initialize i18n with language setting
export function initLocale(languageSetting: LanguageSetting): void {
  const locale = resolveLocale(languageSetting);
  currentLocale.set(locale);
}

// Update locale when settings change
export function updateLocale(languageSetting: LanguageSetting): void {
  initLocale(languageSetting);
}

// Get current locale value (non-reactive)
export function getLocale(): Locale {
  return get(currentLocale);
}

// Translation function (reactive via store)
// Use this in Svelte components with $t('key')
export const t = derived(currentLocale, ($locale) => {
  return (key: TranslationKeys, params?: Record<string, string>): string => {
    let text = locales[$locale]?.[key] || locales.en[key] || key;

    // Replace placeholders like {lang}
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }

    // Development warning for missing translations
    if (import.meta.env.DEV && !locales[$locale]?.[key]) {
      console.warn(`[i18n] Missing translation: ${key} for locale: ${$locale}`);
    }

    return text;
  };
});

// Non-reactive translation function (for use outside Svelte reactive context)
export function translate(key: TranslationKeys, params?: Record<string, string>): string {
  const locale = get(currentLocale);
  let text = locales[locale]?.[key] || locales.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }

  return text;
}

// Get display name for current locale (for "Auto (Current: XX)" display)
export function getLocaleDisplayName(locale: Locale): string {
  return locale === 'ja' ? '日本語' : 'English';
}
