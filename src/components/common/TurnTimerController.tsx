'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/utils/audio';

/**
 * ⏰ BỘ ĐIỀU KHIỂN ĐẾM GIỜ TOÀN CỤC (GLOBAL TURN TIMER CONTROLLER)
 * Tự động chạy vòng lặp 1 giây khi isRunning = true và kích hoạt âm thanh tick-tock
 */
export const TurnTimerController: React.FC = () => {
  const isRunning = useGameStore((state) => state.turnTimer.isRunning);
  const timeLeft = useGameStore((state) => state.turnTimer.timeLeft);
  const tickTimer = useGameStore((state) => state.tickTimer);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);

  useEffect(() => {
    if (isRunning && timeLeft <= 5 && timeLeft > 0) {
      soundEngine.playTimerTick();
    }
  }, [isRunning, timeLeft]);

  return null;
};
