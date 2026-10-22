'use client';

import React from 'react';
import Image from 'next/image';
import { useGameStore } from '@/store/gameStore';
import { COLOR_GROUP_HEX, COLOR_GROUP_NAMES_VN } from '@/constants/gameConfig';
import { Home, Hotel, X, Hammer, ShieldCheck, DollarSign, Building2, User, Crown, AlertCircle, Sparkles } from 'lucide-react';
import { canUpgradeProperty, hasMonopolySet } from '@/logic/handlers/propertyHandler';

export const PropertyDetailModal: React.FC = () => {
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const activeModal = useGameStore((state) => state.activeModal);
  const selectTile = useGameStore((state) => state.selectTile);
  const board = useGameStore((state) => state.board);
  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const upgradeProperty = useGameStore((state) => state.upgradeProperty);
  const bankHouses = useGameStore((state) => state.bankHouses);
  const bankHotels = useGameStore((state) => state.bankHotels);

  if (selectedTileId === null || activeModal !== null) return null;

  const tile = board[selectedTileId];
  if (!tile || !tile.price) return null;

  const currentPlayer = players[currentTurnIndex];
  const owner = tile.ownerId ? players.find((p) => p.id === tile.ownerId) : null;
  const isOwner = owner?.id === currentPlayer?.id;

  // Xử lý màu sắc và tên phân loại theo loại ô (PROPERTY, STATION, UTILITY)
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

  const isMonopoly = owner && tile.colorGroup ? hasMonopolySet(owner, tile.colorGroup, board) : false;
  const upgradeStatus = canUpgradeProperty(tile, board, currentPlayer, bankHouses, bankHotels);
  const canUpgrade = isOwner && upgradeStatus.canUpgrade;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm kawaii-glass overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col border-2 border-emerald-300/80">
        {/* Nút đóng góc phải */}
        <button
          onClick={() => selectTile(null)}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 text-slate-600 hover:text-slate-900 flex items-center justify-center hover:bg-white transition-all cursor-pointer border-2 border-emerald-200 active:scale-95 shadow-sm"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Sổ Đỏ nhỏ gọn nằm ngang */}
        <div
          className="px-4 py-3 text-white border-b-2 border-white/40 flex items-center gap-3 relative pr-12 shadow-sm"
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
            <h3 className="text-lg font-black tracking-wide leading-tight truncate drop-shadow text-white">
              {tile.name}
            </h3>
            <p className="text-white/90 text-[11px] font-extrabold">Chi tiết sở hữu & giá trị</p>
          </div>
        </div>

        {/* Nội dung Sổ Đỏ */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Monopoly Set Crown Banner */}
          {isMonopoly && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-2 border-amber-400/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow">
                <Crown className="w-5 h-5 fill-amber-950 text-amber-950" />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-black text-amber-900 uppercase tracking-wide flex items-center gap-1">
                  <span>TRỌN BỘ MÀU HOÀN THIỆN</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                </div>
                <p className="text-amber-800/90 font-semibold mt-0.5">Tiền thuê đất gốc x2 • Được phép xây dựng</p>
              </div>
            </div>
          )}

          {/* Thông tin chủ sở hữu */}
          <div className="flex items-center justify-between p-2.5 bg-white/95 rounded-2xl border-2 border-emerald-100 text-xs shadow-xs">
            <span className="text-slate-500 uppercase font-extrabold tracking-wider text-[10px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Chủ Sở Hữu:
            </span>
            {owner ? (
              <span
                className="font-black flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 shadow-xs"
                style={{ color: owner.hexColor }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0"
                  style={{ backgroundColor: owner.hexColor }}
                />
                {owner.name} {isOwner && '★ (BẠN)'}
              </span>
            ) : (
              <span className="text-emerald-700 font-black flex items-center text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
                Chưa có chủ (${tile.price})
              </span>
            )}
          </div>

          {/* Biểu phí tiền thuê theo loại */}
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
                  <span className="font-black text-teal-900">Điểm Xúc Xắc × 4</span>
                </div>
                <div className="flex justify-between bg-emerald-50 border-2 border-emerald-300 p-2 rounded-xl">
                  <span className="text-emerald-800 font-bold">Sở hữu cả 2 Công ty:</span>
                  <span className="font-black text-emerald-700">Điểm Xúc Xắc × 10</span>
                </div>
              </div>
            </div>
          )}

          {tile.type === 'PROPERTY' && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-[10px] font-black text-amber-950 shadow-xs">
              <span className="flex items-center gap-1 uppercase tracking-wide">
                <span>Kho Ngân Hàng:</span>
              </span>
              <div className="flex items-center gap-2">
                <span className={bankHouses <= 0 ? 'text-rose-600 font-black' : 'text-emerald-700'}>
                  🏠 {bankHouses}/32 Nhà
                </span>
                <span className="text-slate-300">•</span>
                <span className={bankHotels <= 0 ? 'text-rose-600 font-black' : 'text-amber-700'}>
                  🏨 {bankHotels}/12 KS
                </span>
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
                <div
                  className={`flex justify-between p-1.5 rounded-xl ${
                    isMonopoly ? 'bg-amber-50 border-2 border-amber-300' : 'bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <span className={isMonopoly ? 'text-amber-800 font-black' : 'text-slate-600 font-bold'}>
                    Đất gốc {isMonopoly ? '(x2):' : ':'}
                  </span>
                  <span className={`font-black ${isMonopoly ? 'text-amber-700' : 'text-slate-800'}`}>
                    ${isMonopoly ? tile.rent[0] * 2 : tile.rent[0]}
                  </span>
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

          {/* Cấp độ công trình (chỉ dành cho Bất Động Sản nhà đất) */}
          {tile.type === 'PROPERTY' && (
            <div className="flex items-center justify-between text-xs bg-amber-50/90 border-2 border-amber-200/90 rounded-2xl p-2.5 shadow-xs">
              <span className="text-amber-800 text-[11px] font-extrabold uppercase tracking-wider">Cấp độ công trình:</span>
              <span className="font-black flex items-center gap-1.5 text-xs">
                {tile.houses === 5 ? (
                  <span className="flex items-center gap-1 text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-lg border border-rose-200">
                    <Hotel className="w-3.5 h-3.5 text-rose-600" />
                    <span>1 Khách Sạn VIP</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tile.houses || 0} Ngôi Nhà</span>
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Lý do chưa thể xây dựng nếu isOwner và không thể nâng cấp */}
          {isOwner && tile.type === 'PROPERTY' && !upgradeStatus.canUpgrade && (tile.houses || 0) < 5 && upgradeStatus.reason && (
            <div className="bg-amber-50/95 border-2 border-amber-200 rounded-2xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-snug">{upgradeStatus.reason}</span>
            </div>
          )}

          {/* Nút Xây nhà dành cho chủ sở hữu */}
          {isOwner && tile.type === 'PROPERTY' && tile.houseCost && (
            <button
              onClick={() => upgradeProperty(tile.id)}
              disabled={!canUpgrade}
              className={`w-full py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                canUpgrade
                  ? 'btn-kawaii-jelly-gold'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 rounded-3xl'
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>
                XÂY THÊM {(tile.houses || 0) === 4 ? 'KHÁCH SẠN' : 'NHÀ'} (${tile.houseCost})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
