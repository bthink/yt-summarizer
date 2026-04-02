import { describe, it, expect } from 'vitest';
import {
  extractVideoId,
  getErrorMessage,
  formatCopyText,
  buildMessages,
} from '../shared/utils.js';

describe('extractVideoId', () => {
  it('extracts video ID from standard YouTube URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
  });

  it('extracts video ID from URL without www', () => {
    expect(extractVideoId('https://youtube.com/watch?v=xyz789')).toBe('xyz789');
  });

  it('returns null for non-YouTube URL', () => {
    expect(extractVideoId('https://example.com/watch?v=abc')).toBeNull();
  });

  it('returns null for YouTube homepage', () => {
    expect(extractVideoId('https://www.youtube.com/')).toBeNull();
  });

  it('returns null for YouTube channel URL', () => {
    expect(extractVideoId('https://www.youtube.com/channel/UCxyz')).toBeNull();
  });

  it('returns null for invalid string', () => {
    expect(extractVideoId('not a url')).toBeNull();
  });
});

describe('getErrorMessage', () => {
  it('returns Polish message for NO_API_KEY', () => {
    expect(getErrorMessage('NO_API_KEY')).toContain('ustaw klucz API');
  });

  it('returns Polish message for NO_TRANSCRIPT', () => {
    expect(getErrorMessage('NO_TRANSCRIPT')).toContain('napisów');
  });

  it('returns Polish message for INVALID_API_KEY', () => {
    expect(getErrorMessage('INVALID_API_KEY')).toContain('Nieprawidłowy');
  });

  it('returns Polish message for RATE_LIMITED', () => {
    expect(getErrorMessage('RATE_LIMITED')).toContain('limit');
  });

  it('returns Polish message for NETWORK_ERROR', () => {
    expect(getErrorMessage('NETWORK_ERROR')).toContain('połączenia');
  });

  it('returns fallback message for unknown error code', () => {
    expect(getErrorMessage('UNKNOWN')).toBe('Błąd generowania podsumowania. Spróbuj ponownie');
  });
});

describe('formatCopyText', () => {
  it('appends Źródło label and video URL after summary', () => {
    const result = formatCopyText('Streszczenie.', 'https://youtube.com/watch?v=abc');
    expect(result).toBe('Streszczenie.\n\nŹródło: https://youtube.com/watch?v=abc');
  });
});

describe('buildMessages', () => {
  it('returns exactly 2 messages', () => {
    expect(buildMessages('transcript')).toHaveLength(2);
  });

  it('first message has role system', () => {
    expect(buildMessages('transcript')[0].role).toBe('system');
  });

  it('second message has role user', () => {
    expect(buildMessages('transcript')[1].role).toBe('user');
  });

  it('includes transcript text in user message', () => {
    expect(buildMessages('my transcript')[1].content).toContain('my transcript');
  });

  it('system prompt instructs Polish language response', () => {
    expect(buildMessages('x')[0].content.toLowerCase()).toContain('polsk');
  });

  it('system prompt mentions bullet points format', () => {
    expect(buildMessages('x')[0].content).toContain('•');
  });
});
