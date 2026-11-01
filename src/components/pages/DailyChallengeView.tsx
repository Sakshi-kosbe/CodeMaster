import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Trophy,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../../types';
import { QuestionStore } from '../../services/questionStore';
import { userStore } from '../../services/userStore';

interface DailyChallengeViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onSelectQuestion
}) => {
  const [dailyQId, setDailyQId] = useState<string>('dsa-001');
  const [bonusXp, setBonusXp] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const progress = userStore.getProgress();
  const today = new Date().toISOString().split('T')[0];
  const challengeRecord = progress.dailyChallenges[today];
  const isCompleted = !!challengeRecord?.completed;

  useEffect(() => {
    fetch('/api/daily-challenge')
      .then(res => res.json())
      .then(data => {
        if (data.questionId) {
          setDailyQId(data.questionId);
          setBonusXp(data.bonusXp || 100);
        }
      })
      .catch(() => {
        // Fallback calculation
        setDailyQId('dsa-001');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const question = QuestionStore.getQuestionById(dailyQId) || QuestionStore.getAllQuestions()[0];

  // Past 14 days calendar history
  const pastDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const isDone = !!progress.dailyChallenges[dateStr]?.completed;
    const isCurrent = dateStr === today;
    return {
      date: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      isDone,
      isCurrent
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Zap className="w-4 h-4" /> Daily Coding Challenge
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Today's Featured Problem</h1>
          <p className="text-xs text-slate-400 mt-1">
            Solve one selected interview challenge every day to preserve and extend your daily streak.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 self-start md:self-auto">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Flame className="w-6 h-6 fill-amber-400/20" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Active Streak</div>
            <div className="text-xl font-bold text-white font-mono">{progress.streak} Days</div>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-400">{question.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : (question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400')
            }`}>
              {question.difficulty}
            </span>
            <span className="text-xs text-slate-500">• {question.topic}</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> +{bonusXp} Bonus XP
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-white">{question.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {question.statement}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {isCompleted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Challenge Solved for Today! Bonus claimed.
              </span>
            ) : (
              <span>Submit a passing solution in the code workspace to earn daily rewards.</span>
            )}
          </div>

          <button
            onClick={() => onSelectQuestion(question)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-indigo-600/30"
          >
            <span>{isCompleted ? 'Review Code Solution' : 'Solve Daily Challenge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 14-Day Challenge History Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" /> Recent Daily Challenge History (14 Days)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {pastDays.map((d, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center space-y-1.5 ${
                d.isCurrent
                  ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">{d.day}</div>
              <div className="flex justify-center">
                {d.isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
