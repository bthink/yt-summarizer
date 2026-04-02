# Pitfalls

## Chrome MV3 - service worker ES modules

**[CONFIRMED]** Service worker supports `import` only when manifest declares `"type": "module"` in the `background` entry:
```json
"background": { "service_worker": "background/service-worker.js", "type": "module" }
```
Without it, `import` throws a SyntaxError at load time.

## Chrome MV3 - executeScript return value from async function

**[CONFIRMED]** When `chrome.scripting.executeScript({ func })` is called with a function that returns a Promise, Chrome awaits it and the resolved value is what comes back in `results[0].result`. Works since Chrome 99. The content script uses this to let popup `await` the async transcript extraction.

## Chrome MV3 - content scripts cannot use ES modules

**[CONFIRMED]** Scripts injected via `executeScript({ files: [...] })` are classic scripts - no `import`/`export`. They run in the page's global scope. The pattern used here: assign to `window.__ytSummarizerGetTranscript`, then call it in a second `executeScript({ func })` invocation.

## Chrome MV3 - sendMessage response can be undefined

**[CONFIRMED]** If the service worker is unavailable (first activation, extension update, crash), `chrome.runtime.sendMessage` can throw OR return `undefined`. Always null-guard the response:
```javascript
const response = await chrome.runtime.sendMessage(...);
if (!response?.ok) { ... }
```

## YouTube - transcript button textContent has whitespace

**[OBSERVED]** YouTube renders transcript buttons with child icon elements, causing `textContent.trim()` to produce strings like `"Show\ntranscript"` instead of `"Show transcript"`. Use `.includes('transcript')` not strict equality. Add a length bound (`< 50`) to avoid false matches on longer labels.

## DOM - textContent can be null

**[HYPOTHESIS]** `element.textContent` is typed as `string | null` in the DOM spec. On detached/partially-initialized nodes it can be `null`. Use `element.textContent ?? ''` before calling `.trim()`.

## Polish declension

**[CONFIRMED]** "dostępnych napisów" (genitive plural) not "dostępnych napisy" (nominative). Polish declension applies after negated verbs and after genitive-requiring prepositions. Test assertions should use the correct form to actually catch regressions.
