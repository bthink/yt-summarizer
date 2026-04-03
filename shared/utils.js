/**
 * @param {string} url
 * @returns {string | null}
 */
export function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (
      (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') &&
      u.pathname === '/watch'
    ) {
      return u.searchParams.get('v');
    }
  } catch {
    // invalid URL
  }
  return null;
}

/**
 * @param {string} errorCode
 * @returns {string}
 */
export function getErrorMessage(errorCode) {
  const messages = {
    NO_API_KEY: 'Najpierw ustaw klucz API OpenAI w ustawieniach (⚙️)',
    NO_TRANSCRIPT: 'Ten film nie ma dostępnych napisów',
    INVALID_API_KEY: 'Nieprawidłowy klucz API OpenAI',
    RATE_LIMITED: 'Przekroczono limit zapytań. Spróbuj za chwilę',
    NETWORK_ERROR: 'Błąd połączenia. Sprawdź internet',
    API_ERROR: 'Błąd generowania podsumowania. Spróbuj ponownie',
  };
  return messages[errorCode] ?? 'Błąd generowania podsumowania. Spróbuj ponownie';
}

/**
 * @param {string} summary
 * @param {string} videoUrl
 * @returns {string}
 */
export function formatCopyText(summary, videoUrl) {
  return `${summary}\n\nŹródło: ${videoUrl}`;
}

/** @typedef {'pl' | 'en'} Language */

const SYSTEM_PROMPTS = {
  pl: 'Jesteś asystentem streszczającym treść filmów YouTube. Zawsze odpowiadaj po polsku, niezależnie od języka oryginalnego. Format odpowiedzi: najpierw 2-4 zdania wprowadzające, następnie 4-8 punktów z kluczowymi informacjami (każdy punkt zaczynający się od "• "). Pisz zwięźle i rzeczowo.',
  en: 'You are an assistant that summarizes YouTube videos. Always respond in English, regardless of the video\'s original language. Format: first 2-4 introductory sentences, then 4-8 bullet points with key information (each starting with "• "). Be concise and informative.',
};

const USER_PROMPTS = {
  pl: 'Proszę streść poniższy transkrypt:',
  en: 'Please summarize the following transcript:',
};

/**
 * @param {string} transcript
 * @param {Language} [language='pl']
 * @returns {Array<{role: string, content: string}>}
 */
export function buildMessages(transcript, language = 'pl') {
  return [
    {
      role: 'system',
      content: SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.pl,
    },
    {
      role: 'user',
      content: `${USER_PROMPTS[language] ?? USER_PROMPTS.pl}\n\n${transcript}`,
    },
  ];
}
