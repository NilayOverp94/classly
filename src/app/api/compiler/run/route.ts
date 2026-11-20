import { NextResponse } from 'next/server';

const ONECOMPILER_DEFAULT_KEY = 'oc_44zfkft93_44zfkft9n_05402516c95b05573f6f0091513676bcedcdd3e2777c9082';

// Language and filename mapping for OneCompiler API
const LANGUAGE_CONFIG: Record<string, { apiLang: string; defaultFileName: string }> = {
  python: {
    apiLang: 'python',
    defaultFileName: 'main.py',
  },
  java: {
    apiLang: 'java',
    defaultFileName: 'Main.java',
  },
  javascript: {
    apiLang: 'nodejs',
    defaultFileName: 'index.js',
  },
  nodejs: {
    apiLang: 'nodejs',
    defaultFileName: 'index.js',
  },
  cpp: {
    apiLang: 'cpp',
    defaultFileName: 'main.cpp',
  },
  c: {
    apiLang: 'c',
    defaultFileName: 'main.c',
  },
};

export async function POST(request: Request) {
  try {
    const apiKey = 
      process.env.ONECOMPILER_API_KEY || 
      process.env.NEXT_PUBLIC_ONECOMPILER_API_KEY || 
      ONECOMPILER_DEFAULT_KEY;

    const body = await request.json();
    const { language = 'python', code = '', stdin = '' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Source code is required.' },
        { status: 400 }
      );
    }

    const langKey = language.toLowerCase();
    const config = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG['python'];

    // For Java, determine class name dynamically if user defined a public class
    let fileName = config.defaultFileName;
    if (config.apiLang === 'java') {
      const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      if (match && match[1]) {
        fileName = `${match[1]}.java`;
      }
    }

    // Call OneCompiler v1/run endpoint
    const response = await fetch('https://api.onecompiler.com/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        language: config.apiLang,
        stdin: typeof stdin === 'string' ? stdin : '',
        files: [
          {
            name: fileName,
            content: code,
          },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OneCompiler API error response:', response.status, errorText);
      return NextResponse.json(
        {
          status: 'error',
          stdout: '',
          stderr: `Execution failed with HTTP status ${response.status}`,
          exception: errorText || 'Unable to execute code on OneCompiler servers.',
        },
        { status: 200 } // Return 200 so UI can cleanly display runtime error in console
      );
    }

    const data = await response.json();

    // Construct clean, formatted terminal output
    let formattedOutput = '';

    if (data.stdout) {
      formattedOutput += data.stdout;
    }

    if (data.stderr) {
      if (formattedOutput && !formattedOutput.endsWith('\n')) {
        formattedOutput += '\n';
      }
      formattedOutput += `[STDERR]\n${data.stderr}`;
    }

    if (data.exception) {
      if (formattedOutput && !formattedOutput.endsWith('\n')) {
        formattedOutput += '\n';
      }
      formattedOutput += `[EXCEPTION]\n${data.exception}`;
    }

    if (!formattedOutput) {
      formattedOutput = '[Process completed with 0 output]';
    }

    return NextResponse.json({
      status: data.status || 'success',
      stdout: data.stdout || '',
      stderr: data.stderr || null,
      exception: data.exception || null,
      compilationTime: data.compilationTime ?? null,
      executionTime: data.executionTime ?? null,
      memoryUsed: data.memoryUsed ?? null,
      creditsRemaining: data.creditsRemaining ?? null,
      formattedOutput,
    });
  } catch (err: any) {
    console.error('Compiler proxy error:', err);
    return NextResponse.json(
      {
        status: 'error',
        stdout: '',
        stderr: err.message || 'Internal server error while executing code.',
        formattedOutput: `[SERVER ERROR]\n${err.message || 'Failed to connect to OneCompiler.'}`,
      },
      { status: 500 }
    );
  }
}
