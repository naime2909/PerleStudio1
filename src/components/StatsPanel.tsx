
import React from 'react';
import { BeadType, BraceletSettings, ProjectState } from '../types';
import { ClipboardList, Ruler, ShoppingCart, Minus, Plus, FileDown } from 'lucide-react';

interface StatsPanelProps {
  project: ProjectState;
  beadTypes: BeadType[];
  settings: BraceletSettings;
  setSettings: (s: BraceletSettings) => void;
  wristSizes: { label: string; value: number }[];
  beadSizes: { label: string; value: number }[];
  onResize: (dim: 'rows' | 'columns', delta: number) => void;
  onSetDimension: (dim: 'rows' | 'columns', value: number) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  project, beadTypes, settings, setSettings, wristSizes, beadSizes,
  onResize, onSetDimension
}) => {
  
  // Dimensions estimations
  // Miyuki Delica 11/0 is approx 1.6mm wide x 1.3mm high (hole to hole length)
  // But usually settings.beadSizeMm is the 'pitch'
  
  const beadWidth = settings.beadSizeMm;
  const beadHeight = settings.beadSizeMm * 0.85; // Usually height is slightly less than width for seed beads in patterns
  
  const braceletWidthCm = (project.columns * beadWidth) / 10;
  const braceletLengthCm = (project.rows * beadHeight) / 10;
  
  const targetLength = settings.wristSizeCm;

  // Inventory Count
  const inventory: Record<string, number> = {};
  Object.values(project.grid).forEach((val) => {
    const beadId = val as string;
    inventory[beadId] = (inventory[beadId] || 0) + 1;
  });
  const totalBeads = Object.values(inventory).reduce((a, b) => a + b, 0);

  const generatePDF = async () => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PERLE DESIGN STUDIO', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Fiche Technique', pageWidth / 2, 22, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(15, 25, pageWidth - 15, 25);

      // Get preview canvas (horizontal bracelet view)
      const previewElement = document.querySelector('[data-visual-preview]') as HTMLElement;
      let yOffset = 30;
      
      if (previewElement) {
        try {
          const canvas = await html2canvas(previewElement, {
            backgroundColor: '#f8fafc',
            scale: 2
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 30;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          doc.addImage(imgData, 'PNG', 15, yOffset, imgWidth, Math.min(imgHeight, 40));
          yOffset += Math.min(imgHeight, 40) + 10;
        } catch (err) {
          console.warn('Could not capture preview:', err);
          yOffset += 5;
        }
      }

      // Left: Grid schema (simplified)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Schéma de la Grille', 15, yOffset);
      yOffset += 7;
      
      const gridStartY = yOffset;
      // Dimensions réalistes des perles Miyuki Delica (ratio 1.23:1)
      const cellWidth = 3;
      const cellHeight = 2.4;
      const maxCols = Math.min(project.columns, 20);
      const maxRows = Math.min(project.rows, 30);

      // Draw grid
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      for (let c = 0; c < maxCols; c++) {
        doc.text((c + 1).toString(), 20 + c * cellWidth, gridStartY - 1, { align: 'center' });
      }

      for (let r = 0; r < maxRows; r++) {
        doc.text((r + 1).toString(), 16, gridStartY + r * cellHeight + 1.2);

        for (let c = 0; c < maxCols; c++) {
          const beadId = project.grid[`${r}-${c}`];
          const bead = beadTypes.find(b => b.id === beadId);

          // Calculate position with Peyote offset
          const x = 20 + c * cellWidth;
          let y = gridStartY + r * cellHeight;

          // Apply Peyote offset: odd columns are shifted down
          if (project.mode === 'peyote' && c % 2 !== 0) {
            y += cellHeight / 2;
          }

          if (bead) {
            doc.setFillColor(bead.hex);
            doc.roundedRect(x, y, cellWidth, cellHeight, 0.3, 0.3, 'F');
          }
          doc.roundedRect(x, y, cellWidth, cellHeight, 0.3, 0.3, 'S');
        }
      }

      // Calculate grid end position with Peyote offset
      const peyoteOffset = project.mode === 'peyote' ? cellHeight / 2 : 0;
      const gridEndY = gridStartY + maxRows * cellHeight + peyoteOffset + 5;
      
      // Right side info
      const rightX = 110;
      let rightY = gridStartY;
      
      // Material list
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Matériel Nécessaire', rightX, rightY);
      rightY += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (totalBeads === 0) {
        doc.text('Aucune perle utilisée', rightX, rightY);
        rightY += 6;
      } else {
        Object.entries(inventory).forEach(([beadId, count]) => {
          const bead = beadTypes.find(b => b.id === beadId);
          if (!bead) return;
          
          const grams = (count * 0.005).toFixed(1);
          doc.setFillColor(bead.hex);
          doc.roundedRect(rightX, rightY - 3, 4, 3.2, 0.3, 0.3, 'F');
          doc.roundedRect(rightX, rightY - 3, 4, 3.2, 0.3, 0.3, 'S');
          
          doc.text(`${bead.name}: ${count} perles (~${grams}g)`, rightX + 6, rightY);
          rightY += 5;
        });
      }
      
      rightY += 3;
      
      // Dimensions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dimensions', rightX, rightY);
      rightY += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Largeur: ${braceletWidthCm.toFixed(1)} cm (${project.columns} colonnes)`, rightX, rightY);
      rightY += 5;
      doc.text(`Longueur: ${braceletLengthCm.toFixed(1)} cm (${project.rows} rangs)`, rightX, rightY);
      rightY += 5;
      doc.text(`Tour de poignet: ${settings.wristSizeCm} cm`, rightX, rightY);
      rightY += 8;
      
      // Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Informations', rightX, rightY);
      rightY += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const beadSizeLabel = beadSizes.find(s => s.value === settings.beadSizeMm)?.label || 'Delica 11/0';
      doc.text(`Type: ${beadSizeLabel}`, rightX, rightY);
      rightY += 5;
      doc.text(`Mode: ${project.mode === 'loom' ? 'Loom' : 'Peyote'}`, rightX, rightY);
      rightY += 5;
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, rightX, rightY);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Créé avec PerleDesign Studio', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save
      doc.save('fiche-technique-bracelet.pdf');
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
        </div>

        <hr className="border-slate-100" />

        {/* Dimensions Control & Display */}
        <div>
           <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Ruler size={16} /> Dimensions & Ajustement
           </h4>
           
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
                  <div className="text-xs font-bold text-indigo-600 mt-1">{braceletWidthCm.toFixed(1)} cm</div>
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
                  <div className={`text-xs font-bold mt-1 ${braceletLengthCm < targetLength ? 'text-amber-600' : 'text-green-600'}`}>
                    {braceletLengthCm.toFixed(1)} cm
                  </div>
                  {/* Mini progress bar */}
                  <div className="absolute bottom-0 left-0 h-1 bg-slate-200 w-full">
                     <div className={`h-full ${braceletLengthCm < targetLength ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (braceletLengthCm / targetLength) * 100)}%` }}></div>
                  </div>
              </div>
           </div>
           
           <div className="text-xs text-center bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100">
             {braceletLengthCm < targetLength ? (
               <span>Objectif: <strong>{targetLength}cm</strong>. Manque <strong>{(targetLength - braceletLengthCm).toFixed(1)} cm</strong>.</span>
             ) : (
                <span>Longueur atteinte pour {settings.wristSizeCm}cm !</span>
             )}
           </div>
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
                 const grams = (count * 0.005).toFixed(1); // Approx 0.005g per Delica
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
