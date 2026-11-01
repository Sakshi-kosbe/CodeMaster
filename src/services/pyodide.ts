/**
 * Pyodide WebAssembly Python Execution Service
 * Executes Python code completely in-browser safely with stdout/stderr capture,
 * timeout limits, and automated test case assertion verification.
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
        // Ensure script is loaded
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
              script.onerror = () => reject(new Error('Failed to download Pyodide WebAssembly engine'));
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

        // Initialize standard redirection harness
        await py.runPythonAsync(`
import sys
import io

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
    timeoutMs: number = 5000
  ): Promise<ExecutionResult> {
    const py = await this.init();
    const startTime = performance.now();

    // Prepare execution harness
    const harness = `
_capture.reset()
_capture.start()

# Mock stdin if customInput provided
${customInput !== undefined ? `
import sys, io
sys.stdin = io.StringIO(${JSON.stringify(customInput)})
` : ''}

__user_code_error__ = None
try:
    # Execute user code in dedicated scope
    _ns = {}
    exec(${JSON.stringify(code)}, _ns)
    # Expose solve function or outputs if any
    if 'solve' in _ns:
        globals()['solve'] = _ns['solve']
except Exception as _e:
    import traceback
    __user_code_error__ = traceback.format_exc()

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
      setTimeout(() => reject(new Error(`Execution timed out after ${timeoutMs / 1000} seconds. Check for infinite loops!`)), timeoutMs)
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
    timeoutMs: number = 8000
  ): Promise<ExecutionResult> {
    const py = await this.init();
    const startTime = performance.now();

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

    // First, load the user code definition
    const initHarness = `
_capture.reset()
_capture.start()
_ns = {}
__load_err__ = None
try:
    exec(${JSON.stringify(userCode)}, _ns)
except Exception as _e:
    import traceback
    __load_err__ = traceback.format_exc()
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
            input: tc.input,
            expected: tc.expectedOutput,
            actual: '',
            passed: false,
            isHidden: tc.isHidden,
            error: 'Compilation / Syntax error in submitted code'
          }))
        }
      };
    }

    // Now evaluate each test case
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testHarness = `
_capture.reset()
_capture.start()
_res = None
_tc_err = None

try:
    if 'solve' in _ns:
        # evaluate test case expression
        _args = eval("(${tc.input})")
        if isinstance(_args, tuple):
            _res = _ns['solve'](*_args)
        else:
            _res = _ns['solve'](_args)
    else:
        _tc_err = "No function named 'solve' found in solution."
except Exception as _e:
    import traceback
    _tc_err = traceback.format_exc()

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
          results.push({
            testIndex: i + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: '',
            passed: false,
            isHidden: tc.isHidden,
            error: String(tcErr)
          });
          if (!anyError) anyError = String(tcErr);
        } else {
          // Normalize string comparison: strip trailing whitespace/quotes
          const actualClean = String(resStr).trim();
          const expectedClean = String(tc.expectedOutput).trim();
          const passed = actualClean === expectedClean || actualClean.toLowerCase() === expectedClean.toLowerCase();

          if (passed) passedCount++;

          results.push({
            testIndex: i + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actualClean,
            passed,
            isHidden: tc.isHidden
          });
        }
      } catch (err: any) {
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: '',
          passed: false,
          isHidden: tc.isHidden,
          error: err.message || 'Execution error'
        });
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
