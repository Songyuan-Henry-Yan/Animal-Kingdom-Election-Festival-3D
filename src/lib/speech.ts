/**
 * "Read to me" — uses the browser's built-in speechSynthesis (no external API,
 * no downloads). Perfect for pre-readers in Story Mode. Always optional.
 */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Strip emoji/symbols so the voice doesn't announce "party popper". */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, ' ')
    .replace(/[·—•▸▾✕✓]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakText(text: string, onEnd?: () => void): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
  u.lang = 'en-US';
  u.rate = 0.95;
  u.pitch = 1.05;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

export function stopSpeech(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return canSpeak() && window.speechSynthesis.speaking;
}
