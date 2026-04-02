// options/options.js

const input = /** @type {HTMLInputElement} */ (document.getElementById('api-key'));
const btnSave = document.getElementById('btn-save');
const btnToggle = document.getElementById('btn-toggle');
const statusEl = document.getElementById('status');

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

btnToggle.addEventListener('click', () => {
  input.type = input.type === 'password' ? 'text' : 'password';
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
