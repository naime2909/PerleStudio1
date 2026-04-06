// Pixel art avatars as SVG data URIs — bead/bracelet themed
// Each avatar is a 10x10 pixel grid rendered as SVG

interface PixelAvatar {
  id: string;
  name: string;
  svg: string;
}

const createPixelSvg = (pixels: string[][], size: number = 10): string => {
  const cellSize = 10;
  const svgSize = size * cellSize;
  let rects = '';
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const color = pixels[y][x];
      if (color !== '.') {
        rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;
      }
    }
  }
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" shape-rendering="crispEdges"><rect width="${svgSize}" height="${svgSize}" fill="#f1f5f9"/>${rects}</svg>`)}`;
};

const C = {
  R: '#ef4444', r: '#f87171', // red
  B: '#3b82f6', b: '#60a5fa', // blue
  G: '#22c55e', g: '#4ade80', // green
  Y: '#eab308', y: '#facc15', // yellow
  O: '#f97316', o: '#fb923c', // orange
  P: '#a855f7', p: '#c084fc', // purple
  K: '#1e293b', k: '#475569', // dark
  W: '#ffffff', w: '#e2e8f0', // white/gray
  N: '#d97706', n: '#fbbf24', // gold
  T: '#14b8a6', t: '#2dd4bf', // teal
  I: '#ec4899', i: '#f472b6', // pink
};

// Cat face
const catPixels = [
  ['.','.',C.K,'.','.','.','.', C.K,'.','.'],
  ['.',C.K,C.k,C.K,'.','.', C.K,C.k,C.K,'.'],
  [C.K,C.k,C.k,C.k,C.k,C.k, C.k,C.k,C.k,C.K],
  [C.k,C.k,C.G,C.k,C.k,C.k, C.G,C.k,C.k,C.k],
  [C.k,C.k,C.K,C.k,C.k,C.k, C.K,C.k,C.k,C.k],
  [C.k,C.k,C.k,C.k,C.I,C.k, C.k,C.k,C.k,C.k],
  [C.k,C.k,C.k,C.K,C.k,C.K, C.k,C.k,C.k,C.k],
  ['.',C.k,C.k,C.k,C.k,C.k, C.k,C.k,C.k,'.'],
  ['.','.', C.k,C.k,C.k,C.k,C.k,C.k,'.','.'],
  ['.','.','.', C.k,C.k,C.k,C.k,'.','.','.'],
];

