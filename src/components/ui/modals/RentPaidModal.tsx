'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Receipt, Check, ArrowDownRight, ArrowUpRight, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { ModalTimerHeader } from './ModalTimerHeader';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';

export const RentPaidModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const pendingRentInfo = useGameStore((state) => state.pendingRentInfo);
  const players = useGameStore((state) => state.players);
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const turnTimer = useGameStore((state) => state.turnTimer);
  const closeModal = useGameStore((state) => state.closeModal);

  if (activeModal !== 'RENT_PAID' || !pendingRentInfo) return null;

  const tenant = players.find((p) => p.id === pendingRentInfo.tenantId);
  const landlord = players.find((p) => p.id === pendingRentInfo.landlordId);

  // Phân biệt vai trò: Người trả tiền (Tenant) vs Chủ đất nhận tiền (Landlord) vs Khán giả (Spectator)
  const isTenant = isOnline ? pendingRentInfo.tenantId === mySessionId : true;
  const isLandlord = isOnline && pendingRentInfo.landlordId === mySessionId;
  const isSpectator = isOnline && !isTenant && !isLandlord;

  // 👁️ CHẾ ĐỘ KHÁN GIẢ: Giao dịch tiền thuê giữa hai đối thủ
  if (isSpectator) {
    return (
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
        <div className="bg-slate-950/92 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 text-white backdrop-blur-2xl shadow-[0_0_35px_rgba(245,158,11,0.25),0_25px_60px_rgba(0,0,0,0.85)] transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🔴 TRUYỀN HÌNH TRỰC TIẾP</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">GIAO DỊCH TIỀN THUÊ</span>
              </span>
            </div>

            {turnTimer.isRunning && turnTimer.timeLeft > 0 && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                <span>⏳ {turnTimer.timeLeft}s</span>
              </span>
            )}
          </div>

          {/* Dòng tiền chuyển nhượng giữa 2 đối thủ */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 my-2">
            {/* Người trả tiền */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md shrink-0">
                <PlayerAvatarDisplay avatar={tenant?.avatar || ''} name={tenant?.name || 'Khách'} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white truncate block">{tenant?.name}</span>
                <span className="text-[11px] font-mono font-bold text-rose-400">
                  -${pendingRentInfo.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mũi tên giao dịch */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2 text-amber-400">
              <ArrowRight className="w-5 h-5 animate-pulse" />
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Tiền thuê</span>
            </div>

            {/* Người nhận tiền */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
              <div className="min-w-0">
                <span className="text-xs font-black text-white truncate block">{landlord?.name}</span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  +${pendingRentInfo.amount.toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md shrink-0">
                <PlayerAvatarDisplay avatar={landlord?.avatar || ''} name={landlord?.name || 'Chủ đất'} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 px-1">
            <span>
              Ô đất: <strong className="text-amber-400 font-bold">{pendingRentInfo.tileName}</strong>
            </span>
            <span className="text-slate-400 italic">Đang cập nhật số dư...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm kawaii-glass p-6 shadow-2xl text-center space-y-4 relative overflow-hidden border-2 ${
          isLandlord
            ? 'border-emerald-400/90 ring-4 ring-emerald-500/20'
            : 'border-rose-300/80 ring-4 ring-rose-500/10'
        }`}
      >
        {/* ⏳ Thanh tiến độ & Badge đếm ngược */}
        <ModalTimerHeader />

        {/* Icon biên lai hoặc tia sáng thu tiền */}
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border-2 shadow-md ${
            isLandlord
              ? 'bg-emerald-100 text-emerald-600 border-emerald-300'
              : 'bg-rose-100 text-rose-600 border-rose-300'
          }`}
        >
          {isLandlord ? <Sparkles className="w-8 h-8" /> : <Receipt className="w-8 h-8" />}
        </div>

        <div>
          <span
            className={`text-[11px] uppercase font-black tracking-widest drop-shadow-xs px-3 py-0.5 rounded-full border ${
              isLandlord
                ? 'text-emerald-700 bg-emerald-100/90 border-emerald-200'
                : 'text-rose-600 bg-rose-100/80 border-rose-200'
            }`}
          >
            {isLandlord ? '🎉 THU TIỀN THUÊ ĐẤT' : 'HÓA ĐƠN TIỀN THUÊ ĐẤT'}
          </span>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">
            {isLandlord ? 'Nhận Tiền Thuê!' : 'Đã Thanh Toán!'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-bold">
            {isLandlord ? (
              <span>
                <b style={{ color: tenant?.hexColor }}>{tenant?.name}</b> vừa dừng chân tại ô đất{' '}
                <b className="text-amber-700 underline underline-offset-2">{pendingRentInfo.tileName}</b> của bạn!
              </span>
            ) : isTenant ? (
              <span>
                Bạn vừa dừng chân tại mảnh đất{' '}
                <b className="text-amber-700 underline underline-offset-2">{pendingRentInfo.tileName}</b>
              </span>
            ) : (
              <span>
                <b style={{ color: tenant?.hexColor }}>{tenant?.name}</b> dừng chân tại ô đất{' '}
                <b className="text-amber-700 underline underline-offset-2">{pendingRentInfo.tileName}</b> của{' '}
                <b style={{ color: landlord?.hexColor }}>{landlord?.name}</b>
              </span>
            )}
          </p>
        </div>

        {/* Khung số tiền */}
        <div
          className={`p-4 rounded-2xl border-2 space-y-1.5 shadow-xs ${
            isLandlord
              ? 'bg-emerald-50/90 border-emerald-200/90'
              : 'bg-rose-50/90 border-rose-200/90'
          }`}
        >
          <div
            className={`text-3xl font-black flex items-center justify-center gap-1 tracking-tight ${
              isLandlord ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isLandlord ? (
              <>
                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                +${pendingRentInfo.amount.toLocaleString()}
              </>
            ) : (
              <>
                <ArrowDownRight className="w-6 h-6 text-rose-500" />
                -${pendingRentInfo.amount.toLocaleString()}
              </>
            )}
          </div>
          <p className="text-xs text-slate-600 font-bold">
            {isLandlord ? (
              <span>
                Đã cộng vào ví của <b style={{ color: landlord?.hexColor }}>{landlord?.name || 'Bạn'}</b>!
              </span>
            ) : (
              <span>
                <b style={{ color: tenant?.hexColor }}>{tenant?.name || 'Bạn'}</b> đã chuyển tiền cho{' '}
                <b style={{ color: landlord?.hexColor }}>{landlord?.name}</b>
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => closeModal()}
          className={`w-full py-3.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            isLandlord ? 'btn-kawaii-jelly-mint' : 'btn-kawaii-jelly-mint'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isLandlord ? 'TUYỆT VỜI (XÁC NHẬN)' : 'ĐÃ HIỂU'}</span>
        </button>
      </div>
    </div>
  );
};
