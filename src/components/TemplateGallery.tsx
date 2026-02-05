import React, { useState } from 'react';
import { Template, TEMPLATES, getCategories } from '../templates';
import { BeadType, PatternGrid } from '../types';
import { Sparkles, Search, Filter, Heart, Leaf, Shapes, Star, Type } from 'lucide-react';

interface TemplateGalleryProps {
  beadTypes: BeadType[];
  onApplyTemplate: (grid: PatternGrid, rows: number, columns: number, mode: 'loom' | 'peyote') => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ beadTypes, onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Filter templates
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  // Map template bead colors to actual bead IDs
  const applyTemplate = (template: Template) => {
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

    // Apply the mapping to create the final grid
    Object.entries(template.grid).forEach(([key, templateBeadId]) => {
      const hex = template.beadColors[key];
      if (hex && colorToBeadMap[hex]) {
        newGrid[key] = colorToBeadMap[hex];
      }
    });

    onApplyTemplate(newGrid, template.rows, template.columns, template.mode);
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
                    onClick={() => applyTemplate(template)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors group-hover:scale-105 transition-transform"
                  >
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
    </div>
  );
};

export default TemplateGallery;
