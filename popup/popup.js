// popup/popup.js
import { extractVideoId, getErrorMessage, formatCopyText } from '../shared/utils.js';

const VIEWS = ['wrong-page', 'idle', 'loading', 'done', 'error'];

/** @param {string} name */
function showView(name) {
  for (const v of VIEWS) {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== name);
  }
}

/** @param {string} errorCode */
function showError(errorCode) {
  document.getElementById('error-message').textContent = getErrorMessage(errorCode);
  showView('error');
}

/** @returns {Promise<chrome.tabs.Tab>} */
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Injects content.js into the tab (idempotent) and calls the transcript function.
 * @param {number} tabId
 * @returns {Promise<string | null>}
 */
async function fetchTranscript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content.js'],
    });
  } catch {
    return null;
  }

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () =>
        typeof window.__ytSummarizerGetTranscript === 'function'
          ? window.__ytSummarizerGetTranscript()
          : null,
    });
    return result ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {chrome.tabs.Tab} tab
 * @param {string} videoId
 * @param {string} language
 */
async function summarize(tab, videoId, language) {
  showView('loading');

  // Check for cached summary first
  const cacheKey = `summary_${videoId}_${language}`;
  const cached = await chrome.storage.local.get(cacheKey);
  if (cached[cacheKey]) {
    renderSummary(cached[cacheKey], tab.url);
    return;
  }

  const transcript = await fetchTranscript(tab.id);
  if (!transcript) {
    showError('NO_TRANSCRIPT');
    return;
  }

  let response;
  try {
    response = await chrome.runtime.sendMessage({
      type: 'SUMMARIZE',
      transcript,
      videoId,
    });
  } catch {
    showError('NETWORK_ERROR');
    return;
  }

  if (!response?.ok) {
    showError(response?.errorCode ?? 'API_ERROR');
    return;
  }

  renderSummary(response.summary, tab.url);
}

/**
 * @param {string} summary
 * @param {string} videoUrl
 */
function renderSummary(summary, videoUrl) {
  document.getElementById('summary-text').textContent = summary;
  document.getElementById('video-link').textContent = `🔗 ${videoUrl}`;
  showView('done');
}

async function init() {
  const tab = await getCurrentTab();
  const videoId = extractVideoId(tab?.url ?? '');
  const { language = 'pl' } = await chrome.storage.local.get('language');

  // Wire all buttons once - views toggle, listeners stay
  document.getElementById('btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-summarize').addEventListener('click', () => {
    if (videoId) summarize(tab, videoId, language);
  });

  document.getElementById('btn-refresh').addEventListener('click', async () => {
    if (!videoId) return;
    await chrome.storage.local.remove(`summary_${videoId}_${language}`);
    summarize(tab, videoId, language);
  });

  document.getElementById('btn-copy').addEventListener('click', async () => {
    const summary = document.getElementById('summary-text').textContent;
    try {
      await navigator.clipboard.writeText(formatCopyText(summary, tab.url));
      const btn = document.getElementById('btn-copy');
      btn.textContent = '✓ Skopiowano';
      setTimeout(() => {
        btn.textContent = '📋 Kopiuj';
      }, 2000);
    } catch {
      // Clipboard permission denied - fail silently, button label unchanged
    }
  });

  document.getElementById('btn-retry').addEventListener('click', () => {
    if (videoId) summarize(tab, videoId, language);
  });

  if (!videoId) {
    showView('wrong-page');
    return;
  }

  // Show cached summary immediately if available
  const cacheKey = `summary_${videoId}_${language}`;
  const cached = await chrome.storage.local.get(cacheKey);
  if (cached[cacheKey]) {
    renderSummary(cached[cacheKey], tab.url);
    return;
  }

  showView('idle');
}

init().catch(console.error);
