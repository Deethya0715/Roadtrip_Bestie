/**
 * Free Dictionary API wrapper for the "Ghost Word Chain" game.
 *
 * No API key required. Endpoint:
 *   https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 *
 * Returns:
 *   - 200 + JSON array  -> real English word
 *   - 404               -> not a word
 */

const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

/**
 * @param {string} word
 * @returns {Promise<boolean>} true when the word exists in the dictionary.
 */
export async function isValidWord(word) {
  if (!word || typeof word !== "string") return false;

  const cleaned = word.trim().toLowerCase();
  if (!/^[a-z]+$/.test(cleaned)) return false;

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(cleaned)}`);
    if (res.status === 404) return false;
    if (!res.ok) return false;

    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.warn("Dictionary lookup failed", err);
    return false;
  }
}

/**
 * Fetch the full dictionary entry (definitions, phonetics, etc.).
 * Useful if you want to show the meaning when a player wins a round.
 *
 * @param {string} word
 * @returns {Promise<object[] | null>}
 */
export async function getWordDefinition(word) {
  if (!word) return null;
  const cleaned = word.trim().toLowerCase();

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(cleaned)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Dictionary lookup failed", err);
    return null;
  }
}
