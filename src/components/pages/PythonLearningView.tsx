import React, { useState } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  ChevronRight, 
  Play, 
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, Question } from '../../types';
import { pythonLessons } from '../../data/curriculum';
import { userStore } from '../../services/userStore';
import { QuestionStore } from '../../services/questionStore';

interface PythonLearningViewProps {
  onSelectQuestion: (question: Question) => void;
}

export const PythonLearningView: React.FC<PythonLearningViewProps> = ({
  onSelectQuestion
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [activeLesson, setActiveLesson] = useState<Lesson>(pythonLessons[0]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState<boolean>(false);

  const progress = userStore.getProgress();
  const completedIds = new Set(progress.completedLessons);

  const filteredLessons = pythonLessons.filter(l => 
    selectedLevel === 'All' ? true : l.level === selectedLevel
  );

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizAnswer(null);
    setQuizChecked(false);
  };

  const handleCompleteLesson = () => {
    userStore.markLessonCompleted(activeLesson.id);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  const isCompleted = completedIds.has(activeLesson.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4" /> Structured Python Track
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Python Programming Curriculum</h1>
          <p className="text-xs text-slate-400 mt-1">
            From basic syntax and data structures to OOP, generators, decorators, and memory profiling.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedLevel === lvl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Lessons Sidebar & Active Lesson View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Lessons Syllabus List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 h-fit max-h-[800px] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Modules ({filteredLessons.length} Lessons)
          </div>

          <div className="space-y-1.5">
            {filteredLessons.map((les) => {
              const active = activeLesson.id === les.id;
              const done = completedIds.has(les.id);

              return (
                <button
                  key={les.id}
                  onClick={() => handleLessonSelect(les)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    active
                      ? 'bg-blue-950/60 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {les.level}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{les.topic}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-200 mt-1 truncate">
                      {les.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active Lesson Interactive Content */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Lesson Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <span>{activeLesson.level} Track</span>
                <span>•</span>
                <span>{activeLesson.topic}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{activeLesson.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeLesson.summary}</p>
            </div>

            <button
              onClick={handleCompleteLesson}
              disabled={isCompleted}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shrink-0 ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Lesson Completed (+30 XP)' : 'Mark as Completed'}
            </button>
          </div>

          {/* Theory and Markdown Content */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
            {activeLesson.content}
          </div>

          {/* Executable Code Example & Expected Output */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-blue-400" /> Code Demonstration & Syntax
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre>{activeLesson.codeExample}</pre>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Expected Standard Output:</div>
              <pre className="text-emerald-400 whitespace-pre-wrap">{activeLesson.expectedOutput}</pre>
            </div>
          </div>

          {/* Practical Use Cases & Common Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Practical Use Cases
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                {activeLesson.practicalUseCases.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Common Pitfalls
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                {activeLesson.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Practice Questions Links */}
          <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-4 h-4" /> Practice Problems for this Lesson
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeLesson.practiceQuestionIds.map(qid => {
                const q = QuestionStore.getQuestionById(qid);
                if (!q) return null;
                return (
                  <button
                    key={qid}
                    onClick={() => onSelectQuestion(q)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
                  >
                    <span>{q.id}: {q.title}</span>
                    <ArrowRight className="w-3 h-3 text-blue-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Checkpoint Quiz */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> Knowledge Check Quiz
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {activeLesson.quiz.question}
            </div>

            <div className="space-y-2">
              {activeLesson.quiz.options.map((opt, idx) => {
                const isSelected = quizAnswer === idx;
                const isCorrect = idx === activeLesson.quiz.correctIndex;
                let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                if (quizChecked) {
                  if (isCorrect) style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                  else if (isSelected && !isCorrect) style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                } else if (isSelected) {
                  style = 'bg-blue-950/60 border-blue-500 text-white';
                }

                return (
                  <button
                    key={idx}
                    disabled={quizChecked}
                    onClick={() => setQuizAnswer(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {quizChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              {quizChecked ? (
                <div className="text-xs text-slate-300 font-medium">
                  {quizAnswer === activeLesson.quiz.correctIndex ? (
                    <span className="text-emerald-400 font-bold">Correct! </span>
                  ) : (
                    <span className="text-rose-400 font-bold">Incorrect. </span>
                  )}
                  {activeLesson.quiz.explanation}
                </div>
              ) : (
                <button
                  disabled={quizAnswer === null}
                  onClick={() => setQuizChecked(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
                >
                  Verify Quiz Answer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
