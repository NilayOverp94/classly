'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  Camera, 
  Check, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  ChevronDown, 
  Layers, 
  Maximize2, 
  Minimize2,
  Trash2,
  Sliders,
  TrendingUp,
  Activity
} from 'lucide-react';

declare global {
  interface Window {
    Desmos?: any;
  }
}

export const DESMOS_API_KEY = 'd1916333d3e64028802e1058fee80137';

export interface MathPreset {
  id: string;
  title: string;
  category: 'Algebra' | 'Calculus' | 'Trig' | 'Conics';
  expressions: Array<{ id: string; latex: string; color?: string; sliderBounds?: any }>;
}

export const MATH_PRESETS: MathPreset[] = [
  {
    id: 'parabola_vertex',
    title: 'Parabola (Vertex Form)',
    category: 'Algebra',
    expressions: [
      { id: 'p1', latex: 'y = a(x - h)^2 + k', color: '#2563EB' },
      { id: 'p2', latex: 'a = 1', sliderBounds: { min: -5, max: 5, step: 0.1 } },
      { id: 'p3', latex: 'h = 0', sliderBounds: { min: -10, max: 10, step: 0.5 } },
      { id: 'p4', latex: 'k = 0', sliderBounds: { min: -10, max: 10, step: 0.5 } },
    ],
  },
  {
    id: 'quadratic_roots',
    title: 'Quadratic & Roots',
    category: 'Algebra',
    expressions: [
      { id: 'q1', latex: 'f(x) = x^2 - 4x + 3', color: '#059669' },
      { id: 'q2', latex: '(1, 0)', color: '#DC2626' },
      { id: 'q3', latex: '(3, 0)', color: '#DC2626' },
      { id: 'q4', latex: '(2, -1)', color: '#7C3AED' },
    ],
  },
  {
    id: 'calculus_tangent',
    title: 'Derivative & Tangent Line',
    category: 'Calculus',
    expressions: [
      { id: 'c1', latex: 'f(x) = \\frac{1}{3}x^3 - x + 1', color: '#183153' },
      { id: 'c2', latex: 'x_1 = 1.5', sliderBounds: { min: -3, max: 3, step: 0.05 } },
      { id: 'c3', latex: '(x_1, f(x_1))', color: '#DC2626' },
      { id: 'c4', latex: 'y - f(x_1) = f\'(x_1)(x - x_1)', color: '#2563EB' },
    ],
  },
  {
    id: 'trig_sine_cosine',
    title: 'Sine & Cosine Wave',
    category: 'Trig',
    expressions: [
      { id: 't1', latex: 'y = A \\sin(B(x - C)) + D', color: '#059669' },
      { id: 't2', latex: 'A = 2', sliderBounds: { min: 0.5, max: 5, step: 0.5 } },
      { id: 't3', latex: 'B = 1', sliderBounds: { min: 0.5, max: 4, step: 0.5 } },
      { id: 't4', latex: 'C = 0', sliderBounds: { min: -3.14, max: 3.14, step: 0.1 } },
      { id: 't5', latex: 'D = 0', sliderBounds: { min: -3, max: 3, step: 0.5 } },
    ],
  },
  {
    id: 'conic_circle_ellipse',
    title: 'Circle & Ellipse',
    category: 'Conics',
    expressions: [
      { id: 'e1', latex: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1', color: '#7C3AED' },
      { id: 'e2', latex: 'a = 4', sliderBounds: { min: 1, max: 8, step: 0.5 } },
      { id: 'e3', latex: 'b = 2.5', sliderBounds: { min: 1, max: 8, step: 0.5 } },
    ],
  },
  {
    id: 'rational_asymptote',
    title: 'Rational Curve & Asymptotes',
    category: 'Calculus',
    expressions: [
      { id: 'r1', latex: 'y = \\frac{1}{x - 2} + 1', color: '#2563EB' },
      { id: 'r2', latex: 'x = 2', color: '#DC2626' },
      { id: 'r3', latex: 'y = 1', color: '#059669' },
    ],
  },
];

interface DesmosMathGrapherProps {
  canEdit?: boolean;
  userRole?: 'teacher' | 'student';
  onStateChange?: (state: any) => void;
  remoteState?: any;
  onSnapshotToCanvas?: (dataUrl: string) => void;
  className?: string;
  theme?: 'dark' | 'light';
}

export function DesmosMathGrapher({
  canEdit = true,
  userRole = 'teacher',
  onStateChange,
  remoteState,
  onSnapshotToCanvas,
  className = '',
  theme = 'dark',
}: DesmosMathGrapherProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Custom expression input
  const [latexInput, setLatexInput] = useState('');
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Sync state tracking to prevent self-echo loops
  const isInternalUpdateRef = useRef(false);
  const lastEmittedStateJsonRef = useRef<string>('');

  // 1. Dynamically Load Desmos Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Desmos && window.Desmos.GraphingCalculator) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('desmos-calculator-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      existingScript.addEventListener('error', () => setLoadError('Failed to load Desmos API.'));
      return;
    }

    const script = document.createElement('script');
    script.id = 'desmos-calculator-script';
    script.src = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${DESMOS_API_KEY}`;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Unable to connect to Desmos Graphing API. Please check your internet connection.');
    };

    document.head.appendChild(script);

    return () => {
      // Keep script in head for performance across toggles
    };
  }, []);

  // 2. Initialize Desmos Calculator once script is ready
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || calculatorRef.current) return;

    try {
      const isDark = theme === 'dark';
      const calc = window.Desmos.GraphingCalculator(containerRef.current, {
        keypad: true,
        graphpaper: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        border: false,
        invertedColors: isDark,
        fontSize: 14,
        pointsOfInterest: true,
        trace: true,
        authoring: true,
      });

      calculatorRef.current = calc;

      // Seed with initial educational parabola if empty
      calc.setExpressions([
        { id: 'f1', latex: 'y = x^2 - 4', color: '#2563EB' },
        { id: 'f2', latex: 'y = 2x - 1', color: '#059669' },
      ]);

      // Listen for local graph state changes and notify parent for real-time broadcast
      calc.observeEvent('change', () => {
        if (isInternalUpdateRef.current) return;
        if (!canEdit) return;

        try {
          const currentState = calc.getState();
          const stateJson = JSON.stringify(currentState);
          if (stateJson !== lastEmittedStateJsonRef.current) {
            lastEmittedStateJsonRef.current = stateJson;
            if (onStateChange) {
              onStateChange(currentState);
            }
          }
        } catch (err) {
          console.error('Desmos state extraction error:', err);
        }
      });
    } catch (err: any) {
      console.error('Failed to instantiate Desmos Graphing Calculator:', err);
      setLoadError('Failed to initialize graphing calculator.');
    }

    return () => {
      if (calculatorRef.current) {
        try {
          calculatorRef.current.destroy();
        } catch (e) {
          // ignore
        }
        calculatorRef.current = null;
      }
    };
  }, [scriptLoaded, theme]);

  // 3. Update theme settings on Desmos if invertedColors changes
  useEffect(() => {
    if (calculatorRef.current) {
      try {
        calculatorRef.current.updateSettings({
          invertedColors: theme === 'dark',
        });
      } catch (err) {
        // ignore
      }
    }
  }, [theme]);

  // 4. Handle Incoming Remote State from Supabase Channel
  useEffect(() => {
    if (!remoteState || !calculatorRef.current) return;

    try {
      const remoteJson = JSON.stringify(remoteState);
      if (remoteJson === lastEmittedStateJsonRef.current) return;

      isInternalUpdateRef.current = true;
      lastEmittedStateJsonRef.current = remoteJson;
      calculatorRef.current.setState(remoteState, { allowUndo: false });
    } catch (err) {
      console.error('Failed applying remote Desmos state:', err);
    } finally {
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 50);
    }
  }, [remoteState]);

  // 5. Add custom expression from input
  const handleAddExpression = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!latexInput.trim() || !calculatorRef.current || !canEdit) return;

    const calc = calculatorRef.current;
    const newId = `expr_${Date.now()}`;
    calc.setExpression({
      id: newId,
      latex: latexInput.trim(),
    });

    setLatexInput('');
  };

  // 6. Load a Curated Educational Math Preset
  const handleLoadPreset = (preset: MathPreset) => {
    if (!calculatorRef.current || !canEdit) return;
    const calc = calculatorRef.current;

    // Reset and apply preset
    calc.setBlank();
    preset.expressions.forEach((item) => {
      const expr: any = { id: item.id, latex: item.latex };
      if (item.color) expr.color = item.color;
      if (item.sliderBounds) expr.sliderBounds = item.sliderBounds;
      calc.setExpression(expr);
    });

    setShowPresetsMenu(false);
  };

  // 7. Clear graph
  const handleClearGraph = () => {
    if (!calculatorRef.current || !canEdit) return;
    calculatorRef.current.setBlank();
  };

  // 8. Snapshot Graph directly into Whiteboard Canvas!
  const handleSnapshotToWhiteboard = () => {
    if (!calculatorRef.current || !onSnapshotToCanvas || isExportingSnapshot) return;

    setIsExportingSnapshot(true);
    try {
      calculatorRef.current.asyncScreenshot(
        {
          width: 900,
          height: 650,
          targetPixelRatio: 2,
        },
        (dataUri: string) => {
          setIsExportingSnapshot(false);
          if (dataUri) {
            onSnapshotToCanvas(dataUri);
            setSnapshotSuccess(true);
            setTimeout(() => setSnapshotSuccess(false), 3000);
          }
        }
      );
    } catch (err) {
      console.error('Failed to take Desmos screenshot:', err);
      setIsExportingSnapshot(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0A0F1D] text-white border-l border-[#1E293B] ${className}`}>
      
      {/* Top Controls Toolbar */}
      <div className="h-11 bg-[#0D1424] border-b border-[#1E293B] px-3 sm:px-4 flex items-center justify-between gap-2 flex-shrink-0 select-none">
        
        {/* Left: Branding & Presets Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-white">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Desmos Engine</span>
          </div>

          {/* Quick Math Curves Presets */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              disabled={!canEdit}
              className="px-2.5 py-1 bg-[#080D1A] border border-[#1E293B] hover:border-[#2D3B4F] disabled:opacity-50 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Math Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPresetsMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0D1424] border border-[#1E293B] rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Interactive Curve:
                </div>
                {MATH_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="w-full text-left px-3 py-2 hover:bg-[#1E293B] text-slate-200 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="font-medium text-xs">{preset.title}</div>
                      <div className="text-[10px] text-slate-400">{preset.category}</div>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Expression Quick Adder */}
        {canEdit && (
          <form onSubmit={handleAddExpression} className="hidden md:flex items-center gap-1.5 flex-1 max-w-sm">
            <input
              type="text"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="e.g. y = x^2 - 4 or y = sin(x)"
              className="w-full px-3 py-1 bg-[#080D1A] border border-[#1E293B] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!latexInput.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Plot</span>
            </button>
          </form>
        )}

        {/* Right Action Tools: Stamp onto Whiteboard & Clear */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onSnapshotToCanvas && (
            <button
              onClick={handleSnapshotToWhiteboard}
              disabled={isExportingSnapshot}
              className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-xs ${
                snapshotSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Take a snapshot of this graph and paste directly into the whiteboard canvas"
            >
              {snapshotSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pasted on Board!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stamp to Board</span>
                </>
              )}
            </button>
          )}

          {canEdit && (
            <button
              onClick={handleClearGraph}
              className="px-2.5 py-1 bg-[#111827] border border-[#1E293B] hover:border-rose-500/30 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-medium transition shadow-xs"
              title="Clear all expressions"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {!canEdit && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 font-medium">
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">View Only</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Desmos Graph Container */}
      <div className="flex-1 relative w-full h-full min-h-[300px] overflow-hidden bg-white">
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0A0F1D] text-slate-300">
            <Calculator className="w-10 h-10 text-rose-500 mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-navy-900 dark:text-white mb-1">Grapher Connection Error</h4>
            <p className="text-xs max-w-sm mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-navy-800 dark:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
            >
              Reload Session
            </button>
          </div>
        )}

        {!scriptLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-[#0A0F1D] text-charcoal-500 dark:text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading Desmos Math Engine...</span>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full min-h-[350px] relative"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

    </div>
  );
}
