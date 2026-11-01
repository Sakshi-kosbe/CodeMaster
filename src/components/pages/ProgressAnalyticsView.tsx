import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flame,
  Sparkles,
  PieChart
} from 'lucide-react';
import { userStore } from '../../services/userStore';
import { QuestionStore } from '../../services/questionStore';

export const ProgressAnalyticsView: React.FC = () => {
  const progress = userStore.getProgress();
  const allQuestions = QuestionStore.getAllQuestions();
  const totalQuestions = allQuestions.length; // 1,000

  const solvedIds = Object.keys(progress.solvedQuestions);
  const attemptedIds = Object.keys(progress.attemptedQuestions);
  const solvedCount = solvedIds.length;
  const attemptedCount = attemptedIds.length;
  const overallPct = Math.round((solvedCount / totalQuestions) * 100);

  // Topic-wise metrics
  const topicStats: Record<string, { total: number; solved: number; attempted: number }> = {};
  allQuestions.forEach(q => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, solved: 0, attempted: 0 };
    }
    topicStats[q.topic].total++;
    if (progress.solvedQuestions[q.id]) topicStats[q.topic].solved++;
    if (progress.attemptedQuestions[q.id]) topicStats[q.topic].attempted++;
  });

  const topicEntries = Object.entries(topicStats);

  // Strongest 5 topics (highest solved ratio among attempted)
  const strongestTopics = [...topicEntries]
    .filter(([_, s]) => s.solved > 0)
    .sort((a, b) => (b[1].solved / b[1].total) - (a[1].solved / a[1].total))
    .slice(0, 5);

  // Weakest 5 topics (high attempted but low solved)
  const weakestTopics = [...topicEntries]
    .sort((a, b) => {
      const aFail = a[1].attempted - a[1].solved;
      const bFail = b[1].attempted - b[1].solved;
      return bFail - aFail;
    })
    .slice(0, 5);

  // Difficulty performance
  const easyTotal = allQuestions.filter(q => q.difficulty === 'Easy').length;
  const medTotal = allQuestions.filter(q => q.difficulty === 'Medium').length;
  const hardTotal = allQuestions.filter(q => q.difficulty === 'Hard').length;

  const easySolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Easy').length;
  const medSolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Medium').length;
  const hardSolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Hard').length;

  // Average solving time
  const solvedArray = Object.values(progress.solvedQuestions);
  const avgTimeMs = solvedArray.length > 0
    ? Math.round(solvedArray.reduce((acc, curr) => acc + curr.bestTimeMs, 0) / solvedArray.length)
    : 0;

  // Generated recommendation
  let primaryRec = "Focus on attempting diverse topics across arrays, trees, and dynamic programming to establish baseline performance metrics.";
  if (strongestTopics.length > 0 && weakestTopics.length > 0) {
    primaryRec = `You are performing strongly in ${strongestTopics[0][0]}, but need more focused practice in ${weakestTopics[0][0]}.`;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <BarChart3 className="w-4 h-4" /> Performance Telemetry
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Progress & Mastery Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed metrics computed from your code submissions and test evaluations.
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-slate-500">Average Execution Time</div>
            <div className="font-mono font-bold text-white">{avgTimeMs} ms</div>
          </div>
        </div>
      </div>

      {/* AI Performance Recommendation Callout */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl flex items-start gap-3 shadow-lg">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Personalized Learning Recommendation
          </span>
          <div className="text-sm font-medium text-slate-200">
            "{primaryRec}"
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Easy Problems</span>
            <span className="text-xs font-mono text-slate-400">{easySolved} / {easyTotal}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(easySolved / easyTotal) * 100}%` }} />
          </div>
          <div className="text-xs text-slate-400">
            {Math.round((easySolved / easyTotal) * 100)}% Mastered
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">Medium Problems</span>
            <span className="text-xs font-mono text-slate-400">{medSolved} / {medTotal}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(medSolved / medTotal) * 100}%` }} />
          </div>
          <div className="text-xs text-slate-400">
            {Math.round((medSolved / medTotal) * 100)}% Mastered
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase">Hard Problems</span>
            <span className="text-xs font-mono text-slate-400">{hardSolved} / {hardTotal}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(hardSolved / hardTotal) * 100}%` }} />
          </div>
          <div className="text-xs text-slate-400">
            {Math.round((hardSolved / hardTotal) * 100)}% Mastered
          </div>
        </div>
      </div>

      {/* Strongest vs Weakest Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strongest */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Strongest 5 Topics
          </h2>
          <div className="space-y-3">
            {strongestTopics.map(([topic, s], idx) => {
              const pct = Math.round((s.solved / s.total) * 100);
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{topic}</span>
                    <span className="text-emerald-400 font-mono">{s.solved} solved ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {strongestTopics.length === 0 && (
              <div className="text-slate-500 text-xs py-4 text-center">Solve problems to discover your strongest topics.</div>
            )}
          </div>
        </div>

        {/* Weakest */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Top Improvement Opportunities
          </h2>
          <div className="space-y-3">
            {weakestTopics.map(([topic, s], idx) => {
              const remaining = s.total - s.solved;
              return (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{topic}</div>
                    <div className="text-slate-500 text-[11px]">{s.solved} solved • {remaining} unmastered</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    Priority Practice
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
