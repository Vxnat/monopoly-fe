'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Coins, Home, Sparkles, Copy, Check } from 'lucide-react';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';
import { soundEngine } from '@/utils/audio';

export const PlayerHUD: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const board = useGameStore((state) => state.board);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const roomId = useGameStore((state) => state.roomId);

  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      soundEngine.playButtonClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-3 items-center justify-between pointer-events-none">
      {/* 1. Danh sách thẻ người chơi */}
      <div className="flex flex-wrap gap-3 pointer-events-auto">
        {players.map((player, index) => {
          const isCurrentTurn = index === currentTurnIndex;
          const ownedProperties = board.filter((t) => t.ownerId === player.id);
          const isMe = isOnline ? player.id === mySessionId : (!player.isAI && index === 0);

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                player.isBankrupt
                  ? 'bg-slate-900/40 opacity-40 grayscale border border-red-900/50'
                  : isCurrentTurn
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-2 border-amber-300 shadow-[0_10px_25px_rgba(16,185,129,0.45)] ring-4 ring-amber-300/60 scale-105 animate-pulse-glow'
                  : 'bg-slate-900/85 backdrop-blur-md text-white border-2 border-emerald-300/50 shadow-md hover:border-emerald-300 hover:scale-102'
              }`}
            >
              {/* Avatar + Viền kim loại */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-inner font-black relative overflow-hidden p-0.5"
                style={{
                  backgroundColor: `${player.hexColor}25`,
                  border: `2px solid ${player.isBankrupt ? '#7F1D1D' : player.hexColor}`,
                  boxShadow: isCurrentTurn && !player.isBankrupt ? `0 0 15px ${player.hexColor}80` : undefined,
                }}
              >
                <PlayerAvatarDisplay avatar={player.avatar} name={player.name} />
                {isCurrentTurn && !player.isBankrupt && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce z-10" />
                )}
                {player.isBankrupt && (
                  <span className="absolute text-xs bg-red-600 text-white rounded-full px-1 font-black -bottom-1">
                    💀
                  </span>
                )}
              </div>

              {/* Thông tin người chơi */}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-sm tracking-wide drop-shadow-sm ${
                      player.isBankrupt ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {player.name}
                  </span>
                  {isMe && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-sm">
                      BẠN
                    </span>
                  )}
                  {player.isBankrupt ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-900/80 text-red-200 border border-red-700/60 font-black uppercase">
                      PHÁ SẢN
                    </span>
                  ) : isCurrentTurn ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-amber-300 text-slate-950 shadow-sm animate-pulse">
                      LƯỢT ĐI
                    </span>
                  ) : null}
                  {!player.isBankrupt && player.inJail && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600/90 text-white font-black uppercase">
                      TRONG TÙ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5 mt-1 text-xs">
                  {/* Tiền mặt */}
                  <span
                    className={`flex items-center gap-1 font-black tracking-tight ${
                      player.isBankrupt
                        ? 'text-slate-500'
                        : isCurrentTurn
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    ${player.money.toLocaleString()}
                  </span>
                  {/* Bất động sản */}
                  <span className="flex items-center gap-1 text-sky-200 font-bold">
                    <Home className="w-3.5 h-3.5 text-sky-300" />
                    {ownedProperties.length} Ô Đất
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Trạng thái phòng Online */}
      {isOnline && (
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 shadow-[0_8px_20px_rgba(0,0,0,0.4)] text-xs font-black text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          <span className="text-emerald-300 tracking-wider">PHÒNG ONLINE</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300 font-mono tracking-wide">#{roomId || 'ROOM'}</span>
          {roomId && (
            <button
              onClick={handleCopyRoomId}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1 cursor-pointer ml-0.5"
              title="Sao chép toàn bộ mã phòng"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {copied && (
            <span className="text-[10px] text-emerald-400 font-bold">
              Đã chép!
            </span>
          )}
        </div>
      )}
    </div>
  );
};
