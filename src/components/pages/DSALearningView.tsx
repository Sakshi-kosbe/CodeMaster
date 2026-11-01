import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  Code2, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Flame
} from 'lucide-react';
import { DSAVisualizer } from '../visualizers/DSAVisualizer';
import { dsaLessons } from '../../data/curriculum';
import { QuestionStore } from '../../services/questionStore';
import { userStore } from '../../services/userStore';
import { Question } from '../../types';

interface DSALearningViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const DSALearningView: React.FC<DSALearningViewProps> = ({
  onSelectQuestion
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Arrays');
  const dsaTopics = [
    'Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window',
    'Sorting and Binary Search', 'Recursion and Backtracking', 'Linked Lists',
    'Stacks and Queues', 'Trees and Binary Search Trees', 'Heaps and Priority Queues',
    'Graphs', 'Dynamic Programming', 'Greedy Algorithms', 'Bit Manipulation'
  ];

  const progress = userStore.getProgress();
  const allDsaQuestions = QuestionStore.getAllQuestions().filter(q => q.category === 'dsa');
  const topicQuestions = allDsaQuestions.filter(q => q.topic === selectedTopic);

  const beginnerQuestions = topicQuestions.filter(q => q.difficulty === 'Easy').slice(0, 3);
  const intermediateQuestions = topicQuestions.filter(q => q.difficulty === 'Medium').slice(0, 3);
  const advancedQuestions = topicQuestions.filter(q => q.difficulty === 'Hard').slice(0, 3);

  const solvedInTopic = topicQuestions.filter(q => progress.solvedQuestions[q.id]).length;
  const topicPct = topicQuestions.length > 0 ? Math.round((solvedInTopic / topicQuestions.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
            <Layers className="w-4 h-4" /> Algorithms & Data Structures
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">DSA Interactive Academy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual invariant simulations, memory representations, time-space trade-offs, and 600 interview problems.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 self-start md:self-auto">
          <Activity className="w-5 h-5 text-purple-400" />
          <div className="text-xs">
            <div className="text-slate-400">Total Solved in DSA</div>
            <div className="font-bold text-white font-mono">
              {allDsaQuestions.filter(q => progress.solvedQuestions[q.id]).length} / 600 Questions
            </div>
          </div>
        </div>
      </div>

      {/* 1. Interactive Algorithm Visualizer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Algorithm Simulator & Memory Invariant Engine
          </h2>
          <span className="text-xs text-slate-500">Live Browser Wasm Simulation</span>
        </div>
        <DSAVisualizer />
      </section>

      {/* 2. Topic-wise DSA Mastery Modules */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Topic-wise Practice Modules
        </h2>

        {/* Topic Selector Chips */}
        <div className="flex flex-wrap gap-2">
          {dsaTopics.map(t => {
            const isSelected = selectedTopic === t;
            const qCount = allDsaQuestions.filter(q => q.topic === t).length;
            const sCount = allDsaQuestions.filter(q => q.topic === t && progress.solvedQuestions[q.id]).length;
            const pct = qCount > 0 ? Math.round((sCount / qCount) * 100) : 0;

            return (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{t}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-500'}`}>
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Topic Overview & Practice Questions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Module Blueprint</span>
              <h3 className="text-2xl font-bold text-white mt-1">{selectedTopic} Mastery</h3>
              <p className="text-xs text-slate-400 mt-1">
                {topicQuestions.length} Curated Questions ({solvedInTopic} Solved • {topicPct}% Complete)
              </p>
            </div>

            <div className="w-48 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span className="font-mono text-purple-400">{topicPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${topicPct}%` }} />
              </div>
            </div>
          </div>

          {/* Three Tiered Problem Breakdown: Beginner, Intermediate, Advanced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Beginner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Beginner Problems
                </span>
                <span className="text-xs text-slate-500 font-mono">Tier 1</span>
              </div>
              <div className="space-y-2">
                {beginnerQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition truncate max-w-[180px]">
                        {q.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{q.subtopic}</div>
                    </div>
                    {progress.solvedQuestions[q.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Intermediate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Intermediate Problems
                </span>
                <span className="text-xs text-slate-500 font-mono">Tier 2</span>
              </div>
              <div className="space-y-2">
                {intermediateQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition truncate max-w-[180px]">
                        {q.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{q.subtopic}</div>
                    </div>
                    {progress.solvedQuestions[q.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Advanced Hard Problems
                </span>
                <span className="text-xs text-slate-500 font-mono">Tier 3</span>
              </div>
              <div className="space-y-2">
                {advancedQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition truncate max-w-[180px]">
                        {q.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{q.subtopic}</div>
                    </div>
                    {progress.solvedQuestions[q.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