// Heart
const heartPixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.',C.R,C.R,'.','.','.',C.R,C.R,'.','.'],
  [C.R,C.r,C.R,C.R,'.',C.R,C.r,C.R,C.R,'.'],
  [C.R,C.r,C.r,C.R,C.R,C.r,C.r,C.R,C.R,'.'],
  [C.R,C.r,C.r,C.r,C.r,C.r,C.r,C.r,C.R,'.'],
  ['.',C.R,C.r,C.r,C.r,C.r,C.r,C.R,'.','.'],
  ['.','.',C.R,C.r,C.r,C.r,C.R,'.','.','.'],
  ['.','.','.',C.R,C.r,C.R,'.','.','.','.'],
  ['.','.','.','.',C.R,'.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Star
const starPixels = [
  ['.','.','.','.',C.Y,'.','.','.','.','.'],
  ['.','.','.','.',C.Y,'.','.','.','.','.'],
  ['.','.','.',C.Y,C.y,C.Y,'.','.','.','.',],
  [C.Y,C.Y,C.Y,C.y,C.y,C.y,C.Y,C.Y,C.Y,'.'],
  ['.',C.Y,C.y,C.y,C.y,C.y,C.y,C.Y,'.','.'],
  ['.','.',C.Y,C.y,C.y,C.y,C.Y,'.','.','.'],
  ['.',C.Y,C.y,C.y,'.',C.y,C.y,C.Y,'.','.'],
  [C.Y,C.y,C.y,'.','.','.', C.y,C.y,C.Y,'.'],
  [C.Y,C.y,'.','.','.','.','.',C.y,C.Y,'.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Flower
const flowerPixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.',C.I,'.',C.I,'.',C.I,'.','.','.'],
  ['.',C.I,C.i,C.I,C.i,C.I,C.i,C.I,'.','.'],
  ['.','.',C.I,C.Y,C.y,C.Y,C.I,'.','.','.'],
  ['.',C.I,C.i,C.y,C.Y,C.y,C.i,C.I,'.','.'],
  ['.','.',C.I,C.Y,C.y,C.Y,C.I,'.','.','.'],
  ['.',C.I,C.i,C.I,C.i,C.I,C.i,C.I,'.','.'],
  ['.','.',C.I,'.',C.G,'.',C.I,'.','.','.'],
  ['.','.','.','.', C.G,'.','.','.','.','.'],
  ['.','.','.','.', C.G,'.','.','.','.','.'],
];

// Diamond / gem
const diamondPixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.',C.B,C.B,C.B,C.B,C.B,C.B,'.','.'],
  ['.',C.B,C.b,C.b,C.B,C.b,C.b,C.B,C.B,'.'],
  [C.B,C.b,C.b,C.b,C.b,C.b,C.b,C.b,C.B,'.'],
  ['.',C.B,C.b,C.b,C.b,C.b,C.b,C.B,'.','.'],
  ['.','.',C.B,C.b,C.b,C.b,C.B,'.','.','.'],
  ['.','.','.',C.B,C.b,C.B,'.','.','.','.'],
  ['.','.','.','.',C.B,'.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Rainbow bracelet
const braceletPixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.',C.R,C.R,C.R,C.R,C.R,C.R,C.R,C.R,'.'],
  ['.',C.O,C.O,C.O,C.O,C.O,C.O,C.O,C.O,'.'],
  ['.',C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,'.'],
  ['.',C.G,C.G,C.G,C.G,C.G,C.G,C.G,C.G,'.'],
  ['.',C.B,C.B,C.B,C.B,C.B,C.B,C.B,C.B,'.'],
  ['.',C.P,C.P,C.P,C.P,C.P,C.P,C.P,C.P,'.'],
  ['.',C.I,C.I,C.I,C.I,C.I,C.I,C.I,C.I,'.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Dog face
const dogPixels = [
  [C.N,C.N,'.','.','.','.','.','.', C.N,C.N],
  [C.N,C.n,C.N,'.','.','.','.', C.N,C.n,C.N],
  ['.',C.N,C.n,C.n,C.n,C.n,C.n,C.n,C.N,'.'],
  ['.',C.n,C.n,C.K,C.n,C.n,C.K,C.n,C.n,'.'],
  ['.',C.n,C.n,C.n,C.n,C.n,C.n,C.n,C.n,'.'],
  ['.',C.n,C.n,C.n,C.K,C.K,C.n,C.n,C.n,'.'],
  ['.',C.n,C.W,C.n,C.n,C.n,C.n,C.W,C.n,'.'],
  ['.','.',C.n,C.n,C.n,C.n,C.n,C.n,'.','.'],
  ['.','.','.', C.n,C.n,C.n,C.n,'.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Butterfly
const butterflyPixels = [
  ['.',C.P,C.P,'.','.','.','.', C.T,C.T,'.'],
  [C.P,C.p,C.p,C.P,'.','.', C.T,C.t,C.t,C.T],
  [C.P,C.p,C.Y,C.p,C.P,C.T, C.t,C.Y,C.t,C.T],
  [C.P,C.p,C.p,C.P,'.','.', C.T,C.t,C.t,C.T],
  ['.',C.P,C.P,'.', C.K,C.K,'.',C.T,C.T,'.'],
  ['.','.','.','.', C.K,C.K,'.','.','.','.'],
  [C.I,C.i,C.I,'.',C.K,C.K,'.',C.B,C.b,C.B],
  [C.I,C.i,C.Y,C.I,'.','.', C.B,C.Y,C.b,C.B],
  [C.I,C.i,C.I,'.','.','.','.', C.B,C.b,C.B],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Crown
const crownPixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.',C.Y,'.',C.Y,'.',C.Y,'.',C.Y,'.','.'],
  ['.',C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,'.','.'],
  ['.',C.y,C.R,C.y,C.y,C.y,C.B,C.y,'.','.'],
  ['.',C.y,C.y,C.y,C.y,C.y,C.y,C.y,'.','.'],
  ['.',C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,C.Y,'.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Bead pattern (zigzag)
const beadPatternPixels = [
  [C.R,C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P],
  [C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R],
  [C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R,C.B],
  [C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R,C.B,C.G],
  [C.P,C.R,C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y],
  [C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R,C.B,C.G],
  [C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R,C.B],
  [C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R],
  [C.R,C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P],
  [C.B,C.G,C.Y,C.P,C.R,C.B,C.G,C.Y,C.P,C.R],
];

// Turtle
const turtlePixels = [
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.', C.G,C.G,C.G,'.','.','.','.',],
  ['.','.', C.G,C.g,C.G,C.g,C.G,'.','.','.'],
  ['.', C.T,C.G,C.G,C.g,C.G,C.G,C.T,'.','.'],
  [C.T,C.t,C.G,C.g,C.G,C.g,C.G,C.t,C.T,'.'],
  ['.', C.T,C.G,C.G,C.g,C.G,C.G,C.T,'.','.'],
  ['.','.', C.G,C.g,C.G,C.g,C.G,'.','.','.'],
  ['.', C.T,'.', C.G,C.G,C.G,'.','.', C.T,'.'],
  ['.','.','.','.', C.T,'.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

// Unicorn
const unicornPixels = [
  ['.','.','.', C.Y,'.','.','.','.','.','.',],
  ['.','.', C.Y,C.y,C.W,'.','.','.','.','.'],
  ['.','.','.', C.W,C.W,C.W,'.','.','.','.',],
  ['.','.', C.W,C.W,C.P,C.W,C.W,'.','.','.'],
  ['.','.', C.W,C.W,C.W,C.W,C.W,'.','.','.'],
  ['.','.','.', C.W,C.W,C.W,C.W,C.W,'.','.'],
  ['.','.','.', C.W,'.','.', C.W,'.','.','.'],
  ['.','.','.', C.W,'.','.', C.W,'.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.','.','.'],
];

export const PIXEL_AVATARS: PixelAvatar[] = [
  { id: 'cat', name: 'Chat', svg: createPixelSvg(catPixels) },
  { id: 'dog', name: 'Chien', svg: createPixelSvg(dogPixels) },
  { id: 'heart', name: 'Coeur', svg: createPixelSvg(heartPixels) },
  { id: 'star', name: 'Étoile', svg: createPixelSvg(starPixels) },
  { id: 'flower', name: 'Fleur', svg: createPixelSvg(flowerPixels) },
  { id: 'butterfly', name: 'Papillon', svg: createPixelSvg(butterflyPixels) },
  { id: 'diamond', name: 'Diamant', svg: createPixelSvg(diamondPixels) },
  { id: 'crown', name: 'Couronne', svg: createPixelSvg(crownPixels) },
  { id: 'bracelet', name: 'Bracelet', svg: createPixelSvg(braceletPixels) },
  { id: 'bead', name: 'Perles', svg: createPixelSvg(beadPatternPixels) },
  { id: 'turtle', name: 'Tortue', svg: createPixelSvg(turtlePixels) },
  { id: 'unicorn', name: 'Licorne', svg: createPixelSvg(unicornPixels) },
];
