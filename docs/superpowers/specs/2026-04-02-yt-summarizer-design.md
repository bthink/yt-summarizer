# YT Summarizer - Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

Chrome extension (Manifest V3) that summarizes YouTube videos using OpenAI GPT-4o mini. The user clicks the extension popup on any YouTube video page, the extension fetches the transcript from the YouTube DOM, sends it to OpenAI, and displays a summary with a copy button. Output language (Polish or English) is configurable in settings.

---

## Architecture

### Approach: Manifest V3 with Service Worker

The popup delegates the OpenAI API call to a background service worker. This means the popup can be closed while generation is in progress - the result is stored in `chrome.storage.local` and displayed when the popup is reopened.

### File Structure

```
ytSummarizer/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── content.js
├── background/
│   └── service-worker.js
├── options/
│   ├── options.html
│   └── options.js
└── icons/
    └── icon16/32/48/128.png
```

### Permissions

- `storage` - for API key and cached summary (`chrome.storage.local`)
- `activeTab` - to read current tab URL
- `scripting` - to inject content script on demand

### Data Flow

1. User opens popup on `youtube.com/watch?v=...`
2. Popup sends `GET_TRANSCRIPT` message to content script via `chrome.scripting.executeScript`
3. Content script parses YouTube DOM and returns plain transcript text
4. Popup sends `SUMMARIZE` message to service worker with `{ transcript, videoUrl }`
5. Service worker reads API key from `chrome.storage.local`, calls OpenAI API
6. Service worker stores result in `chrome.storage.local` keyed by `summary_${videoId}_${language}`
7. Popup reads result and renders it

---

## UI

### Popup (380px wide)

**States:**

| State | Display |
|---|---|
| `idle` | "Podsumuj ten odcinek" button, no result |
| `loading` | Spinner + "Generowanie podsumowania..." |
| `done` | Summary + link + Kopiuj / Odśwież buttons |
| `error` | Error message (see error handling) |
| `wrong_page` | "Otwórz film na YouTube, żeby użyć wtyczki" |

**Done state layout:**
```
[paragraph introduction]

• Bullet point 1
• Bullet point 2
• Bullet point N

🔗 https://youtube.com/watch?v=...

[📋 Kopiuj]  [🔄 Odśwież]
```

**Copied text format:**
```
[paragraph]

• Punkt 1
• Punkt 2

Źródło: https://youtube.com/watch?v=...
```

No external UI frameworks - plain HTML/CSS/JS.

### Options Page

Accessible via ⚙️ icon in popup header. Contains:
- OpenAI API key input (masked, with show/hide toggle)
- Output language selector: Polski / English (default: Polski)
- Save button
- Status indicator (saved / error)

---

## OpenAI Integration

- **Model:** `gpt-4o-mini`
- **Language:** Configurable - Polish or English (stored as `language: 'pl' | 'en'` in `chrome.storage.local`, default `'pl'`)
- **Prompt structure:**
  - System: instruct to summarize in the selected language, output format = short paragraph + bullet points
  - User: transcript text (prompt wording also matches selected language)
- **Summary format:** 2-4 sentence introduction paragraph + 4-8 bullet points with key takeaways
- **API key storage:** `chrome.storage.local` - never passed to content script, only used in service worker
- **Cache key:** `summary_${videoId}_${language}` - language is included to prevent stale cross-language cache hits

---

## Transcript Extraction

Content script (`content.js`) reads the transcript from YouTube's DOM:
- YouTube renders transcript text in the transcript panel
- The script triggers opening of the transcript panel if needed, then reads the text nodes
- Returns plain text (timestamps stripped)
- If no transcript is available, returns `null`

---

## Error Handling

| Situation | User-facing message |
|---|---|
| Not on a YouTube video page | "Otwórz film na YouTube, żeby użyć wtyczki" |
| No API key set | "Najpierw ustaw klucz API OpenAI w ustawieniach (⚙️)" |
| No transcript available | "Ten film nie ma dostępnych napisów" |
| OpenAI 401 | "Nieprawidłowy klucz API OpenAI" |
| OpenAI 429 | "Przekroczono limit zapytań. Spróbuj za chwilę" |
| Network error | "Błąd połączenia. Sprawdź internet" |
| OpenAI other error | "Błąd generowania podsumowania. Spróbuj ponownie" |

---

## Security

- API key stored only in `chrome.storage.local` (device-local, not synced)
- API key accessed only by service worker - never exposed to content script or popup JS
- No external services other than `api.openai.com`
- Content script has no access to storage

---

## Out of Scope

- Summary history / bulk management of persisted summaries
- Support for YouTube Shorts
- Video chapters awareness
- Summary length settings
