import { buildMessages } from '../shared/utils.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'SUMMARIZE') return false;

  handleSummarize(message.transcript, message.videoId)
    .then((summary) => sendResponse({ ok: true, summary }))
    .catch((err) => sendResponse({ ok: false, errorCode: err.message }));

  return true; // keep message channel open for async response
});

/**
 * @param {string} transcript
 * @param {string} videoId
 * @returns {Promise<string>}
 */
async function handleSummarize(transcript, videoId) {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) throw new Error('NO_API_KEY');

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: buildMessages(transcript),
        max_tokens: 1000,
      }),
    });
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  if (response.status === 401) throw new Error('INVALID_API_KEY');
  if (response.status === 429) throw new Error('RATE_LIMITED');
  if (!response.ok) throw new Error('API_ERROR');

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('API_ERROR');
  }

  const summary = data?.choices?.[0]?.message?.content;
  if (!summary) throw new Error('API_ERROR');

  await chrome.storage.session.set({ [`summary_${videoId}`]: summary });

  return summary;
}
