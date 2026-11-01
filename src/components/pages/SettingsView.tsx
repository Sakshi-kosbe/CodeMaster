import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Database, 
  Sparkles,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { userStore } from '../../services/userStore';
import { isFirebaseAvailable } from '../../services/firebase';

export const SettingsView: React.FC = () => {
  const [preferences, setPreferences] = useState(userStore.getPreferences());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const progress = userStore.getProgress();

  const handlePrefChange = (key: keyof typeof preferences, val: any) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    userStore.updatePreferences({ [key]: val });
  };

  const handleExportBackup = () => {
    const backupJson = userStore.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codemaster_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = userStore.importBackup(content);
      if (success) {
        setImportStatus('✅ Backup successfully imported!');
        setPreferences(userStore.getPreferences());
      } else {
        setImportStatus('❌ Error importing backup JSON.');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    userStore.clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Settings className="w-4 h-4" /> Preferences & System Setup
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your coding workspace, manage data backups, and verify database synchronizations.
        </p>
      </div>

      {/* Editor & Appearance Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Editor & Interface
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Theme */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Color Theme</div>
              <div className="text-slate-500">Dark high-contrast mode (developer standard)</div>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => handlePrefChange('theme', 'dark')}
                className={`p-1.5 rounded ${preferences.theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePrefChange('theme', 'light')}
                className={`p-1.5 rounded ${preferences.theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Font Size */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Monaco Editor Font Size</div>
              <div className="text-slate-500">Font size for code window</div>
            </div>
            <select
              value={preferences.editorFontSize}
              onChange={(e) => handlePrefChange('editorFontSize', parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1"
            >
              <option value={12}>12 px</option>
              <option value={14}>14 px (Default)</option>
              <option value={16}>16 px</option>
              <option value={18}>18 px</option>
            </select>
          </div>

          {/* Auto-Save Code */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Auto-Save Code Changes</div>
              <div className="text-slate-500">Persist user code across problem switches</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoSaveCode}
              onChange={(e) => handlePrefChange('autoSaveCode', e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Sound Celebrations */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Confetti Celebrations</div>
              <div className="text-slate-500">Visual feedback when solving problems</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.soundEnabled}
              onChange={(e) => handlePrefChange('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Target Goals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" /> Target Goals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Daily Target Problems:</span>
              <span className="font-mono text-emerald-400 font-bold">{preferences.dailyGoalQuestions} questions / day</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={preferences.dailyGoalQuestions}
              onChange={(e) => handlePrefChange('dailyGoalQuestions', parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Weekly Target Problems:</span>
              <span className="font-mono text-purple-400 font-bold">{preferences.weeklyTargetQuestions} questions / week</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={preferences.weeklyTargetQuestions}
              onChange={(e) => handlePrefChange('weeklyTargetQuestions', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Database & Sync Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> Database & Cloud Storage
        </h2>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Storage Architecture:</span>
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-medium">
              Dual-Layer Storage (IndexedDB + Cloud Firestore Ready)
            </span>
          </div>

          <div className="text-slate-400 leading-relaxed">
            All user progress, notes, submission attempts, and spaced repetition queues are stored locally and persistently in your browser with zero latency.
            {isFirebaseAvailable ? (
              <span className="text-emerald-400 font-bold ml-1">
                Firebase Firestore is connected and synchronized!
              </span>
            ) : (
              <span className="text-slate-300 ml-1">
                Guest Mode is active with persistent local storage. Cloud Firestore synchronization will activate automatically when a project is linked.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data Backup & Export / Import */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" /> Backup & Data Sovereignty
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" /> Export Progress Backup (JSON)
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4" /> Import Backup File
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {importStatus && (
            <span className="text-xs font-bold">{importStatus}</span>
          )}
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Reset Local Data
        </h2>

        <p className="text-xs text-slate-400">
          Clear all locally saved progress, solved question history, custom study notes, and streak tallies. This action cannot be undone.
        </p>

        {showClearConfirm ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
            >
              Confirm Clear All Data
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
          >
            Clear Guest Progress Data
          </button>
        )}
      </div>
    </div>
  );
};
