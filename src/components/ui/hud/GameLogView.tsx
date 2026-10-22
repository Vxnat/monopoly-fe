'use client';

import React, { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ScrollText, X, Sparkles, AlertCircle, ShoppingBag, DollarSign, Key, Shuffle } from 'lucide-react';

const LOG_BADGE_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  info: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30', icon: Sparkles },
  buy: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: ShoppingBag },
  rent: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', icon: DollarSign },
  tax: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: AlertCircle },
  chance: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: Sparkles },
  jail: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: Key },
  trade: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Shuffle },
};

export const GameLogFlyoutDrawer: React.FC = () => {
  const logs = useGameStore((state) => state.logs);
  const isGameLogOpen = useUIStore((state) => state.isGameLogOpen);
  const setGameLogOpen = useUIStore((state) => state.setGameLogOpen);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống dòng mới nhất khi có log mới
  useEffect(() => {
    if (isGameLogOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, isGameLogOpen]);

  if (!isGameLogOpen) return null;

  return (
    <div className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 w-80 md:w-96 max-h-[75vh] flex flex-col mint-modal-glass shadow-[0_20px_50px_rgba(6,78,59,0.25)] border-2 border-emerald-300 rounded-3xl p-4 overflow-hidden z-30 animate-in fade-in slide-in-from-right-6 duration-200 pointer-events-auto">
      {/* 1. Header ngăn nắp */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-700 font-bold">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
              Nhật Ký Trận Đấu
            </h3>
            <p className="text-[10px] text-emerald-700 font-bold font-mono">
              Tổng số: {logs.length} sự kiện
            </p>
          </div>
        </div>

        <button
          onClick={() => setGameLogOpen(false)}
          className="p-1.5 rounded-xl bg-white/90 hover:bg-emerald-100 text-slate-500 hover:text-emerald-900 transition-all cursor-pointer border border-emerald-200"
          title="Đóng nhật ký"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Danh sách nhật ký cuộn mượt mà */}
      <div
        ref={scrollRef}
        className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[55vh]"
      >
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-bold">
            Chưa có sự kiện nào diễn ra...
          </div>
        ) : (
          logs.map((log) => {
            const config = LOG_BADGE_CONFIG[log.type] || LOG_BADGE_CONFIG.info;
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white/90 border border-emerald-100/90 text-slate-800 transition-all hover:border-emerald-300 hover:bg-white shadow-xs group"
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md border font-black uppercase tracking-wider flex items-center gap-1 ${config.bg} ${config.text} ${config.border}`}
                  >
                    <Icon className="w-3 h-3" />
                    {log.type}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] font-bold">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-bold">
                  {log.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
