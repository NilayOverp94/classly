'use client';

import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Lock,
  Sparkles,
  Zap,
  Cpu,
  Clock,
  Layers,
  FileCode,
  CornerDownLeft
} from 'lucide-react';

export type SupportedLanguage = 'python' | 'java' | 'javascript' | 'cpp';

export const ONECOMPILER_PUBLIC_KEY = 'oc_44zfkft93_44zfkft9n_05402516c95b05573f6f0091513676bcedcdd3e2777c9082';

interface LiveCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  canEdit: boolean;
  onRun?: (output: string) => void;
  remoteOutput?: string;
}

export const STARTER_CODE: Record<SupportedLanguage, string> = {
  python: `# ==========================================
# Classly Computer Science Studio
# Powered by OneCompiler Cloud Engine
# ==========================================

def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

def main():
    print("Welcome to Classly Live Coding Studio!")
    number = 5
    result = calculate_factorial(number)
    print(f"Factorial of {number} is: {result}")

    # Interactive loops & arrays
    primes = [2, 3, 5, 7, 11, 13, 17, 19]
    squares = [x**2 for x in primes[:5]]
    print(f"Squares of first 5 primes: {squares}")

if __name__ == "__main__":
    main()
`,
  java: `// ==========================================
// Classly Computer Science Studio
// Subject: AP Computer Science A (Java)
// Powered by OneCompiler Cloud Engine
// ==========================================

public class Main {
    public static int calculateSum(int[] arr) {
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return sum;
    }

    public static void main(String[] args) {
        System.out.println("Welcome to Classly AP Computer Science A Studio!");
        int[] scores = { 92, 88, 95, 100, 85 };
        int total = calculateSum(scores);
        double average = (double) total / scores.length;

        System.out.println("Total Score: " + total);
        System.out.printf("Class Average: %.2f%n", average);
        System.out.println("Execution verified on Java 17 Runtime.");
    }
}
`,
  javascript: `// ==========================================
// Classly Computer Science Studio
// Subject: JavaScript & Algorithms (Node.js)
// Powered by OneCompiler Cloud Engine
// ==========================================

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;
const index = binarySearch(numbers, target);

console.log("Searching in sorted array:", numbers);
console.log(\`Target element \${target} found at index: \${index}\`);

// Modern ES6 operations
const doubled = numbers.slice(0, 5).map(n => n * 2);
console.log("First 5 numbers doubled:", doubled);
`,
  cpp: `// ==========================================
// Classly Computer Science Studio
// Subject: C++ Data Structures & Algorithms
// Powered by OneCompiler Cloud Engine (GCC)
// ==========================================

#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "Classly C++ Studio Initialized." << std::endl;
    std::vector<int> data = {10, 45, 23, 78, 12, 99};

    std::sort(data.begin(), data.end());
    std::cout << "Sorted elements: ";
    for (int n : data) {
        std::cout << n << " ";
    }
    std::cout << std::endl;

    int sum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Sum of vector elements: " << sum << std::endl;
    return 0;
}
`,
};

export interface CodeSnippet {
  title: string;
  category: string;
  code: string;
}

