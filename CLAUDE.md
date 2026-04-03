# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ytSummarizer** - Chrome extension (Manifest V3) that summarizes YouTube videos in Polish using OpenAI gpt-4o-mini.

## Stack

- **Extension:** Chrome MV3, vanilla JS (ES modules), no frameworks
- **API:** OpenAI REST (`gpt-4o-mini`), called from service worker only
- **Tests:** Vitest (unit tests for pure functions in `shared/utils.js`)
- **Dev tooling:** pnpm, sharp (icon generation)

## Architecture

- `manifest.json` - MV3 manifest; service worker declared with `"type": "module"`
- `shared/utils.js` - Pure functions: `extractVideoId`, `getErrorMessage`, `formatCopyText`, `buildMessages`
- `content/content.js` - Classic script injected into YouTube tab via `chrome.scripting.executeScript`; sets `window.__ytSummarizerGetTranscript`
- `background/service-worker.js` - ES module; receives `SUMMARIZE` message, calls OpenAI, caches result in `chrome.storage.local`
- `popup/popup.js` - ES module; state machine (wrong-page / idle / loading / done / error), drives UI
- `options/options.js` - ES module; API key save/load with show/hide toggle

## Key conventions

- API key stored only in `chrome.storage.local` - never passed to content script
- Summary cached in `chrome.storage.local` keyed as `summary_${videoId}_${language}` - persists across popup opens and browser restarts
- `popup.js` and `service-worker.js` import from `shared/utils.js`
- `content.js` is self-contained (no imports - injected as classic script)
- All UI text is Polish

## Spec and plan

- Design spec: `docs/superpowers/specs/2026-04-02-yt-summarizer-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-02-yt-summarizer.md`
