'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GameLogFlyoutDrawer } from '@/components/ui/hud/GameLogView';
import {
  Dices,
  ArrowRight,
  RotateCcw,
  Loader2,
  Sparkles,
  Zap,
  ScrollText,
  Video,
  Volume2,
  VolumeX,
  Handshake,
} from 'lucide-react';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

/**
 * 🎯 NÚT HÀNH ĐỘNG HERO THẠCH 3D TRÒN (JUICY ORB) TÍCH HỢP VÒNG LED ĐẾM NGƯỢC HÀO QUANG
 */
const HeroActionButtonWithTimer: React.FC = () => {
  const turnPhase = useGameStore((state) => state.turnPhase);
  const dice = useGameStore((state) => state.dice);
  const rollDice = useGameStore((state) => state.rollDice);
  const endTurn = useGameStore((state) => state.endTurn);
  const turnTimer = useGameStore((state) => state.turnTimer);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);

  const currentPlayer = players[currentTurnIndex];
  const isMyTurn = !isOnline || (currentPlayer && currentPlayer.id === mySessionId);

  const isRolling = dice.isRolling;
  const { timeLeft, maxTime, isRunning } = turnTimer;

  // Tính toán vòng tròn đếm ngược LED (Radius 30px, chu vi 188.5px)
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = isRunning && maxTime > 0 ? Math.min(1, Math.max(0, timeLeft / maxTime)) : 1;
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = isRunning && timeLeft <= 5;

  const ringColor = isUrgent
    ? '#F43F5E'
    : turnPhase === 'TURN_END' && dice.doublesCount === 0
      ? '#10B981'
      : '#F59E0B';

  return (
    <div className="relative w-[70px] h-[70px] flex items-center justify-center group/hero my-1 select-none">
      {/* 1. Vòng tròn LED đếm ngược hào quang phát sáng ôm sát viền nút */}
      {isRunning && maxTime > 0 && (
        <svg
          className="absolute inset-0 w-[70px] h-[70px] -rotate-90 pointer-events-none"
          viewBox="0 0 70 70"
        >
          {/* Vòng nền mờ */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="4"
          />
          {/* Vòng tiến độ phát sáng */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              filter: isUrgent
                ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.8))'
                : 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
              transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            }}
          />
        </svg>
      )}

      {/* 2. Nút Thạch 3D Tròn Sang Trọng (Juicy Orb) theo từng trạng thái */}
      {/* Khi được đổ tiếp do Cặp Đôi (ở cả phase ROLLING lẫn TURN_END) */}
      {dice.doublesCount > 0 && (turnPhase === 'ROLLING' || turnPhase === 'TURN_END') && (
        <button
          onClick={rollDice}
          disabled={isRolling || !isMyTurn}
          className={`w-14 h-14 rounded-full border-2 border-white flex items-center justify-center transition-all ${!isMyTurn
              ? 'bg-slate-700/80 opacity-60 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 shadow-[0_6px_22px_rgba(245,158,11,0.7)] hover:shadow-[0_8px_28px_rgba(245,158,11,0.85)] hover:brightness-110 active:scale-95 active:translate-y-0.5 cursor-pointer animate-pulse'
            }`}
          title={isMyTurn ? `Đổ tiếp vì được Cặp Đôi (${dice.doublesCount}/3)` : `Đang chờ ${currentPlayer?.name}...`}
        >
          <Zap className={`w-7 h-7 drop-shadow-sm ${!isMyTurn ? 'text-slate-300 fill-slate-300' : 'text-amber-950 fill-amber-950'}`} />
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-2xl bg-white/95 text-amber-900 text-xs font-black tracking-wider uppercase border-2 border-amber-300 whitespace-nowrap shadow-xl opacity-0 group-hover/hero:opacity-100 pointer-events-none transition-all animate-pulse-glow">
            {!isMyTurn ? `⏳ Lượt của ${currentPlayer?.name}` : `⚡ Đổ tiếp (Cặp đôi ${dice.doublesCount}/3)`}
          </span>
        </button>
      )}

      {/* Lượt đổ bình thường (Chưa có số đôi) */}
      {turnPhase === 'ROLLING' && dice.doublesCount === 0 && (
        <button
          onClick={rollDice}
          disabled={isRolling || !isMyTurn}
          className={`w-14 h-14 rounded-full border-2 border-white flex items-center justify-center transition-all ${!isMyTurn
              ? 'bg-slate-700/80 opacity-60 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-[0_6px_20px_rgba(245,158,11,0.55)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.75)] hover:brightness-110 active:scale-95 active:translate-y-0.5 cursor-pointer group'
            }`}
          title={isMyTurn ? 'Đổ xúc xắc' : `Đang chờ ${currentPlayer?.name}...`}
        >
          <Dices
            className={`w-7 h-7 drop-shadow-sm transition-transform duration-300 ${!isMyTurn ? 'text-slate-300' : 'text-amber-950'
              } ${isRolling ? 'animate-spin' : isMyTurn ? 'group-hover:rotate-12' : ''}`}
          />
          {/* Tooltip phát xung ánh sáng sang trái */}
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-2xl bg-white/95 text-amber-900 text-xs font-black tracking-wider uppercase border-2 border-amber-300 whitespace-nowrap shadow-xl opacity-0 group-hover/hero:opacity-100 pointer-events-none transition-all animate-pulse-glow">
            {!isMyTurn ? `⏳ Lượt của ${currentPlayer?.name}` : isRolling ? 'Đang tung...' : 'Đổ xúc xắc'}
          </span>
        </button>
      )}

      {turnPhase === 'MOVING' && (
        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-sky-300 via-sky-400 to-teal-500 border-2 border-white shadow-[0_6px_20px_rgba(14,165,233,0.45)] flex items-center justify-center animate-pulse">
          <Loader2 className="w-7 h-7 animate-spin text-white drop-shadow-sm" />
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-2xl bg-white/95 text-sky-900 text-xs font-black tracking-wider uppercase border-2 border-sky-300 whitespace-nowrap shadow-xl opacity-0 group-hover/hero:opacity-100 pointer-events-none transition-all">
            🏃 Đang di chuyển...
          </span>
        </div>
      )}

      {turnPhase === 'TILE_ACTION' && (
        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-teal-300 via-emerald-400 to-emerald-600 border-2 border-white shadow-[0_6px_20px_rgba(16,185,129,0.45)] flex items-center justify-center">
          <Sparkles className="w-7 h-7 animate-bounce text-yellow-100 drop-shadow-sm" />
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-2xl bg-white/95 text-teal-900 text-xs font-black tracking-wider uppercase border-2 border-teal-300 whitespace-nowrap shadow-xl opacity-0 group-hover/hero:opacity-100 pointer-events-none transition-all">
            ✨ Đang xử lý ô đất...
          </span>
        </div>
      )}

      {turnPhase === 'TURN_END' && dice.doublesCount === 0 && (
        <button
          onClick={endTurn}
          disabled={!isMyTurn}
          className={`w-14 h-14 rounded-full border-2 border-white flex items-center justify-center transition-all ${!isMyTurn
              ? 'bg-slate-700/80 opacity-60 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 shadow-[0_6px_20px_rgba(16,185,129,0.55)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.75)] hover:brightness-110 active:scale-95 active:translate-y-0.5 cursor-pointer group'
            }`}
          title={isMyTurn ? 'Kết thúc lượt' : `Đang chờ ${currentPlayer?.name}...`}
        >
          <ArrowRight className={`w-7 h-7 drop-shadow-sm ${!isMyTurn ? 'text-slate-300' : 'text-white group-hover:translate-x-1'} transition-transform`} />
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-2xl bg-white/95 text-emerald-900 text-xs font-black tracking-wider uppercase border-2 border-emerald-300 whitespace-nowrap shadow-xl opacity-0 group-hover/hero:opacity-100 pointer-events-none transition-all animate-pulse-glow">
            {!isMyTurn ? `⏳ Lượt của ${currentPlayer?.name}` : '➡️ Kết thúc lượt'}
          </span>
        </button>
      )}

      {/* 3. Badge số giây đếm ngược thu nhỏ ở đáy nút */}
      {isRunning && maxTime > 0 && (
        <span
          className={`absolute -bottom-2 px-2 py-0.5 rounded-full font-mono font-black text-[10px] border-2 shadow-md ${isUrgent
              ? 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
              : 'bg-white text-amber-900 border-amber-300'
            }`}
        >
          {timeLeft}s
        </span>
      )}
    </div>
  );
};

