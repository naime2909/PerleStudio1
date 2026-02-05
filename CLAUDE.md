# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PerleDesign Studio** is a web application for designing beaded bracelet patterns (Miyuki beads). It's built with React + TypeScript + Vite and features a visual pattern editor, material calculator, image-to-bead converter, and project management system.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Git Sync Workflow

**IMPORTANT**: This project is connected to GitHub and auto-deploys to Vercel on every push.

### Quick Sync Commands

After making ANY changes, use one of these methods to sync:

**Method 1: npm script (Simplest)**
```bash
npm run sync              # Quick sync with auto-generated message
npm run sync:msg          # Sync with custom commit message (opens editor)
npm run status            # Check what changed
```

**Method 2: PowerShell script (Windows)**
```powershell
.\sync.ps1                              # Auto-generated commit message
.\sync.ps1 "Added new feature X"        # Custom message
```

**Method 3: Bash script (Linux/Mac)**
```bash
./sync.sh                               # Auto-generated commit message
./sync.sh "Added new feature X"         # Custom message
```

**Method 4: Manual Git**
```bash
git add .
git commit -m "Your message"
git push origin main
```

### For Claude Agents

When you make changes to the codebase:
1. **Complete your task** (edit files, test, etc.)
2. **Always sync before finishing** using one of the methods above
3. **Inform the user** that changes were pushed and Vercel will redeploy

Example workflow:
```bash
# After making changes...
npm run sync
# Vercel automatically redeploys (takes ~2-3 minutes)
```

## Core Architecture

### State Management Pattern
The app uses a **history-based undo/redo system** centered in `App.tsx`:
- `history: ProjectState[]` - Array of project snapshots (max 50)
- `historyIndex: number` - Current position in history
- `pushToHistory()` - Creates new snapshot for any grid modification
- All grid changes MUST go through `handleUpdateGrid()` to maintain history integrity

### Grid System
The pattern grid uses a **string-keyed dictionary** for sparse data:
```typescript
PatternGrid = Record<"row-col", beadId>
// Example: { "0-5": "b1", "12-3": "b2" }
```
- Key format: `"${row}-${col}"` (zero-indexed)
- Empty cells have no entry (not `null`)
- Efficient for large, sparse patterns

### Project State Structure
```typescript
interface ProjectState {
  mode: 'loom' | 'peyote'  // Pattern weaving technique
  columns: number          // Pattern width
  rows: number            // Pattern height
  grid: PatternGrid       // Bead placements
}
```

### Component Responsibilities

**App.tsx** (1200+ lines)
- Main orchestrator and state container
- Handles all grid operations, tools, clipboard, history
- Manages three tabs: Editor, Projects, Settings
- Desktop/mobile layout switching logic

**PatternEditor.tsx**
- Canvas-like editor with cell-based interaction
- Implements drawing tools: pencil, shapes (rectangle/circle/polygon), selection, eraser
- Handles overlay image positioning and interaction
- Manages zoom/pan with transform calculations

**StatsPanel.tsx**
- Material calculator (bead counts per color)
- Dimension controls (rows/columns)
- Bracelet specifications (wrist size, bead size)

**VisualPreview.tsx**
- 3D-style bracelet preview rendering
- Shows how the finished bracelet will look

**ProjectsPanel.tsx**
- Project library with thumbnails
- Load/delete/rename/export/import functionality

**useLocalStorage.ts**
- Project persistence (50 projects max)
- Auto-save current project every 30 seconds
- Export/import as `.perlestudio.json`

### Tool System
The `toolMode` state determines editor behavior:
- `pencil` - Click/drag to place selected bead
- `eraser` - Click/drag to remove beads
- `rectangle` / `circle` / `polygon` - Shape drawing (with fill option via `isFilled`)
- `select` - Area selection for copy/cut/paste
- `paste` - Click to paste clipboard content
- `move` - Pan the viewport

### Selection & Clipboard
When `toolMode === 'select'`:
1. User drags to create `SelectionArea { r1, c1, r2, c2 }`
2. Actions appear: Copy, Cut, Duplicate
3. Copy → saves to `ClipboardData { width, height, grid }`
4. Paste → switches to `paste` mode, click to place

### Image Overlay Feature
The overlay system allows tracing designs:
- Upload image → `OverlayImage` state with position/scale/opacity
- Can be positioned manually or centered
- Lockable to prevent accidental movement
- **Convert to Beads**: Samples image pixels and maps to closest palette colors
- Layers: `'back'` (behind grid) or `'front'` (above grid)

## Key Constants

