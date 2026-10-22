'use client';

import React from 'react';
import Image from 'next/image';
import { useGameStore } from '@/store/gameStore';
import { COLOR_GROUP_HEX, COLOR_GROUP_NAMES_VN } from '@/constants/gameConfig';
import { Building2, X, Check, DollarSign, ShieldCheck, Wallet, Timer } from 'lucide-react';
import { ModalTimerHeader } from './ModalTimerHeader';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const BuyPropertyModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const board = useGameStore((state) => state.board);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const turnTimer = useGameStore((state) => state.turnTimer);
  const buyProperty = useGameStore((state) => state.buyProperty);
  const skipBuyProperty = useGameStore((state) => state.skipBuyProperty);

  if (activeModal !== 'BUY_PROPERTY' || selectedTileId === null) return null;

  const tile = board[selectedTileId];
  if (!tile || !tile.price) return null;

  const currentPlayer = players[currentTurnIndex];
  if (!currentPlayer) return null;

  const canAfford = currentPlayer.money >= tile.price;
  const isMyTurn = !isOnline || currentPlayer.id === mySessionId;

  let colorHex = '#3B82F6';
  let groupName = 'Bất Động Sản';

  if (tile.type === 'STATION') {
    colorHex = '#334155'; // Màu Slate Ga Tàu / Bến Xe
    groupName = 'BẾN XE & NHÀ GA';
  } else if (tile.type === 'UTILITY') {
    colorHex = '#0F766E'; // Màu Teal Công Ty Dịch Vụ
    groupName = 'DỊCH VỤ TIỆN ÍCH';
  } else if (tile.colorGroup) {
    colorHex = COLOR_GROUP_HEX[tile.colorGroup] || '#3B82F6';
    groupName = COLOR_GROUP_NAMES_VN[tile.colorGroup] || 'Bất Động Sản';
  }

  // 👁️ CHẾ ĐỘ KHÁN GIẢ (MONOPOLY PLUS BROADCAST CARD)
  if (!isMyTurn) {
    return (
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
        <div 
          className="bg-slate-950/92 border-2 rounded-3xl p-4 sm:p-5 text-white backdrop-blur-2xl transition-all"
          style={{ 
            borderColor: `${colorHex}88`,
            boxShadow: `0 0 35px ${colorHex}33, 0 25px 60px rgba(0,0,0,0.85)` 
          }}
        >
          {/* Header Bar: Badge trực tiếp & Live Timer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🔴 TRUYỀN HÌNH TRỰC TIẾP</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">ĐANG THEO DÕI MUA ĐẤT</span>
              </span>
            </div>

            {turnTimer.isRunning && turnTimer.timeLeft > 0 && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{turnTimer.timeLeft}s</span>
              </span>
            )}
          </div>

          {/* Hàng thông tin người chơi đang quyết định */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
                <PlayerAvatarDisplay avatar={currentPlayer.avatar} name={currentPlayer.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white truncate">{currentPlayer.name}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  Ví: <b className="text-amber-400 font-mono">${currentPlayer.money.toLocaleString()}</b>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Đang dừng chân và cân nhắc mua bất động sản:
              </p>
            </div>
          </div>

          {/* Mini Sổ Đỏ (Title Deed Preview Card) */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/90 shadow-inner">
            {/* Dải màu khu đất */}
            <div 
              className="px-4 py-2.5 flex items-center justify-between text-white shadow-sm"
              style={{ backgroundColor: colorHex }}
            >
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/85 block">
                  {groupName}
                </span>
                <h4 className="text-sm sm:text-base font-black tracking-wide uppercase drop-shadow-sm">
                  {tile.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/85 block">
                  GIÁ NIÊM YẾT
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300 drop-shadow-sm">
                  ${tile.price}
                </span>
              </div>
            </div>

            {/* Thông số nhanh của Bất động sản */}
            <div className="p-3 grid grid-cols-3 gap-2 text-center text-xs bg-slate-900/60">
              <div className="bg-slate-800/70 rounded-xl p-2 border border-slate-700/50">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Thuê cơ bản</span>
                <span className="font-black text-slate-200">
                  ${Array.isArray(tile.rent) ? tile.rent[0] : (tile.rent || 0)}
                </span>
              </div>
              <div className="bg-slate-800/70 rounded-xl p-2 border border-slate-700/50">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Giá 1 nhà</span>
                <span className="font-black text-amber-300">${tile.houseCost || 0}</span>
              </div>
              <div className="bg-slate-800/70 rounded-xl p-2 border border-slate-700/50">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Thế chấp</span>
                <span className="font-black text-slate-300">
                  ${tile.mortgageValue || (tile.price ? Math.floor(tile.price / 2) : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Đánh giá tài chính & trạng thái */}
          <div className="mt-3 flex items-center justify-between text-[11px] px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            {currentPlayer.money >= (tile.price || 0) ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Đủ khả năng tài chính (Còn lại ${(currentPlayer.money - (tile.price || 0)).toLocaleString()})
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Không đủ tiền mặt (Thiếu ${((tile.price || 0) - currentPlayer.money).toLocaleString()})
              </span>
            )}
            <span className="text-slate-400 font-medium italic hidden sm:inline">
              Đang chờ quyết định...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm kawaii-glass overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col border-2 border-emerald-300/80">
        {/* ⏳ Thanh tiến độ & Badge đếm ngược */}
        <ModalTimerHeader />

        {/* Header Sổ Đỏ nhỏ gọn nằm ngang (Compact Horizontal Header) */}
        <div
          className="px-4 py-3 text-white border-b-2 border-white/40 flex items-center gap-3 relative shadow-sm"
          style={{ backgroundColor: colorHex }}
        >
          {tile.icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/95 p-1.5 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
              <Image
                src={tile.icon}
                alt={tile.name}
                width={40}
                height={40}
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-amber-300 border border-white/20 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              <span className="truncate">SỔ ĐỎ • {groupName}</span>
            </div>
            <h2 className="text-lg font-black tracking-wide leading-tight truncate drop-shadow text-white">
              {tile.name}
            </h2>
            <p className="text-white/90 text-[11px] font-extrabold">Đất trống • Đang mở bán</p>
          </div>
        </div>

        {/* Thân Modal thu gọn (Compact Body) */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Hàng tài chính: Giá niêm yết & Số dư ví */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col justify-center bg-amber-50/90 border-2 border-amber-200/90 rounded-2xl p-2.5 shadow-xs">
              <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider">
                Giá Niêm Yết
              </span>
              <span className="text-lg font-black text-amber-600 flex items-center tracking-tight">
                <DollarSign className="w-4 h-4 -mr-0.5" />
                {tile.price.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col justify-center bg-emerald-50/90 border-2 border-emerald-200/90 rounded-2xl p-2.5 shadow-xs">
              <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider flex items-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-600" />
                Số Dư Của Bạn
              </span>
              <span
                className={`text-lg font-black flex items-center tracking-tight ${
                  canAfford ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                ${currentPlayer.money.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bảng giá tiền thuê theo loại */}
          {tile.type === 'STATION' && (
            <div className="bg-white/95 p-3 rounded-2xl border-2 border-sky-100 shadow-xs space-y-1.5 text-[11px]">
              <div className="font-black text-sky-800 flex items-center gap-1 uppercase text-[10px] tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Biểu Phí Thu Tiền Vé Bến Xe / Ga:</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                <div className="flex justify-between bg-sky-50/80 border border-sky-200/80 p-1.5 rounded-xl">
                  <span className="text-slate-600 font-bold">1 Bến/Ga:</span>
                  <span className="font-black text-sky-900">$25</span>
                </div>
                <div className="flex justify-between bg-sky-50/80 border border-sky-200/80 p-1.5 rounded-xl">
                  <span className="text-slate-600 font-bold">2 Bến/Ga:</span>
                  <span className="font-black text-sky-900">$50</span>
                </div>
                <div className="flex justify-between bg-sky-50/80 border border-sky-200/80 p-1.5 rounded-xl">
                  <span className="text-slate-600 font-bold">3 Bến/Ga:</span>
                  <span className="font-black text-sky-900">$100</span>
                </div>
                <div className="flex justify-between bg-amber-50 border-2 border-amber-300 p-1.5 rounded-xl">
                  <span className="text-amber-800 font-bold">4 Bến/Ga:</span>
                  <span className="font-black text-amber-700">$200</span>
                </div>
              </div>
            </div>
          )}

          {tile.type === 'UTILITY' && (
            <div className="bg-white/95 p-3 rounded-2xl border-2 border-teal-100 shadow-xs space-y-1.5 text-[11px]">
              <div className="font-black text-teal-800 flex items-center gap-1 uppercase text-[10px] tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Biểu Phí Dịch Vụ Tiện Ích:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between bg-teal-50/80 border border-teal-200/80 p-2 rounded-xl">
                  <span className="text-slate-600 font-bold">Sở hữu 1 Công ty:</span>
                  <span className="font-black text-teal-900">$50</span>
                </div>
                <div className="flex justify-between bg-emerald-50 border-2 border-emerald-300 p-2 rounded-xl">
                  <span className="text-emerald-800 font-bold">Sở hữu cả 2 Công ty:</span>
                  <span className="font-black text-emerald-700">$100</span>
                </div>
              </div>
            </div>
          )}

          {tile.type === 'PROPERTY' && tile.rent && (
            <div className="bg-white/95 p-3 rounded-2xl border-2 border-emerald-100 shadow-xs space-y-1.5 text-[11px]">
              <div className="font-black text-emerald-800 flex items-center gap-1 uppercase text-[10px] tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Biểu Phí Thu Tiền Thuê:</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5">
                <div className="flex justify-between bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl">
                  <span className="text-slate-600 font-bold">Đất gốc:</span>
                  <span className="font-black text-slate-800">${tile.rent[0]}</span>
                </div>
                <div className="flex justify-between bg-emerald-50/80 border border-emerald-200/80 p-1.5 rounded-xl">
                  <span className="text-emerald-700 font-bold">1 Nhà:</span>
                  <span className="font-black text-emerald-800">${tile.rent[1]}</span>
                </div>
                <div className="flex justify-between bg-emerald-50/80 border border-emerald-200/80 p-1.5 rounded-xl">
                  <span className="text-emerald-700 font-bold">2 Nhà:</span>
                  <span className="font-black text-emerald-800">${tile.rent[2]}</span>
                </div>
                <div className="flex justify-between bg-emerald-50/80 border border-emerald-200/80 p-1.5 rounded-xl">
                  <span className="text-emerald-700 font-bold">3 Nhà:</span>
                  <span className="font-black text-emerald-800">${tile.rent[3]}</span>
                </div>
                <div className="flex justify-between bg-emerald-50/80 border border-emerald-200/80 p-1.5 rounded-xl">
                  <span className="text-emerald-700 font-bold">4 Nhà:</span>
                  <span className="font-black text-emerald-800">${tile.rent[4]}</span>
                </div>
                <div className="flex justify-between bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 p-1.5 rounded-xl">
                  <span className="text-amber-800 font-black">Khách Sạn:</span>
                  <span className="font-black text-amber-700">
                    ${tile.rent[5] || tile.rent[tile.rent.length - 1]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!canAfford && (
            <div className="text-xs text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-2xl p-2.5 text-center font-black shadow-xs">
              ⚠️ Số dư ví không đủ để thanh toán
            </div>
          )}

          {/* Cụm nút hành động Mua (Jelly Mint) / Bỏ qua (Jelly Pink) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => skipBuyProperty()}
              className="btn-kawaii-jelly-pink py-3 px-4 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
            >
              <X className="w-4 h-4" />
              <span>BỎ QUA</span>
            </button>

            <button
              onClick={() => buyProperty(tile.id)}
              disabled={!canAfford}
              className={`py-3 px-4 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider transition-all ${
                canAfford
                  ? 'btn-kawaii-jelly-mint'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 rounded-3xl'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>MUA (${tile.price})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