export const ActionControls: React.FC = () => {
  const dice = useGameStore((state) => state.dice);
  const resetGame = useGameStore((state) => state.resetGame);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const isOnline = useGameStore((state) => state.isOnline);
  const logs = useGameStore((state) => state.logs);

  const isGameLogOpen = useUIStore((state) => state.isGameLogOpen);
  const toggleGameLog = useUIStore((state) => state.toggleGameLog);
  const cameraView = useUIStore((state) => state.cameraView);
  const toggleCameraView = useUIStore((state) => state.toggleCameraView);
  const isMuted = useUIStore((state) => state.isMuted);
  const toggleMute = useUIStore((state) => state.toggleMute);
  const openTradeModal = useUIStore((state) => state.openTradeModal);

  const currentPlayer = players[currentTurnIndex];
  const isRolling = dice.isRolling;

  return (
    <aside
      aria-label="Thanh điều khiển nhanh"
      className="fixed right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none pointer-events-none"
    >
      {/* 📜 FLYOUT DRAWER NHẬT KÝ (Trượt từ bên phải sang trái) */}
      <GameLogFlyoutDrawer />

      {/* 🌟 HUY HIỆU ĐỔ ĐÔI NỔI BẬT */}
      {dice.doublesCount > 0 && !isRolling && (
        <div className="pointer-events-auto mb-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce border border-amber-200">
          <Zap className="w-3 h-3 fill-slate-950" />
          <span>{dice.doublesCount}/3</span>
        </div>
      )}

      {/* 🌟 THANH DỌC 1 CỘT SIÊU GỌN (SLIM SINGLE-COLUMN VERTICAL RAIL) */}
      <div className="pointer-events-auto relative mint-glass-hud p-1.5 md:p-2 flex flex-col items-center gap-2.5 shadow-[0_15px_40px_rgba(16,185,129,0.25)] border-2 border-emerald-300/80 rounded-3xl w-[74px] md:w-[78px]">
        {/* 1. AVATAR NGƯỜI CHƠI ĐANG ĐẾN LƯỢT */}
        {currentPlayer && (
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black relative group/player cursor-default shadow-inner overflow-hidden p-0.5"
            style={{
              backgroundColor: `${currentPlayer.hexColor}25`,
              border: `2px solid ${currentPlayer.hexColor}`,
              boxShadow: `0 0 12px ${currentPlayer.hexColor}60`,
            }}
          >
            <PlayerAvatarDisplay avatar={currentPlayer.avatar} name={currentPlayer.name} />
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-ping z-10"
              style={{ backgroundColor: currentPlayer.hexColor }}
            />
            {/* Tooltip tên người chơi */}
            <span className="absolute right-full mr-3 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-black tracking-wide border-2 border-emerald-300 whitespace-nowrap shadow-xl opacity-0 group-hover/player:opacity-100 pointer-events-none transition-all">
              Lượt: <b className="text-amber-700">{currentPlayer.name}</b>
            </span>
          </div>
        )}

        {/* 2. NÚT HERO TÍCH HỢP VÒNG ĐẾM NGƯỢC */}
        <HeroActionButtonWithTimer />

        {/* ĐƯỜNG NGĂN CÁCH NHẸ */}
        <div className="w-8 h-px bg-emerald-200/90 my-0.5" />

        {/* 3. DÃY ICON CÔNG CỤ NHANH XẾP DỌC 1 CỘT (SINGLE COLUMN TOOL RAIL) */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* Nút Nhật ký trận đấu */}
          <div className="relative group/tool">
            <button
              onClick={toggleGameLog}
              aria-label="Mở nhật ký trận đấu"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border active:scale-95 shadow-sm ${isGameLogOpen
                  ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400/50'
                  : 'bg-white/95 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 border-emerald-200'
                }`}
            >
              <ScrollText className="w-4 h-4" />
              {logs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] flex items-center justify-center shadow-xs">
                  {logs.length > 99 ? '99+' : logs.length}
                </span>
              )}
            </button>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-bold border-2 border-emerald-200 whitespace-nowrap shadow-xl opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-all">
              Nhật ký ({logs.length})
            </span>
          </div>

          {/* Nút Đàm phán giao dịch */}
          <div className="relative group/tool">
            <button
              onClick={() => openTradeModal()}
              aria-label="Đàm phán giao dịch"
              className="w-10 h-10 rounded-xl bg-white/95 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 transition-all cursor-pointer border border-emerald-200 active:scale-95 shadow-sm flex items-center justify-center"
            >
              <Handshake className="w-4 h-4" />
            </button>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-bold border-2 border-emerald-200 whitespace-nowrap shadow-xl opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-all">
              Giao dịch
            </span>
          </div>

          {/* Nút Chuyển góc Camera (3D / 2D) */}
          <div className="relative group/tool">
            <button
              onClick={toggleCameraView}
              aria-label="Chuyển góc camera"
              className={`w-10 h-10 rounded-xl transition-all cursor-pointer border active:scale-95 shadow-sm flex items-center justify-center ${cameraView === 'topdown'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold'
                  : 'bg-white/95 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 border-emerald-200'
                }`}
            >
              <Video className="w-4 h-4" />
            </button>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-bold border-2 border-emerald-200 whitespace-nowrap shadow-xl opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-all">
              {cameraView === '3d' ? 'Góc nhìn 3D' : 'Góc nhìn 2D'}
            </span>
          </div>

          {/* Nút Âm thanh */}
          <div className="relative group/tool">
            <button
              onClick={toggleMute}
              aria-label="Bật/Tắt âm thanh"
              className="w-10 h-10 rounded-xl bg-white/95 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 transition-all cursor-pointer border border-emerald-200 active:scale-95 shadow-sm flex items-center justify-center"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              )}
            </button>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-bold border-2 border-emerald-200 whitespace-nowrap shadow-xl opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-all">
              {isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            </span>
          </div>

          {/* Nút Làm mới ván chơi (Chỉ hiển thị khi chơi Đơn Offline) */}
          {!isOnline && (
            <div className="relative group/tool">
              <button
                onClick={resetGame}
                aria-label="Làm mới ván cờ"
                className="w-10 h-10 rounded-xl bg-white/95 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 transition-all cursor-pointer border border-emerald-200 active:scale-95 shadow-sm flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white/95 text-slate-800 text-xs font-bold border-2 border-emerald-200 whitespace-nowrap shadow-xl opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-all">
                Làm mới bàn cờ
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};




