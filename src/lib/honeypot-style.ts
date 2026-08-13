import type { CSSProperties } from 'react';

/**
 * Visually hides a honeypot field without moving it out of normal flow. Do NOT use
 * `position: absolute; left: -9999px` for this — without a positioned ancestor it offsets from
 * the initial containing block and can blow out the document's scrollable width (found this the
 * hard way on the /software download form, see doc/journey.md 2026-08-07). Clipping to 1x1px
 * hides the field just as effectively and can never affect layout/overflow.
 */
export const HONEYPOT_WRAP_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
