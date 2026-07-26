// Maps the first three letters of a month name to its 1-based number.
// Covers English and Indonesian spellings so the parser works regardless
// of the source sheet's locale.
const MONTH_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  // Indonesian spellings that differ from English
  mei: 5,
  agu: 8,
  agt: 8,
  okt: 10,
  des: 12,
};

/**
 * Normalize a date value from the Google Sheet into canonical `YYYY-MM-DD`.
 *
 * Recognized inputs:
 *   - `YYYY-MM-DD`, returned unchanged.
 *   - `D MMM YYYY` / `DD MMM YYYY`, e.g. "5 Mar 2023", "05 Mar 2023",
 *     "5 March 2023", parsed with the month map above.
 *   - Any other string, parsed with the JS Date constructor as a fallback.
 *
 * Returns the original string when it cannot be parsed.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';

  const str = dateStr.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const match = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const month = MONTH_MAP[match[2].slice(0, 3).toLowerCase()];
    if (month) {
      const day = match[1].padStart(2, '0');
      return `${match[3]}-${String(month).padStart(2, '0')}-${day}`;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return str;
}