export const SNIPPETS_BY_LANG: Record<SupportedLanguage, CodeSnippet[]> = {
  python: [
    {
      title: 'Recursion (Fibonacci & Memoization)',
      category: 'Algorithms',
      code: `def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 2: return 1
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

for i in range(1, 11):
    print(f"Fib({i}) = {fib(i)}")
`,
    },
    {
      title: 'User Input (Interactive STDIN)',
      category: 'Basics',
      code: `# Use the STDIN input drawer below to enter your name!
import sys

print("Reading input from STDIN...")
line = sys.stdin.readline().strip()
if not line:
    line = "Classly Student"

print(f"Hello, {line}! Welcome to interactive Python.")
`,
    },
    {
      title: 'Object-Oriented Programming (Class)',
      category: 'OOP',
      code: `class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade
        self.subjects = []

    def enroll(self, subject):
        self.subjects.append(subject)

    def summary(self):
        return f"{self.name} (Grade {self.grade}) is studying: {', '.join(self.subjects)}"

s1 = Student("Maya", 10)
s1.enroll("AP Calculus")
s1.enroll("Computer Science")
print(s1.summary())
`,
    },
  ],
  java: [
    {
      title: 'AP CS A: 2D Array Traversal',
      category: 'Arrays',
      code: `public class Main {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        System.out.println("2D Matrix Elements:");
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                System.out.print(matrix[r][c] + " ");
            }
            System.out.println();
        }
    }
}
`,
    },
    {
      title: 'Java Scanner (STDIN Input)',
      category: 'Input',
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Ready for input:");
        if (sc.hasNextLine()) {
            String name = sc.nextLine();
            System.out.println("Received greeting for: " + name);
        } else {
            System.out.println("No STDIN input provided, using default 'Classly'");
        }
    }
}
`,
    },
  ],
  javascript: [
    {
      title: 'Array High-Order Functions (Map, Filter, Reduce)',
      category: 'Functional',
      code: `const scores = [65, 82, 94, 71, 88, 99, 45, 90];

const honors = scores.filter(s => s >= 85);
const curved = scores.map(s => Math.min(100, s + 5));
const total = scores.reduce((sum, s) => sum + s, 0);
const avg = (total / scores.length).toFixed(1);

console.log("Original scores:", scores);
console.log("Honors (>=85):", honors);
console.log("Curved (+5):", curved);
console.log("Class Average:", avg);
`,
    },
  ],
  cpp: [
    {
      title: 'Binary Search Algorithm (C++)',
      category: 'Algorithms',
      code: `#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> nums = {3, 7, 12, 19, 25, 34, 48, 56, 72};
    int target = 25;
    int idx = binarySearch(nums, target);
    std::cout << "Target " << target << " found at index: " << idx << std::endl;
    return 0;
}
`,
    },
  ],
};

export function LiveCodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  canEdit,
  onRun,
  remoteOutput,
}: LiveCodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [showConsole, setShowConsole] = useState(false);
  const [fontSize, setFontSize] = useState<number>(13);
  
  // STDIN input state
  const [stdinInput, setStdinInput] = useState<string>('');
  const [showStdinDrawer, setShowStdinDrawer] = useState(false);
  const [showSnippetsMenu, setShowSnippetsMenu] = useState(false);

  // Execution meta
  const [executionStats, setExecutionStats] = useState<{
    executionTime?: number;
    compilationTime?: number;
    memoryUsed?: number;
    status?: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  // Sync remote output if provided
  useEffect(() => {
    if (remoteOutput !== undefined && remoteOutput !== '') {
      setConsoleOutput(remoteOutput);
      setShowConsole(true);
    }
  }, [remoteOutput]);

  // Synchronize scrolling between transparent textarea and syntax pre block
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Tab key interception (insert 4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces

      const newCode = code.substring(0, start) + spaces + code.substring(end);
      onChange(newCode);

      // Re-position cursor after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  // Reset to starter template
  const handleResetStarter = () => {
    if (confirm(`Reset ${language.toUpperCase()} editor to the curriculum template?`)) {
      onChange(STARTER_CODE[language]);
    }
  };

  // REAL ONECOMPILER CLOUD EXECUTION
  const handleRunCode = async () => {
    setIsRunning(true);
    setShowConsole(true);

    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(`[OneCompiler Cloud Engine ~ ${timestamp}]\nCompiling & executing ${language.toUpperCase()} in sandbox container...\n`);

    try {
      let result: any = null;

      // 1. First attempt through our Next.js API Route (/api/compiler/run)
      try {
        const res = await fetch('/api/compiler/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            code,
            stdin: stdinInput,
          }),
        });

        if (res.ok) {
          result = await res.json();
        }
      } catch (proxyErr) {
        console.warn('Proxy API failed, attempting direct OneCompiler gateway:', proxyErr);
      }

      // 2. Direct fallback to OneCompiler API if proxy fails
      if (!result || (result.status === 'error' && result.stderr?.includes('HTTP status'))) {
        const directLang = language === 'javascript' ? 'nodejs' : language;
        let directFile = 'main.py';
        if (language === 'java') {
          const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
          directFile = match && match[1] ? `${match[1]}.java` : 'Main.java';
        } else if (language === 'cpp') {
          directFile = 'main.cpp';
        } else if (language === 'javascript') {
          directFile = 'index.js';
        }

        const directRes = await fetch('https://api.onecompiler.com/v1/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': ONECOMPILER_PUBLIC_KEY,
          },
          body: JSON.stringify({
            language: directLang,
            stdin: stdinInput || '',
            files: [{ name: directFile, content: code }],
          }),
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          let formattedOutput = '';
          if (directData.stdout) formattedOutput += directData.stdout;
          if (directData.stderr) formattedOutput += `\n[STDERR]\n${directData.stderr}`;
          if (directData.exception) formattedOutput += `\n[EXCEPTION]\n${directData.exception}`;
          if (!formattedOutput) formattedOutput = '[Process completed with 0 output]';

          result = {
            status: directData.status || 'success',
            stdout: directData.stdout || '',
            stderr: directData.stderr || null,
            exception: directData.exception || null,
            compilationTime: directData.compilationTime ?? null,
            executionTime: directData.executionTime ?? null,
            memoryUsed: directData.memoryUsed ?? null,
            formattedOutput,
          };
        }
      }

      if (result) {
        setExecutionStats({
          executionTime: result.executionTime,
          compilationTime: result.compilationTime,
          memoryUsed: result.memoryUsed,
          status: result.status,
        });

        const execTimeStr = result.executionTime !== null && result.executionTime !== undefined 
          ? `${result.executionTime}ms` 
          : '0.05s';
        const compileTimeStr = result.compilationTime 
          ? ` • Compilation: ${result.compilationTime}ms` 
          : '';
        const memoryStr = result.memoryUsed 
          ? ` • Memory: ${Math.round(result.memoryUsed / 1024)} KB` 
          : '';

        const outputBody = result.formattedOutput || result.stdout || result.stderr || '[Process completed with no output]';

        const finalFormattedTerminal = 
`[OneCompiler Cloud Engine ~ ${timestamp}]
Container: ${language.toUpperCase()} • Exec: ${execTimeStr}${compileTimeStr}${memoryStr}
──────────────────────────────────────────────────
${outputBody}
──────────────────────────────────────────────────
Process finished (Status: ${result.status || 'success'})`;

        setConsoleOutput(finalFormattedTerminal);
        if (onRun) {
          onRun(finalFormattedTerminal);
        }
      } else {
        throw new Error('Unable to obtain compiler response.');
      }
    } catch (err: any) {
      console.error('Code execution error:', err);
      const errorMsg = 
`[OneCompiler Cloud Engine ~ ${timestamp}]
[EXECUTION FAILED]
Error: ${err.message || 'Network error connecting to OneCompiler server.'}
Please ensure your internet connection is active and retry.`;
      setConsoleOutput(errorMsg);
      if (onRun) onRun(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate line numbers
  const lineCount = Math.max(1, (code || '').split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Syntax highlighting
  const grammar = Prism.languages[language] || Prism.languages.javascript;
  const highlightedCode = Prism.highlight(code || '', grammar, language);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0D1117] text-slate-100 overflow-hidden select-text border-l border-navy-800 dark:border-[#1E293B]">
      
      {/* Editor Header Toolbar */}
      <div className="h-11 bg-[#161B22] border-b border-[#30363D] px-3 sm:px-4 flex items-center justify-between text-xs flex-shrink-0 gap-2">
        
        {/* Left: Language Selector & Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">CS Studio</span>
          </div>

          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value as SupportedLanguage;
              onLanguageChange(newLang);
              if (!code || code === STARTER_CODE[language]) {
                onChange(STARTER_CODE[newLang]);
              }
            }}
            disabled={!canEdit}
            className="bg-[#21262D] text-slate-200 border border-[#30363D] rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="python">Python 3 (OneCompiler)</option>
            <option value="java">Java 17 (OneCompiler)</option>
            <option value="javascript">JavaScript / Node.js (OneCompiler)</option>
            <option value="cpp">C++ GCC (OneCompiler)</option>
          </select>

          {/* Quick Snippets Menu */}
          {canEdit && SNIPPETS_BY_LANG[language] && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSnippetsMenu(!showSnippetsMenu)}
                className="px-2 py-1 bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] rounded text-[11px] font-medium flex items-center gap-1 transition"
                title="Curated Algorithm Snippets"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">Snippets</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {showSnippetsMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Load {language.toUpperCase()} Snippet:
                  </div>
                  {SNIPPETS_BY_LANG[language].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onChange(s.code);
                        setShowSnippetsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#21262D] text-slate-200 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-semibold text-xs">{s.title}</div>
                        <div className="text-[10px] text-slate-400">{s.category}</div>
                      </div>
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!canEdit && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span>Read Only</span>
            </span>
          )}
        </div>

        {/* Right: Controls & Run Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Powered by OneCompiler pill */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>OneCompiler Live</span>
          </div>

          {canEdit && (
            <button
              onClick={handleResetStarter}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] font-medium flex items-center gap-1 text-[11px] transition"
              title="Reset to Curriculum Starter Code"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Starter</span>
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-slate-300 border border-[#30363D] font-medium flex items-center gap-1 text-[11px] transition"
            title="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded font-medium flex items-center gap-1 text-[11px] border transition ${
              showConsole 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' 
                : 'bg-[#21262D] text-slate-300 border-[#30363D] hover:bg-[#30363D]'
            }`}
            title="Toggle Output Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          {/* RUN CODE BUTTON */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3 sm:px-4 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            title="Compile & Run Code with OneCompiler"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Editor Main Canvas with Line Numbers & Syntax Overlay */}
      <div className="flex-1 flex overflow-hidden relative font-mono">
        
        {/* Line Numbers Gutter */}
        <div 
          className="w-11 sm:w-12 bg-[#090D13] text-[#484F58] py-4 select-none text-right pr-2 text-xs border-r border-[#21262D] overflow-hidden shrink-0"
          style={{ fontSize: `${fontSize}px`, lineHeight: '21px' }}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Syntax-Highlighted & Editable Code Area */}
        <div className="flex-1 relative h-full overflow-hidden">
          
          {/* Syntax Highlighter View Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full p-4 m-0 bg-transparent text-slate-200 overflow-auto pointer-events-none whitespace-pre text-xs z-0"
            style={{ fontSize: `${fontSize}px`, lineHeight: '21px', tabSize: 4 }}
            dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
          />

          {/* Actual Editable Textarea Layer */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={!canEdit}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full p-4 m-0 bg-transparent text-transparent caret-emerald-400 resize-none outline-none overflow-auto whitespace-pre text-xs z-10 selection:bg-emerald-500/30 selection:text-transparent"
            style={{ fontSize: `${fontSize}px`, lineHeight: '21px', tabSize: 4 }}
            placeholder={`// Write your ${language.toUpperCase()} code here...`}
          />

        </div>

      </div>

      {/* Embedded Terminal Console Output Drawer */}
      {showConsole && (
        <div className="h-56 sm:h-64 bg-[#0A0D12] border-t border-[#30363D] flex flex-col font-mono text-xs z-20 animate-in slide-in-from-bottom duration-150">
          
          {/* Console Header */}
          <div className="h-8 bg-[#161B22] px-3 flex items-center justify-between text-[11px] text-slate-400 border-b border-[#21262D] select-none">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>OneCompiler Terminal</span>
              {executionStats?.executionTime !== undefined && (
                <span className="text-[10px] text-slate-500 font-normal">
                  ({executionStats.executionTime}ms)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStdinDrawer(!showStdinDrawer)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                  showStdinDrawer 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' 
                    : 'bg-[#21262D] text-slate-400 hover:text-white border border-[#30363D]'
                }`}
                title="Provide standard input (stdin) for interactive programs"
              >
                <CornerDownLeft className="w-2.5 h-2.5" />
                <span>STDIN {stdinInput ? '●' : ''}</span>
              </button>

              <button
                onClick={() => setConsoleOutput('')}
                className="hover:text-white p-1 rounded transition"
                title="Clear Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => setShowConsole(false)}
                className="hover:text-white p-1 rounded transition"
                title="Close Terminal"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional STDIN Drawer */}
          {showStdinDrawer && (
            <div className="p-2 bg-[#10141C] border-b border-[#21262D] flex items-center gap-2">
              <div className="text-[10px] text-slate-400 shrink-0 font-sans font-medium">
                STDIN (Input):
              </div>
              <input
                type="text"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Enter input for input() / Scanner (e.g. 42 or Sarah)"
                className="flex-1 bg-[#161B22] border border-[#30363D] text-white text-xs px-2.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              {stdinInput && (
                <button
                  onClick={() => setStdinInput('')}
                  className="text-[10px] text-slate-400 hover:text-red-400 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Output Display */}
          <div className="flex-1 p-3 overflow-y-auto text-emerald-400 text-[11px] leading-relaxed whitespace-pre-wrap select-text">
            {consoleOutput ? (
              consoleOutput
            ) : (
              <span className="text-slate-600">
                Click "Run" above to compile and execute your {language.toUpperCase()} code on the OneCompiler cloud engine.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Embedded Syntax Highlighter Theme CSS */}
      <style jsx global>{`
        /* Custom High-Contrast Prism Theme */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #8b949e;
          font-style: italic;
        }
        .token.punctuation {
          color: #c9d1d9;
        }
        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol {
          color: #79c0ff;
        }
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #a5d6ff;
        }
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #ff7b72;
        }
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #ff7b72;
          font-weight: 600;
        }
        .token.function,
        .token.class-name {
          color: #d2a8ff;
          font-weight: 600;
        }
        .token.regex,
        .token.important,
        .token.variable {
          color: #ffa657;
        }
      `}</style>

    </div>
  );
}
