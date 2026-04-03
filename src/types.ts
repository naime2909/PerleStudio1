
export enum MaterialType {
  MATTE = 'Mat',
  GLOSSY = 'Brillant',
  CRYSTAL = 'Cristal',
  WOOD = 'Bois',
  METAL = 'Métal'
}

export interface BeadType {
  id: string;
  name: string;
  color: string;
  material: MaterialType;
  hex: string;
}

// Stitch types: loom (no offset), peyote (vertical offset on columns), brick (horizontal offset on rows)
export type StitchType = 'loom' | 'peyote' | 'brick';

// Backward compatibility alias
export type PatternMode = StitchType;

// Project shape: what the user is creating
export type ProjectShape = 'bracelet' | 'square' | 'rectangle' | 'circle' | 'freeform';

// Clé de la grille : "row-col", Valeur : beadId
export type PatternGrid = Record<string, string>;

export interface ProjectState {
  mode: StitchType;
  stitchStep?: 1 | 2 | 3;   // Offset every N columns/rows (default 2)
  shape?: ProjectShape;      // Project shape (default 'bracelet' for backward compat)
  columns: number;           // Largeur en nombre de perles
  rows: number;              // Longueur en nombre de perles
  grid: PatternGrid;
}

export interface OverlayImage {
  id: string;
  dataUrl: string;
  opacity: number; // 0 to 1
  scale: number; // multiplier
  x: number; // px offset relative to grid origin
  y: number; // px offset relative to grid origin
  width: number; // original width in px
  height: number; // original height in px
  layer: 'front' | 'back';
}

export interface ProjectSettings {
  beadSizeMm: number; // Hauteur/Largeur approximative
  wristSizeCm: number;
}

// Backward compatibility alias
export type BraceletSettings = ProjectSettings;

export type ToolMode = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'move' | 'polygon' | 'select' | 'paste';

export interface SelectionArea {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

export interface ClipboardData {
  width: number;
  height: number;
  grid: PatternGrid; // Relative coordinates (0-0 based)
}
