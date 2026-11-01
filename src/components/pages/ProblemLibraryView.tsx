import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Shuffle, 
  CheckCircle2, 
  Bookmark, 
  Clock, 
  ArrowUpDown, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Database
} from 'lucide-react';
import { Question, Category, Difficulty } from '../../types';
import { QuestionStore, FilterOptions } from '../../services/questionStore';
import { userStore } from '../../services/userStore';

interface ProblemLibraryViewProps {
  onSelectQuestion: (question: Question) => void;
  onNavigateToStats?: () => void;
}

export const ProblemLibraryView: React.FC<ProblemLibraryViewProps> = ({
  onSelectQuestion,
  onNavigateToStats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'solved' | 'unsolved' | 'attempted'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'difficulty' | 'relevance'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const progress = userStore.getProgress();
  const solvedIds = useMemo(() => new Set(Object.keys(progress.solvedQuestions)), [progress.solvedQuestions]);
  const attemptedIds = useMemo(() => new Set(Object.keys(progress.attemptedQuestions)), [progress.attemptedQuestions]);
  const bookmarkedIds = useMemo(() => new Set(progress.bookmarkedQuestionIds), [progress.bookmarkedQuestionIds]);
  const revisionIds = useMemo(() => new Set(progress.revisionQueue.map(r => r.questionId)), [progress.revisionQueue]);

  // Available topics for selected category
  const availableTopics = useMemo(() => {
    return QuestionStore.getTopics(selectedCategory === 'all' ? undefined : selectedCategory);
  }, [selectedCategory]);

  const filterOptions: FilterOptions = {
    category: selectedCategory,
    topic: selectedTopic,
    difficulty: selectedDifficulty,
    status: selectedStatus,
    bookmarkedOnly,
    searchQuery,
    sortBy,
    sortOrder
  };

  const filteredQuestions = useMemo(() => {
    return QuestionStore.filterQuestions(filterOptions, solvedIds, attemptedIds, bookmarkedIds, revisionIds);
  }, [selectedCategory, selectedTopic, selectedDifficulty, selectedStatus, bookmarkedOnly, searchQuery, sortBy, sortOrder, solvedIds, attemptedIds, bookmarkedIds]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

  const handlePickRandom = () => {
    const q = QuestionStore.getRandomQuestion(
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedDifficulty === 'all' ? undefined : selectedDifficulty
    );
    if (q) onSelectQuestion(q);
  };

  const stats = QuestionStore.getDatasetStats();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Comprehensive Question Bank
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Problem Library ({stats.total} Questions)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse 300 Python, 600 DSA, and 100 Computer Science interview problems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onNavigateToStats && (
            <button
              onClick={onNavigateToStats}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition"
            >
              <Database className="w-4 h-4 text-indigo-400" /> Question Bank Stats
            </button>
          )}

          {/* Quick Action: Random Question */}
          <button
            onClick={handlePickRandom}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            <Shuffle className="w-4 h-4" /> Pick Random Problem
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedCategory('all'); setSelectedTopic('all'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Categories ({stats.total})
        </button>

        <button
          onClick={() => { setSelectedCategory('python'); setSelectedTopic('all'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedCategory === 'python'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" /> Python Programming ({stats.pythonTotal})
        </button>

        <button
          onClick={() => { setSelectedCategory('dsa'); setSelectedTopic('all'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedCategory === 'dsa'
              ? 'bg-purple-600 border-purple-500 text-white shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Data Structures & Algorithms ({stats.dsaTotal})
        </button>

        <button
          onClick={() => { setSelectedCategory('cs-fundamentals'); setSelectedTopic('all'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedCategory === 'cs-fundamentals'
              ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" /> CS Fundamentals ({stats.csTotal})
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Search bar & quick toggles */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by title, question ID, topic, algorithm keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setBookmarkedOnly(!bookmarkedOnly); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                bookmarkedOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" /> Bookmarked ({bookmarkedIds.size})
            </button>
          </div>
        </div>

        {/* Granular Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Topic Select */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-medium">Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Topics</option>
              {availableTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Select */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-medium">Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value as any); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-medium">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value as any); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="space-y-1">
            <label className="text-slate-400 text-[11px] font-medium">Sort Order:</label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="id">Question ID</option>
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
                <option value="relevance">Relevance</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                title="Toggle Ascending/Descending"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {paginatedQuestions.length} of {filteredQuestions.length} matching questions</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {paginatedQuestions.map((q) => {
            const isSolved = solvedIds.has(q.id);
            const isAttempted = attemptedIds.has(q.id) && !isSolved;
            const isBookmarked = bookmarkedIds.has(q.id);

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-4 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-4 transition group"
              >
                {/* Left: Status & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="shrink-0">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isAttempted ? (
                      <Clock className="w-5 h-5 text-amber-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-bold">{q.id}</span>
                      <h3 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition truncate">
                        {q.title}
                      </h3>
                      {isBookmarked && (
                        <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{q.topic}</span>
                      <span>•</span>
                      <span>{q.subtopic}</span>
                      <span>•</span>
                      <span className="text-slate-400">{q.relevance}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Difficulty & Navigation */}
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : (q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')
                  }`}>
                    {q.difficulty}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">No questions match your current filters.</div>
              <p className="text-xs">Try resetting or broadening your search keywords.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
            >
              Previous
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
