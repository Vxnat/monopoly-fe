'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PlayerHUD } from '@/components/ui/hud/PlayerHUD';
import { ActionControls } from '@/components/ui/hud/ActionControls';
import { TurnTimerController } from '@/components/common/TurnTimerController';
import { BuyPropertyModal } from '@/components/ui/modals/BuyPropertyModal';
import { AuctionModal } from '@/components/ui/modals/AuctionModal';
import { RentPaidModal } from '@/components/ui/modals/RentPaidModal';
import { CardDrawModal } from '@/components/ui/modals/CardDrawModal';
import { PropertyDetailModal } from '@/components/ui/modals/PropertyDetailModal';
import { JailChoiceModal } from '@/components/ui/modals/JailChoiceModal';
import { TradeModal } from '@/components/ui/modals/TradeModal';
import { useState } from 'react';
import { DebtSettlementModal } from '@/components/ui/modals/DebtSettlementModal';
import { GameOverModal } from '@/components/ui/modals/GameOverModal';
import { ConfirmLeaveModal } from '@/components/ui/modals/ConfirmLeaveModal';
import { LogOut } from 'lucide-react';

// Tải Scene 3D dạng dynamic client-side (no SSR)
const Scene = dynamic(
  () => import('@/components/3d/Scene').then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/80 to-sky-50 text-slate-800">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-black text-emerald-800 tracking-wider">MONOPOLY 3D</p>
        <p className="text-xs text-slate-500 mt-1 font-bold">Đang khởi tạo bàn cờ 3D và vật lý quân cờ...</p>
      </div>
    ),
  }
);

export default function GamePage() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/80 to-sky-50 font-sans select-none">
      {/* 🍃 BẦU KHÔNG KHÍ XANH MINT PASTEL BỒNG BỀNH */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-4 -left-20 w-[450px] h-[450px] bg-emerald-200/40 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-teal-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-3xl" />
      </div>

      {/* 1. Lớp 3D WebGL Canvas (Alpha trong suốt lộ nền Pastel) */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* 2. Nút Rời trận đấu / Thoát về Sảnh ở góc trên bên trái */}
      <div className="absolute top-4 left-4 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl mint-glass text-rose-800 hover:text-rose-950 hover:border-rose-400 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border-2 border-rose-200/90 group"
          title="Rời trận đấu / Thoát về sảnh chờ"
        >
          <LogOut className="w-4 h-4 text-rose-600 font-bold group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">RỜI PHÒNG</span>
        </button>
      </div>

      {/* 3. Lớp UI 2D Overlay đè lên 3D */}
      <TurnTimerController />
      <div className="pl-28 sm:pl-32">
        <PlayerHUD />
      </div>
      <ActionControls />

      {/* 4. Các Modals tương tác & Sự kiện */}
      <BuyPropertyModal />
      <AuctionModal />
      <RentPaidModal />
      <CardDrawModal />
      <PropertyDetailModal />
      <JailChoiceModal />
      <TradeModal />
      <DebtSettlementModal />
      <GameOverModal />
      <ConfirmLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
    </main>
  );
}
