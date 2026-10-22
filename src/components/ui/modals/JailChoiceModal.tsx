'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { ShieldAlert, Dices, DollarSign, Ticket, Timer } from 'lucide-react';
import { ModalTimerHeader } from './ModalTimerHeader';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const JailChoiceModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const turnTimer = useGameStore((state) => state.turnTimer);
  const payJailBail = useGameStore((state) => state.payJailBail);
  const tryRollForJailEscape = useGameStore((state) => state.tryRollForJailEscape);
  const consumeJailCard = useGameStore((state) => state.consumeJailCard);

  if (activeModal !== 'JAIL_CHOICE') return null;

  const currentPlayer = players[currentTurnIndex];
  if (!currentPlayer || !currentPlayer.inJail) return null;

  const isMyTurn = !isOnline || currentPlayer.id === mySessionId;
  const canAffordBail = currentPlayer.money >= 50;
  const hasJailCard = currentPlayer.getOutOfJailFreeCards > 0;

  // 👁️ CHẾ ĐỘ KHÁN GIẢ: HỒ SƠ GIÁM THỊ NHÀ TÙ
  if (!isMyTurn) {
    return (
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
        <div className="bg-slate-950/92 border-2 border-rose-500/50 rounded-3xl p-4 sm:p-5 text-white backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.25),0_25px_60px_rgba(0,0,0,0.85)] transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>⛓️ GIÁM THỊ NHÀ TÙ</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">THEO DÕI PHẠM NHÂN</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                Án: {currentPlayer.jailTurns}/3 lượt
              </span>
              {turnTimer.isRunning && turnTimer.timeLeft > 0 && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                  <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{turnTimer.timeLeft}s</span>
                </span>
              )}
            </div>
          </div>

          {/* Thông tin Tù nhân */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md">
                <PlayerAvatarDisplay avatar={currentPlayer.avatar} name={currentPlayer.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px]">
                🔒
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white truncate">{currentPlayer.name}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  Ví: <b className="text-amber-400 font-mono">${currentPlayer.money.toLocaleString()}</b>
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5 truncate font-medium">
                Đang cân nhắc phương án thoát án phạt tù:
              </p>
            </div>
          </div>

          {/* 3 Thẻ phương án phạm nhân có thể chọn */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Phương án 1: Lắc xúc xắc đôi */}
            <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800 flex flex-col items-center justify-between">
              <Dices className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-[10px] font-black uppercase text-slate-200 block">Lắc Đôi</span>
              <span className="text-[9px] text-slate-400 mt-1 font-semibold">Tỉ lệ 1/6 may mắn</span>
            </div>

            {/* Phương án 2: Nộp $50 */}
            <div className={`rounded-2xl p-2.5 border flex flex-col items-center justify-between ${
              canAffordBail
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
            }`}>
              <DollarSign className={`w-5 h-5 mb-1 ${canAffordBail ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className="text-[10px] font-black uppercase block">Bảo Lãnh $50</span>
              <span className="text-[9px] mt-1 font-bold">
                {canAffordBail ? '🟢 Đủ tiền nộp' : '🔴 Không đủ tiền'}
              </span>
            </div>

            {/* Phương án 3: Dùng thẻ miễn phí */}
            <div className={`rounded-2xl p-2.5 border flex flex-col items-center justify-between ${
              hasJailCard
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
            }`}>
              <Ticket className={`w-5 h-5 mb-1 ${hasJailCard ? 'text-amber-400' : 'text-slate-600'}`} />
              <span className="text-[10px] font-black uppercase block">Thẻ Ra Tù</span>
              <span className="text-[9px] mt-1 font-bold">
                {hasJailCard ? `🟢 Có ${currentPlayer.getOutOfJailFreeCards} thẻ` : '⚪ 0 thẻ'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center text-[11px] text-slate-400 italic">
            Đang chờ <strong className="text-white font-bold">{currentPlayer.name}</strong> đưa ra quyết định...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm kawaii-glass border-2 border-rose-300/80 overflow-hidden shadow-2xl relative">
        {/* ⏳ Thanh tiến độ & Badge đếm ngược */}
        <ModalTimerHeader />

        {/* Header Tù Giam */}
        <div className="p-5 text-white text-center bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 border-b-2 border-white/40 shadow-sm">
          <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center mx-auto mb-2.5 backdrop-blur-md border-2 border-white/60 shadow-md">
            <ShieldAlert className="w-8 h-8 text-rose-100" />
          </div>
          <span className="text-[11px] uppercase font-black tracking-widest text-white/95 drop-shadow">
            NHÀ TÙ QUỐC GIA
          </span>
          <h3 className="text-xl font-black mt-1 tracking-wide text-white">
            {currentPlayer.name} Đang Bị Giam
          </h3>
          <p className="text-amber-200 text-xs font-black mt-0.5">
            Đã ở tù: {currentPlayer.jailTurns} / 3 lượt
          </p>
        </div>

        {/* 3 Lựa chọn thoát tù */}
        <div className="p-5 space-y-3">
          {/* 1. Nộp phạt $50 */}
          <button
            onClick={() => payJailBail()}
            disabled={!canAffordBail}
            className={`w-full py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
              canAffordBail
                ? 'btn-kawaii-jelly-mint'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 rounded-3xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Nộp Phạt $50 Ra Tù Ngay</span>
            </div>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full text-white">Tự Do 100%</span>
          </button>

          {/* 2. Đổ xúc xắc cầu đôi */}
          <button
            onClick={() => tryRollForJailEscape()}
            className="w-full py-3 px-4 btn-kawaii-jelly-gold text-xs font-black uppercase tracking-wider flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4" />
              <span>Đổ Xúc Xắc Cầu Đôi</span>
            </div>
            <span className="text-[10px] bg-amber-900/20 px-2 py-0.5 rounded-full text-amber-950 font-black">Miễn Phí</span>
          </button>

          {/* 3. Dùng thẻ miễn đi tù */}
          {hasJailCard && (
            <button
              onClick={() => consumeJailCard()}
              className="w-full py-3 px-4 rounded-3xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-between border-2 border-white shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>Dùng Thẻ Miễn Đi Tù</span>
              </div>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">
                Còn {currentPlayer.getOutOfJailFreeCards} thẻ
              </span>
            </button>
          )}

          <p className="text-[11px] text-slate-500 font-medium text-center pt-1">
            💡 <i>Sau 3 lượt đổ xúc xắc không ra đôi, bạn sẽ phải trả $50 tiền bảo lãnh và được đi tiếp.</i>
          </p>
        </div>
      </div>
    </div>
  );
};
