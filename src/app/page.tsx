'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { colyseusClient } from '@/services/colyseusClient';
import {
  TOKENS_CONFIG,
  METAL_FINISHES,
  AVATAR_LIST,
  getTokenConfigById,
  MetalFinish,
} from '@/constants/tokenConfig';
import { PlayerState } from '@/types/game';
import { soundEngine } from '@/utils/audio';
import { PlayerAvatarDisplay } from '@/components/common/PlayerAvatarDisplay';
import {
  Play,
  Bot,
  User,
  Settings,
  Coins,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Users,
  Timer,
  Globe,
  Copy,
  Check,
  LogOut,
  Loader2,
  Sparkles,
  WifiOff,
} from 'lucide-react';

// Tải 3D Token Showcase dynamic
const TokenShowcase3D = dynamic(
  () => import('@/components/3d/TokenShowcase3D').then((m) => m.TokenShowcase3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
          Đang tải ...
        </p>
      </div>
    ),
  }
);

interface PlayerSlotConfig {
  id: string;
  name: string;
  avatar: string;
  tokenId: string;
  hexColor: string;
  isAI: boolean;
  enabled: boolean;
}

export default function LobbyPage() {
  const router = useRouter();
  const initGameWithPlayers = useGameStore((state) => state.initGameWithPlayers);

  // Tab đang kích hoạt ở cột phải: 'customize' | 'solo' | 'online'
  const [activeTab, setActiveTab] = useState<'customize' | 'solo' | 'online'>('customize');

  // Trạng thái Multiplayer Online (Colyseus)
  const isOnline = useGameStore((state) => state.isOnline);
  const mySessionId = useGameStore((state) => state.mySessionId);
  const roomId = useGameStore((state) => state.roomId);
  const onlinePlayers = useGameStore((state) => state.players);
  const turnPhase = useGameStore((state) => state.turnPhase);

  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Kiểm tra tình trạng máy chủ Colyseus (Tự động thích ứng local/tunnel/cloud)
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const isOk = await colyseusClient.checkHealth();
      if (isMounted) {
        setServerOnline(isOk);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Tự động chuyển tới màn hình ván cờ 3D khi Host bấm bắt đầu trận đấu Online (chuyển từ LOBBY sang ROLLING)
  useEffect(() => {
    if (isOnline && roomId && turnPhase && turnPhase !== 'LOBBY') {
      router.push('/game');
    }
  }, [isOnline, roomId, turnPhase, router]);

  // Tự động giữ người chơi ở tab phòng Online khi đã kết nối phòng thành công
  useEffect(() => {
    if (isOnline && roomId) {
      setActiveTab('online');
    }
  }, [isOnline, roomId]);

  // Cấu hình người chơi chính (Slot 1 - Bạn)
  const [playerName, setPlayerName] = useState('Bé Tỷ Phú');
  const [selectedAvatar, setSelectedAvatar] = useState('/images/avatars/char_male_a.jpg');
  const [selectedTokenId, setSelectedTokenId] = useState('char_male_a');
  const [selectedMetalId, setSelectedMetalId] = useState('emerald_green');

  // Cài đặt trận đấu
  const [startingCash, setStartingCash] = useState(1500);
  const [turnDuration, setTurnDuration] = useState(30);

  // Cấu hình các slot đối thủ
  const [opponentSlots, setOpponentSlots] = useState<PlayerSlotConfig[]>([
    {
      id: 'p2',
      name: 'Sophia (AI)',
      avatar: '/images/avatars/char_female_a.jpg',
      tokenId: 'char_female_a',
      hexColor: '#06B6D4',
      isAI: true,
      enabled: true,
    },
    {
      id: 'p3',
      name: 'Alex (AI)',
      avatar: '/images/avatars/char_male_b.jpg',
      tokenId: 'char_male_b',
      hexColor: '#EAB308',
      isAI: true,
      enabled: true,
    },
    {
      id: 'p4',
      name: 'Emma (AI)',
      avatar: '/images/avatars/char_female_b.jpg',
      tokenId: 'char_female_b',
      hexColor: '#F59E0B',
      isAI: true,
      enabled: true,
    },
  ]);

  const selectedToken = getTokenConfigById(selectedTokenId);
  const selectedFinish: MetalFinish =
    METAL_FINISHES.find((m) => m.id === selectedMetalId) || METAL_FINISHES[0];

  // Chuyển nhanh token kế tiếp / trước đó
  const currentTokenIdx = TOKENS_CONFIG.findIndex((t) => t.id === selectedTokenId);
  const handlePrevToken = () => {
    soundEngine.playButtonClick();
    const prevIdx = (currentTokenIdx - 1 + TOKENS_CONFIG.length) % TOKENS_CONFIG.length;
    setSelectedTokenId(TOKENS_CONFIG[prevIdx].id);
  };
  const handleNextToken = () => {
    soundEngine.playButtonClick();
    const nextIdx = (currentTokenIdx + 1) % TOKENS_CONFIG.length;
    setSelectedTokenId(TOKENS_CONFIG[nextIdx].id);
  };

  const handleStartGame = () => {
    soundEngine.playCash();

    // 1. Người chơi 1 (Bạn)
    const p1: PlayerState = {
      id: 'p1',
      name: playerName.trim() || 'Bé Tỷ Phú',
      avatar: selectedAvatar,
      color: 'red',
      hexColor: selectedFinish.hexColor,
      tokenId: selectedTokenId,
      position: 0,
      money: startingCash,
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      isBankrupt: false,
      isAI: false,
    };

    // 2. Các đối thủ được kích hoạt
    const activeOpponents: PlayerState[] = opponentSlots
      .filter((s) => s.enabled)
      .map((s, idx) => ({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        color: idx === 0 ? 'blue' : idx === 1 ? 'yellow' : 'green',
        hexColor: s.hexColor,
        tokenId: s.tokenId,
        position: 0,
        money: startingCash,
        inJail: false,
        jailTurns: 0,
        getOutOfJailFreeCards: 0,
        isBankrupt: false,
        isAI: s.isAI,
      }));

    const allPlayers = [p1, ...activeOpponents];
    initGameWithPlayers(allPlayers, startingCash);

    // Chuyển sang màn hình Bàn cờ 3D
    router.push('/game');
  };

  const toggleSlotAI = (slotId: string) => {
    soundEngine.playButtonClick();
    setOpponentSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isAI: !s.isAI } : s))
    );
  };

  const toggleSlotEnabled = (slotId: string) => {
    soundEngine.playButtonClick();
    setOpponentSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // --- Handlers Multiplayer Online ---
  const handleQuickJoin = async () => {
    soundEngine.playButtonClick();
    setErrorMessage(null);
    setIsJoining(true);
    try {
      await colyseusClient.joinOrCreateRoom({
        name: playerName.trim() || 'Bé Tỷ Phú',
        avatar: selectedAvatar,
        tokenId: selectedTokenId,
      });
      soundEngine.playCash();
      setActiveTab('online');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Không thể kết nối máy chủ (${colyseusClient.getServerWsUrl()}). Vui lòng kiểm tra lại kết nối!`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateCustomRoom = async () => {
    soundEngine.playButtonClick();
    setErrorMessage(null);
    setIsJoining(true);
    try {
      await colyseusClient.createRoom({
        name: playerName.trim() || 'Bé Tỷ Phú',
        avatar: selectedAvatar,
        tokenId: selectedTokenId,
      });
      soundEngine.playCash();
      setActiveTab('online');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Không thể tạo phòng mới. Vui lòng thử lại!');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCodeInput.trim()) return;
    soundEngine.playButtonClick();
    setErrorMessage(null);
    setIsJoining(true);
    try {
      await colyseusClient.joinRoomById(roomCodeInput.trim(), {
        name: playerName.trim() || 'Bé Tỷ Phú',
        avatar: selectedAvatar,
        tokenId: selectedTokenId,
      });
      soundEngine.playCash();
      setActiveTab('online');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Mã phòng không tồn tại hoặc phòng đã đủ người!');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    soundEngine.playButtonClick();
    colyseusClient.leaveRoom();
  };

  const handleAddBot = () => {
    soundEngine.playButtonClick();
    colyseusClient.addAiBot();
  };

  const handleStartOnlineMatch = () => {
    soundEngine.playCash();
    colyseusClient.startOnlineGame();
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopiedRoomCode(true);
      setTimeout(() => setCopiedRoomCode(false), 2000);
    }
  };

  const isHost = onlinePlayers.length > 0 && onlinePlayers[0].id === mySessionId;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50/80 to-sky-50 text-slate-800 flex flex-col justify-between overflow-y-auto overflow-x-hidden p-4 md:p-6 select-none font-sans">
      {/* 🍃 BẦU KHÔNG KHÍ XANH MINT PASTEL */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-4 -left-20 w-[450px] h-[450px] bg-emerald-200/35 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-[550px] h-[550px] bg-sky-200/35 rounded-full blur-3xl" />
      </div>

      {/* 1. HEADER SẢNH CHỜ MINT PASTEL VỚI LOGO ĐỒ HỌA SẮC NÉT */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-200/70">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-3xl bg-white/95 p-1.5 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.25)] border-2 border-emerald-300 transform rotate-[-3deg] hover:rotate-0 transition-transform">
            <Image
              src="/images/ui/logo.png"
              alt="Monopoly 3D City"
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                MONOPOLY 3D CITY
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
                SẢNH CHỜ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Tùy chỉnh linh vật 3D, chọn màu mạ kim loại và cùng so tài bất động sản!
            </p>
          </div>
        </div>

        {/* Thẻ tiền khởi đầu phong cách Mint Glass */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 border-2 border-emerald-200 shadow-sm text-xs font-extrabold text-slate-700">
            <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>Tiền khởi đầu:</span>
            <span className="text-emerald-600 font-black text-sm">${startingCash.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* 2. KHU VỰC CHÍNH: BỐ CỤC 2 CỘT SPLIT HERO (60% SÂN KHẤU 3D + 40% BẢNG ĐIỀU KHIỂN PHÂN TAB) */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-stretch">

        {/* ======================================================== */}
        {/* CỘT TRÁI (60% - 7 CỘT): SÂN KHẤU 3D HERO SHOWCASE TO LỚN */}
        {/* ======================================================== */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full flex-1 min-h-[440px] md:min-h-[520px] mint-glass p-4 rounded-3xl relative flex flex-col justify-between overflow-hidden border-2 border-emerald-200/90 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)] bg-gradient-to-b from-white/95 via-emerald-50/50 to-teal-50/60">

            {/* Header thông tin Linh vật trên sân khấu */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 border-2 border-emerald-200 backdrop-blur-md shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-emerald-800">
                      {selectedToken.name}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                      {selectedFinish.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-extrabold">
                    {selectedToken.tagline}
                  </p>
                </div>
              </div>

              {/* Nút chuyển trước / sau & Badge xoay 360 */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white/95 border-2 border-emerald-200 rounded-2xl p-1 shadow-xs">
                  <button
                    onClick={handlePrevToken}
                    className="p-1.5 rounded-xl hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                    title="Linh vật trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-black text-slate-600 px-1">
                    {currentTokenIdx + 1}/{TOKENS_CONFIG.length}
                  </span>
                  <button
                    onClick={handleNextToken}
                    className="p-1.5 rounded-xl hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                    title="Linh vật tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-white/95 border-2 border-emerald-200 text-[11px] font-black text-emerald-700 flex items-center gap-1.5 shadow-xs">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="hidden sm:inline">XOAY 360°</span>
                </div>
              </div>
            </div>

            {/* Khu vực 3D Canvas xoay */}
            <div className="absolute inset-0 z-0">
              <TokenShowcase3D token={selectedToken} metalFinish={selectedFinish} />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CỘT PHẢI (40% - 5 CỘT): BẢNG ĐIỀU KHIỂN TÙY CHỌN PHÂN TAB */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 flex flex-col gap-4 justify-between">
          <div className="mint-glass p-5 flex flex-col gap-4 flex-1">

            {/* 1. THANH CHUYỂN TAB (TAB SELECTOR) */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-emerald-100/70 border-2 border-emerald-200">
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('customize');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'customize'
                  ? 'bg-white text-emerald-800 shadow-sm border-2 border-emerald-300 scale-[1.02]'
                  : 'text-slate-600 hover:text-emerald-700'
                  }`}
              >
                <Palette className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">1. Nhân Vật</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('solo');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'solo'
                  ? 'bg-white text-emerald-800 shadow-sm border-2 border-emerald-300 scale-[1.02]'
                  : 'text-slate-600 hover:text-emerald-700'
                  }`}
              >
                <Bot className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">2. Đấu AI</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('online');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${activeTab === 'online'
                  ? 'bg-white text-emerald-800 shadow-sm border-2 border-emerald-300 scale-[1.02]'
                  : 'text-slate-600 hover:text-emerald-700'
                  }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">3. Online</span>
                {serverOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 animate-pulse" />
                )}
              </button>
            </div>

            {/* 2. NỘI DUNG TAB 1: TÙY CHỈNH LINH VẬT & MÀU SẮC */}
            {activeTab === 'customize' && (
              <div className="space-y-3.5 overflow-y-auto pr-1.5 custom-scrollbar max-h-[58vh] lg:max-h-[490px]">
                {/* A. Nhập Tên & Chọn Bộ 5 Avatar Anime Kawaii Pastel */}
                <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    Chọn ảnh đại diện
                  </label>

                  {/* Nhập tên */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-13 h-13 rounded-2xl overflow-hidden shadow-inner bg-white border-2 shrink-0 p-0.5"
                      style={{ borderColor: selectedFinish.hexColor }}
                    >
                      <PlayerAvatarDisplay avatar={selectedAvatar} name={playerName} />
                    </div>

                    <input
                      type="text"
                      value={playerName}
                      maxLength={18}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nhập tên tỷ phú..."
                      className="flex-1 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>

                  {/* Bảng 5 Avatar Nhân Vật Anime Độc Quyền (Tối đa 5 avatar theo yêu cầu) */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                      Chọn 1 trong 5 nhân vật đại diện:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATAR_LIST.map((av) => {
                        const isSelected = selectedAvatar === av.imagePath;
                        return (
                          <button
                            key={av.id}
                            onClick={() => {
                              soundEngine.playButtonClick();
                              setSelectedAvatar(av.imagePath);
                            }}
                            className={`p-1.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all border-2 ${isSelected
                              ? 'border-emerald-500 bg-emerald-100/80 shadow-md scale-105 ring-2 ring-emerald-300'
                              : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/70'
                              }`}
                            title={`${av.name} - ${av.role}`}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs border border-white">
                              <Image
                                src={av.imagePath}
                                alt={av.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-700 truncate w-full text-center">
                              {av.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* B. Chọn 1 trong 8 Linh vật 3D (Ảnh 3D Render sắc nét, không dùng emoji) */}
                <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    Chọn Quân Cờ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOKENS_CONFIG.map((token) => {
                      const isSelected = selectedTokenId === token.id;
                      return (
                        <button
                          key={token.id}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setSelectedTokenId(token.id);
                          }}
                          className={`p-2.5 rounded-2xl flex items-center gap-2.5 cursor-pointer transition-all border-2 text-left ${isSelected
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-md scale-[1.02]'
                            : 'bg-emerald-50/40 text-slate-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                        >
                          {/* <div className="w-9 h-9 rounded-xl bg-white/90 p-1 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-xs">
                            <Image
                              src={token.imagePath}
                              alt={token.name}
                              width={32}
                              height={32}
                              unoptimized
                              className="w-full h-full object-contain drop-shadow-xs rounded-full"
                            />
                          </div> */}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-black block truncate">
                              {token.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold block truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'
                                }`}
                            >
                              {token.tagline}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* C. 8 Màu Mạ Kim Loại PBR */}
                <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    Chọn màu sắc
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {METAL_FINISHES.map((finish) => {
                      const isSelected = selectedMetalId === finish.id;
                      return (
                        <button
                          key={finish.id}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setSelectedMetalId(finish.id);
                          }}
                          className={`p-2 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer border-2 transition-all ${isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105'
                            : 'border-emerald-100 bg-white hover:border-emerald-300'
                            }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full shadow-inner border-2 border-white"
                            style={{ backgroundColor: finish.hexColor }}
                          />
                          <span className="text-[10px] font-black text-slate-700 truncate w-full text-center">
                            {finish.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. NỘI DUNG TAB 2: ĐẤU VỚI BOT AI (OFFLINE) */}
            {activeTab === 'solo' && (
              <div className="space-y-3.5 overflow-y-auto pr-1.5 custom-scrollbar max-h-[58vh] lg:max-h-[490px]">
                {/* A. Danh sách 4 Slot Người chơi */}
                <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" /> Danh Sách Người Chơi
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {1 + opponentSlots.filter((s) => s.enabled).length}/4 Sẵn Sàng
                    </span>
                  </div>

                  {/* Slot 1: BẠN */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border-2 border-emerald-300 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm bg-white border-2 shrink-0 p-0.5"
                        style={{ borderColor: selectedFinish.hexColor }}
                      >
                        <PlayerAvatarDisplay avatar={selectedAvatar} name={playerName} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
                            {playerName || 'Bé Tỷ Phú'}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500 text-white font-black rounded-full uppercase">
                            BẠN
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 mt-0.5">
                          <Image
                            src={selectedToken.imagePath}
                            alt={selectedToken.name}
                            width={14}
                            height={14}
                            unoptimized
                            className="w-3.5 h-3.5 object-contain"
                          />
                          {selectedToken.name}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  </div>

                  {/* Slot 2, 3, 4: Đối thủ */}
                  {opponentSlots.map((slot, index) => {
                    const tokenInfo = getTokenConfigById(slot.tokenId);

                    return (
                      <div
                        key={slot.id}
                        className={`p-2.5 rounded-2xl transition-all border-2 ${slot.enabled
                          ? 'bg-white border-emerald-100 shadow-xs hover:border-emerald-300'
                          : 'bg-slate-100/70 border-slate-200 opacity-60'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-2xl overflow-hidden shadow-inner bg-white border-2 shrink-0 p-0.5"
                              style={{ borderColor: slot.hexColor }}
                            >
                              <PlayerAvatarDisplay avatar={slot.avatar} name={slot.name} />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-slate-800 block">
                                {slot.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <Image
                                  src={tokenInfo.imagePath}
                                  alt={tokenInfo.name}
                                  width={12}
                                  height={12}
                                  unoptimized
                                  className="w-3 h-3 object-contain"
                                />
                                {tokenInfo.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Nút Đổi Chế độ AI / Người */}
                            <button
                              onClick={() => toggleSlotAI(slot.id)}
                              title={slot.isAI ? 'Đang là BOT AI' : 'Đang là Người Chơi'}
                              className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-xs ${slot.isAI
                                ? 'bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
                                }`}
                            >
                              {slot.isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </button>

                            {/* Bật / Tắt slot */}
                            <button
                              onClick={() => toggleSlotEnabled(slot.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer border transition-all ${slot.enabled
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-500 border-slate-300'
                                }`}
                            >
                              {slot.enabled ? `Slot ${index + 2}` : 'Tắt'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* B. Cài đặt Tiền mặt & Thời gian */}
                <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-emerald-600" /> Quy Tắc Ván Đấu
                  </h3>

                  {/* Tiền mặt khởi đầu */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                      Tiền mặt khởi đầu
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[1500, 2000, 2500].map((cash) => (
                        <button
                          key={cash}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setStartingCash(cash);
                          }}
                          className={`py-2 rounded-2xl text-xs font-black cursor-pointer border-2 transition-all ${startingCash === cash
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-600 border-emerald-100 hover:border-emerald-300'
                            }`}
                        >
                          ${cash}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thời gian mỗi lượt */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Timer className="w-3 h-3 text-emerald-600" /> Thời gian mỗi lượt đi
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[20, 30, 45].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setTurnDuration(sec);
                          }}
                          className={`py-2 rounded-2xl text-xs font-black cursor-pointer border-2 transition-all ${turnDuration === sec
                            ? 'bg-teal-500 text-white border-teal-600 shadow-sm scale-105'
                            : 'bg-white text-slate-600 border-emerald-100 hover:border-emerald-300'
                            }`}
                        >
                          {sec} giây
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NỘI DUNG TAB 3: MULTIPLAYER ONLINE (COLYSEUS) */}
            {activeTab === 'online' && (
              <div className="space-y-3.5 overflow-y-auto pr-1.5 custom-scrollbar max-h-[58vh] lg:max-h-[490px]">
                {/* A. Thẻ kiểm tra trạng thái máy chủ */}
                <div className="p-3 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {serverOnline === null ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : serverOnline ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                        Máy Chủ Trực Tuyến
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {serverOnline === null
                          ? 'Đang kiểm tra kết nối...'
                          : serverOnline
                          ? `🟢 Trực tuyến (${colyseusClient.getServerWsUrl()})`
                          : `🔴 Chưa thể kết nối (${colyseusClient.getServerWsUrl()})`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                    ANTI-CHEAT
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="text-red-500 hover:text-red-800 font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* B. Chưa vào phòng: Chọn Vào nhanh hoặc Nhập mã phòng */}
                {!isOnline || !roomId ? (
                  <div className="space-y-3">
                    {/* Thẻ hiển thị nhân vật đang chọn */}
                    <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl overflow-hidden shadow-sm bg-white border-2 shrink-0 p-0.5"
                          style={{ borderColor: selectedFinish.hexColor }}
                        >
                          <PlayerAvatarDisplay avatar={selectedAvatar} name={playerName} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate max-w-[130px]">
                              {playerName || 'Bé Tỷ Phú'}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded-full uppercase">
                              BẠN
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 mt-0.5">
                            {selectedToken.name} • {selectedFinish.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('customize')}
                        className="px-2.5 py-1 text-[10px] font-black uppercase rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Đổi
                      </button>
                    </div>

                    {/* Nút Vào Phòng Nhanh (Quick Play) */}
                    <button
                      onClick={handleQuickJoin}
                      disabled={isJoining || serverOnline === false}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Đang kết nối phòng...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <span>⚡ Vào / Tạo Phòng Nhanh (Quick Play)</span>
                        </>
                      )}
                    </button>

                    {/* Tạo phòng riêng hoặc nhập mã phòng */}
                    <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Hoặc tham gia bằng Mã Phòng
                        </span>
                        <button
                          onClick={handleCreateCustomRoom}
                          disabled={isJoining || serverOnline === false}
                          className="text-[10px] font-black uppercase text-teal-700 hover:text-teal-900 underline cursor-pointer"
                        >
                          + Tạo phòng mới
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={roomCodeInput}
                          onChange={(e) => setRoomCodeInput(e.target.value)}
                          placeholder="Nhập mã phòng (VD: d3k92...)"
                          className="flex-1 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleJoinByCode}
                          disabled={!roomCodeInput.trim() || isJoining || serverOnline === false}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Vào
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* C. ĐÃ VÀO PHÒNG: HIỂN THỊ SẢNH CHỜ PHÒNG MULTIPLAYER */
                  <div className="space-y-3">
                    {/* Header thông tin phòng */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-widest uppercase text-emerald-200">
                            PHÒNG CHƠI ONLINE
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-black">
                            {onlinePlayers.length}/4
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm font-black tracking-wider text-amber-300">
                            #{roomId}
                          </span>
                          <button
                            onClick={handleCopyRoomId}
                            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                            title="Sao chép mã phòng"
                          >
                            {copiedRoomCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {copiedRoomCode && (
                            <span className="text-[10px] font-bold text-emerald-200">
                              Đã chép!
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleLeaveRoom}
                        className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                        title="Rời phòng"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline text-[10px] uppercase">Rời</span>
                      </button>
                    </div>

                    {/* Danh sách các người chơi trong phòng */}
                    <div className="p-3.5 rounded-2xl bg-white/90 border-2 border-emerald-100 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                          Thành Viên Trong Phòng ({onlinePlayers.length}/4)
                        </span>
                        {isHost && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black uppercase">
                            👑 Bạn là Chủ Phòng
                          </span>
                        )}
                      </div>

                      {/* Hiển thị từng người chơi */}
                      {onlinePlayers.map((p, idx) => {
                        const isMe = p.id === mySessionId;
                        const isPlayerHost = idx === 0;

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                              isMe
                                ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                                : 'bg-white border-emerald-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-9 h-9 rounded-2xl overflow-hidden shadow-inner bg-white border-2 shrink-0 p-0.5"
                                style={{ borderColor: p.hexColor || '#10B981' }}
                              >
                                <PlayerAvatarDisplay avatar={p.avatar} name={p.name} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">
                                    {p.name}
                                  </span>
                                  {isMe && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black uppercase">
                                      BẠN
                                    </span>
                                  )}
                                  {isPlayerHost && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 font-black uppercase">
                                      👑 HOST
                                    </span>
                                  )}
                                  {p.isAI && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 font-black uppercase">
                                      BOT
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold">
                                  {p.tokenId || 'Token'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">
                              ✓ Sẵn sàng
                            </span>
                          </div>
                        );
                      })}

                      {/* Ghế trống */}
                      {Array.from({ length: Math.max(0, 4 - onlinePlayers.length) }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="p-2.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-slate-400 text-xs font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                              🪑
                            </div>
                            <span>Ghế trống {onlinePlayers.length + i + 1}</span>
                          </div>
                          {isHost && (
                            <button
                              onClick={handleAddBot}
                              className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                            >
                              + Thêm Bot
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Nút hành động phòng */}
                    {isHost ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleStartOnlineMatch}
                          disabled={onlinePlayers.length < 2}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(245,158,11,0.35)] hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <Play className="w-5 h-5 fill-slate-950" />
                          <span>🚀 BẮT ĐẦU VÁN ĐẤU ONLINE</span>
                        </button>
                        {onlinePlayers.length < 2 && (
                          <p className="text-[11px] text-center text-slate-500 font-bold">
                            ⚠️ Cần ít nhất 2 người chơi hoặc thêm Bot AI để bắt đầu
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-800 text-center">
                        <p className="text-xs font-black animate-pulse">
                          ⏳ Đang đợi Chủ Phòng ({onlinePlayers[0]?.name || 'Host'}) bấm bắt đầu ván đấu...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. NÚT ĐIỀU HƯỚNG DƯỚI CÙNG PHÙ HỢP VỚI TỪNG CHẾ ĐỘ */}
          {activeTab === 'customize' && (
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('solo');
              }}
              className="btn-kawaii-jelly-mint w-full py-4 text-sm md:text-base font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(16,185,129,0.45)] cursor-pointer active:scale-95"
            >
              <span>TIẾP THEO: CHỌN CHẾ ĐỘ CHƠI</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {activeTab === 'solo' && (
            <button
              onClick={handleStartGame}
              className="btn-kawaii-jelly-mint w-full py-4.5 text-base md:text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_12px_35px_rgba(16,185,129,0.45)] cursor-pointer active:scale-95"
            >
              <Play className="w-6 h-6 fill-white text-white" />
              <span className="tracking-widest drop-shadow-md">BẮT ĐẦU VÁN ĐẤU (SOLO AI)</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
