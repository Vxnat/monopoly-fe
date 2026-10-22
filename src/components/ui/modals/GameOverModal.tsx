'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import confetti from 'canvas-confetti';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const GameOverModal: React.FC = () => {
  const { activeModal, players, board, resetGame } = useGameStore();

  useEffect(() => {
    if (activeModal === 'GAME_OVER') {
      const end = Date.now() + 3 * 1000;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8'],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [activeModal]);

  if (activeModal !== 'GAME_OVER') {
    return null;
  }

  // Tính toán tổng tài sản ròng cho từng người chơi
  const leaderboard = players
    .map((player) => {
      const ownedTiles = board.filter((t) => t.ownerId === player.id);
      const propertyValue = ownedTiles.reduce((sum, t) => sum + (t.price || 0), 0);
      const buildingValue = ownedTiles.reduce(
        (sum, t) => sum + (t.houses || 0) * (t.houseCost || 0),
        0
      );
      const totalNetWorth = player.isBankrupt ? 0 : player.money + propertyValue + buildingValue;

      return {
        ...player,
        ownedTilesCount: ownedTiles.length,
        buildingCount: ownedTiles.reduce((sum, t) => sum + (t.houses || 0), 0),
        totalNetWorth,
      };
    })
    .sort((a, b) => {
      if (a.isBankrupt && !b.isBankrupt) return 1;
      if (!a.isBankrupt && b.isBankrupt) return -1;
      return b.totalNetWorth - a.totalNetWorth;
    });

  const winner = leaderboard[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-xl kawaii-glass border-2 border-amber-300/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow hiệu ứng nền */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-400/20 blur-3xl pointer-events-none" />

        {/* 1. Header Chiến Thắng & Cúp Vàng */}
        <div className="pt-7 pb-3 text-center relative px-6">
          <div className="relative inline-block mb-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 p-1 shadow-xl animate-bounce">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl shadow-inner">
                🏆
              </div>
            </div>
            <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 px-3 py-1 bg-amber-100 rounded-full border border-amber-300 shadow-xs">
              CHÚC MỪNG TỶ PHÚ VÔ ĐỊCH
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs shrink-0">
              <PlayerAvatarDisplay avatar={winner.avatar} name={winner.name} />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 font-black">
              {winner.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-bold">
            Đã thống trị toàn bộ bàn cờ và tích luỹ khối tài sản khổng lồ!
          </p>
        </div>

        {/* 2. Thống kê nhà vô địch */}
        <div className="px-6 py-2">
          <div className="grid grid-cols-3 gap-3 bg-white/95 border-2 border-amber-200/90 rounded-2xl p-3 text-center shadow-xs">
            <div className="p-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-0.5">
                Tổng tài sản
              </span>
              <span className="text-lg font-black text-amber-600">
                ${winner.totalNetWorth}
              </span>
            </div>
            <div className="p-1 border-x-2 border-amber-100">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-0.5">
                Bất động sản
              </span>
              <span className="text-lg font-black text-emerald-700">
                {winner.ownedTilesCount} ô
              </span>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-0.5">
                Nhà & Khách sạn
              </span>
              <span className="text-lg font-black text-sky-700">
                {winner.buildingCount}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bảng xếp hạng 4 người chơi */}
        <div className="px-6 py-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
          <h4 className="text-[11px] font-black tracking-wider uppercase text-slate-500 mb-1.5">
            BẢNG XẾP HẠNG CHUNG CUỘC
          </h4>

          {leaderboard.map((player, idx) => {
            const isWinner = idx === 0;
            const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '4️⃣';

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  isWinner
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-xs'
                    : player.isBankrupt
                    ? 'bg-slate-100/60 border-slate-200 opacity-60'
                    : 'bg-white/95 border-emerald-100 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold w-5 text-center">{rankIcon}</span>
                  <div
                    className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-lg border shadow-xs p-0.5"
                    style={{ backgroundColor: `${player.hexColor}20`, borderColor: `${player.hexColor}60` }}
                  >
                    <PlayerAvatarDisplay avatar={player.avatar} name={player.name} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {player.isBankrupt && (
                        <span className="text-[9px] uppercase font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                          Phá sản
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      Sở hữu: {player.ownedTilesCount} đất • {player.buildingCount} nhà
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-amber-700">
                    ${player.totalNetWorth}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Tiền mặt: ${player.money}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Footer & Nút Chơi Ván Mới */}
        <div className="p-4 bg-white/90 border-t-2 border-emerald-100 text-center">
          <button
            onClick={resetGame}
            className="w-full py-3.5 px-6 btn-kawaii-jelly-gold text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>🔄 CHƠI VÁN MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
