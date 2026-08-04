/**
 * Utilities for handling map icons (URLs or emojis)
 */

/**
 * Checks if a string is an emoji (not a URL)
 */
export function isEmoji(str: string): boolean {
  // If it looks like a URL or path, it's not an emoji
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('./')) {
    return false;
  }

  // Check if the string contains emoji characters
  // This regex matches most common emoji patterns
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(str);
}

/**
 * Converts an emoji to an SVG data URL for use as a favicon
 */
export function emojiToFaviconUrl(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
