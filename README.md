# Gemini Sidekick

A Chrome extension that embeds Google Gemini in the browser's side panel. Chat with Gemini while browsing — no tab switching needed.

## Why?

| Problem | Gemini Sidekick Solution |
|---------|------------------------|
| Switching tabs to use Gemini | Always available in the side panel (`Alt+G`) |
| Text too small/large in narrow panel | Zoom level adjustment (50%–150%) |
| Copy-pasting text into Gemini is tedious | Auto-copies selected text to clipboard when panel is open |
| Gemini sidebar doesn't scroll in narrow widths | CSS injection fixes scroll in side panel mode |

## Install

1. Clone or download this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `chrome-ext-gemini-sidekick/chrome-mv3/`

Or install from the pre-built zip in `chrome-ext-gemini-sidekick/`.

## Features

### Side Panel Embedding

Opens Gemini (`gemini.google.com`) in Chrome's side panel via iframe. Press `Alt+G` (configurable) to toggle.

### Default View

Choose what to show when opening the side panel:

| Option | Description |
|--------|------------|
| **New Chat** | Standard Gemini screen (default) |
| **Gems List** | Browse your created Gems |
| **Custom URL** | Open a specific Gem directly (`gemini.google.com` domain only) |

### Zoom Level

Adjust the Gemini display size in the side panel from 50% to 150% (10% increments). Useful for fitting content in narrow panel widths.

### Auto-Copy

When the side panel is open, selecting text on any page automatically copies it to your clipboard. A notification bar confirms the copy. Password fields are excluded for security.

### Scroll Fix

Fixes Gemini's left sidebar (chat history, Gems list) scroll being disabled when Chrome detects narrow viewport widths in the side panel.

### i18n

Supports English and Japanese. Auto-detects from browser language or can be set manually.

## Settings

Accessible from the gear icon in the side panel or via `chrome://extensions` → Gemini Sidekick → Options.

| Setting | Default | Description |
|---------|---------|------------|
| Default View | New Chat | Screen shown when panel opens |
| Zoom Level | 100% | Display scale (50%–150%) |
| Auto-Copy | ON | Copy selected text while panel is open |
| Language | Auto | UI language (auto / ja / en) |
| Shortcut | `Alt+G` | Open side panel (configurable in Chrome) |

## Architecture

```
entrypoints/
├── background.ts              # Service Worker: panel open/close tracking via Port
├── content.ts                 # Content Script: auto-copy on text selection (all pages)
├── gemini-scroll.content.ts   # Content Script: scroll fix CSS (gemini.google.com only)
├── sidepanel/                 # Side panel UI (Svelte)
│   └── App.svelte             #   Main view + inline settings
├── options/                   # Options page UI (Svelte)
│   └── App.svelte             #   Full settings page
└── lib/
    ├── settings.ts            # Settings management (chrome.storage.sync)
    ├── i18n.ts                # i18n utility (Svelte store-based)
    └── locales/               # en.ts (source of truth) + ja.ts
```

| Tech | Choice |
|------|--------|
| Framework | [WXT](https://wxt.dev/) (Vite-based) |
| UI | Svelte 4 |
| Manifest | Chrome MV3 |
| Language | TypeScript |

### Chrome APIs Used

| API | Purpose |
|-----|---------|
| `sidePanel` | Panel open/close control |
| `storage.sync` | Persistent settings (synced across devices) |
| `storage.session` | Panel open state sharing with content scripts |
| `declarativeNetRequest` | Remove `X-Frame-Options` / `CSP` headers for Gemini iframe |
| `clipboardWrite` | Auto-copy feature |
| `runtime.connect` / `Port` | Panel lifecycle detection |

### Security Note

To embed Gemini in an iframe, `X-Frame-Options` and `Content-Security-Policy` response headers are removed for `gemini.google.com` sub-frame requests only (`rules.json`). This is scoped to the minimum necessary for the extension to function.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev mode (hot reload)
npm run build        # Production build
npm run zip          # Build + create distribution zip
```

Build output: `../../chrome-ext-gemini-sidekick/chrome-mv3/`

## License

MIT
