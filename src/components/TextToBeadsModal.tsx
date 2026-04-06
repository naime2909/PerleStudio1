import React, { useState, useMemo } from 'react';
import { X, Type, Eye, Maximize } from 'lucide-react';
import { renderTextToBeads, getTextWidth, getTextHeight, FontSize } from '../constants/pixelFont';
import { BeadType } from '../types';

interface TextToBeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBeads: BeadType[];
  selectedBeadId: string | null;
  gridColumns: number;
  gridRows: number;
  gridEmpty: boolean;
  onApply: (updates: { r: number; c: number; beadId: string | null }[]) => void;
  onResizeGrid: (columns: number, rows: number) => void;
}

const FONT_OPTIONS: { id: FontSize; label: string; desc: string }[] = [
  { id: 'mini', label: 'Mini', desc: '3x5 par lettre' },
  { id: 'standard', label: 'Normal', desc: '5x7 par lettre' },
];

const SCALE_OPTIONS = [1, 2, 3];

const TextToBeadsModal: React.FC<TextToBeadsModalProps> = ({
  isOpen,
  onClose,
  activeBeads,
  selectedBeadId,
  gridColumns,
  gridRows,
  gridEmpty,
  onApply,
  onResizeGrid,
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('mini');
  const [scale, setScale] = useState(1);
  const [spacing, setSpacing] = useState(1);
  const [colorId, setColorId] = useState(selectedBeadId || activeBeads[0]?.id || '');
  const [startRow, setStartRow] = useState(1);
  const [startCol, setStartCol] = useState(1);
  const [autoResize, setAutoResize] = useState(true);

  const preview = useMemo(() => {
    if (!text || !colorId) return null;
    return renderTextToBeads(text, colorId, fontSize, scale, spacing, 0, 0);
  }, [text, colorId, fontSize, scale, spacing]);

  const previewColor = activeBeads.find(b => b.id === colorId)?.hex || '#000';

  if (!isOpen) return null;

  const textWidth = text ? getTextWidth(text, fontSize, scale, spacing) : 0;
  const textHeight = text ? getTextHeight(fontSize, scale) : 0;

  // Needed grid size with margins
  const neededCols = textWidth + startCol + 1;
  const neededRows = textHeight + startRow + 1;
  const fitsInGrid = neededCols <= gridColumns && neededRows <= gridRows;
  const needsResize = !fitsInGrid && autoResize;

  const handleApply = () => {
    if (!text || !colorId) return;

    // Resize grid if needed
    if (needsResize) {
      const newCols = Math.max(gridColumns, neededCols);
      const newRows = Math.max(gridRows, neededRows);
      onResizeGrid(newCols, newRows);
      // Small delay to let the state update before placing beads
      setTimeout(() => {
        applyText();
      }, 50);
    } else {
      applyText();
    }
  };

  const applyText = () => {
    const result = renderTextToBeads(text, colorId, fontSize, scale, spacing, startRow, startCol);
    const updates = Object.entries(result.grid).map(([key, beadId]) => {
      const [r, c] = key.split('-').map(Number);
      return { r, c, beadId };
    });
    onApply(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Type size={20} className="text-indigo-600" /> Texte en Perles
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ton texte</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: HELLO, LOVE, ton prénom..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Couleur</label>
            <div className="flex flex-wrap gap-1.5">
              {activeBeads.map(bead => (
                <button
                  key={bead.id}
                  onClick={() => setColorId(bead.id)}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    colorId === bead.id
                      ? 'ring-3 ring-indigo-600 ring-offset-1 scale-110'
                      : 'ring-1 ring-slate-200 hover:ring-indigo-400'
                  }`}
                  style={{ backgroundColor: bead.hex }}
                  title={bead.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size + Scale */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Police</label>
              <div className="flex gap-1">
                {FONT_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                      fontSize === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={f.desc}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {FONT_OPTIONS.find(f => f.id === fontSize)?.desc}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Multiplicateur</label>
              <div className="flex gap-1">
                {SCALE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                      scale === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spacing + Position */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Espacement</label>
              <div className="flex gap-1">
                {[0, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpacing(s)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                      spacing === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ligne</label>
              <input
                type="number"
                value={startRow}
                onChange={(e) => setStartRow(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Colonne</label>
              <input
                type="number"
                value={startCol}
                onChange={(e) => setStartCol(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Auto resize toggle */}
          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoResize}
              onChange={(e) => setAutoResize(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <Maximize size={14} className="text-indigo-600" />
            <span className="text-xs font-semibold text-slate-700">Adapter la grille automatiquement au texte</span>
          </label>

          {/* Info */}
          {text && (
            <div className={`p-3 rounded-lg border text-sm ${
              fitsInGrid ? 'bg-green-50 border-green-200' :
              autoResize ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`font-semibold text-xs ${
                fitsInGrid ? 'text-green-800' : autoResize ? 'text-blue-800' : 'text-amber-800'
              }`}>
                Texte : {textWidth} x {textHeight} perles
                {!fitsInGrid && autoResize && ` — Grille sera agrandie à ${Math.max(gridColumns, neededCols)} x ${Math.max(gridRows, neededRows)}`}
                {!fitsInGrid && !autoResize && ` — Dépasse ! Sera coupé`}
              </p>
            </div>
          )}

          {/* Preview */}
          {preview && text && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Eye size={14} /> Aperçu
              </label>
              <div className="bg-slate-100 rounded-lg p-3 overflow-x-auto">
                <div
                  className="inline-grid"
                  style={{
                    gridTemplateColumns: `repeat(${preview.width}, 1fr)`,
                    gap: '0.5px',
                    width: `${preview.width * 6}px`,
                  }}
                >
                  {Array.from({ length: preview.height }).map((_, row) =>
                    Array.from({ length: preview.width }).map((_, col) => {
                      const key = `${row}-${col}`;
                      const isOn = preview.grid[key];
                      return (
                        <div
                          key={key}
                          style={{
                            backgroundColor: isOn ? previewColor : '#e2e8f0',
                            width: 6,
                            height: 6,
                            borderRadius: 1,
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleApply}
            disabled={!text || !colorId}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Type size={16} /> Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToBeadsModal;
