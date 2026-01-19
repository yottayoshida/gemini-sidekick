import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: '../../chrome-ext-gemini-sidekick',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Gemini Sidekick',
    description: 'サイドパネルでGeminiを使う',
    icons: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon16.png',
        48: 'icons/icon48.png',
      },
      default_title: 'Gemini Sidekick',
    },
    permissions: [
      'sidePanel',
      'declarativeNetRequest',
      'clipboardWrite',  // クリップボード書き込み権限
    ],
    host_permissions: [
      'https://gemini.google.com/*',
    ],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_1',
          enabled: true,
          path: 'rules.json',
        },
      ],
    },
  },
});
