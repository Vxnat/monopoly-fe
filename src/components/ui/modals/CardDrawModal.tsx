'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/store/gameStore';
import { Sparkles, HelpCircle, Check, Eye } from 'lucide-react';
import { ModalTimerHeader } from './ModalTimerHeader';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const CardDrawModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const activeCardData = useGameStore((state) => state.activeCardData);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const closeModal = useGameStore((state) => state.closeModal);

  const drawer = players[currentTurnIndex];
  const isMyCard = !isOnline || drawer?.id === mySessionId;

  useEffect(() => {
    if (isMyCard && activeModal === 'CARD_DRAW' && activeCardData && activeCardData.rewardOrPenalty > 0) {
      // Bắn pháo hoa vàng ăn mừng khi chính mình bốc được thẻ thưởng tiền
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FCD34D', '#10B981'],
      });
    }
  }, [activeModal, activeCardData, isMyCard]);

  if (activeModal !== 'CARD_DRAW' || !activeCardData) return null;

  const isChance = activeCardData.type === 'chance';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm kawaii-glass overflow-hidden shadow-2xl relative border-2 border-amber-300/80 rounded-3xl">
        {/* ⏳ Thanh tiến độ & Badge đếm ngược */}
        <ModalTimerHeader />

        {/* Khán giả: Badge trực tiếp */}
        {!isMyCard && (
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-amber-400 font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              🔴 TRUYỀN HÌNH TRỰC TIẾP
            </span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-4 h-4 rounded-full overflow-hidden border border-amber-400">
                <PlayerAvatarDisplay avatar={drawer?.avatar} name={drawer?.name || ''} className="w-full h-full object-cover" />
              </div>
              <span className="truncate max-w-[100px]">{drawer?.name}</span>
            </div>
          </div>
        )}

        {/* Header Thẻ bài */}
        <div
          className={`p-6 text-white text-center relative border-b-2 border-white/40 shadow-sm ${
            isChance
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600'
              : 'bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600'
          }`}
        >
          <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center mx-auto mb-2.5 backdrop-blur-md shadow-md border-2 border-white/60">
            {isChance ? (
              <HelpCircle className="w-8 h-8 text-yellow-100 drop-shadow" />
            ) : (
              <Sparkles className="w-8 h-8 text-cyan-100 drop-shadow" />
            )}
          </div>
          <span className="text-[11px] uppercase font-black tracking-widest text-white/95 drop-shadow">
            {isMyCard
              ? isChance
                ? '★ THẺ CƠ HỘI CỦA BẠN ★'
                : '★ THẺ KHÍ VẬN CỦA BẠN ★'
              : isChance
              ? `★ ${drawer?.name.toUpperCase() || 'ĐỐI THỦ'} RÚT CƠ HỘI ★`
              : `★ ${drawer?.name.toUpperCase() || 'ĐỐI THỦ'} RÚT KHÍ VẬN ★`}
          </span>
          <h3 className="text-xl font-black mt-1 tracking-wide drop-shadow text-white">
            {activeCardData.title}
          </h3>
        </div>

        {/* Thân thẻ bài */}
        <div className="p-5 space-y-4 text-center">
          <div className="bg-amber-50/90 border-2 border-amber-200/90 p-4 rounded-2xl shadow-xs">
            <p className="text-sm text-slate-800 leading-relaxed font-bold">
              &ldquo;{activeCardData.description}&rdquo;
            </p>
          </div>

          <button
            onClick={() => closeModal()}
            className="w-full py-3.5 px-4 btn-kawaii-jelly-gold text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isMyCard ? 'XÁC NHẬN HIỆU ỨNG THẺ' : 'ĐÃ HIỂU'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
