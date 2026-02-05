import { PatternGrid, PatternMode } from './types';

export interface Template {
  id: string;
  name: string;
  category: 'geometrique' | 'floral' | 'animal' | 'symbole' | 'alphabet';
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  rows: number;
  columns: number;
  mode: PatternMode;
  grid: PatternGrid;
  thumbnail?: string;
  description?: string;
  beadColors: { [key: string]: string }; // Map bead positions to hex colors
}

// Helper function to create a grid from a 2D array pattern
const createGridFromPattern = (pattern: string[][], colorMap: { [key: string]: string }): { grid: PatternGrid; beadColors: { [key: string]: string } } => {
  const grid: PatternGrid = {};
  const beadColors: { [key: string]: string } = {};

  pattern.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && cell !== '.' && colorMap[cell]) {
        const key = `${r}-${c}`;
        grid[key] = `template-${cell}`;
        beadColors[key] = colorMap[cell];
      }
    });
  });

  return { grid, beadColors };
};

// Templates Collection
export const TEMPLATES: Template[] = [
  // ========== GÉOMÉTRIQUES ==========
  {
    id: 'geo-chevron',
    name: 'Chevron',
    category: 'geometrique',
    difficulty: 'debutant',
    rows: 10,
    columns: 10,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['R', '.', '.', '.', '.', '.', '.', '.', '.', 'R'],
        ['.', 'R', '.', '.', '.', '.', '.', '.', 'R', '.'],
        ['.', '.', 'R', '.', '.', '.', '.', 'R', '.', '.'],
        ['.', '.', '.', 'R', '.', '.', 'R', '.', '.', '.'],
        ['.', '.', '.', '.', 'R', 'R', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'R', 'R', '.', '.', '.', '.'],
        ['.', '.', '.', 'R', '.', '.', 'R', '.', '.', '.'],
        ['.', '.', 'R', '.', '.', '.', '.', 'R', '.', '.'],
        ['.', 'R', '.', '.', '.', '.', '.', '.', 'R', '.'],
        ['R', '.', '.', '.', '.', '.', '.', '.', '.', 'R'],
      ],
      { R: '#ef4444', B: '#3b82f6' }
    ),
    description: 'Motif chevron classique, parfait pour débuter'
  },

  {
    id: 'geo-damier',
    name: 'Damier',
    category: 'geometrique',
    difficulty: 'debutant',
    rows: 8,
    columns: 8,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['N', 'B', 'N', 'B', 'N', 'B', 'N', 'B'],
        ['B', 'N', 'B', 'N', 'B', 'N', 'B', 'N'],
        ['N', 'B', 'N', 'B', 'N', 'B', 'N', 'B'],
        ['B', 'N', 'B', 'N', 'B', 'N', 'B', 'N'],
        ['N', 'B', 'N', 'B', 'N', 'B', 'N', 'B'],
        ['B', 'N', 'B', 'N', 'B', 'N', 'B', 'N'],
        ['N', 'B', 'N', 'B', 'N', 'B', 'N', 'B'],
        ['B', 'N', 'B', 'N', 'B', 'N', 'B', 'N'],
      ],
      { N: '#171717', B: '#f8fafc' }
    ),
    description: 'Damier noir et blanc intemporel'
  },

  {
    id: 'geo-losange',
    name: 'Losanges',
    category: 'geometrique',
    difficulty: 'intermediaire',
    rows: 12,
    columns: 12,
    mode: 'peyote',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', '.', 'B', 'B', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'B', 'V', 'V', 'B', '.', '.', '.', '.'],
        ['.', '.', '.', 'B', 'V', 'V', 'V', 'V', 'B', '.', '.', '.'],
        ['.', '.', 'B', 'V', 'V', 'V', 'V', 'V', 'V', 'B', '.', '.'],
        ['.', 'B', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'B', '.'],
        ['B', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'B'],
        ['B', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'B'],
        ['.', 'B', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'B', '.'],
        ['.', '.', 'B', 'V', 'V', 'V', 'V', 'V', 'V', 'B', '.', '.'],
        ['.', '.', '.', 'B', 'V', 'V', 'V', 'V', 'B', '.', '.', '.'],
        ['.', '.', '.', '.', 'B', 'V', 'V', 'B', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'B', 'B', '.', '.', '.', '.', '.'],
      ],
      { B: '#3b82f6', V: '#8b5cf6' }
    ),
    description: 'Losange dégradé bleu-violet'
  },

  {
    id: 'geo-zigzag',
    name: 'Zigzag',
    category: 'geometrique',
    difficulty: 'debutant',
    rows: 8,
    columns: 12,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['R', 'R', '.', '.', '.', '.', '.', '.', 'R', 'R', '.', '.'],
        ['.', 'R', 'R', '.', '.', '.', '.', 'R', 'R', '.', '.', '.'],
        ['.', '.', 'R', 'R', '.', '.', 'R', 'R', '.', '.', '.', '.'],
        ['.', '.', '.', 'R', 'R', 'R', 'R', '.', '.', '.', '.', '.'],
        ['.', '.', '.', 'R', 'R', 'R', 'R', '.', '.', '.', '.', '.'],
        ['.', '.', 'R', 'R', '.', '.', 'R', 'R', '.', '.', '.', '.'],
        ['.', 'R', 'R', '.', '.', '.', '.', 'R', 'R', '.', '.', '.'],
        ['R', 'R', '.', '.', '.', '.', '.', '.', 'R', 'R', '.', '.'],
      ],
      { R: '#f59e0b', J: '#fbbf24' }
    ),
    description: 'Vague zigzag dynamique'
  },

  {
    id: 'geo-etoile',
    name: 'Étoile',
    category: 'geometrique',
    difficulty: 'intermediaire',
    rows: 11,
    columns: 11,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', '.', 'J', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'J', 'J', 'J', '.', '.', '.', '.'],
        ['.', '.', '.', 'J', 'J', 'J', 'J', 'J', '.', '.', '.'],
        ['.', '.', 'J', '.', '.', 'J', '.', '.', 'J', '.', '.'],
        ['.', 'J', 'J', '.', '.', 'J', '.', '.', 'J', 'J', '.'],
        ['J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J'],
        ['.', 'J', 'J', '.', '.', 'J', '.', '.', 'J', 'J', '.'],
        ['.', '.', 'J', '.', '.', 'J', '.', '.', 'J', '.', '.'],
        ['.', '.', '.', 'J', 'J', 'J', 'J', 'J', '.', '.', '.'],
        ['.', '.', '.', '.', 'J', 'J', 'J', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'J', '.', '.', '.', '.', '.'],
      ],
      { J: '#fbbf24' }
    ),
    description: 'Étoile brillante dorée'
  },

  // ========== FLORAUX ==========
  {
    id: 'floral-rose',
    name: 'Rose',
    category: 'floral',
    difficulty: 'intermediaire',
    rows: 10,
    columns: 10,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', 'V', 'R', 'R', 'R', 'R', 'V', '.', '.'],
        ['.', 'V', 'R', 'R', 'R', 'R', 'R', 'R', 'V', '.'],
        ['V', 'R', 'R', 'R', 'O', 'O', 'R', 'R', 'R', 'V'],
        ['V', 'R', 'R', 'O', 'O', 'O', 'O', 'R', 'R', 'V'],
        ['V', 'R', 'R', 'O', 'O', 'O', 'O', 'R', 'R', 'V'],
        ['V', 'R', 'R', 'R', 'O', 'O', 'R', 'R', 'R', 'V'],
        ['.', 'V', 'R', 'R', 'R', 'R', 'R', 'R', 'V', '.'],
        ['.', '.', 'V', 'R', 'R', 'R', 'R', 'V', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
      ],
      { R: '#f43f5e', O: '#fda4af', V: '#047857' }
    ),
    description: 'Rose romantique rose et verte'
  },

  {
    id: 'floral-marguerite',
    name: 'Marguerite',
    category: 'floral',
    difficulty: 'debutant',
    rows: 9,
    columns: 9,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['.', 'B', 'B', 'B', 'J', 'B', 'B', 'B', '.'],
        ['B', 'B', 'B', 'J', 'J', 'J', 'B', 'B', 'B'],
        ['B', 'B', 'J', 'J', 'J', 'J', 'J', 'B', 'B'],
        ['B', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'B'],
        ['B', 'B', 'J', 'J', 'J', 'J', 'J', 'B', 'B'],
        ['B', 'B', 'B', 'J', 'J', 'J', 'B', 'B', 'B'],
        ['.', 'B', 'B', 'B', 'J', 'B', 'B', 'B', '.'],
        ['.', '.', 'B', 'B', 'B', 'B', 'B', '.', '.'],
      ],
      { B: '#f8fafc', J: '#fbbf24' }
    ),
    description: 'Marguerite simple et fraîche'
  },

  {
    id: 'floral-feuille',
    name: 'Feuille',
    category: 'floral',
    difficulty: 'debutant',
    rows: 12,
    columns: 8,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', 'V', 'V', '.', '.', '.'],
        ['.', '.', 'V', 'V', 'V', 'V', '.', '.'],
        ['.', 'V', 'V', 'V', 'V', 'V', 'V', '.'],
        ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V'],
        ['V', 'V', 'V', 'V', 'V', 'V', 'V', 'V'],
        ['V', 'V', 'V', 'V', 'V', 'V', 'V', '.'],
        ['V', 'V', 'V', 'V', 'V', 'V', '.', '.'],
        ['.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', '.', 'V', 'V', '.', '.', '.'],
        ['.', '.', '.', 'V', '.', '.', '.', '.'],
        ['.', '.', '.', 'V', '.', '.', '.', '.'],
      ],
      { V: '#047857', F: '#10b981' }
    ),
    description: 'Feuille verte naturelle'
  },

  {
    id: 'floral-tulipe',
    name: 'Tulipe',
    category: 'floral',
    difficulty: 'intermediaire',
    rows: 14,
    columns: 10,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', 'R', 'R', 'R', 'R', '.', '.', '.'],
        ['.', '.', 'R', 'R', 'R', 'R', 'R', 'R', '.', '.'],
        ['.', 'R', 'R', 'R', 'O', 'O', 'R', 'R', 'R', '.'],
        ['R', 'R', 'R', 'O', 'O', 'O', 'O', 'R', 'R', 'R'],
        ['R', 'R', 'O', 'O', 'O', 'O', 'O', 'O', 'R', 'R'],
        ['R', 'R', 'O', 'O', 'O', 'O', 'O', 'O', 'R', 'R'],
        ['.', 'R', 'R', 'O', 'O', 'O', 'O', 'R', 'R', '.'],
        ['.', '.', 'R', 'R', 'R', 'R', 'R', 'R', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', 'V', 'V', 'V', 'V', 'V', 'V', '.', '.'],
        ['.', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', '.'],
      ],
      { R: '#dc2626', O: '#fca5a5', V: '#047857' }
    ),
    description: 'Tulipe rouge avec tige'
  },

  // ========== ANIMAUX ==========
  {
    id: 'animal-papillon',
    name: 'Papillon',
    category: 'animal',
    difficulty: 'avance',
    rows: 10,
    columns: 14,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['R', 'R', '.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.', 'R', 'R'],
        ['R', 'R', 'R', '.', '.', 'N', '.', '.', 'N', '.', '.', 'R', 'R', 'R'],
        ['R', 'O', 'R', 'R', '.', '.', 'N', 'N', '.', '.', 'R', 'R', 'O', 'R'],
        ['R', 'R', 'O', 'R', 'R', '.', 'N', 'N', '.', 'R', 'R', 'O', 'R', 'R'],
        ['R', 'R', 'R', 'O', 'R', 'R', 'N', 'N', 'R', 'R', 'O', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'O', 'R', 'R', 'N', 'N', 'R', 'R', 'O', 'R', 'R', 'R'],
        ['R', 'R', 'O', 'R', 'R', '.', 'N', 'N', '.', 'R', 'R', 'O', 'R', 'R'],
        ['R', 'O', 'R', 'R', '.', '.', 'N', 'N', '.', '.', 'R', 'R', 'O', 'R'],
        ['R', 'R', 'R', '.', '.', 'N', '.', '.', 'N', '.', '.', 'R', 'R', 'R'],
        ['R', 'R', '.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.', 'R', 'R'],
      ],
      { R: '#f59e0b', O: '#fbbf24', N: '#171717' }
    ),
    description: 'Papillon orange et noir'
  },

  {
    id: 'animal-coeur',
    name: 'Cœur',
    category: 'symbole',
    difficulty: 'debutant',
    rows: 10,
    columns: 11,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', 'R', 'R', '.', '.', '.', '.', '.', 'R', 'R', '.'],
        ['R', 'R', 'R', 'R', '.', '.', '.', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', '.', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
        ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
        ['.', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', '.'],
        ['.', '.', 'R', 'R', 'R', 'R', 'R', 'R', 'R', '.', '.'],
        ['.', '.', '.', 'R', 'R', 'R', 'R', 'R', '.', '.', '.'],
        ['.', '.', '.', '.', 'R', 'R', 'R', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'R', '.', '.', '.', '.', '.'],
      ],
      { R: '#f43f5e' }
    ),
    description: 'Cœur d\'amour romantique'
  },

  {
    id: 'animal-chat',
    name: 'Chat',
    category: 'animal',
    difficulty: 'intermediaire',
    rows: 12,
    columns: 12,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['N', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'N'],
        ['N', 'N', '.', '.', '.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['.', 'N', 'N', '.', '.', '.', '.', '.', '.', 'N', 'N', '.'],
        ['.', '.', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', '.', '.'],
        ['.', '.', 'N', 'O', 'N', 'N', 'N', 'N', 'O', 'N', '.', '.'],
        ['.', '.', 'N', 'O', 'N', 'N', 'N', 'N', 'O', 'N', '.', '.'],
        ['.', '.', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', '.', '.'],
        ['.', '.', 'N', 'N', 'R', 'N', 'N', 'R', 'N', 'N', '.', '.'],
        ['.', '.', 'N', 'N', 'N', 'R', 'R', 'N', 'N', 'N', '.', '.'],
        ['.', '.', 'N', 'N', 'R', 'N', 'N', 'R', 'N', 'N', '.', '.'],
        ['.', '.', '.', 'N', 'N', 'N', 'N', 'N', 'N', '.', '.', '.'],
        ['.', '.', '.', '.', 'N', 'N', 'N', 'N', '.', '.', '.', '.'],
      ],
      { N: '#171717', O: '#fbbf24', R: '#fca5a5' }
    ),
    description: 'Tête de chat mignon'
  },

  {
    id: 'animal-poisson',
    name: 'Poisson',
    category: 'animal',
    difficulty: 'intermediaire',
    rows: 8,
    columns: 14,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', '.', 'B', 'B', 'B', 'B', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'B', 'B', 'B', 'B', 'B', 'B', 'T', '.', '.', '.'],
        ['.', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'T', 'T', '.'],
        ['B', 'B', 'B', 'N', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'T', 'T'],
        ['B', 'B', 'B', 'N', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'T', 'T'],
        ['.', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'T', 'T', '.'],
        ['.', '.', '.', '.', 'B', 'B', 'B', 'B', 'B', 'B', 'T', '.', '.', '.'],
        ['.', '.', '.', '.', '.', 'B', 'B', 'B', 'B', '.', '.', '.', '.', '.'],
      ],
      { B: '#3b82f6', T: '#60a5fa', N: '#171717' }
    ),
    description: 'Poisson bleu tropical'
  },

  // ========== SYMBOLES ==========
  {
    id: 'symbole-ancre',
    name: 'Ancre',
    category: 'symbole',
    difficulty: 'intermediaire',
    rows: 14,
    columns: 10,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', '.', '.', 'N', 'N', 'N', 'N', '.', '.', '.'],
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', '.'],
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', '.', '.', '.', 'N', 'N', '.', '.', '.', '.'],
        ['.', '.', 'N', '.', 'N', 'N', '.', 'N', '.', '.'],
        ['.', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', '.'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', '.', '.', '.', '.', 'N', 'N', 'N'],
        ['N', 'N', '.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['.', 'N', '.', '.', '.', '.', '.', '.', 'N', '.'],
      ],
      { N: '#1e3a8a' }
    ),
    description: 'Ancre marine bleue'
  },

  {
    id: 'symbole-peace',
    name: 'Peace',
    category: 'symbole',
    difficulty: 'debutant',
    rows: 11,
    columns: 11,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', 'V', 'V', 'V', 'V', 'V', '.', '.', '.'],
        ['.', '.', 'V', 'V', 'V', 'V', 'V', 'V', 'V', '.', '.'],
        ['.', 'V', 'V', 'V', '.', 'N', '.', 'V', 'V', 'V', '.'],
        ['V', 'V', 'V', '.', '.', 'N', '.', '.', 'V', 'V', 'V'],
        ['V', 'V', '.', '.', 'N', 'N', 'N', '.', '.', 'V', 'V'],
        ['V', 'V', 'V', 'N', 'N', 'N', 'N', 'N', 'V', 'V', 'V'],
        ['V', 'V', '.', '.', 'N', 'N', 'N', '.', '.', 'V', 'V'],
        ['V', 'V', 'V', '.', 'N', '.', 'N', '.', 'V', 'V', 'V'],
        ['.', 'V', 'V', 'V', '.', 'N', '.', 'V', 'V', 'V', '.'],
        ['.', '.', 'V', 'V', 'V', 'V', 'V', 'V', 'V', '.', '.'],
        ['.', '.', '.', 'V', 'V', 'V', 'V', 'V', '.', '.', '.'],
      ],
      { V: '#10b981', N: '#171717' }
    ),
    description: 'Symbole de la paix'
  },

  {
    id: 'symbole-note',
    name: 'Note Musique',
    category: 'symbole',
    difficulty: 'intermediaire',
    rows: 13,
    columns: 8,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['.', '.', '.', '.', '.', '.', 'N', 'N'],
        ['N', 'N', 'N', '.', '.', '.', 'N', 'N'],
        ['N', 'N', 'N', 'N', '.', '.', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', '.', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['.', 'N', 'N', 'N', 'N', 'N', 'N', '.'],
        ['.', '.', 'N', 'N', 'N', 'N', '.', '.'],
        ['N', 'N', 'N', '.', '.', '.', '.', '.'],
        ['N', 'N', 'N', '.', '.', '.', '.', '.'],
        ['N', 'N', 'N', '.', '.', '.', '.', '.'],
      ],
      { N: '#171717' }
    ),
    description: 'Note de musique noire'
  },

  {
    id: 'symbole-soleil',
    name: 'Soleil',
    category: 'symbole',
    difficulty: 'intermediaire',
    rows: 11,
    columns: 11,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', '.', 'J', 'J', 'J', '.', '.', '.', '.'],
        ['.', '.', 'J', '.', 'J', 'O', 'J', '.', 'J', '.', '.'],
        ['.', 'J', '.', 'J', 'O', 'O', 'O', 'J', '.', 'J', '.'],
        ['.', '.', 'J', 'O', 'O', 'O', 'O', 'O', 'J', '.', '.'],
        ['J', 'J', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'J', 'J'],
        ['J', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'J'],
        ['J', 'J', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'J', 'J'],
        ['.', '.', 'J', 'O', 'O', 'O', 'O', 'O', 'J', '.', '.'],
        ['.', 'J', '.', 'J', 'O', 'O', 'O', 'J', '.', 'J', '.'],
        ['.', '.', 'J', '.', 'J', 'O', 'J', '.', 'J', '.', '.'],
        ['.', '.', '.', '.', 'J', 'J', 'J', '.', '.', '.', '.'],
      ],
      { J: '#fbbf24', O: '#f59e0b' }
    ),
    description: 'Soleil éclatant doré'
  },

  {
    id: 'symbole-lune',
    name: 'Lune',
    category: 'symbole',
    difficulty: 'debutant',
    rows: 12,
    columns: 10,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', '.', 'B', 'B', 'B', 'B', '.', '.', '.'],
        ['.', '.', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['.', 'B', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['B', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.', '.'],
        ['B', 'B', 'B', 'B', 'B', 'B', '.', '.', '.', '.'],
        ['B', 'B', 'B', 'B', 'B', 'B', '.', '.', '.', '.'],
        ['B', 'B', 'B', 'B', 'B', 'B', '.', '.', '.', '.'],
        ['B', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.', '.'],
        ['.', 'B', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['.', '.', 'B', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['.', '.', '.', 'B', 'B', 'B', 'B', 'B', '.', '.'],
        ['.', '.', '.', '.', 'B', 'B', 'B', '.', '.', '.'],
      ],
      { B: '#f8fafc' }
    ),
    description: 'Lune croissante blanche'
  },

  // ========== ALPHABET (exemples) ==========
  {
    id: 'alpha-a',
    name: 'Lettre A',
    category: 'alphabet',
    difficulty: 'debutant',
    rows: 10,
    columns: 7,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['.', '.', 'N', 'N', 'N', '.', '.'],
        ['.', 'N', 'N', 'N', 'N', 'N', '.'],
        ['N', 'N', 'N', '.', 'N', 'N', 'N'],
        ['N', 'N', '.', '.', '.', 'N', 'N'],
        ['N', 'N', '.', '.', '.', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', 'N', 'N', 'N', 'N', 'N'],
        ['N', 'N', '.', '.', '.', 'N', 'N'],
        ['N', 'N', '.', '.', '.', 'N', 'N'],
        ['N', 'N', '.', '.', '.', 'N', 'N'],
      ],
      { N: '#171717' }
    ),
    description: 'Lettre A majuscule'
  },

  {
    id: 'alpha-coeur-love',
    name: 'LOVE',
    category: 'alphabet',
    difficulty: 'avance',
    rows: 8,
    columns: 18,
    mode: 'loom',
    ...createGridFromPattern(
      [
        ['R', '.', '.', 'R', '.', 'R', 'R', 'R', '.', 'R', 'R', 'R', '.', 'R', 'R', 'R', 'R', 'R'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', '.', '.', '.'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', '.', '.', '.'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', 'R', 'R', 'R', '.'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', 'R', '.', '.', '.', '.', 'R', '.'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', 'R', 'R', 'R', '.', '.', '.', '.', 'R', '.'],
        ['R', '.', '.', 'R', '.', 'R', '.', 'R', '.', '.', 'R', '.', '.', '.', '.', '.', 'R', '.'],
        ['R', 'R', 'R', 'R', '.', 'R', 'R', 'R', '.', '.', 'R', '.', '.', 'R', 'R', 'R', 'R', '.'],
      ],
      { R: '#f43f5e' }
    ),
    description: 'Mot LOVE romantique'
  },

  {
    id: 'geo-vague',
    name: 'Vague',
    category: 'geometrique',
    difficulty: 'debutant',
    rows: 8,
    columns: 12,
    mode: 'peyote',
    ...createGridFromPattern(
      [
        ['B', 'B', '.', '.', '.', '.', '.', '.', 'B', 'B', '.', '.'],
        ['B', 'B', 'B', '.', '.', '.', '.', 'B', 'B', 'B', 'B', '.'],
        ['.', 'B', 'B', 'B', '.', '.', 'B', 'B', 'B', 'T', 'B', 'B'],
        ['.', '.', 'B', 'B', 'B', 'B', 'B', 'B', 'T', 'T', 'T', 'B'],
        ['.', '.', '.', 'B', 'B', 'B', 'B', 'T', 'T', 'T', 'T', 'T'],
        ['.', '.', 'B', 'B', 'B', 'B', 'T', 'T', 'T', 'T', 'T', '.'],
        ['.', 'B', 'B', 'B', 'B', 'T', 'T', 'T', 'T', 'T', '.', '.'],
        ['B', 'B', 'B', 'T', 'T', 'T', 'T', 'T', '.', '.', '.', '.'],
      ],
      { B: '#1e3a8a', T: '#60a5fa' }
    ),
    description: 'Vague océanique bleue'
  },
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return TEMPLATES.filter(t => t.category === category);
};

// Helper function to get templates by difficulty
export const getTemplatesByDifficulty = (difficulty: Template['difficulty']): Template[] => {
  return TEMPLATES.filter(t => t.difficulty === difficulty);
};

// Get all categories
export const getCategories = (): string[] => {
  return Array.from(new Set(TEMPLATES.map(t => t.category)));
};

// Get all difficulties
export const getDifficulties = (): string[] => {
  return Array.from(new Set(TEMPLATES.map(t => t.difficulty)));
};
