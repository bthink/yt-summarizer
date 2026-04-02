// options/options.js

const input = /** @type {HTMLInputElement} */ (document.getElementById('api-key'));
const btnSave = /** @type {HTMLButtonElement} */ (document.getElementById('btn-save'));
const btnToggle = /** @type {HTMLButtonElement} */ (document.getElementById('btn-toggle'));
const statusEl = /** @type {HTMLParagraphElement} */ (document.getElementById('status'));

/** @param {string} message @param {'success'|'error'} type */
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  setTimeout(() => {
    statusEl.className = 'status hidden';
  }, 3000);
}

async function loadKey() {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (apiKey) {
    input.value = apiKey;
  }
}

function updateToggleState() {
  const isHidden = input.type === 'password';
  btnToggle.textContent = isHidden ? '👁️' : '👁️‍🗨️';
  btnToggle.setAttribute('aria-label', isHidden ? 'Pokaż klucz' : 'Ukryj klucz');
}

btnToggle.addEventListener('click', () => {
  input.type = input.type === 'password' ? 'text' : 'password';
  updateToggleState();
  input.focus();
});

btnSave.addEventListener('click', async () => {
  const key = input.value.trim();
  if (!key) {
    showStatus('Wpisz klucz API', 'error');
    return;
  }
  await chrome.storage.local.set({ apiKey: key });
  showStatus('Zapisano', 'success');
});

loadKey().catch(console.error);
updateToggleState();
