// Gemini Scroll Fix - サイドパネル表示時のスクロール問題を修正
// Geminiの左サイドバー（会話履歴）がサイドパネルの狭い幅でもスクロールできるようにする

export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  allFrames: true, // iframe内でも実行（サイドパネル対応）
  runAt: 'document_start', // 早期に注入してレイアウトシフトを防ぐ
  main() {
    // CSSを注入
    const style = document.createElement('style');
    style.id = 'gemini-sidekick-scroll-fix';
    style.textContent = `
      /* ==============================================
       * Gemini Sidekick - Scroll Fix for Side Panel
       *
       * サイドパネル（狭い幅）でモバイル判定されて
       * スクロールが無効化される問題を修正
       * ============================================== */

      /* =============================================
       * 主要ターゲット: overflow-container
       * data-test-id="overflow-container" がスクロール領域のルート
       * ============================================= */
      .overflow-container,
      [data-test-id="overflow-container"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* =============================================
       * infinite-scroller カスタム要素
       * 会話履歴とGemリストを含む無限スクロール領域
       * ============================================= */
      infinite-scroller {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* =============================================
       * 会話履歴エリア
       * ============================================= */
      .chat-history,
      .chat-history-list,
      .conversations-container,
      [id^="conversations-list"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* =============================================
       * Gem リストエリア
       * ============================================= */
      .bots-list-container,
      .gems-list-container {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* =============================================
       * サイドナビゲーション関連
       * ============================================= */
      .side-nav-entry-container,
      [class*="side-nav"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* =============================================
       * スクロールバーのスタイリング（細めで邪魔にならないように）
       * ============================================= */
      .overflow-container::-webkit-scrollbar,
      [data-test-id="overflow-container"]::-webkit-scrollbar,
      infinite-scroller::-webkit-scrollbar {
        width: 6px;
      }

      .overflow-container::-webkit-scrollbar-track,
      [data-test-id="overflow-container"]::-webkit-scrollbar-track,
      infinite-scroller::-webkit-scrollbar-track {
        background: transparent;
      }

      .overflow-container::-webkit-scrollbar-thumb,
      [data-test-id="overflow-container"]::-webkit-scrollbar-thumb,
      infinite-scroller::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
      }

      .overflow-container::-webkit-scrollbar-thumb:hover,
      [data-test-id="overflow-container"]::-webkit-scrollbar-thumb:hover,
      infinite-scroller::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    `;

    // document.headがまだない場合はdocumentElementに追加
    const target = document.head || document.documentElement;
    target.appendChild(style);

    // DOMが完全に読み込まれた後に再度確認（動的にスタイルが上書きされる可能性があるため）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        ensureStyleExists();
      });
    }

    // MutationObserverでスタイルが削除された場合に再注入
    const observer = new MutationObserver(() => {
      ensureStyleExists();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    function ensureStyleExists() {
      if (!document.getElementById('gemini-sidekick-scroll-fix')) {
        const newTarget = document.head || document.documentElement;
        newTarget.appendChild(style.cloneNode(true));
      }
    }
  },
});
