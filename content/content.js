// content/content.js
// Sets window.__ytSummarizerGetTranscript for popup to call.

window.__ytSummarizerGetTranscript = async function () {
  const MAX_WAIT_MS = 6000;
  const POLL_INTERVAL_MS = 200;

  function getSegments() {
    return document.querySelectorAll('ytd-transcript-segment-renderer');
  }

  function extractText(segments) {
    return Array.from(segments)
      .map((seg) => {
        const el = seg.querySelector('.segment-text');
        return el ? el.textContent.trim() : '';
      })
      .filter(Boolean)
      .join(' ');
  }

  /** @returns {Promise<NodeList | null>} */
  function waitForSegments() {
    return new Promise((resolve) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const segs = getSegments();
        if (segs.length > 0) {
          clearInterval(timer);
          resolve(segs);
          return;
        }
        if (Date.now() - start >= MAX_WAIT_MS) {
          clearInterval(timer);
          resolve(null);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  function findTranscriptButton() {
    // Method 1: button inside the transcript section in the description area
    const section = document.querySelector(
      'ytd-video-description-transcript-section-renderer'
    );
    if (section) {
      const btn = section.querySelector('button');
      if (btn) return btn;
    }

    // Method 2: yt-description-preview-view-model (newer YouTube layout)
    const preview = document.querySelector('yt-description-preview-view-model');
    if (preview) {
      for (const btn of preview.querySelectorAll('button')) {
        if ((btn.textContent || '').toLowerCase().includes('transcript')) return btn;
      }
    }

    // Method 3: any button with "transcript" or "transkrypt" text
    for (const btn of document.querySelectorAll('button, [role="button"]')) {
      const text = (btn.textContent || '').toLowerCase().trim();
      if (text === 'show transcript' || text === 'transkrypt' || text === 'transcript') {
        return btn;
      }
    }

    return null;
  }

  // Return immediately if transcript panel is already open
  let segments = getSegments();
  if (segments.length > 0) {
    return extractText(segments);
  }

  const button = findTranscriptButton();
  if (!button) return null;

  button.click();

  segments = await waitForSegments();
  if (!segments || segments.length === 0) return null;

  return extractText(segments);
};
