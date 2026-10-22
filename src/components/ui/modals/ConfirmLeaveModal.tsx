'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { colyseusClient } from '@/services/colyseusClient';
import { soundEngine } from '@/utils/audio';
import { LogOut, AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';

interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const isOnline = useGameStore((state) => state.isOnline);
  const roomId = useGameStore((state) => state.roomId);

  if (!isOpen) return null;

  const handleConfirmLeave = () => {
    soundEngine.playButtonClick();
    if (isOnline) {
      colyseusClient.leaveRoom();
    }
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white backdrop-blur-2xl">
        {/* Thanh trang trí viền trên */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-4">
          {/* Icon Cảnh báo rung chuyển nhẹ */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>CẢNH BÁO RỜI VÁN ĐẤU</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide uppercase">
              Bạn Muốn Rời Phòng?
            </h3>
          </div>

          {/* Nội dung cảnh báo */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left space-y-2 text-xs sm:text-sm text-slate-300">
            {isOnline ? (
              <>
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold border-b border-slate-700/60 pb-2">
                  <span>MÃ PHÒNG HIỆN TẠI:</span>
                  <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-400 border border-amber-500/30">
                    #{roomId}
                  </span>
                </div>
                <p className="leading-relaxed">
                  Trận đấu đang diễn ra và phòng chơi đã được <strong className="text-rose-400">Khóa (Locked)</strong>.
                </p>
                <p className="leading-relaxed text-slate-400 text-xs">
                  ⚠️ Nếu rời phòng lúc này, bạn sẽ <strong className="text-white">không thể kết nối lại</strong> ván đấu cũ. Hệ thống sẽ đưa bạn về sảnh chính để tham gia hoặc tạo phòng mới.
                </p>
              </>
            ) : (
              <p className="leading-relaxed">
                Bạn có chắc chắn muốn kết thúc ván đấu ngoại tuyến hiện tại và quay về sảnh chính không?
              </p>
            )}
          </div>

          {/* Nhóm nút bấm */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider border border-slate-600/80 transition-all active:scale-95 shadow-md"
            >
              Ở Lại Chơi Tiếp
            </button>
            <button
              onClick={handleConfirmLeave}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[0_10px_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5 border border-rose-400/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Rời Về Sảnh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
