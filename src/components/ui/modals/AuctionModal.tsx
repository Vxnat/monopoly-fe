'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/store/gameStore';
import { COLOR_GROUP_HEX, COLOR_GROUP_NAMES_VN } from '@/constants/gameConfig';
import { Gavel, Crown, ShieldAlert, Plus, ArrowUpRight, Ban, DollarSign } from 'lucide-react';
import { ModalTimerHeader } from './ModalTimerHeader';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const AuctionModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const auction = useGameStore((state) => state.auction);
  const board = useGameStore((state) => state.board);
  const players = useGameStore((state) => state.players);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const placeBid = useGameStore((state) => state.placeBid);
  const foldAuction = useGameStore((state) => state.foldAuction);

  const [customBid, setCustomBid] = useState<string>('');

  if (activeModal !== 'AUCTION' || !auction) return null;

  const tile = board[auction.tileId];
  if (!tile) return null;

  // Xác định chính xác người chơi của máy này (Client-bound Player)
  const myPlayer = isOnline
    ? players.find((p) => p.id === mySessionId)
    : players.find((p) => !p.isAI && !p.isBankrupt);

  const isMyActive = myPlayer ? auction.activeBidderIds.includes(myPlayer.id) : false;
  const isMyHighest = myPlayer && auction.highestBidderId === myPlayer.id;

  const highestBidder = auction.highestBidderId
    ? players.find((p) => p.id === auction.highestBidderId)
    : null;

  const minNextBid = auction.highestBidderId
    ? auction.currentBid + auction.minIncrement
    : 10;

  // Xử lý màu sắc dải ô
  let colorHex = '#3B82F6';
  let groupName = 'Bất Động Sản';
  if (tile.type === 'STATION') {
    colorHex = '#334155';
    groupName = 'BẾN XE & NHÀ GA';
  } else if (tile.type === 'UTILITY') {
    colorHex = '#0F766E';
    groupName = 'DỊCH VỤ TIỆN ÍCH';
  } else if (tile.colorGroup) {
    colorHex = COLOR_GROUP_HEX[tile.colorGroup] || '#3B82F6';
    groupName = COLOR_GROUP_NAMES_VN[tile.colorGroup] || 'Bất Động Sản';
  }

  const handleQuickBid = (increment: number) => {
    if (!myPlayer) return;
    const bidAmount = auction.highestBidderId
      ? auction.currentBid + increment
      : Math.max(10, increment);
    placeBid(bidAmount, myPlayer.id);
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPlayer) return;
    const amount = parseInt(customBid, 10);
    if (!isNaN(amount) && amount >= minNextBid && amount <= myPlayer.money) {
      placeBid(amount, myPlayer.id);
      setCustomBid('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm kawaii-glass overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col border-2 border-amber-400/90 ring-4 ring-amber-500/20">
        {/* ⏳ Thanh tiến độ & Badge đếm ngược */}
        <ModalTimerHeader />

        {/* Header Phiên Đấu Giá Nhỏ Gọn Chuẩn Monopoly Plus */}
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-amber-300 border border-white/20 mb-0.5">
              <Gavel className="w-3.5 h-3.5 text-amber-300" />
              <span className="truncate">SÀN ĐẤU GIÁ • {groupName}</span>
            </div>
            <h3 className="text-lg font-black tracking-wide leading-tight truncate drop-shadow text-white">
              {tile.name}
            </h3>
            <p className="text-white/90 text-[11px] font-extrabold">
              Giá gốc: ${tile.price}
            </p>
          </div>
        </div>

        {/* Thân phiên đấu giá */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Spotlight Mức Giá Cao Nhất Hiện Tại */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-400/20 to-amber-500/10 border-2 border-amber-400/80 shadow-sm text-center relative overflow-hidden">
            <div className="text-[10px] uppercase font-black tracking-widest text-amber-900/80 mb-0.5">
              Mức Giá Cao Nhất Hiện Tại
            </div>
            <div className="text-3xl font-black text-amber-950 flex items-center justify-center gap-1 drop-shadow-xs">
              <span className="text-xl text-amber-600">$</span>
              <span>{auction.currentBid}</span>
            </div>

            {highestBidder ? (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-amber-300 shadow-xs text-xs font-black">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-amber-400 shadow-xs flex items-center justify-center bg-slate-100">
                  <PlayerAvatarDisplay avatar={highestBidder.avatar} name={highestBidder.name} className="w-full h-full object-cover" />
                </div>
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                <span className="text-slate-900 font-extrabold truncate max-w-[120px]">{highestBidder.name}</span>
                {isMyHighest && <span className="text-emerald-600 text-[10px] font-black">(BẠN)</span>}
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-amber-800/90 font-bold italic">
                Chưa có người trả giá • Khởi điểm $10
              </div>
            )}
          </div>

          {/* Danh sách người tham gia đấu giá */}
          <div className="bg-white/95 p-3 rounded-2xl border-2 border-emerald-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700">
              <span>Người Tham Gia:</span>
              <span className="text-emerald-700 font-black">
                {auction.activeBidderIds.length} / {players.filter((p) => !p.isBankrupt).length} Còn Lại
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {players
                .filter((p) => !p.isBankrupt)
                .map((p) => {
                  const isActive = auction.activeBidderIds.includes(p.id);
                  const isLeader = auction.highestBidderId === p.id;
                  const isMe = myPlayer && p.id === myPlayer.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        isLeader
                          ? 'bg-amber-50/95 border-2 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                          : isMe
                          ? 'bg-sky-50/90 border-2 border-sky-400 shadow-xs'
                          : isActive
                          ? 'bg-slate-50 border border-slate-200'
                          : 'bg-slate-100/70 border border-slate-200 opacity-45'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-300 shadow-xs bg-white flex items-center justify-center">
                        <PlayerAvatarDisplay avatar={p.avatar} name={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black truncate leading-tight text-slate-900 flex items-center gap-1">
                          <span>{p.name}</span>
                          {isMe && <span className="text-sky-600 text-[9px] font-black uppercase">(Tôi)</span>}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-extrabold">
                          ${p.money}
                        </p>
                      </div>
                      {isLeader ? (
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      ) : !isActive ? (
                        <span className="text-[9px] font-black text-rose-500 uppercase shrink-0 px-1 py-0.5 bg-rose-50 rounded">
                          Bỏ
                        </span>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Khu vực điều khiển của người chơi (My Controls) */}
          {myPlayer && isMyActive ? (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Lượt Của Bạn:</span>
                <span className="text-emerald-700 font-black">Ví: ${myPlayer.money}</span>
              </div>

              {/* Các nút nâng giá nhanh */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickBid(10)}
                  disabled={myPlayer.money < (auction.highestBidderId ? auction.currentBid + 10 : 10)}
                  className="py-2.5 px-2 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs uppercase tracking-wider transition-all shadow-xs border border-amber-500/40 flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-900" />
                  <span>$10</span>
                </button>

                <button
                  onClick={() => handleQuickBid(50)}
                  disabled={myPlayer.money < (auction.highestBidderId ? auction.currentBid + 50 : 50)}
                  className="py-2.5 px-2 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs uppercase tracking-wider transition-all shadow-xs border border-amber-500/40 flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-900" />
                  <span>$50</span>
                </button>

                <button
                  onClick={() => handleQuickBid(100)}
                  disabled={myPlayer.money < (auction.highestBidderId ? auction.currentBid + 100 : 100)}
                  className="py-2.5 px-2 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs uppercase tracking-wider transition-all shadow-xs border border-amber-500/40 flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-900" />
                  <span>$100</span>
                </button>
              </div>

              {/* Form tự nhập giá */}
              <form onSubmit={handleCustomBidSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-black text-slate-500">$</span>
                  <input
                    type="number"
                    min={minNextBid}
                    max={myPlayer.money}
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    placeholder={`Tối thiểu $${minNextBid}`}
                    className="w-full pl-6 pr-3 py-2 text-xs font-black text-slate-900 placeholder:text-slate-400 bg-white rounded-2xl border-2 border-emerald-200 focus:border-amber-400 focus:outline-hidden shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customBid || parseInt(customBid, 10) < minNextBid || parseInt(customBid, 10) > myPlayer.money}
                  className="px-4 py-2 rounded-2xl btn-kawaii-jelly-gold text-xs font-black uppercase flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>Đặt</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Nút Rút Lui / Bỏ Cuộc */}
              <button
                onClick={() => foldAuction(myPlayer.id)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 font-black text-xs uppercase tracking-wider rounded-2xl transition-all border border-slate-300 active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Ban className="w-4 h-4 text-rose-500" />
                <span>Rút Lui (Bỏ Cuộc Đấu Giá)</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-300 text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>
                {myPlayer?.isBankrupt
                  ? 'Bạn đã phá sản và đang theo dõi phiên đấu giá.'
                  : 'Bạn đã rút lui khỏi phiên đấu giá này (Đang theo dõi).'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
