import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Play, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles,
  BarChart3,
  Clock,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, TimedTestSession, TimedTestResult } from '../../types';
import { QuestionStore } from '../../services/questionStore';
import { userStore } from '../../services/userStore';

interface CodingTestsViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const CodingTestsView: React.FC<CodingTestsViewProps> = ({
  onSelectQuestion
}) => {
  const [activeSession, setActiveSession] = useState<TimedTestSession | null>(null);
  const [lastResult, setLastResult] = useState<TimedTestResult | null>(null);

  // Predefined tests
  const presetTests = [
    { name: 'Python Fundamentals Assessment', category: 'python', difficulty: 'Easy', durationMinutes: 30, count: 5 },
    { name: 'Python Advanced Architecture Test', category: 'python', difficulty: 'Hard', durationMinutes: 45, count: 5 },
    { name: 'DSA Beginner Coding Assessment', category: 'dsa', difficulty: 'Easy', durationMinutes: 30, count: 4 },
    { name: 'DSA Intermediate Core Algorithms Test', category: 'dsa', difficulty: 'Medium', durationMinutes: 45, count: 4 },
    { name: 'DSA Advanced Competitive Test', category: 'dsa', difficulty: 'Hard', durationMinutes: 60, count: 4 },
    { name: 'Placement Comprehensive Assessment', category: 'all', difficulty: 'Medium', durationMinutes: 45, count: 6 },
    { name: 'Mixed Technical Interview Test', category: 'all', difficulty: 'Hard', durationMinutes: 60, count: 5 }
  ];

  // Timer tick for active test session
  useEffect(() => {
    if (!activeSession || activeSession.isCompleted) return;

    const interval = setInterval(() => {
      setActiveSession(prev => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) {
          // Time expired, auto submit
          clearInterval(interval);
          handleFinishTest(prev);
          return { ...prev, timeRemainingSeconds: 0, isCompleted: true };
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.isCompleted]);

  const startTest = (preset: typeof presetTests[0]) => {
    const all = QuestionStore.getAllQuestions();
    let pool = all;
    if (preset.category !== 'all') {
      pool = pool.filter(q => q.category === preset.category);
    }
    if (preset.difficulty) {
      pool = pool.filter(q => q.difficulty === preset.difficulty);
    }

    // Shuffle and pick
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, preset.count);

    const session: TimedTestSession = {
      id: `test_${Date.now()}`,
      testName: preset.name,
      category: preset.category,
      difficulty: preset.difficulty,
      durationMinutes: preset.durationMinutes,
      questions: selected,
      currentQuestionIndex: 0,
      userAnswers: {},
      reviewedQuestions: {},
      startTime: Date.now(),
      timeRemainingSeconds: preset.durationMinutes * 60,
      isCompleted: false
    };

    setLastResult(null);
    setActiveSession(session);
  };

  const handleFinishTest = (sessionToFinish = activeSession) => {
    if (!sessionToFinish) return;

    const total = sessionToFinish.questions.length;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const topicPerf: Record<string, { total: number; correct: number }> = {};
    const details: any[] = [];

    sessionToFinish.questions.forEach((q) => {
      const ans = sessionToFinish.userAnswers[q.id];
      if (!topicPerf[q.topic]) topicPerf[q.topic] = { total: 0, correct: 0 };
      topicPerf[q.topic].total++;

      if (!ans || ans.trim().length === 0) {
        unattempted++;
        details.push({
          questionId: q.id,
          title: q.title,
          isCorrect: false,
          timeTakenSeconds: 0,
          topic: q.topic
        });
      } else {
        // Simple evaluation: conceptual index or coding solution presence
        const isCorr = q.type === 'conceptual' 
          ? parseInt(ans) === q.correctOptionIndex 
          : ans.length > 20; // completed code submitted
        
        if (isCorr) {
          correct++;
          topicPerf[q.topic].correct++;
        } else {
          incorrect++;
        }

        details.push({
          questionId: q.id,
          title: q.title,
          isCorrect: isCorr,
          timeTakenSeconds: 300,
          topic: q.topic
        });
      }
    });

    const score = Math.round((correct / total) * 100);
    const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;
    const timeSpent = (sessionToFinish.durationMinutes * 60) - sessionToFinish.timeRemainingSeconds;

    const recs: string[] = [];
    Object.entries(topicPerf).forEach(([topic, stats]) => {
      if (stats.correct < stats.total) {
        recs.push(`Revise ${topic}: accuracy was ${Math.round((stats.correct / stats.total) * 100)}%.`);
      }
    });
    if (recs.length === 0) {
      recs.push('Outstanding performance! You achieved 100% on this assessment.');
    }

    const result: TimedTestResult = {
      id: sessionToFinish.id,
      testName: sessionToFinish.testName,
      category: sessionToFinish.category,
      difficulty: sessionToFinish.difficulty,
      totalMarks: 100,
      score,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattemptedQuestions: unattempted,
      accuracy,
      timeSpentSeconds: timeSpent,
      date: new Date().toISOString().split('T')[0],
      topicPerformance: topicPerf,
      recommendations: recs,
      details
    };

    userStore.saveTimedTestResult(result);
    setLastResult(result);
    setActiveSession(null);

    if (score >= 60) {
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const currentQ = activeSession?.questions[activeSession.currentQuestionIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Timer className="w-4 h-4" /> Assessment Center
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Timed Technical Assessments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real timed coding tests, track accuracy under time constraints, and review in-depth scorecards.
          </p>
        </div>

        {activeSession && (
          <div className="flex items-center gap-4 bg-slate-950 px-5 py-2.5 rounded-xl border border-indigo-500/30">
            <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Remaining</div>
              <div className="text-lg font-mono font-bold text-white">
                {Math.floor(activeSession.timeRemainingSeconds / 60)}:
                {String(activeSession.timeRemainingSeconds % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE TEST TAKING VIEW */}
      {activeSession && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Question Nav Strip */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {activeSession.questions.map((q, idx) => {
                const isCurrent = idx === activeSession.currentQuestionIndex;
                const isAnswered = !!activeSession.userAnswers[q.id];
                const isFlagged = activeSession.reviewedQuestions[q.id];

                let bg = 'bg-slate-800 text-slate-400 border-slate-700';
                if (isCurrent) bg = 'bg-indigo-600 text-white border-indigo-400 shadow-md';
                else if (isFlagged) bg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                else if (isAnswered) bg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveSession({ ...activeSession, currentQuestionIndex: idx })}
                    className={`w-9 h-9 rounded-xl border text-xs font-bold font-mono transition flex items-center justify-center relative ${bg}`}
                  >
                    {idx + 1}
                    {isFlagged && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currFlag = activeSession.reviewedQuestions[currentQ.id];
                  setActiveSession({
                    ...activeSession,
                    reviewedQuestions: {
                      ...activeSession.reviewedQuestions,
                      [currentQ.id]: !currFlag
                    }
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  activeSession.reviewedQuestions[currentQ.id]
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Flag for Review</span>
              </button>

              <button
                onClick={() => handleFinishTest()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                <Send className="w-3.5 h-3.5" /> Submit Assessment
              </button>
            </div>
          </div>

          {/* Question Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-bold uppercase">{currentQ.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">{currentQ.difficulty}</span>
              <span className="text-xs text-slate-500">{currentQ.topic}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentQ.title}</h2>
            <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{currentQ.statement}</p>
          </div>

          {/* Answer Input */}
          {currentQ.type === 'conceptual' ? (
            <div className="space-y-2 pt-2">
              {currentQ.conceptualOptions?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSession({
                      ...activeSession,
                      userAnswers: { ...activeSession.userAnswers, [currentQ.id]: String(idx) }
                    });
                  }}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3 ${
                    activeSession.userAnswers[currentQ.id] === String(idx)
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Write Python Solution:
              </label>
              <textarea
                value={activeSession.userAnswers[currentQ.id] || currentQ.starterCode || ''}
                onChange={(e) => {
                  setActiveSession({
                    ...activeSession,
                    userAnswers: { ...activeSession.userAnswers, [currentQ.id]: e.target.value }
                  });
                }}
                className="w-full h-48 p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={activeSession.currentQuestionIndex === 0}
              onClick={() => setActiveSession({ ...activeSession, currentQuestionIndex: activeSession.currentQuestionIndex - 1 })}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Question
            </button>

            <button
              disabled={activeSession.currentQuestionIndex === activeSession.questions.length - 1}
              onClick={() => setActiveSession({ ...activeSession, currentQuestionIndex: activeSession.currentQuestionIndex + 1 })}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FINAL SCORECARD MODAL */}
      {lastResult && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Test Completed</span>
              <h2 className="text-2xl font-bold text-white mt-1">{lastResult.testName}</h2>
              <div className="text-xs text-slate-400 mt-1">Submitted on {lastResult.date}</div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Score</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">{lastResult.score}%</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                <div className="text-2xl font-extrabold text-cyan-300 font-mono">{lastResult.accuracy}%</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-emerald-400 font-semibold">Correct Answers</span>
              <div className="text-xl font-bold text-white font-mono mt-1">{lastResult.correctAnswers}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-rose-400 font-semibold">Incorrect Answers</span>
              <div className="text-xl font-bold text-white font-mono mt-1">{lastResult.incorrectAnswers}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-semibold">Unattempted</span>
              <div className="text-xl font-bold text-white font-mono mt-1">{lastResult.unattemptedQuestions}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Recommendations for Improvement:
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {lastResult.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Predefined Assessment Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Select a Standard Timed Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetTests.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400 uppercase tracking-wider">{t.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : (t.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400')
                  }`}>
                    {t.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 text-base">{t.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                  <span>{t.durationMinutes} Minutes</span>
                  <span>•</span>
                  <span>{t.count} Questions</span>
                </div>
              </div>

              <button
                onClick={() => startTest(t)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Assessment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
