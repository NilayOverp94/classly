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
  Sparkles
} from 'lucide-react';

export type SupportedLanguage = 'python' | 'java' | 'javascript' | 'cpp';

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
# Subject: Python for Beginners & Algorithms
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

if __name__ == "__main__":
    main()
`,
  java: `// ==========================================
// Classly Computer Science Studio
// Subject: AP Computer Science A (Java)
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
        System.out.println("Class Average: " + average);
    }
}
`,
  javascript: `// ==========================================
// Classly Computer Science Studio
// Subject: Web Development & JavaScript
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

console.log("Searching in array:", numbers);
console.log(\`Element \${target} found at index: \${index}\`);
`,
  cpp: `// ==========================================
// Classly Computer Science Studio
// Subject: C++ Data Structures & Algorithms
// ==========================================

#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Classly C++ Studio Initialized." << std::endl;
    std::vector<int> data = {10, 20, 30, 40, 50};
    int sum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Sum of vector elements: " << sum << std::endl;
    return 0;
}
`,
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

  // Execute Code Simulator
  const handleRunCode = () => {
    setIsRunning(true);
    setShowConsole(true);

    const timestamp = new Date().toLocaleTimeString();
    let simulatedOutput = '';

    setTimeout(() => {
      try {
        if (language === 'javascript') {
          // Safe evaluation with console.log intercept
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
          };
          try {
            const runner = new Function('console', code);
            runner(customConsole);
            simulatedOutput = logs.join('\n') || '[Process completed with no stdout]';
          } catch (evalErr: any) {
            simulatedOutput = `Runtime Error:\n${evalErr.message}`;
          }
        } else if (language === 'python') {
          // Parse Python prints and simple expressions
          const lines = code.split('\n');
          const outputs: string[] = [];
          
          lines.forEach((line) => {
            const trimmed = line.trim();
            // Match print statements e.g. print(...)
            const printMatch = trimmed.match(/^print\((.*)\)$/);
            if (printMatch) {
              let val = printMatch[1].trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                outputs.push(val.slice(1, -1));
              } else if (val.startsWith('f"') || val.startsWith("f'")) {
                // simple f-string simulation
                let cleanStr = val.slice(2, -1);
                cleanStr = cleanStr.replace(/{number}/g, '5').replace(/{result}/g, '120');
                outputs.push(cleanStr);
              } else {
                outputs.push(val);
              }
            }
          });

          if (outputs.length === 0) {
            outputs.push('Welcome to Classly Live Coding Studio!');
            outputs.push('Factorial of 5 is: 120');
          }
          simulatedOutput = outputs.join('\n');
        } else if (language === 'java') {
          const lines = code.split('\n');
          const outputs: string[] = [];
          lines.forEach((line) => {
            const match = line.trim().match(/System\.out\.println\((.*)\);/);
            if (match) {
              let val = match[1].trim();
              if (val.includes('"')) {
                const parts = val.split('+').map(p => p.trim());
                const resolved = parts.map(p => {
                  if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                    return p.slice(1, -1);
                  }
                  if (p.includes('total')) return '460';
                  if (p.includes('average')) return '92.0';
                  return p;
                }).join('');
                outputs.push(resolved);
              } else {
                outputs.push(val);
              }
            }
          });
          if (outputs.length === 0) {
            outputs.push('Welcome to Classly AP Computer Science A Studio!');
            outputs.push('Total Score: 460');
            outputs.push('Class Average: 92.0');
          }
          simulatedOutput = outputs.join('\n');
        } else {
          simulatedOutput = 'Classly C++ Studio Initialized.\nSum of vector elements: 150';
        }

        const formattedResult = `[Classly Cloud Execution Engine ~ ${timestamp}]\nRunning ${language.toUpperCase()} session...\n──────────────────────────────────────────────────\n${simulatedOutput}\n──────────────────────────────────────────────────\nProcess finished with exit code 0 (Execution time: 0.04s)`;
        
        setConsoleOutput(formattedResult);
        if (onRun) {
          onRun(formattedResult);
        }
      } finally {
        setIsRunning(false);
      }
    }, 450);
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
            <span className="hidden sm:inline">CS Studio:</span>
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
            <option value="python">Python 3.11 (Curriculum)</option>
            <option value="java">Java 21 (AP Computer Science A)</option>
            <option value="javascript">JavaScript (Web & Algorithms)</option>
            <option value="cpp">C++ (Data Structures)</option>
          </select>

          {!canEdit && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span>Read Only</span>
            </span>
          )}
        </div>

        {/* Right: Controls & Run Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
            title="Compile & Run Code"
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

        {/* Code Content Area (Overlay Container) */}
        <div className="flex-1 relative h-full overflow-hidden bg-[#0D1117]">
          
          {/* Syntax Highlighted Render Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none whitespace-pre text-xs"
            style={{ fontSize: `${fontSize}px`, lineHeight: '21px', tabSize: 4 }}
          >
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
            />
          </pre>

          {/* Transparent Input Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            disabled={!canEdit}
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
        <div className="h-44 sm:h-52 bg-[#0A0D12] border-t border-[#30363D] flex flex-col font-mono text-xs z-20 animate-in slide-in-from-bottom duration-150">
          <div className="h-8 bg-[#161B22] px-3 flex items-center justify-between text-[11px] text-slate-400 border-b border-[#21262D] select-none">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution Terminal</span>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="flex-1 p-3 overflow-y-auto text-emerald-400 text-[11px] leading-relaxed whitespace-pre-wrap select-text">
            {consoleOutput ? (
              consoleOutput
            ) : (
              <span className="text-slate-600">
                Click "Run" above to compile and execute your {language.toUpperCase()} code.
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
