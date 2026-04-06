// Pixel font 5x7 — each character is a 7-row array of 5-bit numbers
// Bit 1 = pixel on, read left to right
// Standard bitmap font covering A-Z, 0-9, basic punctuation

type FontChar = number[];

const FONT: Record<string, FontChar> = {
  'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  'G': [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'I': [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  'J': [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  'N': [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b01110, 0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100],
  ',': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b01000],
  '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  '?': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b00000, 0b00100],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  '+': [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000],
  '=': [0b00000, 0b00000, 0b11111, 0b00000, 0b11111, 0b00000, 0b00000],
  ':': [0b00000, 0b00100, 0b00100, 0b00000, 0b00100, 0b00100, 0b00000],
  '/': [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  '\'': [0b00100, 0b00100, 0b01000, 0b00000, 0b00000, 0b00000, 0b00000],
  '#': [0b01010, 0b01010, 0b11111, 0b01010, 0b11111, 0b01010, 0b01010],
  '*': [0b00000, 0b10101, 0b01110, 0b11111, 0b01110, 0b10101, 0b00000],
};

const CHAR_WIDTH = 5;
const CHAR_HEIGHT = 7;

export interface TextToBeadsResult {
  grid: Record<string, string>; // "row-col" -> beadId
  width: number;
  height: number;
}

/**
 * Render text to a bead grid
 * @param text - Text to render
 * @param beadId - Bead color ID to use
 * @param scale - Size multiplier (1 = 5x7 per char, 2 = 10x14, etc.)
 * @param spacing - Pixels between characters
 * @param startRow - Row offset to place text at
 * @param startCol - Column offset
 */
export const renderTextToBeads = (
  text: string,
  beadId: string,
  scale: number = 1,
  spacing: number = 1,
  startRow: number = 0,
  startCol: number = 0,
): TextToBeadsResult => {
  const grid: Record<string, string> = {};
  const upperText = text.toUpperCase();

  let cursorX = startCol;

  for (let ci = 0; ci < upperText.length; ci++) {
    const char = upperText[ci];
    const charData = FONT[char];

    if (!charData) {
      // Unknown character — treat as space
      cursorX += (CHAR_WIDTH + spacing) * scale;
      continue;
    }

    for (let row = 0; row < CHAR_HEIGHT; row++) {
      const rowBits = charData[row];
      for (let col = 0; col < CHAR_WIDTH; col++) {
        const isOn = (rowBits >> (CHAR_WIDTH - 1 - col)) & 1;
        if (isOn) {
          // Apply scale
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const r = startRow + row * scale + sy;
              const c = cursorX + col * scale + sx;
              grid[`${r}-${c}`] = beadId;
            }
          }
        }
      }
    }

    cursorX += (CHAR_WIDTH + spacing) * scale;
  }

  const totalWidth = cursorX - startCol;
  const totalHeight = CHAR_HEIGHT * scale;

  return { grid, width: totalWidth, height: totalHeight };
};

/**
 * Get the total width needed for text
 */
export const getTextWidth = (text: string, scale: number = 1, spacing: number = 1): number => {
  return text.length * (CHAR_WIDTH + spacing) * scale - spacing * scale;
};

export const getTextHeight = (scale: number = 1): number => {
  return CHAR_HEIGHT * scale;
};

export { CHAR_WIDTH, CHAR_HEIGHT };
