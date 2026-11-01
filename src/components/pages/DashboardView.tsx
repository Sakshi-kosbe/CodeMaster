import React from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';
import { Question } from '../../types';
import { userStore } from '../../services/userStore';
import { QuestionStore } from '../../services/questionStore';

interface DashboardViewProps {
  onSelectQuestion: (question: Question) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectQuestion,
  onNavigate
}) => {
  const progress = userStore.getProgress();
  const allQuestions = QuestionStore.getAllQuestions();
  const datasetStats = QuestionStore.getDatasetStats();

  const totalQuestions = allQuestions.length; // 1,000
  const solvedIds = Object.keys(progress.solvedQuestions);
  const attemptedIds = Object.keys(progress.attemptedQuestions);
  
  const solvedCount = solvedIds.length;
  const attemptedCount = attemptedIds.length;
  const remainingCount = totalQuestions - solvedCount;
  const overallPct = Math.round((solvedCount / totalQuestions) * 100);

  // Category counts
  const pythonQuestions = allQuestions.filter(q => q.category === 'python');
  const dsaQuestions = allQuestions.filter(q => q.category === 'dsa');
  const csQuestions = allQuestions.filter(q => q.category === 'cs-fundamentals');

  const solvedPythonCount = pythonQuestions.filter(q => progress.solvedQuestions[q.id]).length;
  const solvedDsaCount = dsaQuestions.filter(q => progress.solvedQuestions[q.id]).length;
  const solvedCsCount = csQuestions.filter(q => progress.solvedQuestions[q.id]).length;

  const pythonPct = Math.round((solvedPythonCount / pythonQuestions.length) * 100);
  const dsaPct = Math.round((solvedDsaCount / dsaQuestions.length) * 100);

  // Difficulty counts
  const easySolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Easy').length;
  const mediumSolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Medium').length;
  const hardSolved = solvedIds.filter(id => QuestionStore.getQuestionById(id)?.difficulty === 'Hard').length;

  // Accuracy calculation: total passed / total attempts
  let totalAttempts = 0;
  Object.values(progress.attemptedQuestions).forEach(a => totalAttempts += a.attempts);
  const accuracyPct = totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 100;

  // Coding time in hours and minutes
  const totalMins = Math.round(progress.totalCodingTimeSeconds / 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  // Daily Challenge for today
  const today = new Date().toISOString().split('T')[0];
  const dailyRecord = progress.dailyChallenges[today];
  const dailyQuestion = QuestionStore.getQuestionById('dsa-001') || allQuestions[0];

  // Due revisions
  const dueRevisions = progress.revisionQueue.filter(r => r.nextReviewDate <= today);

  // Weak topics calculation (attempted but not solved or low accuracy)
  const topicStats: Record<string, { attempted: number; solved: number }> = {};
  attemptedIds.forEach(id => {
    const q = QuestionStore.getQuestionById(id);
    if (!q) return;
    if (!topicStats[q.topic]) topicStats[q.topic] = { attempted: 0, solved: 0 };
    topicStats[q.topic].attempted++;
    if (progress.solvedQuestions[id]) topicStats[q.topic].solved++;
  });

  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => stats.attempted > stats.solved)
    .sort((a, b) => (a[1].solved / a[1].attempted) - (b[1].solved / b[1].attempted))
    .slice(0, 3);

  // Recent attempted
  const recentAttempts = Object.entries(progress.attemptedQuestions)
    .sort((a, b) => b[1].lastAttemptAt - a[1].lastAttemptAt)
    .slice(0, 4)
    .map(([id]) => QuestionStore.getQuestionById(id)!)
    .filter(Boolean);

  // Recommended questions
  const recommended = allQuestions
    .filter(q => !progress.solvedQuestions[q.id])
    .slice(0, 4);

  // Last 7 days activity heatmap
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = progress.activityCalendar[dateStr] || 0;
    return { date: dateStr, day: dayName, count };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Welcome back, {progress.displayName}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Master Python & Data Structures with 1,000+ Curated Problems
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Targeted for technical interviews, university exams, and competitive programming. Track real-time progress, execute Python in-browser via WebAssembly, and level up with your AI mentor.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="w-6 h-6 fill-amber-400/20" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Daily Streak</div>
                <div className="text-xl font-bold text-white font-mono">{progress.streak} Days</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Trophy className="w-6 h-6 fill-purple-400/20" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Total XP Earned</div>
                <div className="text-xl font-bold text-purple-300 font-mono">{progress.xp.toLocaleString()} XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">{solvedCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ {totalQuestions}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>{overallPct}% Completed</span>
            <span>{remainingCount} Left</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Python Track</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-300 font-mono">{solvedPythonCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ {pythonQuestions.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pythonPct}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>{pythonPct}% Python</span>
            <span>300 Curated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>DSA Mastery</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-purple-300 font-mono">{solvedDsaCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ {dsaQuestions.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${dsaPct}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>{dsaPct}% DSA</span>
            <span>600 Curated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Accuracy & Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-cyan-300 font-mono">{accuracyPct}%</span>
            <span className="text-xs text-slate-500">Accuracy</span>
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Coding Time: <span className="font-mono text-white font-semibold">{hours}h {mins}m</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {attemptedCount} unique questions attempted
          </div>
        </div>
      </div>

      {/* Two Column Section: Daily Challenge & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Coding Challenge Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Zap className="w-5 h-5 fill-amber-400/20" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Daily Coding Challenge</h3>
                <span className="text-xs text-slate-400">Date: {today}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
              +100 Bonus XP
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
                {dailyQuestion.id} • {dailyQuestion.difficulty}
              </span>
              <span className="text-xs text-slate-500">{dailyQuestion.topic}</span>
            </div>
            <div className="text-base font-bold text-slate-200">
              {dailyQuestion.title}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">
              {dailyQuestion.statement}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {dailyRecord?.completed ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Completed for today!
                </span>
              ) : (
                <span>Complete today's challenge to maintain your streak!</span>
              )}
            </div>
            <button
              onClick={() => onSelectQuestion(dailyQuestion)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              Solve Challenge <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Weekly Activity Heatmap
            </h3>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {last7Days.map((item, idx) => {
              const intensity = item.count === 0 
                ? 'bg-slate-800' 
                : (item.count <= 2 ? 'bg-indigo-900 text-indigo-300' : (item.count <= 5 ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white font-bold'));
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs transition border border-slate-700/50 ${intensity}`}
                    title={`${item.date}: ${item.count} submissions`}
                  >
                    {item.count > 0 ? item.count : ''}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{item.day}</span>
                </div>
              );
            })}
          </div>

          {/* Difficulty Distribution Breakdown */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-emerald-400 font-semibold">Easy</div>
              <div className="text-base font-bold text-white font-mono">{easySolved} / {datasetStats.difficulty.easy}</div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-amber-400 font-semibold">Medium</div>
              <div className="text-base font-bold text-white font-mono">{mediumSolved} / {datasetStats.difficulty.medium}</div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-rose-400 font-semibold">Hard</div>
              <div className="text-base font-bold text-white font-mono">{hardSolved} / {datasetStats.difficulty.hard}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Due & Weak Topics Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revision Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Spaced Repetition Due</h3>
            </div>
            <button
              onClick={() => onNavigate('revision')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Queue ({progress.revisionQueue.length})
            </button>
          </div>

          {dueRevisions.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
              🎉 No questions due for review right now! Solve more problems to schedule automatic spaced repetitions.
            </div>
          ) : (
            <div className="space-y-2">
              {dueRevisions.slice(0, 3).map((r, idx) => {
                const q = QuestionStore.getQuestionById(r.questionId);
                if (!q) return null;
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/60 cursor-pointer rounded-xl border border-slate-800 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{q.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Interval Level {r.revisionLevel}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Revise
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weak Topics Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Target Areas for Improvement</h3>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Full Analytics
            </button>
          </div>

          {weakTopics.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
              ✨ Great performance! Keep attempting questions across various topics to pinpoint growth areas.
            </div>
          ) : (
            <div className="space-y-2">
              {weakTopics.map(([topic, stats], idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{topic}</div>
                    <div className="text-slate-500 text-[11px]">
                      {stats.solved} solved out of {stats.attempted} attempted
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                    Needs Practice
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Questions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Recommended Next Problems
          </h3>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Explore Library (1,000 Questions) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommended.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 cursor-pointer rounded-xl border border-slate-800 flex flex-col justify-between space-y-3 transition group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">{q.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' : (q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10')
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                <h4 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition line-clamp-1">
                  {q.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {q.statement}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
                <span>{q.topic}</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
