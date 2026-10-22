'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Timer } from 'lucide-react';

/**
 * ⏳ THANH TIẾN ĐỘ & BADGE ĐẾM NGƯỢC THỜI GIAN TRONG MODAL
 * Tự động đồng bộ với Zustand turnTimer store
 */
export const ModalTimerHeader: React.FC = () => {
  const turnTimer = useGameStore((state) => state.turnTimer);
  const { timeLeft, maxTime, isRunning } = turnTimer;

  if (!isRunning || maxTime <= 0) return null;

  const progress = Math.min(100, Math.max(0, (timeLeft / maxTime) * 100));
  const isUrgent = timeLeft <= 5;

  return (
    <>
      {/* 1. Thanh tiến độ đếm ngược ở đỉnh mép trên của Modal */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 overflow-hidden z-30">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${isUrgent
            ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse'
            : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. Badge đồng hồ tròn nhỏ ở góc trên bên phải Modal */}
      <div
        className={`absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 backdrop-blur-md transition-all duration-300 select-none pointer-events-none ${isUrgent
          ? 'bg-rose-500 text-white border-white shadow-[0_0_14px_rgba(244,63,94,0.6)] animate-pulse'
          : 'bg-white/95 text-amber-800 border-amber-300 shadow-md'
          }`}
        title={`Thời gian còn lại: ${timeLeft}s`}
      >
        <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-white' : 'text-amber-500'}`} />
        <span className="font-mono font-black text-xs">
          {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
        </span>
      </div>
    </>
  );
};
