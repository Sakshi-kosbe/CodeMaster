import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Terminal,
  Bot,
  Play,
  RotateCcw
} from 'lucide-react';
import { Question } from '../../types';
import { QuestionStore } from '../../services/questionStore';

interface InterviewPrepViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  onSelectQuestion
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('product-based');
  const [isMockActive, setIsMockActive] = useState<boolean>(false);
  const [mockQuestion, setMockQuestion] = useState<Question | null>(null);

  const allQuestions = QuestionStore.getAllQuestions();

  const tracks = [
    {
      id: 'product-based',
      name: 'Product-Based Engineering',
      desc: 'Focus on optimal time-space trade-offs, graph models, sliding window, and system design invariants.',
      questionIds: ['dsa-001', 'dsa-071', 'dsa-161', 'dsa-196', 'dsa-346', 'dsa-506']
    },
    {
      id: 'service-based',
      name: 'Service-Based & Campus Placements',
      desc: 'Focus on strings, arrays, basic sorting, OOP concepts, DBMS, and quantitative algorithm tests.',
      questionIds: ['py-001', 'py-005', 'py-071', 'cs-001', 'cs-002', 'dsa-002']
    },
    {
      id: 'beginner-prep',
      name: 'Beginner Interview Warmup',
      desc: 'Fundamental coding fluency, hash maps, simple two-pointers, and syntax fundamentals.',
      questionIds: ['py-001', 'py-002', 'py-004', 'py-071', 'dsa-001']
    },
    {
      id: 'advanced-prep',
      name: 'Staff / Senior Tech Screening',
      desc: 'Hard dynamic programming, monotonic stacks, concurrent Python internals, and complex system questions.',
      questionIds: ['dsa-506', 'dsa-421', 'py-221', 'cs-003', 'cs-004']
    }
  ];

  const currentTrack = tracks.find(t => t.id === selectedTrack) || tracks[0];
  const trackQuestions = currentTrack.questionIds
    .map(id => QuestionStore.getQuestionById(id)!)
    .filter(Boolean);

  const startMockInterview = () => {
    // Pick a random medium or hard question
    const q = QuestionStore.getRandomQuestion('dsa', 'Medium');
    setMockQuestion(q);
    setIsMockActive(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Briefcase className="w-4 h-4" /> Technical Interview Acceleration
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Interview Preparation & Mock Rounds</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard interview pattern tracks, CS fundamentals screening, and simulated mock interviews.
          </p>
        </div>

        <button
          onClick={startMockInterview}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition self-start md:self-auto"
        >
          <Play className="w-4 h-4 fill-white" /> Launch Mock Coding Interview
        </button>
      </div>

      {/* Mock Interview Modal / Active Banner */}
      {isMockActive && mockQuestion && (
        <div className="p-6 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Clock className="w-5 h-5 text-indigo-400" /> Live Mock Interview: 45-Minute Window
            </div>
            <button
              onClick={() => setIsMockActive(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Exit Mock
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-purple-400">{mockQuestion.id} • {mockQuestion.difficulty}</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{mockQuestion.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{mockQuestion.statement}</p>
            </div>

            <button
              onClick={() => onSelectQuestion(mockQuestion)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/30"
            >
              Enter Coding Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tracks Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tracks.map(t => {
          const isSelected = selectedTrack === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs mb-3 font-bold ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{t.desc}</p>
              </div>

              <div className="text-xs text-indigo-400 font-medium flex items-center gap-1 pt-2 border-t border-slate-800/80">
                <span>{t.questionIds.length} Core Questions</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Track Problem List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Curated Track List</span>
          <h2 className="text-xl font-bold text-white mt-1">{currentTrack.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentTrack.desc}</p>
        </div>

        <div className="space-y-2 pt-2">
          {trackQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 font-bold">{q.id}</span>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition">
                    {q.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {q.topic} • {q.subtopic}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  q.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : (q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')
                }`}>
                  {q.difficulty}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function ChevronRightIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
