const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function latinizeDigits(value: string): string {
  return Array.from(value, (character) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(character);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(character);
    return arabicIndex >= 0 ? String(arabicIndex) : character;
  }).join('');
}

export function normalizeIranianPhoneNumber(input: string): string | null {
  const compact = latinizeDigits(input).trim().replace(/[\s()-]/g, '');
  const local = compact.startsWith('+98')
    ? `0${compact.slice(3)}`
    : compact.startsWith('0098')
      ? `0${compact.slice(4)}`
      : compact.startsWith('98')
        ? `0${compact.slice(2)}`
        : /^9\d{9}$/.test(compact)
          ? `0${compact}`
          : compact;

  return /^09\d{9}$/.test(local) ? `+98${local.slice(1)}` : null;
}

export function isIranianMobileNumber(input: string): boolean {
  return normalizeIranianPhoneNumber(input) !== null;
}

export function maskPhoneNumber(input: string): string {
  const normalized = normalizeIranianPhoneNumber(input);
  if (!normalized) return 'Elecio customer';
  return `${normalized.slice(0, 5)}•••${normalized.slice(-3)}`;
}

export function normalizeOtpCode(input: string): string | null {
  const normalized = latinizeDigits(input).replace(/\s/g, '');
  return /^\d{6}$/.test(normalized) ? normalized : null;
}
