import React, { useState, useMemo } from 'react';
import { X, Type, Scaling, ArrowDown, ArrowRight, Eye } from 'lucide-react';
import { renderTextToBeads, getTextWidth, getTextHeight } from '../constants/pixelFont';
import { BeadType, PatternGrid } from '../types';

interface TextToBeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBeads: BeadType[];
  selectedBeadId: string | null;
  gridColumns: number;
  gridRows: number;
  onApply: (updates: { r: number; c: number; beadId: string | null }[]) => void;
}

const TextToBeadsModal: React.FC<TextToBeadsModalProps> = ({
  isOpen,
  onClose,
  activeBeads,
  selectedBeadId,
  gridColumns,
  gridRows,
  onApply,
}) => {
  const [text, setText] = useState('');
  const [scale, setScale] = useState(1);
  const [spacing, setSpacing] = useState(1);
  const [colorId, setColorId] = useState(selectedBeadId || activeBeads[0]?.id || '');
  const [startRow, setStartRow] = useState(0);
  const [startCol, setStartCol] = useState(0);

  const preview = useMemo(() => {
    if (!text || !colorId) return null;
    return renderTextToBeads(text, colorId, scale, spacing, 0, 0);
  }, [text, colorId, scale, spacing]);

  const previewColor = activeBeads.find(b => b.id === colorId)?.hex || '#000';

  if (!isOpen) return null;

  const handleApply = () => {
    if (!text || !colorId) return;

    const result = renderTextToBeads(text, colorId, scale, spacing, startRow, startCol);
    const updates = Object.entries(result.grid).map(([key, beadId]) => {
      const [r, c] = key.split('-').map(Number);
      return { r, c, beadId };
    });

    // Filter out-of-bounds cells
    const validUpdates = updates.filter(u => u.r >= 0 && u.r < gridRows && u.c >= 0 && u.c < gridColumns);

    if (validUpdates.length === 0) {
      alert('Le texte est en dehors de la grille !');
      return;
    }

    onApply(validUpdates);
    onClose();
  };

  const textWidth = text ? getTextWidth(text, scale, spacing) : 0;
  const textHeight = text ? getTextHeight(scale) : 0;
  const fitsInGrid = textWidth + startCol <= gridColumns && textHeight + startRow <= gridRows;

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
            <p className="text-xs text-slate-400 mt-1">A-Z, 0-9, espaces et ponctuation de base</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Couleur du texte</label>
            <div className="flex flex-wrap gap-1.5">
              {activeBeads.map(bead => (
                <button
                  key={bead.id}
                  onClick={() => setColorId(bead.id)}
                  className={`w-8 h-8 rounded-lg transition-all ${
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

          {/* Scale */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Scaling size={14} /> Taille
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(s => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
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

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Espacement</label>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpacing(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                      spacing === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ArrowDown size={14} /> Ligne de départ
              </label>
              <input
                type="number"
                value={startRow}
                onChange={(e) => setStartRow(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                max={gridRows - 1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ArrowRight size={14} /> Colonne de départ
              </label>
              <input
                type="number"
                value={startCol}
                onChange={(e) => setStartCol(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                max={gridColumns - 1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Info */}
          {text && (
            <div className={`p-3 rounded-lg border text-sm ${fitsInGrid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`font-semibold ${fitsInGrid ? 'text-green-800' : 'text-amber-800'}`}>
                Taille du texte : {textWidth} x {textHeight} perles
              </p>
              <p className={`text-xs ${fitsInGrid ? 'text-green-600' : 'text-amber-600'}`}>
                Grille : {gridColumns} x {gridRows}
                {!fitsInGrid && ' — Le texte dépasse de la grille, il sera coupé'}
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
                  className="inline-grid gap-px"
                  style={{
                    gridTemplateColumns: `repeat(${preview.width}, ${scale <= 1 ? 6 : scale <= 2 ? 4 : 3}px)`,
                  }}
                >
                  {Array.from({ length: preview.height }).map((_, row) =>
                    Array.from({ length: preview.width }).map((_, col) => {
                      const key = `${row}-${col}`;
                      const isOn = preview.grid[key];
                      return (
                        <div
                          key={key}
                          className="aspect-square rounded-sm"
                          style={{
                            backgroundColor: isOn ? previewColor : '#e2e8f0',
                            width: scale <= 1 ? 6 : scale <= 2 ? 4 : 3,
                            height: scale <= 1 ? 6 : scale <= 2 ? 4 : 3,
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
