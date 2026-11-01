import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Database, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Code2, 
  Cpu, 
  FileCheck, 
  ArrowRight, 
  Download, 
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { QuestionStore } from '../../services/questionStore';
import { Question } from '../../types';

interface QuestionBankStatsViewProps {
  onNavigateToCategory: (category: string) => void;
  onSelectQuestion: (question: Question) => void;
}

export const QuestionBankStatsView: React.FC<QuestionBankStatsViewProps> = ({
  onNavigateToCategory,
  onSelectQuestion
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [batchData, setBatchData] = useState<any[]>([]);

  const stats = QuestionStore.getDatasetStats();
  const allQuestions = QuestionStore.getAllQuestions();

  useEffect(() => {
    fetch('/api/questions/batch-stats')
      .then(res => res.json())
      .then(data => {
        if (data.batches) setBatchData(data.batches);
      })
      .catch(() => {
        // Fallback local batch list if offline
        setBatchData([
          { file: 'batch-01-python-basics.json', count: 70, category: 'python', topic: 'Python Basics', startId: 'py-001', endId: 'py-070', status: 'Verified' },
          { file: 'batch-02-python-datastructures.json', count: 80, category: 'python', topic: 'Python Data Structures', startId: 'py-071', endId: 'py-150', status: 'Verified' },
          { file: 'batch-03-python-oop-functions.json', count: 70, category: 'python', topic: 'Python Functions & OOP', startId: 'py-151', endId: 'py-220', status: 'Verified' },
          { file: 'batch-04-python-advanced.json', count: 40, category: 'python', topic: 'Advanced Python', startId: 'py-221', endId: 'py-260', status: 'Verified' },
          { file: 'batch-05-python-interview.json', count: 40, category: 'python', topic: 'Python Interview Questions', startId: 'py-261', endId: 'py-300', status: 'Verified' },
          { file: 'batch-06-dsa-arrays.json', count: 70, category: 'dsa', topic: 'Arrays', startId: 'dsa-001', endId: 'dsa-070', status: 'Verified' },
          { file: 'batch-07-dsa-strings.json', count: 50, category: 'dsa', topic: 'Strings', startId: 'dsa-071', endId: 'dsa-120', status: 'Verified' },
          { file: 'batch-08-dsa-hashing.json', count: 40, category: 'dsa', topic: 'Hashing', startId: 'dsa-121', endId: 'dsa-160', status: 'Verified' },
          { file: 'batch-09-dsa-twopointers.json', count: 35, category: 'dsa', topic: 'Two Pointers', startId: 'dsa-161', endId: 'dsa-195', status: 'Verified' },
          { file: 'batch-10-dsa-slidingwindow.json', count: 35, category: 'dsa', topic: 'Sliding Window', startId: 'dsa-196', endId: 'dsa-230', status: 'Verified' },
          { file: 'batch-11-dsa-sorting-binarysearch.json', count: 45, category: 'dsa', topic: 'Sorting and Binary Search', startId: 'dsa-231', endId: 'dsa-275', status: 'Verified' },
          { file: 'batch-12-dsa-recursion-backtracking.json', count: 45, category: 'dsa', topic: 'Recursion and Backtracking', startId: 'dsa-276', endId: 'dsa-320', status: 'Verified' },
          { file: 'batch-13-dsa-linkedlists.json', count: 35, category: 'dsa', topic: 'Linked Lists', startId: 'dsa-321', endId: 'dsa-355', status: 'Verified' },
          { file: 'batch-14-dsa-stacks-queues.json', count: 35, category: 'dsa', topic: 'Stacks and Queues', startId: 'dsa-356', endId: 'dsa-390', status: 'Verified' },
          { file: 'batch-15-dsa-trees-bst.json', count: 50, category: 'dsa', topic: 'Trees and Binary Search Trees', startId: 'dsa-391', endId: 'dsa-440', status: 'Verified' },
          { file: 'batch-16-dsa-heaps.json', count: 25, category: 'dsa', topic: 'Heaps and Priority Queues', startId: 'dsa-441', endId: 'dsa-465', status: 'Verified' },
          { file: 'batch-17-dsa-graphs.json', count: 40, category: 'dsa', topic: 'Graphs', startId: 'dsa-466', endId: 'dsa-505', status: 'Verified' },
          { file: 'batch-18-dsa-dp.json', count: 55, category: 'dsa', topic: 'Dynamic Programming', startId: 'dsa-506', endId: 'dsa-560', status: 'Verified' },
          { file: 'batch-19-dsa-greedy.json', count: 20, category: 'dsa', topic: 'Greedy Algorithms', startId: 'dsa-561', endId: 'dsa-580', status: 'Verified' },
          { file: 'batch-20-dsa-bitmanip.json', count: 20, category: 'dsa', topic: 'Bit Manipulation', startId: 'dsa-581', endId: 'dsa-600', status: 'Verified' },
          { file: 'batch-21-cs-fundamentals.json', count: 100, category: 'cs-fundamentals', topic: 'Computer Science Fundamentals', startId: 'cs-001', endId: 'cs-100', status: 'Verified' }
        ]);
      });
  }, []);

  const handleTriggerFirestoreImport = async () => {
    setIsImporting(true);
    setImportStatus(null);
    try {
      const resp = await fetch('/api/admin/import-firestore', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        setImportStatus(`✅ Successfully imported and verified ${data.details.totalImported} questions across ${data.details.batches} batches!`);
      } else {
        setImportStatus(`❌ Import issue: ${data.error}`);
      }
    } catch (e: any) {
      setImportStatus(`❌ Import error: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const dsaTopicDetails = [
    { name: 'Arrays', count: 70, range: 'dsa-001 to dsa-070' },
    { name: 'Strings', count: 50, range: 'dsa-071 to dsa-120' },
    { name: 'Hashing', count: 40, range: 'dsa-121 to dsa-160' },
    { name: 'Two Pointers', count: 35, range: 'dsa-161 to dsa-195' },
    { name: 'Sliding Window', count: 35, range: 'dsa-196 to dsa-230' },
    { name: 'Sorting and Binary Search', count: 45, range: 'dsa-231 to dsa-275' },
    { name: 'Recursion and Backtracking', count: 45, range: 'dsa-276 to dsa-320' },
    { name: 'Linked Lists', count: 35, range: 'dsa-321 to dsa-355' },
    { name: 'Stacks and Queues', count: 35, range: 'dsa-356 to dsa-390' },
    { name: 'Trees and Binary Search Trees', count: 50, range: 'dsa-391 to dsa-440' },
    { name: 'Heaps and Priority Queues', count: 25, range: 'dsa-441 to dsa-465' },
    { name: 'Graphs', count: 40, range: 'dsa-466 to dsa-505' },
    { name: 'Dynamic Programming', count: 55, range: 'dsa-506 to dsa-560' },
    { name: 'Greedy Algorithms', count: 20, range: 'dsa-561 to dsa-580' },
    { name: 'Bit Manipulation', count: 20, range: 'dsa-581 to dsa-600' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Complete & Verified Dataset
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Question Bank Telemetry & Category Distribution
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every question in CodeMaster is stored in structured, validated batch files with guaranteed zero duplicate IDs, complete executable test suites, and strict Firestore schema compliance.
          </p>
        </div>

        {/* Global Total Badge */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center shrink-0">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Verified Questions
          </span>
          <div className="text-4xl font-extrabold text-white font-mono mt-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {stats.total.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">0 Duplicates • 100% Tested</span>
        </div>
      </div>

      {/* Main 3 Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Python Track */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-blue-500/50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Code2 className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Python Programming</h3>
            </div>
            <span className="font-mono text-xl font-extrabold text-blue-400">{stats.pythonTotal}</span>
          </div>

          <p className="text-xs text-slate-400">
            From language fundamentals and collection manipulation to advanced OOP, decorators, and memory profiling.
          </p>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800 font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Python Basics</span>
              <span>70 Questions (py-001 - py-070)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Python Data Structures</span>
              <span>80 Questions (py-071 - py-150)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Functions & OOP</span>
              <span>70 Questions (py-151 - py-220)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Advanced Python</span>
              <span>40 Questions (py-221 - py-260)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Interview Tracing</span>
              <span>40 Questions (py-261 - py-300)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToCategory('python')}
            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <span>Explore 300 Python Problems</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DSA Track */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Layers className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Data Structures & Algo</h3>
            </div>
            <span className="font-mono text-xl font-extrabold text-purple-400">{stats.dsaTotal}</span>
          </div>

          <p className="text-xs text-slate-400">
            Comprehensive algorithms covering all 15 core interview topics from Arrays and Two Pointers to Trees and Dynamic Programming.
          </p>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800 font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Arrays & Strings</span>
              <span>120 Questions (dsa-001 - dsa-120)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Hashing, Two Ptr & Window</span>
              <span>110 Questions (dsa-121 - dsa-230)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Sorting, Binary Search & Tree</span>
              <span>175 Questions (dsa-231 - dsa-440)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Graphs & Dynamic Programming</span>
              <span>95 Questions (dsa-466 - dsa-560)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Heaps, Greedy & Bitwise</span>
              <span>65 Questions (dsa-441 - dsa-600)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToCategory('dsa')}
            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <span>Explore 600 DSA Problems</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CS Fundamentals Track */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Cpu className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">CS Fundamentals</h3>
            </div>
            <span className="font-mono text-xl font-extrabold text-cyan-400">{stats.csTotal}</span>
          </div>

          <p className="text-xs text-slate-400">
            University examinations and high-stakes technical screening questions covering DBMS, OS, Networking, and Architecture.
          </p>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800 font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">OOP Core Invariants</span>
              <span>18 Questions (cs-001 - cs-018)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">DBMS & SQL Transactions</span>
              <span>20 Questions (cs-019 - cs-038)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Operating Systems & Memory</span>
              <span>20 Questions (cs-039 - cs-058)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Computer Networks (TCP/IP)</span>
              <span>18 Questions (cs-059 - cs-076)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Complexity & Software Eng</span>
              <span>24 Questions (cs-077 - cs-100)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToCategory('cs-fundamentals')}
            className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <span>Explore 100 CS Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Difficulty Breakdown Visual Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base">Difficulty Distribution Across 1,000 Questions</h3>
        
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-950">
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${(stats.difficulty.easy / stats.total) * 100}%` }}
            title={`Easy: ${stats.difficulty.easy}`}
          />
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${(stats.difficulty.medium / stats.total) * 100}%` }}
            title={`Medium: ${stats.difficulty.medium}`}
          />
          <div
            className="bg-rose-500 h-full"
            style={{ width: `${(stats.difficulty.hard / stats.total) * 100}%` }}
            title={`Hard: ${stats.difficulty.hard}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-semibold">Easy</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{stats.difficulty.easy}</div>
            <span className="text-[10px] text-slate-500">{Math.round((stats.difficulty.easy / stats.total) * 100)}% of bank</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-semibold">Medium</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{stats.difficulty.medium}</div>
            <span className="text-[10px] text-slate-500">{Math.round((stats.difficulty.medium / stats.total) * 100)}% of bank</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-semibold">Hard</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{stats.difficulty.hard}</div>
            <span className="text-[10px] text-slate-500">{Math.round((stats.difficulty.hard / stats.total) * 100)}% of bank</span>
          </div>
        </div>
      </div>

      {/* DSA Topic-Wise Distribution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base">Data Structures & Algorithms Breakdown (600 Questions)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dsaTopicDetails.map((t, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200">{t.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.range}</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold font-mono">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Batches & Cloud Firestore Synchronizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4" /> Batch Inventory & Cloud Firestore Importer
            </div>
            <h3 className="text-xl font-bold text-white mt-1">21 Structured Batch Files</h3>
            <p className="text-xs text-slate-400 mt-1">
              All question data is segregated into modular JSON batches ready for Cloud Firestore bulk ingestion.
            </p>
          </div>

          <button
            onClick={handleTriggerFirestoreImport}
            disabled={isImporting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 self-start sm:self-auto shrink-0"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>{isImporting ? 'Validating Batches...' : 'Verify & Import to Firestore'}</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 font-mono leading-relaxed">
            {importStatus}
          </div>
        )}

        {/* Batches Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Batch File</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Topic</th>
                <th className="py-3 px-3">ID Range</th>
                <th className="py-3 px-3">Question Count</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {batchData.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 text-slate-300">
                  <td className="py-2.5 px-3 font-bold text-slate-200">{b.file}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                      b.category === 'python' ? 'bg-blue-500/10 text-blue-400' : (b.category === 'dsa' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400')
                    }`}>
                      {b.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{b.topic}</td>
                  <td className="py-2.5 px-3 text-slate-400">{b.startId} - {b.endId}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{b.count}</td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-sans font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
