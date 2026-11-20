'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Code2, 
  PenTool, 
  Video, 
  Play, 
  Terminal, 
  Maximize2, 
  Users, 
  Mic, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Sliders
} from 'lucide-react';

export function InteractiveClassroomShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'whiteboard' | 'recording'>('code');
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [curveMultiplier, setCurveMultiplier] = useState(1);

  // Scroll-linked 3D Perspective Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.6, 1]);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTerminalOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setTerminalOutput('>>> Output: [Roots found: x = -1.0, x = 3.0] | AP Calculus derivative verified ✅');
    }, 450);
  };

  return (
    <section 
      ref={containerRef}
      className="py-20 lg:py-32 bg-[#F4F4F0] dark:bg-[#060911] border-b border-gray-200/80 dark:border-[#1E293B] relative overflow-hidden transition-colors duration-200"
    >
      {/* Subtle Grid Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-[#1E293B] shadow-sm text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
            <span className="font-semibold text-navy-950 dark:text-emerald-400">THE CLASSROOM EXPERIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 dark:text-white tracking-tight leading-tight">
            Engineered for Deep Learning.<br />
            <span className="font-serif italic font-normal text-accent-600 dark:text-emerald-400">
              Not another awkward video call.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-charcoal-600 dark:text-slate-300">
            Dual-board digital whiteboards, live Python/Java coding with real-time compilation, and synchronized lesson recordings built right into your browser.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-[#1E293B] shadow-md gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'code'
                  ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                  : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Live Code Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whiteboard')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'whiteboard'
                  ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                  : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Interactive Math Board</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recording')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'recording'
                  ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                  : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Class Replays & Notes</span>
            </button>
          </div>
        </div>

        {/* 3D Perspective Workspace Window */}
        <motion.div
          style={{
            rotateX,
            scale,
            opacity,
            transformPerspective: 1200,
          }}
          className="w-full rounded-3xl overflow-hidden border-2 border-gray-300/80 dark:border-[#1E293B] bg-white dark:bg-[#0D1322] shadow-[0_24px_70px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
        >
          {/* Window Chrome Titlebar */}
          <div className="px-5 py-3.5 bg-gray-100/90 dark:bg-[#111827] border-b border-gray-200 dark:border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/90" />
              <div className="w-3 h-3 rounded-full bg-amber-400/90" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
              <span className="ml-3 font-mono text-xs text-gray-500 dark:text-slate-400 font-medium">
                classly_studio // session_live_3829.cls
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/60 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live 60 FPS
              </span>
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#162032] border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Tab 1: Live Code Editor */}
          {activeTab === 'code' && (
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Code Area */}
              <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl bg-gray-950 p-5 text-gray-200 font-mono text-xs sm:text-sm border border-gray-800 shadow-inner min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800 text-xs text-gray-400">
                    <span className="text-emerald-400 font-bold">lesson_solution.py</span>
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 leading-relaxed text-gray-300">
                    <p><span className="text-purple-400">def</span> <span className="text-yellow-300">find_critical_points</span>(f_prime, interval):</p>
                    <p className="pl-4 text-gray-500"># Calculate roots of derivative for local extrema</p>
                    <p className="pl-4">roots = []</p>
                    <p className="pl-4"><span className="text-purple-400">for</span> x <span className="text-purple-400">in</span> range(interval[<span className="text-orange-400">0</span>], interval[<span className="text-orange-400">1</span>]):</p>
                    <p className="pl-8"><span className="text-purple-400">if</span> abs(f_prime(x)) &lt; <span className="text-orange-400">0.001</span>:</p>
                    <p className="pl-12">roots.append(round(x, <span className="text-orange-400">2</span>))</p>
                    <p className="pl-4"><span className="text-purple-400">return</span> roots</p>
                    <p className="pt-2 text-cyan-400">print(<span className="text-emerald-300">&quot;Testing polynomial curve P(x) = x^3 - 3x&quot;</span>)</p>
                  </div>
                </div>

                {/* Live Terminal Output Drawer */}
                <div className="mt-4 pt-3 border-t border-gray-800/80">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Interactive Output Console</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/60 border border-gray-800 font-mono text-xs text-emerald-400">
                    {terminalOutput || '>>> Click "Run Code" above to execute solution live in sandbox.'}
                  </div>
                </div>
              </div>

              {/* Sidebar: Teacher Live Video & Execution Notes */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-[#1E293B] relative h-[200px] bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
                    alt="Instructor David Miller explaining code"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs">
                    <span className="font-semibold">David M. (Instructor)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#111827] border border-gray-200/80 dark:border-[#1E293B]">
                  <span className="text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider block mb-2 font-mono">
                    Session Telemetry
                  </span>
                  <div className="space-y-2 text-xs text-charcoal-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Syntax Environment:</span>
                      <span className="font-mono font-bold text-navy-900 dark:text-emerald-400">Python 3.12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Peer Whiteboard:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Synchronized (0ms lag)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Curriculum Aligned:</span>
                      <span className="font-bold text-navy-900 dark:text-white">AP CS A Unit 6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Math Board */}
          {activeTab === 'whiteboard' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#090D16] border border-gray-800 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-4">
                  <span className="text-emerald-400 font-bold">Coordinate Plane // Calculus Tangent Visualizer</span>
                  <span>f(x) = {curveMultiplier.toFixed(1)} * sin(x) + cos(0.5x)</span>
                </div>

                {/* Dynamic SVG Graph that updates with slider */}
                <svg className="w-full h-48 overflow-visible" viewBox="0 0 600 200">
                  {/* Grid lines */}
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1f2937" strokeWidth="1.5" />
                  <line x1="300" y1="0" x2="300" y2="200" stroke="#1f2937" strokeWidth="1.5" />
                  
                  {/* Interactive Dynamic Wave */}
                  <path
                    d={`M 0 ${100 - Math.sin(0) * 45 * curveMultiplier} 
                        Q 150 ${100 - Math.sin(1.5) * 55 * curveMultiplier}, 
                          300 ${100 - Math.sin(3) * 50 * curveMultiplier} 
                        T 600 ${100 - Math.sin(6) * 50 * curveMultiplier}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Tangent slope line */}
                  <line 
                    x1="220" 
                    y1={100 - 30 * curveMultiplier} 
                    x2="380" 
                    y2={100 + 30 * curveMultiplier} 
                    stroke="#f59e0b" 
                    strokeWidth="2.5" 
                    strokeDasharray="4 4" 
                  />
                  <circle cx="300" cy="100" r="5" fill="#f59e0b" />
                </svg>

                {/* Live Curve Multiplier Slider */}
                <div className="mt-4 p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Adjust Amplitude:</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.8"
                    step="0.1"
                    value={curveMultiplier}
                    onChange={(e) => setCurveMultiplier(parseFloat(e.target.value))}
                    className="w-48 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-emerald-400 font-bold w-12 text-right">
                    {curveMultiplier.toFixed(1)}x
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#111827] border border-gray-200/80 dark:border-[#1E293B]">
                  <h4 className="font-bold text-navy-950 dark:text-white text-sm mb-2">
                    Visual Mathematical Proofs
                  </h4>
                  <p className="text-xs text-charcoal-600 dark:text-slate-300 leading-relaxed">
                    Stop memorizing formulas blindly. Classly educators use responsive geometric graphs, vector simulations, and step-by-step whiteboard derivations so concepts click permanently.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Dual-Pen Collision Detection allows student & teacher to annotate simultaneously with zero latency.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Session Replays & Notes */}
          {activeTab === 'recording' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-gray-900 text-white min-h-[340px] flex flex-col justify-between border border-gray-800">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">REPLAY_RECORDER // ARCHIVE</span>
                    <span className="text-gray-400">Duration: 55m 20s</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">AP Calculus: Integration by Substitution</h4>
                  <p className="text-xs text-gray-400">Recorded Nov 18, 2026 with Dr. Catherine Vance</p>
                </div>

                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-accent-500 w-2/3" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>36:40 / 55:20</span>
                    <span className="text-emerald-400">Auto-chapter bookmarks active</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                  Timestamped Chapters
                </span>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-950 dark:text-white">00:00 — Homework diagnostic review</span>
                  <Play className="w-3.5 h-3.5 text-accent-500" />
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-950 dark:text-white">14:20 — U-substitution step-by-step theorem</span>
                  <Play className="w-3.5 h-3.5 text-accent-500" />
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-950 dark:text-white">35:10 — Live practice problem & AP test trick</span>
                  <Play className="w-3.5 h-3.5 text-accent-500" />
                </div>
              </div>
            </div>
          )}

        </motion.div>

      </div>
    </section>
  );
}
