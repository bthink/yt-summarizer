# YT Summarizer

A Chrome extension that summarizes YouTube videos using OpenAI's `gpt-4o-mini` model. Open a YouTube video, click the extension icon, and get a concise summary in seconds.

## Features

- Summarizes any YouTube video that has subtitles/captions available
- Output language selectable: Polish or English (configured in settings)
- Summary format: 2-4 intro sentences + 4-8 bullet points with key information
- One-click copy of the summary to clipboard
- Results cached per session (no repeated API calls for the same video)

## Requirements

- Google Chrome (or any Chromium-based browser)
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Installation

This extension is not published on the Chrome Web Store. Install it manually in developer mode:

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the project folder

## Setup

After installing the extension:

1. Click the extension icon in the Chrome toolbar
2. Click the **Settings** gear icon (or right-click the extension icon → *Options*)
3. Paste your OpenAI API key
4. Select the output language (Polski / English)
5. Click **Save**

The key is stored locally in `chrome.storage.local` and never leaves your browser except in requests to `api.openai.com`.

## Usage

1. Open any YouTube video
2. Click the **YT Summarizer** icon in the toolbar
3. Click **Summarize** - the extension fetches the transcript and sends it to OpenAI
4. Read the summary or click **Copy** to copy it to clipboard

If the video has no available captions, the extension will display an error.

## Tech stack

- Chrome Manifest V3, vanilla JS (ES modules)
- OpenAI REST API (`gpt-4o-mini`)
- Vitest for unit tests

## Development

```bash
pnpm install
pnpm test          # run unit tests
pnpm run icons     # regenerate icons from source SVG
```

Load the project folder as an unpacked extension (see Installation above). After any code change, go to `chrome://extensions` and click the reload button on the extension card.

## Project structure

```
background/service-worker.js   # fetches transcript, calls OpenAI, caches result
content/content.js             # injected into YouTube tab, exposes transcript getter
popup/popup.html + popup.js    # extension popup UI and state machine
options/options.html + .js     # API key settings page
shared/utils.js                # pure utility functions (tested)
```

## Privacy

- Your OpenAI API key is stored only in your browser's local storage.
- Video transcripts are sent to `api.openai.com` for summarization - no other third party receives your data.
- No analytics, no telemetry, no external services beyond OpenAI.

## License

MIT
