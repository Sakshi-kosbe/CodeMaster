import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';

type AlgorithmMode = 'binary-search' | 'bubble-sort' | 'stack-queue' | 'two-pointers' | 'binary-tree';

export const DSAVisualizer: React.FC = () => {
  const [mode, setMode] = useState<AlgorithmMode>('binary-search');
  const [array, setArray] = useState<number[]>([12, 24, 35, 47, 58, 69, 73, 85, 96]);
  const [target, setTarget] = useState<number>(58);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(800);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<Array<{
    array: number[];
    highlights: Record<number, 'compare' | 'found' | 'left' | 'right' | 'mid' | 'sorted'>;
    labels?: Record<number, string>;
    narration: string;
  }>>([]);

  const timerRef = useRef<any>(null);

  // Generate steps based on algorithm mode
  useEffect(() => {
    setIsPlaying(false);
    setStepIndex(0);

    if (mode === 'binary-search') {
      const sortedArr = [...array].sort((a, b) => a - b);
      const generatedSteps: any[] = [];
      let l = 0;
      let r = sortedArr.length - 1;
      let found = false;

      generatedSteps.push({
        array: sortedArr,
        highlights: { [l]: 'left', [r]: 'right' },
        labels: { [l]: 'L', [r]: 'R' },
        narration: `Starting Binary Search for target ${target}. Left pointer at 0, Right pointer at ${r}.`
      });

      while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        generatedSteps.push({
          array: sortedArr,
          highlights: { [l]: 'left', [r]: 'right', [mid]: 'mid' },
          labels: { [l]: 'L', [r]: 'R', [mid]: 'MID' },
          narration: `Checking Mid element array[${mid}] = ${sortedArr[mid]}. Comparing with ${target}.`
        });

        if (sortedArr[mid] === target) {
          generatedSteps.push({
            array: sortedArr,
            highlights: { [mid]: 'found' },
            labels: { [mid]: 'TARGET' },
            narration: `🎯 Target ${target} found at index ${mid}!`
          });
          found = true;
          break;
        } else if (sortedArr[mid] < target) {
          generatedSteps.push({
            array: sortedArr,
            highlights: { [mid]: 'compare', [r]: 'right' },
            narration: `${sortedArr[mid]} < ${target}. Target must be in right half. Move Left to ${mid + 1}.`
          });
          l = mid + 1;
        } else {
          generatedSteps.push({
            array: sortedArr,
            highlights: { [l]: 'left', [mid]: 'compare' },
            narration: `${sortedArr[mid]} > ${target}. Target must be in left half. Move Right to ${mid - 1}.`
          });
          r = mid - 1;
        }
      }

      if (!found) {
        generatedSteps.push({
          array: sortedArr,
          highlights: {},
          narration: `❌ Search interval exhausted. Target ${target} is not in the array.`
        });
      }

      setSteps(generatedSteps);
    } else if (mode === 'bubble-sort') {
      const arr = [64, 34, 25, 12, 22, 11, 90];
      const generatedSteps: any[] = [];
      const current = [...arr];
      const n = current.length;

      generatedSteps.push({
        array: [...current],
        highlights: {},
        narration: `Starting Bubble Sort with unsorted array: [${current.join(', ')}]`
      });

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          generatedSteps.push({
            array: [...current],
            highlights: { [j]: 'compare', [j + 1]: 'compare' },
            narration: `Comparing elements ${current[j]} and ${current[j + 1]}`
          });

          if (current[j] > current[j + 1]) {
            const temp = current[j];
            current[j] = current[j + 1];
            current[j + 1] = temp;

            generatedSteps.push({
              array: [...current],
              highlights: { [j]: 'found', [j + 1]: 'found' },
              narration: `Swapped ${current[j + 1]} and ${current[j]} because ${current[j + 1]} > ${current[j]}`
            });
          }
        }
        generatedSteps.push({
          array: [...current],
          highlights: { [n - i - 1]: 'sorted' },
          narration: `Element ${current[n - i - 1]} is now placed in its final sorted position.`
        });
      }

      generatedSteps.push({
        array: [...current],
        highlights: Object.fromEntries(current.map((_, i) => [i, 'sorted'])),
        narration: `🎉 Array is fully sorted!`
      });

      setSteps(generatedSteps);
    } else if (mode === 'two-pointers') {
      const arr = [1, 2, 4, 6, 9, 13, 17];
      const pairTarget = 15;
      const generatedSteps: any[] = [];
      let l = 0;
      let r = arr.length - 1;

      generatedSteps.push({
        array: arr,
        highlights: { [l]: 'left', [r]: 'right' },
        labels: { [l]: 'L', [r]: 'R' },
        narration: `Two Pointers: Find pair with sum = ${pairTarget}. Left at index 0, Right at index ${r}.`
      });

      while (l < r) {
        const sum = arr[l] + arr[r];
        generatedSteps.push({
          array: arr,
          highlights: { [l]: 'compare', [r]: 'compare' },
          labels: { [l]: `L(${arr[l]})`, [r]: `R(${arr[r]})` },
          narration: `Sum = ${arr[l]} + ${arr[r]} = ${sum}. Target is ${pairTarget}.`
        });

        if (sum === pairTarget) {
          generatedSteps.push({
            array: arr,
            highlights: { [l]: 'found', [r]: 'found' },
            labels: { [l]: 'PAIR 1', [r]: 'PAIR 2' },
            narration: `🎯 Pair Found! ${arr[l]} + ${arr[r]} = ${pairTarget}`
          });
          break;
        } else if (sum < pairTarget) {
          generatedSteps.push({
            array: arr,
            highlights: { [l]: 'left' },
            narration: `Sum ${sum} < ${pairTarget}. Increment left pointer to increase sum.`
          });
          l++;
        } else {
          generatedSteps.push({
            array: arr,
            highlights: { [r]: 'right' },
            narration: `Sum ${sum} > ${pairTarget}. Decrement right pointer to reduce sum.`
          });
          r--;
        }
      }

      setSteps(generatedSteps);
    } else if (mode === 'stack-queue') {
      const sequence = [10, 20, 30, 40];
      const generatedSteps: any[] = [];
      const currentStack: number[] = [];

      generatedSteps.push({
        array: [],
        highlights: {},
        narration: 'LIFO Stack Demonstration. Initializing empty stack.'
      });

      for (const val of sequence) {
        currentStack.push(val);
        generatedSteps.push({
          array: [...currentStack],
          highlights: { [currentStack.length - 1]: 'found' },
          labels: { [currentStack.length - 1]: 'TOP' },
          narration: `PUSH(${val}): Added ${val} to top of stack.`
        });
      }

      const popped = currentStack.pop();
      generatedSteps.push({
        array: [...currentStack],
        highlights: { [currentStack.length - 1]: 'compare' },
        labels: { [currentStack.length - 1]: 'TOP' },
        narration: `POP(): Removed ${popped} from top of stack. New top is ${currentStack[currentStack.length - 1]}.`
      });

      setSteps(generatedSteps);
    } else {
      // Binary Tree In-Order
      const treeVals = [1, 2, 3, 4, 5, 6, 7];
      setSteps([
        {
          array: treeVals,
          highlights: { 0: 'left', 1: 'mid', 2: 'right' },
          labels: { 1: 'ROOT' },
          narration: 'BST In-Order Traversal: Traverses Left Subtree -> Root -> Right Subtree, visiting nodes in sorted order.'
        },
        {
          array: treeVals,
          highlights: { 0: 'found' },
          narration: 'Visiting Left Child: 1'
        },
        {
          array: treeVals,
          highlights: { 1: 'found' },
          narration: 'Visiting Root: 2'
        },
        {
          array: treeVals,
          highlights: { 2: 'found' },
          narration: 'Visiting Right Child: 3'
        }
      ]);
    }
  }, [mode, target]);

  // Handle Play/Pause timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedMs);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps, speedMs]);

  const currentStep = steps[stepIndex] || {
    array: [],
    highlights: {},
    narration: 'Ready'
  };

  const getBarColor = (type?: string) => {
    switch (type) {
      case 'found':
        return 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/50';
      case 'compare':
        return 'bg-amber-500 border-amber-400 text-white shadow-amber-500/50';
      case 'left':
        return 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50';
      case 'right':
        return 'bg-purple-600 border-purple-400 text-white shadow-purple-500/50';
      case 'mid':
        return 'bg-cyan-500 border-cyan-400 text-white shadow-cyan-500/50';
      case 'sorted':
        return 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/50';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-200';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Interactive DSA Algorithm Visualizer</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Step through algorithmic invariants with real-time memory and pointer states.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['binary-search', 'bubble-sort', 'two-pointers', 'stack-queue', 'binary-tree'] as AlgorithmMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Target input for binary search */}
      {mode === 'binary-search' && (
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-xs font-medium text-slate-400">Search Target:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <span className="text-xs text-slate-500">Pick any number to visualize the O(log N) binary division.</span>
        </div>
      )}

      {/* Visual Canvas */}
      <div className="min-h-[200px] flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden">
        {/* Memory Array Blocks */}
        <div className="flex flex-wrap items-end justify-center gap-2.5 max-w-full">
          {currentStep.array.map((val, idx) => {
            const highlightType = currentStep.highlights[idx];
            const label = currentStep.labels?.[idx];
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 transition-all duration-300">
                {label && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {label}
                  </span>
                )}
                <div
                  className={`w-12 h-14 md:w-14 md:h-16 flex items-center justify-center rounded-xl border-2 font-mono text-base font-bold shadow-md transition-all duration-300 ${getBarColor(
                    highlightType
                  )}`}
                >
                  {val}
                </div>
                <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 border border-blue-400" />
            <span>Left Pointer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600 border border-purple-400" />
            <span>Right Pointer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 border border-cyan-400" />
            <span>Mid Index</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
            <span>Target / Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400" />
            <span>Comparing</span>
          </div>
        </div>
      </div>

      {/* Step Narration */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Step {stepIndex + 1} of {steps.length}
          </div>
          <div className="text-sm text-slate-200 mt-1 font-medium">
            {currentStep.narration}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            {isPlaying ? 'Pause' : 'Play Simulation'}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(prev => Math.min(prev + 1, steps.length - 1));
            }}
            disabled={stepIndex >= steps.length - 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(0);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Speed:</span>
          <input
            type="range"
            min="300"
            max="1500"
            step="100"
            value={1800 - speedMs}
            onChange={(e) => setSpeedMs(1800 - parseInt(e.target.value))}
            className="w-28 accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400">{(speedMs / 1000).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
