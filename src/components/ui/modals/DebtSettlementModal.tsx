'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { ModalTimerHeader } from './ModalTimerHeader';
import { COLOR_GROUP_HEX } from '@/constants/gameConfig';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const DebtSettlementModal: React.FC = () => {
  const {
    activeModal,
    pendingDebt,
    players,
    board,
    isOnline,
    mySessionId,
    turnTimer,
    mortgageProperty,
    sellHouse,
    payPendingDebt,
    declareBankruptcy,
  } = useGameStore();

  if (activeModal !== 'DEBT_SETTLEMENT' || !pendingDebt) {
    return null;
  }

  const debtor = players.find((p) => p.id === pendingDebt.debtorId);
  const creditor = pendingDebt.creditorId
    ? players.find((p) => p.id === pendingDebt.creditorId)
    : null;

  if (!debtor) return null;

  const isMyDebt = !isOnline || debtor.id === mySessionId;
  const ownedProperties = board.filter((tile) => tile.ownerId === debtor.id);
  const deficit = Math.max(0, pendingDebt.amount - debtor.money);
  const canPay = debtor.money >= pendingDebt.amount;

  // 👁️ CHẾ ĐỘ KHÁN GIẢ: BÁO ĐỘNG KHỦNG HOẢNG TÀI CHÍNH
  if (!isMyDebt) {
    return (
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
        <div className="bg-slate-950/92 border-2 border-rose-500/60 rounded-3xl p-4 sm:p-5 text-white backdrop-blur-2xl shadow-[0_0_40px_rgba(244,63,94,0.3),0_25px_60px_rgba(0,0,0,0.85)] transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>🚨 CẢNH BÁO TÀI CHÍNH</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">NGUY CƠ PHÁ SẢN</span>
              </span>
            </div>

            {turnTimer.isRunning && turnTimer.timeLeft > 0 && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-xs">
                <span>⏳ {turnTimer.timeLeft}s</span>
              </span>
            )}
          </div>

          {/* Thông tin Con nợ */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md">
                <PlayerAvatarDisplay avatar={debtor.avatar} name={debtor.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px]">
                ⚠️
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-white truncate">{debtor.name}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  Tiền mặt: <b className="text-amber-400 font-mono">${debtor.money.toLocaleString()}</b>
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5 truncate font-medium">
                Khoản nợ: <strong className="text-white">{pendingDebt.reason}</strong>
              </p>
            </div>
          </div>

          {/* Chi tiết nợ và Thiếu hụt */}
          <div className="rounded-2xl p-3.5 bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SỐ TIỀN CẦN THANH TOÁN</span>
                <span className="text-xl font-black text-rose-400">${pendingDebt.amount.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CHỦ NỢ</span>
                <span className="text-xs font-black text-amber-300">
                  {creditor ? creditor.name : '🏦 Ngân Hàng'}
                </span>
              </div>
            </div>

            {deficit > 0 ? (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-rose-300 font-bold">Thiếu hụt tiền mặt:</span>
                <span className="font-mono font-black text-rose-400">-${deficit.toLocaleString()}</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-bold">Khả năng chi trả:</span>
                <span className="font-mono font-black text-emerald-400">Đủ tiền mặt thanh toán</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sở hữu {ownedProperties.length} bất động sản để xoay xở</span>
            <span className="italic">Đang chờ xử lý...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl kawaii-glass border-2 border-amber-300/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Thanh đếm ngược thời gian trên cùng */}
        <ModalTimerHeader />

        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* 1. Hộp thông tin khoản nợ */}
          <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-2xl shadow-sm overflow-hidden p-0.5">
                  <PlayerAvatarDisplay avatar={debtor.avatar} name={debtor.name} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base leading-tight">
                    {debtor.name}
                  </h3>
                  <p className="text-xs text-rose-700 font-bold">
                    Khoản nợ: <span className="font-extrabold text-slate-800">{pendingDebt.reason}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Cần thanh toán
                </span>
                <span className="text-2xl font-black text-rose-600 tracking-tight">
                  ${pendingDebt.amount}
                </span>
              </div>
            </div>

            {/* Chủ nợ & Trạng thái tiền mặt */}
            <div className="mt-3 pt-3 border-t border-rose-200/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/90 rounded-xl p-2 border border-rose-100 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-extrabold uppercase mb-0.5">Chủ nợ</span>
                <span className="font-black text-amber-800 truncate flex items-center justify-center gap-1">
                  {creditor ? (
                    <>
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                        <PlayerAvatarDisplay avatar={creditor.avatar} name={creditor.name} />
                      </div>
                      <span className="truncate">{creditor.name}</span>
                    </>
                  ) : (
                    '🏛️ Ngân Hàng'
                  )}
                </span>
              </div>
              <div className="bg-white/90 rounded-xl p-2 border border-rose-100 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-extrabold uppercase mb-0.5">Tiền hiện có</span>
                <span className="font-black text-emerald-700 block">
                  ${debtor.money}
                </span>
              </div>
              <div className="bg-white/90 rounded-xl p-2 border border-rose-100 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-extrabold uppercase mb-0.5">Còn thiếu</span>
                <span className={`font-black block ${deficit > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'}`}>
                  ${deficit}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Danh sách bất động sản để thế chấp / bán nhà */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-700 flex items-center gap-1.5">
                <span>🏘️ TÀI SẢN BẤT ĐỘNG SẢN CỦA BẠN</span>
                <span className="text-amber-600 font-black">({ownedProperties.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-bold">
                Thế chấp nhận 50% • Bán nhà nhận 50%
              </span>
            </div>

            {ownedProperties.length === 0 ? (
              <div className="bg-white/80 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                <p className="text-sm font-bold">Bạn không sở hữu bất động sản nào để thế chấp.</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Nếu không đủ tiền mặt để trả nợ, bạn cần tuyên bố phá sản.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ownedProperties.map((prop) => {
                  const colorHex = prop.colorGroup ? COLOR_GROUP_HEX[prop.colorGroup] || '#64748B' : '#64748B';
                  const mortgageVal = prop.mortgageValue || Math.floor((prop.price || 0) * 0.5);
                  const houseRefund = Math.floor((prop.houseCost || 0) * 0.5);
                  const houses = prop.houses || 0;

                  return (
                    <div
                      key={prop.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                        prop.isMortgaged
                          ? 'bg-slate-100/80 border-slate-200 opacity-60'
                          : 'bg-white/95 hover:border-emerald-300 border-emerald-100/90 shadow-xs'
                      }`}
                    >
                      {/* Tên ô và màu khu vực */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-9 rounded-lg shadow-xs shrink-0"
                          style={{ backgroundColor: colorHex }}
                        />
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-xs truncate">
                            {prop.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {prop.isMortgaged ? (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                Đã thế chấp
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold">
                                Giá: ${prop.price}
                              </span>
                            )}

                            {houses > 0 && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                                {houses === 5 ? '🏨 Khách sạn' : `🏠 x${houses} Nhà`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Các nút hành động: Bán nhà hoặc Thế chấp */}
                      <div className="flex items-center gap-2 shrink-0">
                        {houses > 0 && (
                          <button
                            onClick={() => sellHouse(prop.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black text-xs border border-amber-300 transition-all active:scale-95 shadow-xs cursor-pointer"
                            title={`Bán bớt 1 nhà, nhận lại +$${houseRefund}`}
                          >
                            Bán nhà (+${houseRefund})
                          </button>
                        )}

                        {!prop.isMortgaged && houses === 0 && (
                          <button
                            onClick={() => mortgageProperty(prop.id)}
                            className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-black text-xs border border-sky-300 transition-all active:scale-95 shadow-xs cursor-pointer"
                            title={`Thế chấp ô đất, nhận +$${mortgageVal}`}
                          >
                            Thế chấp (+${mortgageVal})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer hành động */}
        <div className="p-4 bg-white/90 border-t-2 border-emerald-100 flex items-center justify-between gap-3">
          <button
            onClick={declareBankruptcy}
            className="btn-kawaii-jelly-pink px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>💀 Phá Sản</span>
          </button>

          <button
            onClick={payPendingDebt}
            disabled={!canPay}
            className={`flex-1 py-3 px-6 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              canPay
                ? 'btn-kawaii-jelly-mint'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 rounded-3xl'
            }`}
          >
            <span>✓ THANH TOÁN NỢ</span>
            <span className="text-xs opacity-90">(${pendingDebt.amount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
