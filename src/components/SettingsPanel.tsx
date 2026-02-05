import React from 'react';
import { Settings, Info, Heart, Github, Mail } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const clearAllData = () => {
    if (confirm('Supprimer TOUS les projets sauvegardés ?\n\nCette action est irréversible !')) {
      if (confirm('Êtes-vous vraiment sûr(e) ? Tous vos bracelets seront perdus !')) {
        localStorage.clear();
        alert('Toutes les données ont été supprimées. Rechargez la page.');
      }
    }
  };

  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Settings size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Paramètres</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        
        {/* Storage Info */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Info size={18} />
            Stockage Local
          </h3>
          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <p>• Espace utilisé: <strong>{getStorageSize()} KB</strong></p>
            <p>• Limite navigateur: ~5-10 MB</p>
            <p>• Projets max recommandés: 50</p>
          </div>
          <button
            onClick={clearAllData}
            className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors border border-red-200"
          >
            ⚠️ Supprimer toutes les données
          </button>
        </div>

        {/* App Info */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-900 mb-3">
            À propos de PerleDesign Studio
          </h3>
          <div className="space-y-2 text-sm text-indigo-700">
            <p>• Version: 1.0.0</p>
            <p>• Créé avec React + TypeScript</p>
            <p>• Hébergé sur Vercel</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-3">
            Fonctionnalités
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Éditeur de motifs Loom & Peyote
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              40+ couleurs Miyuki Delica
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Outils de dessin avancés
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Sauvegarde automatique locale
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Export PDF & JSON
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Convertisseur d'images
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Support tactile mobile
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-3">
            Raccourcis Clavier
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Annuler</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Rétablir</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl+Y</kbd>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Copier</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl+C</kbd>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Coller</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl+V</kbd>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Échap</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">ESC</kbd>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Sauvegarder</span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Auto</kbd>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
          <p className="mb-2">Fait avec <Heart size={14} className="inline text-red-500" /> pour la communauté des tisseuses</p>
          <p>© 2024 PerleDesign Studio</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
