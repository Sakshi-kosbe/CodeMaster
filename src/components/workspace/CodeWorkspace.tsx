import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Bot, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Terminal,
  FileCode2,
  ListOrdered,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  History,
  RefreshCw,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, ExecutionResult, SubmissionRecord } from '../../types';
import { pyodideService } from '../../services/pyodide';
import { userStore } from '../../services/userStore';
import { QuestionStore } from '../../services/questionStore';

interface CodeWorkspaceProps {
  question: Question;
  onSelectQuestion: (question: Question) => void;
  filteredQuestionIds?: string[];
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  question,
  onSelectQuestion,
  filteredQuestionIds
}) => {
  const [code, setCode] = useState<string>(question.starterCode || '');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'output' | 'customInput' | 'history' | 'aiMentor'>('tests');
  const [customInput, setCustomInput] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedConceptualOption, setSelectedConceptualOption] = useState<number | null>(null);
  const [conceptualSubmitted, setConceptualSubmitted] = useState<boolean>(false);
  const [isResettingRuntime, setIsResettingRuntime] = useState<boolean>(false);
  const [loadedMsg, setLoadedMsg] = useState<string | null>(null);
  
  // Pyodide status
  const [pyStatus, setPyStatus] = useState(pyodideService.getStatus());

  // AI Mentor State
  const [aiMode, setAiMode] = useState<'HINT' | 'EXPLAIN' | 'SOLUTION' | 'DEBUG'>('HINT');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // User notes & bookmarks
  const progress = userStore.getProgress();
  const isBookmarked = progress.bookmarkedQuestionIds.includes(question.id);
  const isSolved = !!progress.solvedQuestions[question.id];
  const userNote = progress.notes[question.id] || '';
  const [noteText, setNoteText] = useState<string>(userNote);
  const [showNoteSaved, setShowNoteSaved] = useState<boolean>(false);

  const { prev, next } = QuestionStore.getNextAndPrevQuestion(question.id, filteredQuestionIds);

  // Submissions for this question
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(userStore.getSubmissionsForQuestion(question.id));

  // Reset state on question change
  useEffect(() => {
    // If user previously solved or attempted this question, load their saved code
    const saved = progress.solvedQuestions[question.id]?.code || progress.attemptedQuestions[question.id]?.lastCode;
    setCode(saved || question.starterCode || '');
    setExecutionResult(null);
    setSelectedConceptualOption(null);
    setConceptualSubmitted(false);
    setAiResponse('');
    setNoteText(progress.notes[question.id] || '');
    setSubmissions(userStore.getSubmissionsForQuestion(question.id));
  }, [question.id]);

  useEffect(() => {
    return userStore.subscribe(() => {
      setSubmissions(userStore.getSubmissionsForQuestion(question.id));
    });
  }, [question.id]);

  useEffect(() => {
    return pyodideService.subscribeStatus(setPyStatus);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + Enter to Run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, customInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(question.starterCode || '');
    setExecutionResult(null);
  };

  const handleResetRuntime = async () => {
    setIsResettingRuntime(true);
    try {
      await pyodideService.reset();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResettingRuntime(false);
    }
  };

  const handleLoadSubmissionCode = (subCode: string, timestamp: number) => {
    setCode(subCode);
    const dateStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLoadedMsg(`Loaded code from submission at ${dateStr}`);
    setTimeout(() => setLoadedMsg(null), 3000);
  };

  const handleRun = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setActiveTab('output');
    try {
      const res = await pyodideService.runPython(code, customInput);
      setExecutionResult(res);
    } catch (e: any) {
      setExecutionResult({
        stdout: '',
        stderr: '',
        error: e.message || 'Execution error',
        executionTimeMs: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (isExecuting) return;

    if (question.type === 'conceptual') {
      if (selectedConceptualOption === null) return;
      setConceptualSubmitted(true);
      const isCorrect = selectedConceptualOption === question.correctOptionIndex;
      userStore.recordSubmission(
        question.id, 
        isCorrect, 
        10, 
        '# Conceptual answer submitted',
        {
          status: isCorrect ? 'Accepted' : 'Wrong Answer',
          passedTests: isCorrect ? 1 : 0,
          totalTests: 1
        }
      );
      if (isCorrect) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      return;
    }

    setIsExecuting(true);
    setActiveTab('tests');
    try {
      const res = await pyodideService.evaluateTestCases(code, question.testCases);
      setExecutionResult(res);

      const allPassed = res.testResults?.failed === 0 && (res.testResults?.passed || 0) > 0;
      let status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' = 'Wrong Answer';
      if (allPassed) {
        status = 'Accepted';
      } else if (res.error?.includes('Time Limit') || res.error?.includes('TimeoutError')) {
        status = 'Time Limit Exceeded';
      } else if (res.error) {
        status = 'Runtime Error';
      } else {
        status = 'Wrong Answer';
      }

      userStore.recordSubmission(
        question.id,
        allPassed,
        res.executionTimeMs,
        code,
        {
          status,
          passedTests: res.testResults?.passed || 0,
          totalTests: res.testResults?.total || question.testCases.length
        }
      );

      if (allPassed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e: any) {
      const isTimeout = (e.message || '').includes('Time Limit') || (e.message || '').includes('Timeout');
      const status = isTimeout ? 'Time Limit Exceeded' : 'Runtime Error';
      setExecutionResult({
        stdout: '',
        stderr: '',
        error: e.message || 'Error executing test suite',
        executionTimeMs: 0
      });
      userStore.recordSubmission(
        question.id,
        false,
        0,
        code,
        {
          status,
          passedTests: 0,
          totalTests: question.testCases.length
        }
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const askAiMentor = async (mode: 'HINT' | 'EXPLAIN' | 'SOLUTION' | 'DEBUG') => {
    setAiMode(mode);
    setIsAiLoading(true);
    setActiveTab('aiMentor');
    try {
      const resp = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          question,
          userCode: code,
          context: executionResult?.error || (executionResult?.testResults?.failed ? 'Test case mismatch' : undefined)
        })
      });
      const data = await resp.json();
      setAiResponse(data.text || 'No response from mentor.');
    } catch (err: any) {
      setAiResponse(`Unable to reach AI Mentor: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveNote = () => {
    userStore.saveNote(question.id, noteText);
    setShowNoteSaved(true);
    setTimeout(() => setShowNoteSaved(false), 2000);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-2' : ''}`}>
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            {question.id}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getDifficultyBadge(question.difficulty)}`}>
            {question.difficulty}
          </span>
          {isSolved && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
        </div>

        {/* Prev / Next & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => userStore.toggleBookmark(question.id)}
            className={`p-1.5 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Bookmark for Revision"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Full Screen Workspace"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            disabled={!prev}
            onClick={() => prev && onSelectQuestion(prev)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Previous Question"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            disabled={!next}
            onClick={() => next && onSelectQuestion(next)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Next Question"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden bg-slate-950 border-x border-b border-slate-800 rounded-b-xl">
        {/* LEFT COLUMN: Problem Details & Notes */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col h-full overflow-hidden bg-slate-900/60">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-snug">
                {question.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-medium">
                  {question.topic}
                </span>
                <span>•</span>
                <span className="text-slate-400">{question.subtopic}</span>
                <span>•</span>
                <span className="text-indigo-400 font-medium">{question.relevance}</span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {question.statement}
            </div>

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-indigo-400" /> Examples
                </h3>
                {question.examples.map((ex, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 font-sans">Input: </span>
                      <span className="text-amber-300">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans">Output: </span>
                      <span className="text-emerald-400 font-bold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 font-sans pt-1 border-t border-slate-900">
                        <span className="font-semibold text-slate-300">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints & Specs */}
            {question.constraints && question.constraints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-purple-400" /> Constraints
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
                  {question.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complexity & Algorithm Blueprint */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Complexity Specs
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Time: </span>
                  <span className="text-emerald-400 font-bold">{question.timeComplexity}</span>
                </div>
                <div>
                  <span className="text-slate-500">Space: </span>
                  <span className="text-cyan-400 font-bold">{question.spaceComplexity}</span>
                </div>
              </div>
              {question.algorithm && (
                <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300">Algorithm Blueprint:</span>
                  <ol className="list-decimal list-inside space-y-0.5">
                    {question.algorithm.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Personal Study Notes */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Personal Study Notes
                </label>
                {showNoteSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={saveNote}
                placeholder="Write your personal observations, edge case insights, or reminders here..."
                className="w-full h-20 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Quick AI Mentor Launch Buttons */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" /> AI Mentor:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => askAiMentor('HINT')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
              >
                Get Hint
              </button>
              <button
                onClick={() => askAiMentor('EXPLAIN')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition"
              >
                Explain Concept
              </button>
              <button
                onClick={() => askAiMentor('SOLUTION')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition"
              >
                Optimized Solution
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor / Conceptual Choice & Test Execution */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-slate-950">
          {question.type === 'conceptual' ? (
            /* Conceptual Multiple Choice Interface */
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <HelpCircle className="w-5 h-5" /> Multiple Choice Assessment
                </div>
                <div className="text-slate-200 text-sm font-medium">
                  Select the correct answer based on technical interview standards:
                </div>

                <div className="space-y-3 pt-2">
                  {question.conceptualOptions?.map((opt, idx) => {
                    const isSelected = selectedConceptualOption === idx;
                    const isCorrect = idx === question.correctOptionIndex;
                    let style = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (conceptualSubmitted) {
                      if (isCorrect) {
                        style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      style = 'bg-indigo-950/60 border-indigo-500 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={conceptualSubmitted}
                        onClick={() => setSelectedConceptualOption(idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-start gap-3 ${style}`}
                      >
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {conceptualSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {conceptualSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {conceptualSubmitted && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-4">
                    <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Explanation & Reasoning
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed">
                      {question.explanation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Coding Mode with Monaco Editor */
            <div className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
              {/* Editor Sub-Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" /> Python 3 (Pyodide Wasm)
                  </span>
                  {pyStatus.isInitializing && (
                    <span className="text-amber-400 animate-pulse text-[11px]">
                      • Initializing runtime...
                    </span>
                  )}
                  {pyStatus.isReady && (
                    <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ready
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Infinite Loop Guard Verification */}
                  <button
                    onClick={() => {
                      setCode(`# Infinite Loop Protection Test
# CodeMaster will intercept this loop via sys.settrace and halt safely in 3s.
print("Executing infinite loop test...")
count = 0
while True:
    count += 1
`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[11px]"
                    title="Load infinite loop snippet to test execution timeout guard"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Loop Guard</span>
                  </button>

                  {/* Restart Wasm Runtime */}
                  <button
                    onClick={handleResetRuntime}
                    disabled={isResettingRuntime}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition text-[11px]"
                    title="Restart Pyodide WebAssembly runtime"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResettingRuntime ? 'animate-spin text-indigo-400' : ''}`} />
                    <span>{isResettingRuntime ? 'Restarting...' : 'Restart Wasm'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                    title="Copy code to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Toast when code is restored from submission history */}
              {loadedMsg && (
                <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-1.5 flex items-center justify-between animate-fade-in shrink-0">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {loadedMsg}
                  </span>
                  <button onClick={() => setLoadedMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
              )}

              {/* Monaco Editor Canvas */}
              <div className="flex-1 relative overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    tabSize: 4,
                    insertSpaces: true,
                    autoClosingBrackets: 'always',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    renderLineHighlight: 'all',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}
                />
              </div>
            </div>
          )}

          {/* BOTTOM DRAWER: Test Results, Output, Custom Input, Submissions History, AI Mentor */}
          <div className="h-64 border-t border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
            {/* Drawer Tabs & Action Buttons */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'tests'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" /> Test Suite
                  {executionResult?.testResults && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      executionResult.testResults.failed === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {executionResult.testResults.passed}/{executionResult.testResults.total}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'output'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Standard Output
                </button>

                <button
                  onClick={() => setActiveTab('customInput')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'customInput'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Custom Input
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'history'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Submissions
                  {submissions.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-700 text-slate-300">
                      {submissions.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('aiMentor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'aiMentor'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/40'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Mentor
                </button>
              </div>

              {/* Action Buttons: Run Code & Submit */}
              <div className="flex items-center gap-2">
                {executionResult && (
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mr-2">
                    <Clock className="w-3 h-3" /> {executionResult.executionTimeMs}ms
                  </span>
                )}

                {question.type !== 'conceptual' && (
                  <button
                    onClick={handleRun}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition"
                    title="Run code with custom input (Ctrl+Enter)"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-200" />
                    <span>Run</span>
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isExecuting || (question.type === 'conceptual' && conceptualSubmitted)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{question.type === 'conceptual' ? 'Check Answer' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>

            {/* Drawer Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs">
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  {!executionResult?.testResults ? (
                    <div className="text-slate-500 flex flex-col items-center justify-center h-32 space-y-2">
                      <Terminal className="w-6 h-6 text-slate-600" />
                      <span>Click "Submit Solution" to run your code against test cases.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {executionResult.testResults.failed === 0 ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Accepted! All Test Cases Passed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                              <XCircle className="w-4 h-4" /> Wrong Answer / Mismatched Output
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {executionResult.testResults.passed} of {executionResult.testResults.total} passed
                        </span>
                      </div>

                      {/* Individual test case badges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {executionResult.testResults.details.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                              tc.passed
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-sans">
                              <span className="font-bold">
                                Case {tc.testIndex} {tc.isHidden ? '(Hidden Test)' : '(Sample)'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tc.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {tc.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>

                            {!tc.isHidden ? (
                              <div className="space-y-1 pt-1 text-[11px]">
                                <div><span className="text-slate-500">Input: </span>{tc.input}</div>
                                <div><span className="text-slate-500">Expected: </span>{tc.expected}</div>
                                <div><span className="text-slate-500">Actual: </span>{tc.actual || tc.error || 'None'}</div>
                              </div>
                            ) : (
                              <div className="text-slate-400 text-[11px] pt-1 italic">
                                Hidden interview evaluation case. {tc.passed ? 'Output matched.' : (tc.error || 'Output did not match.')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {executionResult.testResults.failed > 0 && (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Stuck on test failures?</span>
                          <button
                            onClick={() => askAiMentor('DEBUG')}
                            className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                          >
                            <Bot className="w-3.5 h-3.5" /> Debug with AI Mentor
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'output' && (
                <div className="space-y-2">
                  {executionResult?.stdout && (
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Standard Output:</div>
                      <pre className="text-slate-200 whitespace-pre-wrap">{executionResult.stdout}</pre>
                    </div>
                  )}
                  {executionResult?.error && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 whitespace-pre-wrap">
                      <div className="font-bold flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Runtime Error / Traceback:
                      </div>
                      {executionResult.error}
                    </div>
                  )}
                  {!executionResult?.stdout && !executionResult?.error && (
                    <div className="text-slate-500 italic">No output yet. Click "Run" to test your code.</div>
                  )}
                </div>
              )}

              {activeTab === 'customInput' && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">
                      Standard input (stdin) passed to your program:
                    </span>
                    {question.examples?.[0]?.input && (
                      <button
                        onClick={() => setCustomInput(question.examples[0].input)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Insert Example 1 Input
                      </button>
                    )}
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="w-full h-24 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <div className="text-[11px] text-slate-500 font-mono">
                    Hint: Use Python's <code className="text-indigo-400">input()</code> or <code className="text-indigo-400">sys.stdin.read()</code> to read this stream.
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3 font-sans">
                  {submissions.length === 0 ? (
                    <div className="text-slate-500 flex flex-col items-center justify-center h-32 space-y-2">
                      <History className="w-6 h-6 text-slate-600" />
                      <span>No submissions recorded yet for this question.</span>
                      <span className="text-xs text-slate-600">Submit your solution to track your progress and accuracy!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                        <span>Past Submissions ({submissions.length})</span>
                        <span className="text-[11px] text-slate-500">Click "Load Code" to restore any past submission</span>
                      </div>
                      <div className="space-y-2">
                        {submissions.map((sub, idx) => {
                          const isAcc = sub.status === 'Accepted';
                          const isTle = sub.status === 'Time Limit Exceeded';
                          const isErr = sub.status === 'Runtime Error';
                          const badgeColor = isAcc
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isTle
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : isErr
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                          const dateFormatted = new Date(sub.timestamp).toLocaleString();

                          return (
                            <div
                              key={sub.id || idx}
                              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono hover:border-slate-700 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-sans flex items-center gap-1.5 ${badgeColor}`}>
                                  {isAcc ? <CheckCircle2 className="w-3.5 h-3.5" /> : isTle ? <Clock className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                  {sub.status}
                                </span>
                                <span className="text-slate-400 font-sans">
                                  {sub.passedTests} / {sub.totalTests} tests passed
                                </span>
                                <span className="text-slate-500">
                                  • {sub.executionTimeMs}ms
                                </span>
                              </div>

                              <div className="flex items-center gap-3 font-sans">
                                <span className="text-[11px] text-slate-500">
                                  {dateFormatted}
                                </span>
                                <button
                                  onClick={() => handleLoadSubmissionCode(sub.code, sub.timestamp)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                                  title="Load this submission's code into Monaco Editor"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Load Code</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'aiMentor' && (
                <div className="space-y-3 font-sans text-xs">
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 text-indigo-400 py-6 justify-center">
                      <Bot className="w-5 h-5 animate-spin" />
                      <span>AI Mentor is thinking through your code and problem nuances...</span>
                    </div>
                  ) : aiResponse ? (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> AI Mentor ({aiMode})
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => askAiMentor('HINT')}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            Hint
                          </button>
                          <button
                            onClick={() => askAiMentor('EXPLAIN')}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            Explain
                          </button>
                          <button
                            onClick={() => askAiMentor('SOLUTION')}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            Solution
                          </button>
                        </div>
                      </div>
                      <div className="text-slate-300 text-xs leading-relaxed">{aiResponse}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center justify-center py-6 space-y-2">
                      <Bot className="w-6 h-6 text-indigo-400" />
                      <span>Select a mode above (Hint, Explain, or Solution) to receive real-time guidance.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
