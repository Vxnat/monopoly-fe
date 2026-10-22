'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { COLOR_GROUP_HEX } from '@/constants/gameConfig';
import {
  Handshake,
  X,
  ArrowRightLeft,
  DollarSign,
  KeyRound,
  AlertTriangle,
  Bot,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { soundEngine } from '@/utils/audio';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';
import {
  TradeOffer,
  canTradeProperty,
  validateTrade,
  evaluateAiTradeDecision,
} from '@/logic/handlers/tradeHandler';
import confetti from 'canvas-confetti';

interface CompletedTradeSummary {
  partnerName: string;
  partnerAvatar: string;
  offeredMoney: number;
  requestedMoney: number;
  offeredJailCards: number;
  requestedJailCards: number;
  offeredTiles: Array<{ id: number; name: string; price: number; colorGroup?: string; type: string }>;
  requestedTiles: Array<{ id: number; name: string; price: number; colorGroup?: string; type: string }>;
}

export const TradeModal: React.FC = () => {
  const isTradeModalOpen = useUIStore((state) => state.isTradeModalOpen);
  const closeTradeModal = useUIStore((state) => state.closeTradeModal);

  const players = useGameStore((state) => state.players);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);
  const board = useGameStore((state) => state.board);
  const executeTradeAction = useGameStore((state) => state.executeTradeAction);

  const currentPlayer = players[currentTurnIndex];
  const otherPlayers = players.filter((p) => p.id !== currentPlayer?.id && !p.isBankrupt);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(otherPlayers[0]?.id || '');
  const [offeredTileIds, setOfferedTileIds] = useState<number[]>([]);
  const [requestedTileIds, setRequestedTileIds] = useState<number[]>([]);
  const [offeredMoney, setOfferedMoney] = useState<number>(0);
  const [requestedMoney, setRequestedMoney] = useState<number>(0);
  const [offeredJailCards, setOfferedJailCards] = useState<number>(0);
  const [requestedJailCards, setRequestedJailCards] = useState<number>(0);

  // Trạng thái đánh giá của Bot, biên lai thành công và lỗi
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [botFeedback, setBotFeedback] = useState<{
    status: 'ACCEPTED' | 'REJECTED';
    reason: string;
    score: number;
    suggestedCashExtra?: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSummary, setCompletedSummary] = useState<CompletedTradeSummary | null>(null);

  if (!isTradeModalOpen || !currentPlayer) return null;

  const partner = players.find((p) => p.id === selectedPartnerId) || otherPlayers[0];
  if (!partner) return null;

  const myProperties = board.filter((t) => t.ownerId === currentPlayer.id);
  const partnerProperties = board.filter((t) => t.ownerId === partner.id);

  const toggleOfferTile = (id: number) => {
    soundEngine.playButtonClick();
    setBotFeedback(null);
    setErrorMessage(null);
    setOfferedTileIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleRequestTile = (id: number) => {
    soundEngine.playButtonClick();
    setBotFeedback(null);
    setErrorMessage(null);
    setRequestedTileIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const currentTradeOffer: TradeOffer = {
    senderId: currentPlayer.id,
    receiverId: partner.id,
    offeredTileIds,
    requestedTileIds,
    offeredMoney,
    requestedMoney,
    offeredJailCards,
    requestedJailCards,
  };

  const handleSendOffer = () => {
    soundEngine.playButtonClick();
    setErrorMessage(null);

    // 1. Kiểm tra tính hợp lệ cơ bản
    const validation = validateTrade(currentTradeOffer, players, board);
    if (!validation.isValid) {
      setErrorMessage(validation.reason || 'Đề xuất không hợp lệ!');
      return;
    }

    const buildSummaryData = (): CompletedTradeSummary => {
      return {
        partnerName: partner.name,
        partnerAvatar: partner.avatar,
        offeredMoney,
        requestedMoney,
        offeredJailCards,
        requestedJailCards,
        offeredTiles: offeredTileIds.map((id) => {
          const t = board.find((tile) => tile.id === id)!;
          return { id: t.id, name: t.name, price: t.price || 0, colorGroup: t.colorGroup, type: t.type };
        }),
        requestedTiles: requestedTileIds.map((id) => {
          const t = board.find((tile) => tile.id === id)!;
          return { id: t.id, name: t.name, price: t.price || 0, colorGroup: t.colorGroup, type: t.type };
        }),
      };
    };

    // 2. Nếu đối tác là AI Bot -> Đánh giá đề xuất
    if (partner.isAI) {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        const decision = evaluateAiTradeDecision(currentTradeOffer, players, board);

        if (decision.accept) {
          // AI chấp nhận giao dịch!
          const summaryData = buildSummaryData();
          const result = executeTradeAction(currentTradeOffer);
          if (result.success) {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
            setCompletedSummary(summaryData);
          } else {
            setErrorMessage(result.reason || 'Giao dịch thất bại!');
          }
        } else {
          // AI từ chối -> Giữ nguyên bàn đàm phán và hiện lý do kèm gợi ý
          setBotFeedback({
            status: 'REJECTED',
            reason: decision.reason,
            score: decision.score,
            suggestedCashExtra: decision.suggestedCashExtra,
          });
        }
      }, 650);
      return;
    }

    // 3. Nếu đối tác là Người chơi (Local / Human) -> Xác nhận thực hiện
    const summaryData = buildSummaryData();
    const result = executeTradeAction(currentTradeOffer);
    if (result.success) {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
      setCompletedSummary(summaryData);
    } else {
      setErrorMessage(result.reason || 'Giao dịch thất bại!');
    }
  };

  const getTileColor = (tile: (typeof board)[0]) => {
    if (tile.type === 'STATION') return '#64748B';
    if (tile.type === 'UTILITY') return '#8B5CF6';
    if (tile.colorGroup && COLOR_GROUP_HEX[tile.colorGroup]) {
      return COLOR_GROUP_HEX[tile.colorGroup];
    }
    return '#0284C7';
  };

  const handleCloseAll = () => {
    setCompletedSummary(null);
    setBotFeedback(null);
    setErrorMessage(null);
    setOfferedTileIds([]);
    setRequestedTileIds([]);
    setOfferedMoney(0);
    setRequestedMoney(0);
    setOfferedJailCards(0);
    setRequestedJailCards(0);
    closeTradeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl kawaii-glass border-2 border-emerald-300/90 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.25)] relative max-h-[92vh] flex flex-col">
        
        {/* ========================================================================= */}
        {/* 📜 MÀN HÌNH 2: BIÊN LAI GIAO DỊCH THÀNH CÔNG (TRADE RECEIPT SUMMARY) */}
        {/* ========================================================================= */}
        {completedSummary ? (
          <div className="flex flex-col flex-1 overflow-hidden bg-white/95 animate-in zoom-in-95 duration-250">
            {/* Header Chúc mừng Thành Công */}
            <div className="p-5 text-white text-center bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 border-b-2 border-white/40 shadow-sm relative flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-amber-300 drop-shadow" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-amber-300 border border-white/20 mb-0.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>HỢP ĐỒNG ĐÃ ĐƯỢC KÝ KẾT</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-wide leading-tight">
                    GIAO DỊCH THÀNH CÔNG RỰC RỠ!
                  </h3>
                </div>
              </div>

              <button
                onClick={handleCloseAll}
                className="w-9 h-9 rounded-full bg-white/90 text-slate-600 hover:text-slate-950 flex items-center justify-center cursor-pointer border-2 border-emerald-200 shadow-sm active:scale-95 transition-all"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chi tiết Biến Động Tài Sản (2 Cột Trao Đi & Nhận Về) */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-emerald-50/90 p-3.5 rounded-2xl border-2 border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-300 shadow-sm">
                    <PlayerAvatarDisplay avatar={completedSummary.partnerAvatar} name={completedSummary.partnerName} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                      Đối tác giao dịch:
                    </span>
                    <h4 className="text-sm font-black text-emerald-950">{completedSummary.partnerName}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-800 block">Số dư ví của bạn hiện tại:</span>
                  <span className="text-base font-black text-amber-600 drop-shadow-xs">${currentPlayer.money}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 📤 BẠN ĐÃ TRAO ĐI */}
                <div className="bg-rose-50/70 p-4 rounded-2xl border-2 border-rose-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b-2 border-rose-200/80 pb-2">
                    <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                      BẠN ĐÃ TRAO ĐI:
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {completedSummary.offeredMoney > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-200 shadow-xs font-bold text-rose-900">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-rose-600" /> Tiền mặt chuyển đi:
                        </span>
                        <span className="font-black text-rose-600">-${completedSummary.offeredMoney}</span>
                      </div>
                    )}

                    {completedSummary.offeredJailCards > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-200 shadow-xs font-bold text-rose-900">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-purple-600" /> Thẻ Miễn Đi Tù:
                        </span>
                        <span className="font-black text-purple-700">-{completedSummary.offeredJailCards} thẻ</span>
                      </div>
                    )}

                    {completedSummary.offeredTiles.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 block">
                          Bất động sản đã nhượng lại ({completedSummary.offeredTiles.length}):
                        </span>
                        {completedSummary.offeredTiles.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-xs flex items-center justify-between text-xs font-bold"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                                style={{
                                  backgroundColor:
                                    t.type === 'STATION'
                                      ? '#64748B'
                                      : t.type === 'UTILITY'
                                      ? '#8B5CF6'
                                      : t.colorGroup
                                      ? COLOR_GROUP_HEX[t.colorGroup] || '#0284C7'
                                      : '#0284C7',
                                }}
                              />
                              <span className="text-slate-800 font-black">{t.name}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-extrabold">${t.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {completedSummary.offeredMoney === 0 &&
                      completedSummary.offeredJailCards === 0 &&
                      completedSummary.offeredTiles.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2">Không có tài sản nào trao đi</p>
                      )}
                  </div>
                </div>

                {/* 📥 BẠN VỪA NHẬN ĐƯỢC */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border-2 border-emerald-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b-2 border-emerald-200/80 pb-2">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      BẠN VỪA NHẬN ĐƯỢC:
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {completedSummary.requestedMoney > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 shadow-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" /> Tiền mặt nhận thêm:
                        </span>
                        <span className="font-black text-emerald-600">+${completedSummary.requestedMoney}</span>
                      </div>
                    )}

                    {completedSummary.requestedJailCards > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 shadow-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-purple-600" /> Thẻ Miễn Đi Tù:
                        </span>
                        <span className="font-black text-purple-700">+{completedSummary.requestedJailCards} thẻ</span>
                      </div>
                    )}

                    {completedSummary.requestedTiles.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                          Bất động sản mới sở hữu ({completedSummary.requestedTiles.length}):
                        </span>
                        {completedSummary.requestedTiles.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white border-2 border-emerald-300 shadow-xs flex items-center justify-between text-xs font-bold"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                                style={{
                                  backgroundColor:
                                    t.type === 'STATION'
                                      ? '#64748B'
                                      : t.type === 'UTILITY'
                                      ? '#8B5CF6'
                                      : t.colorGroup
                                      ? COLOR_GROUP_HEX[t.colorGroup] || '#0284C7'
                                      : '#0284C7',
                                }}
                              />
                              <span className="text-emerald-950 font-black">{t.name}</span>
                            </div>
                            <span className="text-[11px] text-amber-600 font-black">${t.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {completedSummary.requestedMoney === 0 &&
                      completedSummary.requestedJailCards === 0 &&
                      completedSummary.requestedTiles.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2">Không có tài sản nào nhận về</p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Nút bấm Hoàn tất */}
            <div className="p-4 bg-white border-t-2 border-emerald-100 flex items-center justify-center">
              <button
                type="button"
                onClick={handleCloseAll}
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-white"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>XÁC NHẬN & TIẾP TỤC TRẬN ĐẤU</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 🤝 MÀN HÌNH 1: BÀN ĐÀM PHÁN GIAO DỊCH (NEGOTIATION BOARD) */
          /* ========================================================================= */
          <div className="flex flex-col flex-1 overflow-hidden bg-white/95">
            {/* Header Sang Trọng Phong Cách Kawaii Mint Glass */}
            <div className="p-4 sm:p-5 text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 border-b-2 border-white/40 shadow-sm relative flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-md">
                  <Handshake className="w-6 h-6 text-white drop-shadow" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-amber-300 border border-white/20 mb-0.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>THƯƠNG VIỆN HOÀNG GIA</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide leading-tight">
                    ĐÀM PHÁN & GIAO DỊCH BẤT ĐỘNG SẢN
                  </h3>
                </div>
              </div>

              <button
                onClick={() => closeTradeModal()}
                className="w-9 h-9 rounded-full bg-white/90 text-slate-600 hover:text-slate-950 flex items-center justify-center cursor-pointer border-2 border-emerald-200 shadow-sm active:scale-95 transition-all"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh chọn đối tác giao dịch */}
            <div className="p-3 bg-emerald-50/80 border-b-2 border-emerald-100 flex items-center gap-3 overflow-x-auto">
              <span className="text-xs text-emerald-950 font-black whitespace-nowrap uppercase tracking-wider pl-1">
                Chọn Đối Tác:
              </span>
              {otherPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPartnerId(p.id);
                    setRequestedTileIds([]);
                    setRequestedMoney(0);
                    setRequestedJailCards(0);
                    setBotFeedback(null);
                    setErrorMessage(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    selectedPartnerId === p.id
                      ? 'bg-amber-400 text-amber-950 border-2 border-amber-300 shadow-md scale-102'
                      : 'bg-white text-slate-700 hover:bg-emerald-100/60 border border-emerald-200'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-emerald-300">
                    <PlayerAvatarDisplay avatar={p.avatar} name={p.name} />
                  </div>
                  <span className="truncate max-w-[100px]">{p.name}</span>
                  {p.isAI ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 text-[9px] font-extrabold border border-sky-300">
                      BOT
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border border-emerald-300">
                      P2P
                    </span>
                  )}
                  <span className="text-[10px] text-amber-700 font-extrabold">${p.money}</span>
                </button>
              ))}
            </div>

            {/* Thông báo phản hồi từ AI BOT khi bị từ chối kèm gợi ý điều chỉnh */}
            {botFeedback && botFeedback.status === 'REJECTED' && (
              <div className="p-3.5 mx-4 mt-3 rounded-2xl bg-rose-50/95 border-2 border-rose-200 text-rose-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-rose-200/80 flex items-center justify-center shrink-0 border border-rose-300">
                    <Bot className="w-5 h-5 text-rose-700" />
                  </div>
                  <div className="text-xs">
                    <div className="font-black uppercase tracking-wide text-rose-900 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>{partner.name} TỪ CHỐI ĐỀ XUẤT</span>
                    </div>
                    <p className="mt-0.5 text-rose-800 font-bold">{botFeedback.reason}</p>
                  </div>
                </div>

                {botFeedback.suggestedCashExtra && botFeedback.suggestedCashExtra > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const additional = botFeedback.suggestedCashExtra || 50;
                      setOfferedMoney((prev) => Math.min(currentPlayer.money, prev + additional));
                      setBotFeedback(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer active:scale-95 transition-all border border-amber-300 self-end sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cộng +${botFeedback.suggestedCashExtra} vào đề xuất</span>
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 mx-4 mt-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 flex items-center gap-2.5 text-xs animate-in fade-in font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2 Cột Đàm Phán (BẠN ĐƯA RA vs BẠN YÊU CẦU) */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
              
              {/* CỘT 1: BẠN ĐƯA RA (YOU OFFER) */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                      BẠN ĐƯA RA (YOU OFFER)
                    </span>
                  </div>
                  <span className="text-xs text-amber-900 font-extrabold">
                    Ví: <b className="text-amber-600">${currentPlayer.money}</b>
                  </span>
                </div>

                {/* 1. Tiền mặt đưa ra */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center justify-between">
                    <span>Tiền mặt các thêm:</span>
                    <span className="text-emerald-700 font-extrabold">${offeredMoney}</span>
                  </label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-amber-200 shadow-xs focus-within:border-amber-400">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.money}
                      value={offeredMoney}
                      onChange={(e) => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setOfferedMoney(
                          Math.min(currentPlayer.money, Math.max(0, parseInt(e.target.value) || 0))
                        );
                      }}
                      className="bg-transparent text-sm font-black text-emerald-700 w-full outline-none"
                      placeholder="0"
                    />
                  </div>
                  {/* Quick Money Chips */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setBotFeedback(null);
                          setErrorMessage(null);
                          setOfferedMoney((prev) => Math.min(currentPlayer.money, prev + amt));
                        }}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-[10px] font-extrabold cursor-pointer active:scale-95 border border-amber-200 shadow-2xs"
                      >
                        +${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setOfferedMoney(currentPlayer.money);
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-400/80 hover:bg-amber-400 text-amber-950 text-[10px] font-extrabold cursor-pointer active:scale-95 ml-auto border border-amber-300 shadow-2xs"
                    >
                      Tất cả (${currentPlayer.money})
                    </button>
                  </div>
                </div>

                {/* 2. Thẻ Miễn Đi Tù đưa ra */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/90 border-2 border-purple-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-black text-purple-950">
                      Thẻ Miễn Đi Tù ({currentPlayer.getOutOfJailFreeCards || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={offeredJailCards <= 0}
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setOfferedJailCards((prev) => Math.max(0, prev - 1));
                      }}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-purple-100 disabled:opacity-30 text-purple-900 border border-purple-200 flex items-center justify-center font-black cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-purple-950 w-4 text-center">
                      {offeredJailCards}
                    </span>
                    <button
                      type="button"
                      disabled={offeredJailCards >= (currentPlayer.getOutOfJailFreeCards || 0)}
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setOfferedJailCards((prev) =>
                          Math.min(currentPlayer.getOutOfJailFreeCards || 0, prev + 1)
                        );
                      }}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-purple-100 disabled:opacity-30 text-purple-900 border border-purple-200 flex items-center justify-center font-black cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 3. Bất động sản của bạn */}
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <span className="text-[11px] text-amber-950 block font-black uppercase tracking-wider">
                    Bất động sản của bạn ({myProperties.length}):
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 flex-1">
                    {myProperties.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">Bạn chưa sở hữu bất động sản nào</p>
                    ) : (
                      myProperties.map((t) => {
                        const isChecked = offeredTileIds.includes(t.id);
                        const tradeCheck = canTradeProperty(t, board);
                        const tileColor = getTileColor(t);

                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={!tradeCheck.canTrade}
                            onClick={() => toggleOfferTile(t.id)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border-2 ${
                              !tradeCheck.canTrade
                                ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                                : isChecked
                                ? 'bg-amber-200/90 border-amber-400 text-amber-950 shadow-xs'
                                : 'bg-white border-amber-100 hover:border-amber-300 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: tileColor }}
                              />
                              <span className="truncate font-black">{t.name}</span>
                              {t.isMortgaged && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black border border-rose-300">
                                  Thế chấp
                                </span>
                              )}
                              {!tradeCheck.canTrade && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                  Có nhà
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-amber-700 font-extrabold shrink-0 pl-2">
                              ${t.price}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* CỘT 2: BẠN YÊU CẦU (YOU REQUEST) */}
              <div className="bg-sky-50/70 p-4 rounded-2xl border-2 border-sky-200/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b-2 border-sky-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sky-400 shadow-xs" />
                    <span className="text-xs font-black uppercase tracking-wider text-sky-950">
                      BẠN YÊU CẦU TỪ {partner.name.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-sky-900 font-extrabold">
                    Ví: <b className="text-sky-600">${partner.money}</b>
                  </span>
                </div>

                {/* 1. Tiền mặt yêu cầu */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-sky-950 flex items-center justify-between">
                    <span>Tiền mặt yêu cầu:</span>
                    <span className="text-emerald-700 font-extrabold">${requestedMoney}</span>
                  </label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-sky-200 shadow-xs focus-within:border-sky-400">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      max={partner.money}
                      value={requestedMoney}
                      onChange={(e) => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setRequestedMoney(
                          Math.min(partner.money, Math.max(0, parseInt(e.target.value) || 0))
                        );
                      }}
                      className="bg-transparent text-sm font-black text-emerald-700 w-full outline-none"
                      placeholder="0"
                    />
                  </div>
                  {/* Quick Money Chips */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setBotFeedback(null);
                          setErrorMessage(null);
                          setRequestedMoney((prev) => Math.min(partner.money, prev + amt));
                        }}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-sky-100 text-sky-950 text-[10px] font-extrabold cursor-pointer active:scale-95 border border-sky-200 shadow-2xs"
                      >
                        +${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setRequestedMoney(partner.money);
                      }}
                      className="px-2 py-1 rounded-lg bg-sky-400/80 hover:bg-sky-400 text-sky-950 text-[10px] font-extrabold cursor-pointer active:scale-95 ml-auto border border-sky-300 shadow-2xs"
                    >
                      Tất cả (${partner.money})
                    </button>
                  </div>
                </div>

                {/* 2. Thẻ Miễn Đi Tù yêu cầu */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/90 border-2 border-purple-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-black text-purple-950">
                      Thẻ Miễn Đi Tù ({partner.getOutOfJailFreeCards || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={requestedJailCards <= 0}
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setRequestedJailCards((prev) => Math.max(0, prev - 1));
                      }}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-purple-100 disabled:opacity-30 text-purple-900 border border-purple-200 flex items-center justify-center font-black cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-purple-950 w-4 text-center">
                      {requestedJailCards}
                    </span>
                    <button
                      type="button"
                      disabled={requestedJailCards >= (partner.getOutOfJailFreeCards || 0)}
                      onClick={() => {
                        setBotFeedback(null);
                        setErrorMessage(null);
                        setRequestedJailCards((prev) =>
                          Math.min(partner.getOutOfJailFreeCards || 0, prev + 1)
                        );
                      }}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-purple-100 disabled:opacity-30 text-purple-900 border border-purple-200 flex items-center justify-center font-black cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 3. Bất động sản của đối tác */}
                <div className="space-y-1.5 flex-1 flex flex-col">
                  <span className="text-[11px] text-sky-950 block font-black uppercase tracking-wider">
                    Bất động sản của {partner.name} ({partnerProperties.length}):
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 flex-1">
                    {partnerProperties.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">Đối phương chưa sở hữu bất động sản nào</p>
                    ) : (
                      partnerProperties.map((t) => {
                        const isChecked = requestedTileIds.includes(t.id);
                        const tradeCheck = canTradeProperty(t, board);
                        const tileColor = getTileColor(t);

                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={!tradeCheck.canTrade}
                            onClick={() => toggleRequestTile(t.id)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border-2 ${
                              !tradeCheck.canTrade
                                ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                                : isChecked
                                ? 'bg-sky-200/90 border-sky-400 text-sky-950 shadow-xs'
                                : 'bg-white border-sky-100 hover:border-sky-300 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: tileColor }}
                              />
                              <span className="truncate font-black">{t.name}</span>
                              {t.isMortgaged && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-black border border-rose-300">
                                  Thế chấp
                                </span>
                              )}
                              {!tradeCheck.canTrade && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                  Có nhà
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-sky-700 font-extrabold shrink-0 pl-2">
                              ${t.price}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Xác nhận giao dịch */}
            <div className="p-4 bg-white/95 border-t-2 border-emerald-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => closeTradeModal()}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider border border-slate-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                HỦY BỎ
              </button>

              <button
                type="button"
                disabled={isEvaluating}
                onClick={() => handleSendOffer()}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border-2 border-white ${
                  isEvaluating
                    ? 'opacity-60 bg-amber-500 text-white cursor-wait'
                    : partner.isAI
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  {isEvaluating
                    ? 'BOT ĐANG SUY NGHĨ...'
                    : partner.isAI
                    ? `GỬI ĐỀ XUẤT CHO ${partner.name.toUpperCase()}`
                    : 'XÁC NHẬN GIAO DỊCH'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
