import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Layers, 
  BookOpen, 
  Briefcase, 
  Timer, 
  Zap, 
  RotateCcw, 
  BarChart3, 
  Bot, 
  Settings, 
  Search, 
  Flame, 
  Trophy, 
  Menu, 
  X, 
  User, 
  Terminal, 
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Database
} from 'lucide-react';

import { Question } from './types';
import { userStore } from './services/userStore';
import { QuestionStore } from './services/questionStore';

// Views
import { DashboardView } from './components/pages/DashboardView';
import { ProblemLibraryView } from './components/pages/ProblemLibraryView';
import { PythonLearningView } from './components/pages/PythonLearningView';
import { DSALearningView } from './components/pages/DSALearningView';
import { InterviewPrepView } from './components/pages/InterviewPrepView';
import { CodingTestsView } from './components/pages/CodingTestsView';
import { DailyChallengeView } from './components/pages/DailyChallengeView';
import { RevisionBookmarksView } from './components/pages/RevisionBookmarksView';
import { ProgressAnalyticsView } from './components/pages/ProgressAnalyticsView';
import { AIMentorView } from './components/pages/AIMentorView';
import { SettingsView } from './components/pages/SettingsView';
import { QuestionBankStatsView } from './components/pages/QuestionBankStatsView';
import { CodeWorkspace } from './components/workspace/CodeWorkspace';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState(userStore.getProgress());
  const [preferences, setPreferences] = useState(userStore.getPreferences());

  useEffect(() => {
    return userStore.subscribe(() => {
      setProgress(userStore.getProgress());
      setPreferences(userStore.getPreferences());
    });
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setCurrentView('workspace');
    setSearchModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'python', label: 'Python Learning', icon: Code2 },
    { id: 'dsa', label: 'DSA Practice', icon: Layers },
    { id: 'library', label: 'Problem Library', icon: BookOpen, badge: '1,000' },
    { id: 'stats', label: 'Question Bank Stats', icon: Database, badge: 'Verified' },
    { id: 'interview', label: 'Interview Preparation', icon: Briefcase },
    { id: 'tests', label: 'Coding Tests', icon: Timer },
    { id: 'daily', label: 'Daily Challenge', icon: Zap },
    { id: 'revision', label: 'Revision / Bookmarks', icon: RotateCcw },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'mentor', label: 'AI Coding Mentor', icon: Bot, highlight: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Quick search results (max 6)
  const searchResults = searchQuery.trim()
    ? QuestionStore.getAllQuestions().filter(q =>
        q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className={`min-h-screen flex flex-col ${preferences.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div
            onClick={() => { setCurrentView('dashboard'); setSelectedQuestion(null); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>CodeMaster</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wide -mt-0.5">
                Python & DSA Academy
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar (Center / Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <span>Search 1,000+ questions, algorithms, concepts...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Metric Counters & Profile */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div
            onClick={() => { setCurrentView('daily'); setSelectedQuestion(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-pointer hover:bg-amber-500/20 transition"
            title="Daily Practice Streak"
          >
            <Flame className="w-4 h-4 fill-amber-400/20" />
            <span className="text-xs font-bold font-mono">{progress.streak}</span>
          </div>

          {/* XP Points */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-bold">
            <Trophy className="w-4 h-4 text-purple-400 fill-purple-400/20" />
            <span>{progress.xp} XP</span>
          </div>

          {/* User Profile / Guest Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-200 leading-tight">
                {progress.displayName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {progress.isGuest ? 'Guest Mode' : 'Verified Student'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Curriculum & Practice
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id && !selectedQuestion;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSelectedQuestion(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : item.highlight
                      ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Progress Card */}
          <div className="p-4 border-t border-slate-800">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Academy Progress</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {Object.keys(progress.solvedQuestions).length} / 1,000
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((Object.keys(progress.solvedQuestions).length / 1000) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 h-full p-4 flex flex-col justify-between border-r border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <div className="font-bold text-white text-sm">Navigation Menu</div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setSelectedQuestion(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 text-center pt-4 border-t border-slate-800">
                CodeMaster • 1,000 Python & DSA Questions
              </div>
            </div>
          </div>
        )}

        {/* MAIN WORKSPACE OR PAGE VIEW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {currentView === 'workspace' && selectedQuestion ? (
            <CodeWorkspace
              question={selectedQuestion}
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'dashboard' ? (
            <DashboardView
              onSelectQuestion={handleSelectQuestion}
              onNavigate={(v) => setCurrentView(v)}
            />
          ) : currentView === 'library' ? (
            <ProblemLibraryView
              onSelectQuestion={handleSelectQuestion}
              onNavigateToStats={() => setCurrentView('stats')}
            />
          ) : currentView === 'stats' ? (
            <QuestionBankStatsView
              onNavigateToCategory={() => setCurrentView('library')}
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'python' ? (
            <PythonLearningView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'dsa' ? (
            <DSALearningView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'interview' ? (
            <InterviewPrepView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'tests' ? (
            <CodingTestsView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'daily' ? (
            <DailyChallengeView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'revision' ? (
            <RevisionBookmarksView
              onSelectQuestion={handleSelectQuestion}
            />
          ) : currentView === 'analytics' ? (
            <ProgressAnalyticsView />
          ) : currentView === 'mentor' ? (
            <AIMentorView />
          ) : (
            <SettingsView />
          )}
        </main>
      </div>

      {/* QUICK SEARCH MODAL (Cmd+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Search className="w-5 h-5 text-indigo-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type question ID (e.g. py-001, dsa-050) or topic..."
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1">
              {searchResults.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold">{q.id}</span>
                      <span className="font-bold text-slate-200">{q.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{q.topic} • {q.subtopic}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {q.difficulty}
                  </span>
                </div>
              ))}

              {searchQuery && searchResults.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-6">
                  No matching problems found for "{searchQuery}".
                </div>
              )}

              {!searchQuery && (
                <div className="text-xs text-slate-500 py-4 text-center">
                  Search across all 1,000 verified questions by title, ID, or topic.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
