import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, username: string) => Promise<any>;
  onGoogleSignIn: () => Promise<any>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignIn, onSignUp, onGoogleSignIn }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (username.length < 3) {
          setError('Le pseudo doit faire au moins 3 caractères');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Le mot de passe doit faire au moins 6 caractères');
          setLoading(false);
          return;
        }
        await onSignUp(email, password, username);
        setSuccess('Compte créé ! Vérifie ton email pour confirmer ton inscription.');
      } else {
        await onSignIn(email, password);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Une erreur est survenue';
      if (msg.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('already registered')) {
        setError('Cet email est déjà utilisé');
      } else if (msg.includes('duplicate key') && msg.includes('username')) {
        setError('Ce pseudo est déjà pris');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {mode === 'login'
              ? 'Connecte-toi pour sauvegarder et partager tes créations'
              : 'Rejoins la communauté PerleDesign Studio'}
          </p>
        </div>

        <div className="p-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          >
            <Chrome size={20} />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ou par email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Pseudo (min. 3 caractères)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Mot de passe (min. 6 caractères)' : 'Mot de passe'}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} />
                  Se connecter
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-slate-500 mt-4">
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-indigo-600 font-semibold hover:underline">
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-indigo-600 font-semibold hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
