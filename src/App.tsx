/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Users, 
  RotateCcw, 
  Trophy, 
  Settings2, 
  Trash2, 
  LayoutGrid, 
  Dices,
  CheckCircle2,
  AlertCircle,
  Download,
  UserCheck,
  Sparkles,
  CopyCheck
} from 'lucide-react';

const MOCK_NAMES = [
  "陳小明", "林美惠", "張大華", "李志豪", "王曉萍", 
  "趙子龍", "孫悟空", "周杰倫", "蔡依林", "劉德華",
  "陳小明", "林美惠"
];

type Tab = 'draw' | 'group';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('draw');
  
  // Draw state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<string | null>(null);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [drawnHistory, setDrawnHistory] = useState<string[]>([]);
  
  // Group state
  const [groupSize, setGroupSize] = useState(2);
  const [groups, setGroups] = useState<string[][]>([]);

  // Parse names from input
  const names = useMemo(() => {
    return inputText
      .split(/[\n,，、]/)
      .map(name => name.trim())
      .filter(name => name !== '');
  }, [inputText]);

  // Duplicate detection
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    names.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.keys(counts).filter(name => counts[name] > 1);
  }, [names]);

  const removeDuplicates = () => {
    const uniqueNames = Array.from(new Set(names));
    setInputText(uniqueNames.join('\n'));
  };

  const loadMockData = () => {
    setInputText(MOCK_NAMES.join('\n'));
  };

  const exportToCSV = () => {
    if (groups.length === 0) return;
    let csvContent = "\uFEFFGroup,Name\n"; // Add BOM for Excel Chinese support
    groups.forEach((group, index) => {
      group.forEach(name => {
        csvContent += `${index + 1},${name}\n`;
      });
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remaining names for non-repeat draw
  const remainingNames = useMemo(() => {
    if (allowRepeat) return names;
    return names.filter(name => !drawnHistory.includes(name));
  }, [names, drawnHistory, allowRepeat]);

  // Handle Draw
  const handleDraw = () => {
    if (isDrawing || remainingNames.length === 0) return;

    setIsDrawing(true);
    setDrawResult(null);

    // Animation duration
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const tempIndex = Math.floor(Math.random() * remainingNames.length);
        setDrawResult(remainingNames[tempIndex]);
        requestAnimationFrame(animate);
      } else {
        const finalIndex = Math.floor(Math.random() * remainingNames.length);
        const winner = remainingNames[finalIndex];
        setDrawResult(winner);
        if (!allowRepeat) {
          setDrawnHistory(prev => [...prev, winner]);
        }
        setIsDrawing(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Handle Grouping
  const handleGrouping = () => {
    if (names.length === 0) return;

    setGroups([]); // Clear first to trigger re-animation
    
    setTimeout(() => {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      const result: string[][] = [];
      
      for (let i = 0; i < shuffled.length; i += groupSize) {
        result.push(shuffled.slice(i, i + groupSize));
      }
      
      setGroups(result);
    }, 50);
  };

  const resetDraw = () => {
    setDrawnHistory([]);
    setDrawResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6"
          >
            <Dices className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold tracking-tight text-slate-900 mb-3"
          >
            隨機抽籤與自動分組
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-md mx-auto"
          >
            輸入名單，快速進行公平抽籤或自動分組，支援動畫效果與視覺化呈現。
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <UserPlus className="w-5 h-5" />
                  <h2>名單輸入</h2>
                </div>
                <button 
                  onClick={loadMockData}
                  className="text-xs flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  載入模擬名單
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="請輸入姓名，用換行或逗號分隔..."
                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
              />
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>當前人數：<strong className="text-indigo-600">{names.length}</strong> 人</span>
                <button 
                  onClick={() => setInputText('')}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>

              {/* Duplicate Warning */}
              {duplicates.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                      <CopyCheck className="w-4 h-4" />
                      偵測到重複姓名 ({duplicates.length})
                    </div>
                    <button 
                      onClick={removeDuplicates}
                      className="text-xs px-2 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                    >
                      一鍵移除
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {duplicates.map(name => (
                      <span key={name} className="px-2 py-0.5 bg-white text-rose-600 text-xs rounded-md border border-rose-200">
                        {name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {names.length === 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>請先在上方輸入名單，方可開始抽籤或分組。</p>
              </div>
            )}
          </section>

          {/* Main Content Section */}
          <main className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
              <button
                onClick={() => setActiveTab('draw')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'draw' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                隨機抽籤
              </button>
              <button
                onClick={() => setActiveTab('group')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'group' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                自動分組
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
              {activeTab === 'draw' ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  {/* Draw Result Display */}
                  <div className="relative w-full max-w-md aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      {drawResult ? (
                        <motion.div
                          key={drawResult}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          className={`text-5xl font-bold ${isDrawing ? 'text-slate-400' : 'text-indigo-600'}`}
                        >
                          {drawResult}
                        </motion.div>
                      ) : (
                        <div className="text-slate-300 text-lg">準備就緒</div>
                      )}
                    </AnimatePresence>
                    
                    {/* Confetti-like effect on win */}
                    {!isDrawing && drawResult && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        {/* Simple decorative elements */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 0, x: 0, opacity: 1 }}
                            animate={{ 
                              y: [0, -100, -50], 
                              x: [0, (i - 2.5) * 40, (i - 2.5) * 60],
                              opacity: 0 
                            }}
                            transition={{ duration: 1 }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 bg-indigo-400 rounded-full"
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="w-full max-w-md space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Settings2 className="w-4 h-4" />
                        <span className="text-sm font-medium">抽籤設定</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={allowRepeat}
                          onChange={(e) => setAllowRepeat(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-500">
                          {allowRepeat ? '重複抽取' : '不重複抽取'}
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={isDrawing || remainingNames.length === 0}
                        onClick={handleDraw}
                        className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
                      >
                        {isDrawing ? '正在抽取...' : '開始抽籤'}
                      </button>
                      <button
                        onClick={resetDraw}
                        className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
                        title="重置歷史"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Status info */}
                    {!allowRepeat && (
                      <div className="text-center text-sm text-slate-400">
                        剩餘人數：<span className="text-indigo-500 font-semibold">{remainingNames.length}</span> / {names.length}
                      </div>
                    )}
                  </div>

                  {/* History */}
                  {drawnHistory.length > 0 && (
                    <div className="w-full pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        抽籤歷史
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {drawnHistory.map((name, idx) => (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={`${name}-${idx}`}
                            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm flex items-center gap-1"
                          >
                            <span className="text-slate-300 font-mono text-xs">{idx + 1}.</span>
                            {name}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Group Config */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        每組人數
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max={Math.max(1, names.length)}
                          value={groupSize}
                          onChange={(e) => setGroupSize(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-2xl font-bold text-indigo-600 w-12 text-center">{groupSize}</span>
                      </div>
                    </div>
                    <button
                      disabled={names.length === 0}
                      onClick={handleGrouping}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
                    >
                      開始分組
                    </button>
                  </div>

                  {/* Group Results */}
                  <AnimatePresence mode="wait">
                    {groups.length > 0 ? (
                      <motion.div 
                        key="group-results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            分組結果
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setGroups([])}
                              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                              清除
                            </button>
                            <button
                              onClick={exportToCSV}
                              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              下載 CSV
                            </button>
                          </div>
                        </div>

                        {/* The Board */}
                        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100/50 min-h-[300px] relative overflow-hidden">
                          {/* Decorative background pattern */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            {groups.map((group, idx) => (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ 
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 20,
                                  delay: idx * 0.1 
                                }}
                                key={idx}
                                className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-slate-800">第 {idx + 1} 組</h3>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Team {idx + 1}</p>
                                    </div>
                                  </div>
                                  <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 border border-slate-100">
                                    {group.length} MEMBERS
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {group.map((member, mIdx) => (
                                    <motion.span 
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: (idx * 0.1) + (mIdx * 0.05) }}
                                      key={mIdx}
                                      className="px-4 py-2 bg-indigo-50/50 text-indigo-700 rounded-2xl text-sm font-semibold flex items-center gap-2 border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-default"
                                    >
                                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                      {member}
                                    </motion.span>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-slate-300"
                      >
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
                          <Users className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="font-medium">設定人數並點擊開始分組</p>
                        <p className="text-xs mt-2 opacity-60">系統將會為您自動分配成員</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2026 隨機工具箱 · 讓選擇更簡單</p>
      </footer>
    </div>
  );
}
