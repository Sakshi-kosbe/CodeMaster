import React, { useState } from 'react';
import { 
  User, 
  X, 
  CheckCircle2, 
  Cloud, 
  CloudCheck, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Trophy, 
  BookMarked, 
  Clock, 
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { userStore } from '../../services/userStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const progress = userStore.getProgress();
  const syncStatus = userStore.getSyncStatus();

  const [emailInput, setEmailInput] = useState<string>('sakshikosbe@gmail.com');
  const [nameInput, setNameInput] = useState<string>('Sakshi Kosbe');
  const [mergeGuest, setMergeGuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    if (!emailInput.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid Google email address.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await userStore.loginWithGoogle(emailInput.trim(), nameInput.trim(), undefined, mergeGuest);
      if (res.success) {
        setFeedback({ 
          type: 'success', 
          message: res.isNewUser 
            ? 'Account created and synced to primary cloud database!' 
            : 'Welcome back! Loaded your persistent progress across devices.' 
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to authenticate.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Authentication error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    userStore.logoutToGuest();
    setFeedback({ type: 'success', message: 'Signed out. Switched to clean Guest Mode session.' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleManualSync = async () => {
    if (progress.isGuest) return;
    setIsLoading(true);
    try {
      await userStore.syncFromServer(progress.userId);
      setFeedback({ type: 'success', message: 'Synchronized with primary cloud database!' });
      setTimeout(() => setFeedback(null), 2500);
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Sync failed: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const solvedCount = Object.keys(progress.solvedQuestions || {}).length;
  const attemptedCount = Object.keys(progress.attemptedQuestions || {}).length;
  const bookmarkCount = progress.bookmarkedQuestionIds?.length || 0;
  const submissionCount = progress.submissionHistory?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {progress.isGuest ? 'Sign In / Account' : 'User Profile & Sync'}
              </h2>
              <div className="text-[10px] text-slate-400">
                {progress.isGuest ? 'Guest Mode (Local Sandbox)' : 'Authenticated Student'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {progress.isGuest ? (
            /* Guest View: Prompt to sign in with Google */
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Cloud className="w-4 h-4" /> Persistent Multi-Device Sync
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in with your Google account to automatically persist your solved questions, notes, revision schedules, and bookmarks to the primary database across browser refreshes and different devices.
                </p>
              </div>

              {/* Account Inputs */}
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Google Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                {/* Merge Progress Option */}
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeGuest}
                    onChange={(e) => setMergeGuest(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-300">
                    Migrate my current guest progress ({solvedCount} solved, {progress.xp} XP) into this account
                  </span>
                </label>
              </div>

              {/* Sign in with Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isLoading ? 'Signing In & Syncing...' : 'Sign In with Google'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  onClick={onClose}
                  className="text-[11px] text-slate-500 hover:text-slate-400 font-medium"
                >
                  Continue exploring in Guest Mode
                </button>
              </div>
            </div>
          ) : (
            /* Signed In View: Account Details, Cloud Sync, and Stats */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {progress.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        {progress.displayName}
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {progress.email}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Persistent Cloud
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Cloud className="w-3.5 h-3.5 text-indigo-400" /> Database Status:
                  </span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Persistent Across Devices
                  </span>
                </div>
              </div>

              {/* Progress Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Solved
                  </div>
                  <div className="font-mono text-base font-bold text-white">{solvedCount}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-purple-400" /> Total XP
                  </div>
                  <div className="font-mono text-base font-bold text-white">{progress.xp}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> Streak
                  </div>
                  <div className="font-mono text-base font-bold text-white">{progress.streak} days</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <BookMarked className="w-3 h-3 text-cyan-400" /> Bookmarks
                  </div>
                  <div className="font-mono text-base font-bold text-white">{bookmarkCount}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{isLoading ? 'Syncing with Server...' : 'Force Sync to Server Database'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account / Sign Out to Guest Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
