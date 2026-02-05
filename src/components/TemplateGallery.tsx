import React, { useState } from 'react';
import { Template, TEMPLATES, getCategories } from '../templates';
import { BeadType, PatternGrid } from '../types';
import { Sparkles, Search, Filter, Heart, Leaf, Shapes, Star, Type, Copy, X } from 'lucide-react';

interface TemplateGalleryProps {
  beadTypes: BeadType[];
  onApplyTemplate: (grid: PatternGrid, rows: number, columns: number, mode: 'loom' | 'peyote') => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ beadTypes, onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Repeat modal state
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [repeatX, setRepeatX] = useState(3);
  const [repeatY, setRepeatY] = useState(1);

  // Filter templates
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  // Map template bead colors to actual bead IDs and optionally repeat
  const applyTemplate = (template: Template, repX: number = 1, repY: number = 1) => {
    const newGrid: PatternGrid = {};

    // Create a mapping between template colors and available beads
    const colorToBeadMap: { [hex: string]: string } = {};
    const uniqueColors = new Set(Object.values(template.beadColors));

    uniqueColors.forEach(hex => {
      // Find closest matching bead color
      const closestBead = findClosestBead(hex);
      if (closestBead) {
        colorToBeadMap[hex] = closestBead.id;
      }
    });

    // Repeat the pattern repX times horizontally and repY times vertically
    for (let ry = 0; ry < repY; ry++) {
      for (let rx = 0; rx < repX; rx++) {
        Object.entries(template.grid).forEach(([key, templateBeadId]) => {
          const [r, c] = key.split('-').map(Number);
          const newR = r + (ry * template.rows);
          const newC = c + (rx * template.columns);
          const newKey = `${newR}-${newC}`;

          const hex = template.beadColors[key];
          if (hex && colorToBeadMap[hex]) {
            newGrid[newKey] = colorToBeadMap[hex];
          }
        });
      }
    }

    const totalRows = template.rows * repY;
    const totalColumns = template.columns * repX;

    onApplyTemplate(newGrid, totalRows, totalColumns, template.mode);
  };

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setShowRepeatModal(true);
  };

  const handleApplyWithRepeat = () => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate, repeatX, repeatY);
      setShowRepeatModal(false);
      setSelectedTemplate(null);
    }
  };

  // Find closest bead color (Euclidean distance in RGB space)
  const findClosestBead = (targetHex: string): BeadType | null => {
    if (beadTypes.length === 0) return null;

    const hex = targetHex.replace('#', '');
    const tr = parseInt(hex.substr(0, 2), 16);
    const tg = parseInt(hex.substr(2, 2), 16);
    const tb = parseInt(hex.substr(4, 2), 16);

    let closestBead = beadTypes[0];
    let minDistance = Infinity;

    beadTypes.forEach(bead => {
      const beadHex = bead.hex.replace('#', '');
      const br = parseInt(beadHex.substr(0, 2), 16);
      const bg = parseInt(beadHex.substr(2, 2), 16);
      const bb = parseInt(beadHex.substr(4, 2), 16);

      const distance = Math.sqrt(
        Math.pow(tr - br, 2) +
        Math.pow(tg - bg, 2) +
        Math.pow(tb - bb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestBead = bead;
      }
    });

    return closestBead;
  };

  // Render template thumbnail
  const renderThumbnail = (template: Template) => {
    const cellSize = 6;
    const maxWidth = 180;
    const maxHeight = 140;

    const gridWidth = template.columns * cellSize;
    const gridHeight = template.rows * cellSize;

    // Scale if needed
    const scale = Math.min(1, Math.min(maxWidth / gridWidth, maxHeight / gridHeight));
    const scaledCellSize = cellSize * scale;

    return (
      <div
        className="flex items-center justify-center bg-slate-100 rounded-lg p-2 border border-slate-200"
        style={{ minHeight: '140px' }}
      >
        <div style={{ width: 'fit-content', transform: `scale(${scale})`, transformOrigin: 'center' }}>
          {Array.from({ length: template.rows }).map((_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: template.columns }).map((_, c) => {
                const key = `${r}-${c}`;
                const hex = template.beadColors[key];
                return (
                  <div
                    key={c}
                    className="rounded-sm"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize * 0.81}px`,
                      backgroundColor: hex || 'transparent',
                      border: hex ? '0.5px solid rgba(0,0,0,0.1)' : 'none'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Category icons
  const categoryIcons: { [key: string]: React.ReactNode } = {
    geometrique: <Shapes size={16} />,
    floral: <Leaf size={16} />,
    animal: <Heart size={16} />,
    symbole: <Star size={16} />,
    alphabet: <Type size={16} />
  };

  // Difficulty colors
  const difficultyColors: { [key: string]: string } = {
    debutant: 'bg-green-100 text-green-700 border-green-300',
    intermediaire: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    avance: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Galerie de Templates</h2>
        </div>
        <p className="text-sm text-slate-600">
          {TEMPLATES.length} motifs prédéfinis pour commencer rapidement
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category & Difficulty Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Categories */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Filter size={14} />
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Tous
              </button>
              {getCategories().map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {categoryIcons[cat]}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="sm:w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficulté
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toutes</option>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Sparkles size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">Aucun template trouvé</p>
            <p className="text-sm">Essayez de changer les filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                {renderThumbnail(template)}

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-slate-800 mb-1">{template.name}</h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[template.difficulty]}`}>
                      {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {template.columns}×{template.rows}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {template.mode === 'loom' ? 'Loom' : 'Peyote'}
                    </span>
                  </div>

                  {/* Description */}
                  {template.description && (
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Apply Button */}
                  <button
                    onClick={() => handleTemplateClick(template)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors group-hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <Copy size={16} />
                    Utiliser ce motif
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-600 text-center">
          {filteredTemplates.length} template{filteredTemplates.length > 1 ? 's' : ''} affiché{filteredTemplates.length > 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` • Catégorie: ${selectedCategory}`}
          {selectedDifficulty !== 'all' && ` • Difficulté: ${selectedDifficulty}`}
        </p>
      </div>

      {/* Repeat Modal */}
      {showRepeatModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Copy size={20} className="text-indigo-600" />
                Répéter le motif
              </h3>
              <button
                onClick={() => {
                  setShowRepeatModal(false);
                  setSelectedTemplate(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-900 font-semibold mb-1">{selectedTemplate.name}</p>
                <p className="text-xs text-indigo-700">
                  Motif original: {selectedTemplate.columns}×{selectedTemplate.rows}
                </p>
              </div>

              {/* Horizontal Repeat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Répétitions horizontales (largeur du bracelet)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={repeatX}
                    onChange={(e) => setRepeatX(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={repeatX}
                    onChange={(e) => setRepeatX(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-center border border-slate-300 rounded"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Largeur finale: {selectedTemplate.columns * repeatX} colonnes
                </p>
              </div>

              {/* Vertical Repeat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Répétitions verticales (longueur du bracelet)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={repeatY}
                    onChange={(e) => setRepeatY(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={repeatY}
                    onChange={(e) => setRepeatY(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-center border border-slate-300 rounded"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Hauteur finale: {selectedTemplate.rows * repeatY} rangs
                </p>
              </div>

              {/* Preview Info */}
              <div className="bg-slate-100 p-3 rounded-lg">
                <p className="text-sm font-semibold text-slate-800 mb-1">Résultat final</p>
                <p className="text-xs text-slate-600">
                  • Dimensions: {selectedTemplate.columns * repeatX} × {selectedTemplate.rows * repeatY}<br />
                  • Mode: {selectedTemplate.mode === 'loom' ? 'Loom' : 'Peyote'}<br />
                  • Perles totales: ~{Object.keys(selectedTemplate.grid).length * repeatX * repeatY}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowRepeatModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyWithRepeat}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
