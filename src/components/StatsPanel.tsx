
import React from 'react';
import { BeadType, ProjectSettings, ProjectState } from '../types';
import { ClipboardList, Ruler, ShoppingCart, Minus, Plus, FileDown } from 'lucide-react';

interface StatsPanelProps {
  project: ProjectState;
  beadTypes: BeadType[];
  settings: ProjectSettings;
  setSettings: (s: ProjectSettings) => void;
  wristSizes: { label: string; value: number }[];
  beadSizes: { label: string; value: number }[];
  onResize: (dim: 'rows' | 'columns', delta: number) => void;
  onSetDimension: (dim: 'rows' | 'columns', value: number) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  project, beadTypes, settings, setSettings, wristSizes, beadSizes,
  onResize, onSetDimension
}) => {

  const shape = project.shape || 'bracelet';
  const isBracelet = shape === 'bracelet';
  const isSquare = shape === 'square' || shape === 'circle';
  const stitchStep = project.stitchStep || 2;
  const isOffsetIdx = (index: number, step: number) => Math.floor(index / step) % 2 !== 0;

  const beadWidth = settings.beadSizeMm;
  const beadHeight = settings.beadSizeMm * 0.85;

  const widthCm = (project.columns * beadWidth) / 10;
  const lengthCm = (project.rows * beadHeight) / 10;

  const targetLength = settings.wristSizeCm;

  // Inventory Count
  const inventory: Record<string, number> = {};
  Object.values(project.grid).forEach((val) => {
    const beadId = val as string;
    inventory[beadId] = (inventory[beadId] || 0) + 1;
  });
  const totalBeads = Object.values(inventory).reduce((a, b) => a + b, 0);

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'loom': return 'Loom';
      case 'peyote': return 'Peyote';
      case 'brick': return 'Brick';
      default: return mode;
    }
  };

  const getShapeLabel = (s: string) => {
    switch (s) {
      case 'bracelet': return 'Bracelet';
      case 'square': return 'Carré';
      case 'rectangle': return 'Rectangle';
      case 'circle': return 'Rond';
      case 'freeform': return 'Libre';
      default: return s;
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 15;
      const contentWidth = pageWidth - margin * 2; // 180mm

      const addFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Créé avec PerleDesign Studio', pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.setTextColor(0);
      };

      // Ensure yOffset doesn't overflow page, add new page if needed
      const ensureSpace = (needed: number, y: number): number => {
        if (y + needed > pageHeight - 15) {
          addFooter();
          doc.addPage();
          return 15;
        }
        return y;
      };

      // ===== PAGE 1: HEADER + PREVIEW + INFO =====
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PERLE DESIGN STUDIO', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Fiche Technique', pageWidth / 2, 22, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(margin, 25, pageWidth - margin, 25);

      let y = 30;

      // Preview image
      const previewElement = document.querySelector('[data-visual-preview]') as HTMLElement;
      if (previewElement) {
        try {
          const canvas = await html2canvas(previewElement, { backgroundColor: '#f8fafc', scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const imgW = contentWidth;
          const imgH = Math.min((canvas.height * imgW) / canvas.width, 45);
          doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
          y += imgH + 8;
        } catch (err) {
          console.warn('Could not capture preview:', err);
        }
      }

      // --- Info section (2 columns) ---
      const col1X = margin;
      const col2X = margin + contentWidth / 2;

      // Left column: Material list
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Matériel Nécessaire', col1X, y);
      let matY = y + 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (totalBeads === 0) {
        doc.text('Aucune perle utilisée', col1X, matY);
        matY += 5;
      } else {
        Object.entries(inventory).forEach(([beadId, count]) => {
          const bead = beadTypes.find(b => b.id === beadId);
          if (!bead) return;
          const grams = (count * 0.005).toFixed(1);
          doc.setFillColor(bead.hex);
          doc.roundedRect(col1X, matY - 3, 4, 3.2, 0.3, 0.3, 'F');
          doc.setDrawColor(180);
          doc.roundedRect(col1X, matY - 3, 4, 3.2, 0.3, 0.3, 'S');
          doc.text(`${bead.name}: ${count} perles (~${grams}g)`, col1X + 6, matY);
          matY += 5;
        });
      }

      // Right column: Dimensions + Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dimensions', col2X, y);
      let infoY = y + 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Largeur: ${widthCm.toFixed(1)} cm (${project.columns} colonnes)`, col2X, infoY);
      infoY += 5;
      doc.text(`Longueur: ${lengthCm.toFixed(1)} cm (${project.rows} rangs)`, col2X, infoY);
      infoY += 5;
      if (isBracelet) {
        doc.text(`Tour de poignet: ${settings.wristSizeCm} cm`, col2X, infoY);
        infoY += 5;
      }
      infoY += 3;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Informations', col2X, infoY);
      infoY += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const beadSizeLabel = beadSizes.find(s => s.value === settings.beadSizeMm)?.label || 'Delica 11/0';
      doc.text(`Type: ${beadSizeLabel}`, col2X, infoY); infoY += 5;
      doc.text(`Forme: ${getShapeLabel(shape)}`, col2X, infoY); infoY += 5;
      doc.text(`Mode: ${getModeLabel(project.mode)}${project.mode !== 'loom' ? ` (1/${stitchStep})` : ''}`, col2X, infoY); infoY += 5;
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, col2X, infoY);

      y = Math.max(matY, infoY) + 8;

      // ===== GRID SCHEMA (full width, multi-page) =====
      const totalCols = project.columns;
      const totalRows = project.rows;
      const gridMarginLeft = margin + 8; // room for row labels
      const gridAvailWidth = contentWidth - 8; // minus label space

      // Dynamic cell size: fit all columns in available width, cap at 4mm
      const cellW = Math.min(gridAvailWidth / totalCols, 4);
      const cellH = cellW * 0.8; // Delica ratio
      const labelFontSize = Math.max(3.5, Math.min(6, cellW * 1.6));
      const radius = Math.min(0.3, cellW * 0.1);

      // How many rows fit on remaining space of current page
      const firstPageAvail = pageHeight - y - 20;
      const rowsFirstPage = Math.max(1, Math.floor(firstPageAvail / cellH));
      const rowsPerFullPage = Math.max(1, Math.floor((pageHeight - 30) / cellH));

      let rowsDrawn = 0;
      let pageNum = 0;

      while (rowsDrawn < totalRows) {
        const isFirstGridPage = (pageNum === 0);
        if (!isFirstGridPage) {
          addFooter();
          doc.addPage();
          y = 15;
        }

        const maxRowsThisPage = isFirstGridPage ? rowsFirstPage : rowsPerFullPage;
        const startRow = rowsDrawn;
        const endRow = Math.min(startRow + maxRowsThisPage, totalRows);

        // Section title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const gridTitle = totalRows > maxRowsThisPage
          ? `Schéma (rangs ${startRow + 1}-${endRow})`
          : 'Schéma de la Grille';
        doc.text(gridTitle, margin, y);
        y += 5;

        const gridStartY = y + (labelFontSize > 4 ? 3 : 2);

        // Column headers
        doc.setFontSize(labelFontSize);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        for (let c = 0; c < totalCols; c++) {
          doc.text(
            (c + 1).toString(),
            gridMarginLeft + c * cellW + cellW / 2,
            gridStartY - 1,
            { align: 'center' }
          );
        }
        doc.setTextColor(0);

        // Draw rows
        for (let r = startRow; r < endRow; r++) {
          const localR = r - startRow;

          // Row label
          doc.setFontSize(labelFontSize);
          doc.setTextColor(100);
          doc.text(
            (r + 1).toString(),
            gridMarginLeft - 1.5,
            gridStartY + localR * cellH + cellH * 0.65,
            { align: 'right' }
          );
          doc.setTextColor(0);

          for (let c = 0; c < totalCols; c++) {
            const beadId = project.grid[`${r}-${c}`];
            const bead = beadTypes.find(b => b.id === beadId);

            let x = gridMarginLeft + c * cellW;
            let cellY = gridStartY + localR * cellH;

            if (project.mode === 'peyote' && isOffsetIdx(c, stitchStep)) {
              cellY += cellH / 2;
            } else if (project.mode === 'brick' && isOffsetIdx(r, stitchStep)) {
              x += cellW / 2;
            }

            if (bead) {
              doc.setFillColor(bead.hex);
              doc.roundedRect(x, cellY, cellW, cellH, radius, radius, 'F');
            }
            doc.setDrawColor(200);
            doc.roundedRect(x, cellY, cellW, cellH, radius, radius, 'S');
          }
        }

        rowsDrawn = endRow;
        pageNum++;
      }

      // Footer on last page
      addFooter();

      doc.save(`fiche-technique-${shape}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Assurez-vous que votre navigateur supporte cette fonctionnalité.');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <ClipboardList size={20} className="text-indigo-600"/>
          Fiche Technique
        </h3>
        <button
          onClick={generatePDF}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          title="Télécharger la fiche technique en PDF"
        >
          <FileDown size={16} />
          PDF
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {/* Settings */}
        <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Type de Perle</label>
            <select
              value={settings.beadSizeMm}
              onChange={(e) => setSettings({...settings, beadSizeMm: Number(e.target.value)})}
              className="w-full bg-white border border-slate-200 rounded text-sm p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700"
            >
              {beadSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {isBracelet && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tour de poignet Cible</label>
              <select
                value={settings.wristSizeCm}
                onChange={(e) => setSettings({...settings, wristSizeCm: Number(e.target.value)})}
                className="w-full bg-white border border-slate-200 rounded text-sm p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700"
              >
                {wristSizes.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Dimensions Control & Display */}
        <div>
           <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Ruler size={16} /> Dimensions & Ajustement
           </h4>

           {isSquare ? (
             /* Single size control for square/circle */
             <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center mb-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">{shape === 'circle' ? 'Diamètre' : 'Taille'} (Colonnes)</span>
                 <div className="flex items-center gap-1 mb-1 bg-white border border-slate-200 rounded p-0.5">
                     <button onClick={() => onResize('columns', -1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Minus size={14}/></button>
                     <input
                       type="number"
                       value={project.columns}
                       onChange={(e) => onSetDimension('columns', Math.max(1, parseInt(e.target.value) || 1))}
                       className="w-10 text-center text-sm font-bold outline-none border-none p-0 bg-white text-slate-900 placeholder-slate-400"
                     />
                     <button onClick={() => onResize('columns', 1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Plus size={14}/></button>
                 </div>
                 <div className="text-xs font-bold text-indigo-600 mt-1">{widthCm.toFixed(1)} × {widthCm.toFixed(1)} cm</div>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Columns Control */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Largeur (Colonnes)</span>
                  <div className="flex items-center gap-1 mb-1 bg-white border border-slate-200 rounded p-0.5">
                      <button onClick={() => onResize('columns', -1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Minus size={14}/></button>
                      <input
                        type="number"
                        value={project.columns}
                        onChange={(e) => onSetDimension('columns', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-10 text-center text-sm font-bold outline-none border-none p-0 bg-white text-slate-900 placeholder-slate-400"
                      />
                      <button onClick={() => onResize('columns', 1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Plus size={14}/></button>
                  </div>
                  <div className="text-xs font-bold text-indigo-600 mt-1">{widthCm.toFixed(1)} cm</div>
              </div>

              {/* Rows Control */}
              <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col items-center relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Longueur (Rangs)</span>
                  <div className="flex items-center gap-1 mb-1 bg-white border border-slate-200 rounded p-0.5">
                      <button onClick={() => onResize('rows', -1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Minus size={14}/></button>
                      <input
                        type="number"
                        value={project.rows}
                        onChange={(e) => onSetDimension('rows', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-10 text-center text-sm font-bold outline-none border-none p-0 bg-white text-slate-900 placeholder-slate-400"
                      />
                      <button onClick={() => onResize('rows', 1)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"><Plus size={14}/></button>
                  </div>
                  <div className={`text-xs font-bold mt-1 ${isBracelet && lengthCm < targetLength ? 'text-amber-600' : 'text-green-600'}`}>
                    {lengthCm.toFixed(1)} cm
                  </div>
                  {/* Mini progress bar (bracelet only) */}
                  {isBracelet && (
                    <div className="absolute bottom-0 left-0 h-1 bg-slate-200 w-full">
                       <div className={`h-full ${lengthCm < targetLength ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (lengthCm / targetLength) * 100)}%` }}></div>
                    </div>
                  )}
              </div>
             </div>
           )}

           {isBracelet && (
             <div className="text-xs text-center bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100">
               {lengthCm < targetLength ? (
                 <span>Objectif: <strong>{targetLength}cm</strong>. Manque <strong>{(targetLength - lengthCm).toFixed(1)} cm</strong>.</span>
               ) : (
                  <span>Longueur atteinte pour {settings.wristSizeCm}cm !</span>
               )}
             </div>
           )}
        </div>

        <hr className="border-slate-100" />

        {/* Material List */}
        <div>
           <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
             <ShoppingCart size={16} /> Matériel ({totalBeads} perles)
           </h4>
           {totalBeads === 0 ? (
             <p className="text-xs text-slate-400 italic text-center py-4">Dessinez pour voir le matériel.</p>
           ) : (
             <ul className="space-y-1">
               {Object.entries(inventory).map(([beadId, count]) => {
                 const bead = beadTypes.find(b => b.id === beadId);
                 if (!bead) return null;
                 const grams = (count * 0.005).toFixed(1);
                 return (
                   <li key={beadId} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 rounded border-l-4 border-slate-200" style={{ borderLeftColor: bead.hex }}>
                     <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{bead.name}</span>
                     </div>
                     <div className="text-right">
                       <span className="font-bold text-indigo-600 block">{count} p.</span>
                       <span className="text-[10px] text-slate-400">~{grams}g</span>
                     </div>
                   </li>
                 )
               })}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
