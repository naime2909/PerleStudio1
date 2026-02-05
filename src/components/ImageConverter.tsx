import React, { useState, useRef } from 'react';
import { BeadType, PatternGrid } from '../types';
import { Image as ImageIcon, Upload, Sliders, Zap } from 'lucide-react';

interface ImageConverterProps {
  beadTypes: BeadType[];
  targetColumns: number;
  onApply: (grid: PatternGrid, rows: number, columns: number) => void;
}

const ImageConverter: React.FC<ImageConverterProps> = ({ beadTypes, targetColumns, onApply }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewGrid, setPreviewGrid] = useState<PatternGrid>({});
  const [previewRows, setPreviewRows] = useState(0);
  const [previewColumns, setPreviewColumns] = useState(targetColumns);
  
  const [columns, setColumns] = useState(targetColumns);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert RGB to LAB color space (more perceptually accurate)
  const rgbToLab = (r: number, g: number, b: number): [number, number, number] => {
    // Convert RGB to XYZ
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;

    rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
    gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
    bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

    rNorm *= 100;
    gNorm *= 100;
    bNorm *= 100;

    // Observer = 2°, Illuminant = D65
    let x = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
    let y = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
    let z = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 0.9505;

    // Convert XYZ to LAB
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

    const L = (116 * y) - 16;
    const A = 500 * (x - y);
    const B = 200 * (y - z);

    return [L, A, B];
  };

  // Color distance calculation using Delta E (CIE76) in LAB space
  // More perceptually accurate than RGB Euclidean distance
  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
    const [L1, A1, B1] = rgbToLab(r1, g1, b1);
    const [L2, A2, B2] = rgbToLab(r2, g2, b2);

    return Math.sqrt(
      Math.pow(L1 - L2, 2) +
      Math.pow(A1 - A2, 2) +
      Math.pow(B1 - B2, 2)
    );
  };

  // Find closest bead color
  const findClosestBead = (r: number, g: number, b: number): BeadType | null => {
    if (beadTypes.length === 0) return null;

    let closestBead = beadTypes[0];
    let minDistance = Infinity;

    beadTypes.forEach(bead => {
      // Convert hex to RGB
      const hex = bead.hex.replace('#', '');
      const br = parseInt(hex.substr(0, 2), 16);
      const bg = parseInt(hex.substr(2, 2), 16);
      const bb = parseInt(hex.substr(4, 2), 16);

      const dist = colorDistance(r, g, b, br, bg, bb);
      if (dist < minDistance) {
        minDistance = dist;
        closestBead = bead;
      }
    });

    return closestBead;
  };

  // Process image and convert to bead grid
  const processImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Calculate dimensions
    const aspectRatio = image.height / image.width;
    const rows = Math.round(columns * aspectRatio);

    canvas.width = columns;
    canvas.height = rows;

    // Apply filters
    ctx.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
    ctx.drawImage(image, 0, 0, columns, rows);
    ctx.filter = 'none';

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, columns, rows);
    const pixels = imageData.data;

    // Convert to bead grid
    const newGrid: PatternGrid = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const index = (r * columns + c) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];

        // Skip transparent pixels
        if (alpha < 128) continue;

        const bead = findClosestBead(red, green, blue);
        if (bead) {
          newGrid[`${r}-${c}`] = bead.id;
        }
      }
    }

    setPreviewGrid(newGrid);
    setPreviewRows(rows);
    setPreviewColumns(columns);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Trigger initial processing
        setTimeout(() => {
          setImage(img);
        }, 100);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Auto-process when settings change
  React.useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, columns, contrast, brightness, saturation]);

  const handleApply = () => {
    if (Object.keys(previewGrid).length > 0) {
      onApply(previewGrid, previewRows, previewColumns);
      // Reset
      setImage(null);
      setPreviewGrid({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewGrid({});
    setColumns(targetColumns);
    setContrast(100);
    setBrightness(100);
    setSaturation(100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Convertir Image en Perles</h2>
        </div>
        <p className="text-sm text-slate-600">
          Transformez n'importe quelle image en motif de perles Miyuki
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!image ? (
          /* Upload Section */
          <div className="flex flex-col items-center justify-center h-full">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md p-12 border-4 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer text-center"
            >
              <Upload size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Choisir une image
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                PNG, JPG, SVG • Max 5MB
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                <Upload size={16} />
                Parcourir
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Tips */}
            <div className="mt-8 max-w-md text-left">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                Conseils pour un bon résultat :
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Utilisez des images simples et contrastées</li>
                <li>✓ Les logos et icônes fonctionnent très bien</li>
                <li>✓ Évitez les photos trop détaillées</li>
                <li>✓ Un fond transparent facilite la conversion</li>
                <li>✨ <strong>Nouveau :</strong> Correspondance des couleurs améliorée (LAB)</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Preview & Settings */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Sliders size={18} />
                  Ajustements
                </h3>

                {/* Columns */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Largeur (colonnes)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={columns}
                      onChange={(e) => setColumns(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="10"
                      max="50"
                      value={columns}
                      onChange={(e) => setColumns(parseInt(e.target.value) || 10)}
                      className="w-16 px-2 py-1 text-center border border-slate-300 rounded"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hauteur: ~{previewRows} rangs (automatique)
                  </p>
                </div>

                {/* Contrast */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contraste: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Brightness */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Luminosité: {brightness}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Saturation */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Saturation: {saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setContrast(100);
                    setBrightness(100);
                    setSaturation(100);
                  }}
                  className="w-full px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>

              {/* Stats */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">Résultat</h4>
                <div className="space-y-1 text-sm text-indigo-700">
                  <p>• Dimensions: {previewColumns} × {previewRows}</p>
                  <p>• Perles: {Object.keys(previewGrid).length}</p>
                  <p>• Couleurs: {new Set(Object.values(previewGrid)).size}</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-3">Aperçu</h3>
                <div className="bg-white p-2 rounded border border-slate-300 overflow-auto max-h-96">
                  {previewRows > 0 && (
                    <div style={{ width: 'fit-content' }}>
                      {Array.from({ length: previewRows }).map((_, r) => (
                        <div key={r} className="flex">
                          {Array.from({ length: previewColumns }).map((_, c) => {
                            const beadId = previewGrid[`${r}-${c}`];
                            const bead = beadTypes.find(b => b.id === beadId);
                            return (
                              <div
                                key={c}
                                className="border border-slate-200"
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: bead?.hex || '#ffffff'
                                }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  disabled={Object.keys(previewGrid).length === 0}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Appliquer au Motif
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverter;
