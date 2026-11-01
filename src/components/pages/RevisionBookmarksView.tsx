import React, { useState } from 'react';
import { 
  RotateCcw, 
  Bookmark, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Trash2,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Question } from '../../types';
import { userStore } from '../../services/userStore';
import { QuestionStore } from '../../services/questionStore';

interface RevisionBookmarksViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const RevisionBookmarksView: React.FC<RevisionBookmarksViewProps> = ({
  onSelectQuestion
}) => {
  const [activeTab, setActiveTab] = useState<'spaced' | 'bookmarks' | 'notes'>('spaced');
  const progress = userStore.getProgress();

  const today = new Date().toISOString().split('T')[0];
  const dueItems = progress.revisionQueue.filter(r => r.nextReviewDate <= today);
  const upcomingItems = progress.revisionQueue.filter(r => r.nextReviewDate > today);

  const bookmarkedQuestions = progress.bookmarkedQuestionIds
    .map(id => QuestionStore.getQuestionById(id)!)
    .filter(Boolean);

  const notesList = Object.entries(progress.notes)
    .filter(([_, note]) => note.trim().length > 0)
    .map(([id, note]) => ({
      question: QuestionStore.getQuestionById(id)!,
      note
    }))
    .filter(item => Boolean(item.question));

  const handleReviewAction = (questionId: string, remembered: boolean) => {
    userStore.advanceRevision(questionId, remembered);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <RotateCcw className="w-4 h-4" /> Cognitive Retention
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Revision & Personal Knowledge Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            Scientifically scheduled spaced repetition (1d, 3d, 7d, 14d, 30d) and bookmarked questions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('spaced')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'spaced'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Spaced Repetition ({progress.revisionQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bookmarks ({bookmarkedQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Study Notes ({notesList.length})
          </button>
        </div>
      </div>

      {/* 1. Spaced Repetition Tab */}
      {activeTab === 'spaced' && (
        <div className="space-y-6">
          {/* Due Now Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Due for Review Today ({dueItems.length})
              </h2>
              <span className="text-xs text-slate-400">Review to strengthen long-term memory</span>
            </div>

            {dueItems.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                ✨ Zero reviews pending for today! All current questions are scheduled for later dates.
              </div>
            ) : (
              <div className="space-y-3">
                {dueItems.map((item, idx) => {
                  const q = QuestionStore.getQuestionById(item.questionId);
                  if (!q) return null;

                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div
                        onClick={() => onSelectQuestion(q)}
                        className="cursor-pointer space-y-1 flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 font-bold">{q.id}</span>
                          <span className="font-bold text-slate-200 text-sm hover:text-indigo-400 transition">
                            {q.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {q.topic} • Interval Level {item.revisionLevel}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleReviewAction(q.id, true)}
                          className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                        >
                          Remembered (+20 XP)
                        </button>
                        <button
                          onClick={() => handleReviewAction(q.id, false)}
                          className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                        >
                          Forgot (Reset to Day 1)
                        </button>
                        <button
                          onClick={() => onSelectQuestion(q)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                          title="Open Code Workspace"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-400" /> Upcoming Scheduled Revisions ({upcomingItems.length})
            </h2>

            <div className="space-y-2">
              {upcomingItems.map((item, idx) => {
                const q = QuestionStore.getQuestionById(item.questionId);
                if (!q) return null;

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-800/60 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{q.title}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Scheduled for review on: <span className="font-mono text-indigo-400">{item.nextReviewDate}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Level {item.revisionLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Bookmarked Questions Tab */}
      {activeTab === 'bookmarks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" /> Bookmarked Questions
          </h2>

          {bookmarkedQuestions.length === 0 ? (
            <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
              No bookmarked questions yet. Click the bookmark icon in the code workspace to save problems for quick access.
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarkedQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q)}
                  className="p-4 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-bold">{q.id}</span>
                      <span className="font-bold text-slate-200 text-sm group-hover:text-amber-400 transition">
                        {q.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{q.topic} • {q.subtopic}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {q.difficulty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        userStore.toggleBookmark(q.id);
                      }}
                      className="text-amber-400 hover:text-slate-400 p-1"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Personal Study Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Personal Study Notes Archive
          </h2>

          {notesList.length === 0 ? (
            <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
              No study notes recorded yet. Write notes in the workspace pane while solving any problem!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notesList.map(({ question, note }) => (
                <div
                  key={question.id}
                  onClick={() => onSelectQuestion(question)}
                  className="p-5 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 space-y-3 transition group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition">
                      {question.title}
                    </span>
                    <span className="font-mono text-slate-500">{question.id}</span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
