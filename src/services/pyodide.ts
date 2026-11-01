/**
 * Pyodide WebAssembly Python Execution Service
 * Executes Python code completely in-browser safely with:
 * - stdout and stderr capture
 * - custom stdin support
 * - sys.settrace execution guard for infinite loop and timeout protection
 * - sample test cases evaluation
 * - secure hidden test evaluation (concealing hidden inputs & expected answers)
 */

import { ExecutionResult, TestCase } from '../types';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL?: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

class PyodideRunner {
  private pyodide: any = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<any> | null = null;
  private statusListeners: Set<(status: { isReady: boolean; isInitializing: boolean; error: string | null }) => void> = new Set();
  private error: string | null = null;

  public subscribeStatus(listener: (status: { isReady: boolean; isInitializing: boolean; error: string | null }) => void) {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getStatus() {
    return {
      isReady: !!this.pyodide,
      isInitializing: this.isInitializing,
      error: this.error
    };
  }

  private notify() {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => listener(status));
  }

  public async init(): Promise<any> {
    if (this.pyodide) return this.pyodide;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.error = null;
    this.notify();

    this.initPromise = (async () => {
      try {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="pyodide.js"]');
            if (existingScript) {
              existingScript.addEventListener('load', () => resolve());
              existingScript.addEventListener('error', () => reject(new Error('Failed to load Pyodide script from CDN')));
            } else {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';
              script.async = true;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to download Pyodide WebAssembly runtime'));
              document.head.appendChild(script);
            }
          });
        }

        if (!window.loadPyodide) {
          throw new Error('Pyodide loader function is not available on window.');
        }

