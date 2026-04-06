import React, { useState } from 'react';
import { X, Save, Layout, Sparkles } from 'lucide-react';

interface SaveModalProps {
  projectName: string;
  isLoggedIn: boolean;
  onSaveProject: () => void;
  onSaveAsTemplate: (opts: {
    name: string;
    category: 'geometrique' | 'floral' | 'animal' | 'symbole' | 'alphabet' | 'custom';
    difficulty: 'debutant' | 'intermediaire' | 'avance';
    description: string;
  }) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'custom', label: 'Perso' },
  { value: 'geometrique', label: 'Géométrique' },
  { value: 'floral', label: 'Floral' },
  { value: 'animal', label: 'Animal' },
  { value: 'symbole', label: 'Symbole' },
  { value: 'alphabet', label: 'Alphabet' },
] as const;

const DIFFICULTIES = [
  { value: 'debutant', label: 'Débutant', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'intermediaire', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'avance', label: 'Avancé', color: 'bg-red-100 text-red-700 border-red-300' },
] as const;

const SaveModal: React.FC<SaveModalProps> = ({ projectName, isLoggedIn, onSaveProject, onSaveAsTemplate, onClose }) => {
  const [mode, setMode] = useState<'choose' | 'template'>('choose');
  const [templateName, setTemplateName] = useState(projectName);
  const [category, setCategory] = useState<SaveModalProps['onSaveAsTemplate'] extends (opts: infer O) => void ? O extends { category: infer C } ? C : never : never>('custom');
  const [difficulty, setDifficulty] = useState<'debutant' | 'intermediaire' | 'avance'>('debutant');
  const [description, setDescription] = useState('');

  const handleSaveProject = () => {
    onSaveProject();
    onClose();
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate({
      name: templateName.trim(),
      category,
      difficulty,
      description: description.trim(),
    });
    onClose();
  };

  if (mode === 'choose') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Save size={20} className="text-indigo-600" />
              Sauvegarder
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {/* Save as project */}
            <button
              onClick={handleSaveProject}
              className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                <Save size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Sauvegarder le projet</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Enregistre "{projectName}" {isLoggedIn ? 'en local + cloud' : 'en local'}
                </p>
              </div>
            </button>

            {/* Save as template */}
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  alert('Connectez-vous pour sauvegarder un template personnalisé.');
                  return;
                }
                setMode('template');
              }}
              className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                <Layout size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Sauvegarder comme template</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isLoggedIn
                    ? 'Crée un motif réutilisable dans votre galerie'
                    : 'Connexion requise pour cette fonctionnalité'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Template form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            Nouveau template
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du template</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Mon super motif..."
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as typeof category)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    category === cat.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulté</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    difficulty === d.value
                      ? d.color + ' ring-2 ring-offset-1 ring-purple-400'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="Décrivez votre motif..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-slate-200">
          <button
            onClick={() => setMode('choose')}
            className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Créer le template
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