**EDITOR_CONSTANTS** (`constants.ts`)
- Desktop: 26x22px cells, 32px header
- Mobile: 20x17px cells, 24px header

**DEFAULT_BEADS** - 6 starter colors

**PRESET_COLORS** - 40+ curated colors with materials (Mat, Brillant, Cristal, Métal, Bois)

**BEAD_SIZES** - Common bead dimensions (Miyuki Delica 11/0 = 1.6mm, etc.)

**WRIST_SIZES** - Standard bracelet circumferences (13-21cm)

## Important Patterns

### Making Grid Changes
Always use batch updates via `handleUpdateGrid`:
```typescript
const updates = [
  { r: 0, c: 5, beadId: 'b1' },
  { r: 1, c: 5, beadId: null } // null = delete
];
handleUpdateGrid(updates);
```
This ensures a single history entry for the entire operation.

### Adding New Tools
1. Add type to `ToolMode` in `types.ts`
2. Add button in App.tsx toolbar (around line 835)
3. Implement logic in `PatternEditor.tsx` event handlers

### Modifying Palette
Three ways to add beads:
1. `handleAddPalette()` - Bulk add (from AI, currently disabled)
2. `handleAddPresetToPalette()` - From PRESET_COLORS catalog
3. `handleAddCustomToPalette()` - Custom hex color

Remove: `handleRemoveBead(beadId)` - Right-click bead in palette

## Data Persistence

Projects are stored in **localStorage**:
- Key: `perlestudio_projects` - Array of SavedProject (max 50)
- Key: `perlestudio_current` - Current working project
- Auto-save every 30 seconds when on Editor tab
- Manual save via "Sauvegarder Projet" button

## External Integration

**AI Service (Disabled)**
`geminiService.ts` is a stub - returns `null` and shows alert. Previously used Google Gemini API for palette generation from text prompts. Can be re-enabled by implementing the service.

## Mobile vs Desktop

The UI adapts based on screen width:
- **Desktop**: Sidebar (left) + Editor (center) + StatsPanel (right)
- **Mobile**: Collapsible sidebar (overlay), bottom tabs to switch Editor ↔ Stats

Mobile-specific state: `mobileTab: 'editor' | 'specs'`

## Common Tasks

**Change grid dimensions programmatically:**
```typescript
handleSetDimension('columns', 20);
handleSetDimension('rows', 60);
```

**Fill entire row/column:**
```typescript
handleFillRow(rowIndex);  // Uses selectedBeadId or eraser
handleFillCol(colIndex);
```

**Shift entire pattern:**
```typescript
handleShiftPattern('up' | 'down' | 'left' | 'right');
```

**Calculate material needs:**
Done automatically in StatsPanel - counts each beadId occurrence in grid, displays with bead names and colors.

## Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Escape` - Cancel selection or paste mode

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 5** - Build tool and dev server
- **Tailwind CSS** (CDN) - Utility-first styling
- **Lucide React** - Icon library
- **LocalStorage** - Persistence

## Project Structure

```
src/
├── App.tsx              # Main app orchestrator
├── index.tsx            # React entry point
├── types.ts             # TypeScript definitions
├── constants.ts         # Config and preset data
├── useLocalStorage.ts   # Persistence hooks
├── components/
│   ├── PatternEditor.tsx    # Grid editor canvas
│   ├── StatsPanel.tsx       # Material calculator
│   ├── VisualPreview.tsx    # 3D bracelet preview
│   ├── AIGenerator.tsx      # AI palette UI (disabled)
│   ├── ProjectsPanel.tsx    # Project management
│   ├── SettingsPanel.tsx    # App settings
│   ├── ImageConverter.tsx   # Image overlay converter
│   └── BeadRenderer.tsx     # Individual bead visual
└── services/
    └── geminiService.ts     # AI integration stub
```

## Design Decisions

**Why sparse grid?**
Users often create small patterns on large grids (e.g., 10 beads on 50x20 grid). A sparse dictionary saves memory vs. a 2D array.

**Why history array instead of undo/redo stacks?**
Allows easy "time travel" - can jump to any previous state, and simplifies redo logic. Trade-off: memory for 50 snapshots (acceptable for typical pattern sizes).

**Why string keys "row-col"?**
JavaScript objects with string keys are fast hash maps. Alternative (nested objects) would complicate access patterns.

**Why LocalStorage not IndexedDB?**
Simplicity. Project data is small (<1MB typically), and LocalStorage is synchronous and easier to debug. Limit of 50 projects prevents quota issues.

**Why Tailwind via CDN?**
Quick setup for prototype. Trade-off: larger initial load, but no build config complexity. For production, consider installing Tailwind properly.