        const py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/'
        });

        // Initialize standard redirection and execution guard harness
        await py.runPythonAsync(`
import sys
import io
import time

class OutputCapture:
    def __init__(self):
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
    def start(self):
        sys.stdout = self.stdout_buf
        sys.stderr = self.stderr_buf
    def reset(self):
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
        sys.stdout = self.stdout_buf
        sys.stderr = self.stderr_buf
    def get_stdout(self):
        return self.stdout_buf.getvalue()
    def get_stderr(self):
        return self.stderr_buf.getvalue()

_capture = OutputCapture()

class ExecutionGuard:
    def __init__(self, max_seconds=3.0, max_steps=3000000):
        self.start_time = time.time()
        self.max_seconds = max_seconds
        self.steps = 0
        self.max_steps = max_steps

    def trace_func(self, frame, event, arg):
        self.steps += 1
        if self.steps % 1000 == 0:
            if time.time() - self.start_time > self.max_seconds:
                raise TimeoutError(f"Time Limit Exceeded ({self.max_seconds:.1f}s): Infinite loop protection triggered.")
        if self.steps > self.max_steps:
            raise TimeoutError("Step Limit Exceeded: Potential infinite loop detected.")
        return self.trace_func
`);

        this.pyodide = py;
        window.pyodideInstance = py;
        this.isInitializing = false;
        this.notify();
        return py;
      } catch (err: any) {
        this.isInitializing = false;
        this.error = err.message || 'Error initializing Python runtime';
        this.notify();
        throw err;
      }
    })();

    return this.initPromise;
  }

  public async runPython(
    code: string,
    customInput?: string,
    timeoutMs: number = 4000
  ): Promise<ExecutionResult> {
    const py = await this.init();
    const startTime = performance.now();
    const maxSeconds = timeoutMs / 1000;

    const harness = `
_capture.reset()
_capture.start()

# Handle custom input
import sys, io
sys.stdin = io.StringIO(${JSON.stringify(customInput || '')})

__user_code_error__ = None
_guard = ExecutionGuard(max_seconds=${maxSeconds})
sys.settrace(_guard.trace_func)

try:
    _ns = {}
    exec(${JSON.stringify(code)}, _ns)
    if 'solve' in _ns:
        globals()['solve'] = _ns['solve']
except Exception as _e:
    import traceback
    __user_code_error__ = traceback.format_exc()
finally:
    sys.settrace(None)

_captured_stdout = _capture.get_stdout()
_captured_stderr = _capture.get_stderr()
`;

    const executionPromise = (async () => {
      await py.runPythonAsync(harness);
      const stdout = py.globals.get('_captured_stdout') || '';
      const stderr = py.globals.get('_captured_stderr') || '';
      const err = py.globals.get('__user_code_error__') || undefined;
      const duration = Math.round(performance.now() - startTime);

      return {
        stdout: String(stdout),
        stderr: String(stderr),
        error: err ? String(err) : undefined,
        executionTimeMs: duration
      };
    })();

    const timeoutPromise = new Promise<ExecutionResult>((_, reject) =>
      setTimeout(() => reject(new Error(`Time Limit Exceeded: Execution halted after ${maxSeconds}s.`)), timeoutMs + 1000)
    );

    try {
      return await Promise.race([executionPromise, timeoutPromise]);
    } catch (e: any) {
      return {
        stdout: '',
        stderr: '',
        error: e.message || 'Execution error',
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }
  }

  public async evaluateTestCases(
    userCode: string,
    testCases: TestCase[],
    timeoutPerTestMs: number = 3000
  ): Promise<ExecutionResult> {
    const py = await this.init();
    const startTime = performance.now();
    const maxSeconds = timeoutPerTestMs / 1000;

    const results: Array<{
      testIndex: number;
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
      isHidden: boolean;
      error?: string;
    }> = [];

    let passedCount = 0;
    let anyError: string | undefined = undefined;
    let fullStdout = '';

    // First load user code definitions
    const initHarness = `
_capture.reset()
_capture.start()
_ns = {}
__load_err__ = None
_guard = ExecutionGuard(max_seconds=${maxSeconds})
sys.settrace(_guard.trace_func)

try:
    exec(${JSON.stringify(userCode)}, _ns)
except Exception as _e:
    import traceback
    __load_err__ = traceback.format_exc()
finally:
    sys.settrace(None)
`;

    await py.runPythonAsync(initHarness);
    const loadErr = py.globals.get('__load_err__');
    if (loadErr) {
      return {
        stdout: '',
        stderr: '',
        error: String(loadErr),
        executionTimeMs: Math.round(performance.now() - startTime),
        testResults: {
          total: testCases.length,
          passed: 0,
          failed: testCases.length,
          details: testCases.map((tc, idx) => ({
            testIndex: idx + 1,
            input: tc.isHidden ? '[Hidden Interview Test Input]' : tc.input,
            expected: tc.isHidden ? '[Hidden Expected Output]' : tc.expectedOutput,
            actual: '',
            passed: false,
            isHidden: tc.isHidden,
            error: 'Syntax / Compilation error in submitted solution'
          }))
        }
      };
    }

    // Evaluate each test case
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testHarness = `
_capture.reset()
_capture.start()
_res = None
_tc_err = None
_guard = ExecutionGuard(max_seconds=${maxSeconds})
sys.settrace(_guard.trace_func)

try:
    if 'solve' in _ns:
        import inspect
        _raw_input = ${JSON.stringify(tc.input)}
        _args = None
        try:
            _args = eval(f"({_raw_input})")
        except Exception:
            try:
                _args = eval(_raw_input)
            except Exception:
                _args = _raw_input

        _fn = _ns['solve']
        try:
            _sig = inspect.signature(_fn)
            _param_count = len(_sig.parameters)
            if isinstance(_args, tuple) and _param_count > 1:
                _res = _fn(*_args)
            elif isinstance(_args, tuple) and _param_count == 1:
                _res = _fn(_args)
            else:
                try:
                    _res = _fn(*_args) if isinstance(_args, tuple) else _fn(_args)
                except TypeError:
                    _res = _fn(_args)
        except Exception:
            if isinstance(_args, tuple):
                try:
                    _res = _fn(*_args)
                except TypeError:
                    _res = _fn(_args)
            else:
                _res = _fn(_args)
    else:
        _tc_err = "No function named 'solve' found in solution. Ensure you define 'def solve(...) -> ...'"
except Exception as _e:
    import traceback
    _tc_err = traceback.format_exc()
finally:
    sys.settrace(None)

_res_str = str(_res)
_out = _capture.get_stdout()
`;

      try {
        await py.runPythonAsync(testHarness);
        const tcErr = py.globals.get('_tc_err');
        const resStr = py.globals.get('_res_str');
        const caseOut = py.globals.get('_out') || '';

        fullStdout += caseOut;

        if (tcErr) {
          const errStr = String(tcErr);
          const isTimeout = errStr.includes('TimeoutError') || errStr.includes('Time Limit Exceeded') || errStr.includes('Step Limit Exceeded');
          const displayErr = isTimeout 
            ? `Time Limit Exceeded (${maxSeconds.toFixed(1)}s): Execution halted by infinite loop guard.`
            : errStr;

          results.push({
            testIndex: i + 1,
            input: tc.isHidden ? '[Hidden Interview Test Input]' : tc.input,
            expected: tc.isHidden ? '[Hidden Expected Output]' : tc.expectedOutput,
            actual: '',
            passed: false,
            isHidden: tc.isHidden,
            error: tc.isHidden ? (isTimeout ? 'Time Limit Exceeded' : 'Runtime Error on Hidden Test Case') : displayErr
          });
          if (!anyError) anyError = displayErr;
        } else {
          const actualClean = String(resStr).trim();
          const expectedClean = String(tc.expectedOutput).trim();
          const normActual = actualClean.replace(/\s+/g, '').toLowerCase();
          const normExpected = expectedClean.replace(/\s+/g, '').toLowerCase();
          const passed = actualClean === expectedClean || normActual === normExpected;

          if (passed) passedCount++;

          results.push({
            testIndex: i + 1,
            // SECURITY: Never expose hidden test case input or expected answer to client
            input: tc.isHidden ? '[Hidden Interview Test Input]' : tc.input,
            expected: tc.isHidden ? '[Hidden Expected Output]' : tc.expectedOutput,
            actual: tc.isHidden ? (passed ? '[Output Matched Expected Criteria]' : '[Output Mismatched Expected Criteria]') : actualClean,
            passed,
            isHidden: tc.isHidden
          });
        }
      } catch (err: any) {
        const isTimeout = (err.message || '').includes('Time Limit') || (err.message || '').includes('timeout');
        results.push({
          testIndex: i + 1,
          input: tc.isHidden ? '[Hidden Interview Test Input]' : tc.input,
          expected: tc.isHidden ? '[Hidden Expected Output]' : tc.expectedOutput,
          actual: '',
          passed: false,
          isHidden: tc.isHidden,
          error: isTimeout ? `Time Limit Exceeded (${maxSeconds.toFixed(1)}s)` : (err.message || 'Execution error')
        });
        if (!anyError) anyError = isTimeout ? `Time Limit Exceeded (${maxSeconds.toFixed(1)}s)` : err.message;
      }
    }

    return {
      stdout: fullStdout,
      stderr: '',
      error: anyError,
      executionTimeMs: Math.round(performance.now() - startTime),
      testResults: {
        total: testCases.length,
        passed: passedCount,
        failed: testCases.length - passedCount,
        details: results
      }
    };
  }

  public async reset() {
    this.pyodide = null;
    this.initPromise = null;
    window.pyodideInstance = null;
    await this.init();
  }
}

export const pyodideService = new PyodideRunner();
