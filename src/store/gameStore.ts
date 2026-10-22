import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { GameState, PlayerState, GameLog, TileData } from '../types/game';
import { INITIAL_BOARD_DATA } from '../constants/boardData';
import { GAME_CONFIG, TURN_TIMER_CONFIG } from '../constants/gameConfig';
import { dispatchTileEvent } from '../logic/handlers/tileDispatcher';
import { reshuffleAllDecks } from '../logic/handlers/cardHandler';
import { canUpgradeProperty, canSellHouse } from '../logic/handlers/propertyHandler';
import {
  createAuction,
  placeBid as placeBidHandler,
  foldAuction as foldAuctionHandler,
  getAiBidDecision,
} from '../logic/handlers/auctionHandler';
import {
  validateTrade,
  executeTrade as executeTradeEngine,
  TradeOffer,
} from '../logic/handlers/tradeHandler';
import { rollDiceValues } from '../utils/random';
import { soundEngine } from '../utils/audio';

const INITIAL_PLAYERS: PlayerState[] = [
  {
    id: 'p1',
    name: 'Tỷ Phú 1',
    avatar: '🤵',
    color: 'red',
    hexColor: '#EF4444',
    tokenId: 'char_male_a',
    position: 0,
    money: GAME_CONFIG.STARTING_MONEY,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    isBankrupt: false,
    isAI: false,
  },
  {
    id: 'p2',
    name: 'Tỷ Phú 2 (AI)',
    avatar: '👩‍💼',
    color: 'blue',
    hexColor: '#06B6D4',
    tokenId: 'char_female_a',
    position: 0,
    money: GAME_CONFIG.STARTING_MONEY,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    isBankrupt: false,
    isAI: true,
  },
  {
    id: 'p3',
    name: 'Tỷ Phú 3 (AI)',
    avatar: '🧑‍💻',
    color: 'yellow',
    hexColor: '#EAB308',
    tokenId: 'char_male_b',
    position: 0,
    money: GAME_CONFIG.STARTING_MONEY,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    isBankrupt: false,
    isAI: true,
  },
  {
    id: 'p4',
    name: 'Tỷ Phú 4 (AI)',
    avatar: '👸',
    color: 'green',
    hexColor: '#10B981',
    tokenId: 'char_female_b',
    position: 0,
    money: GAME_CONFIG.STARTING_MONEY,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    isBankrupt: false,
    isAI: true,
  },
];

export interface ColyseusDispatcher {
  rollDice: () => void;
  buyProperty: () => void;
  declineProperty: () => void;
  bidAuction: (amount?: number) => void;
  foldAuction: () => void;
  upgradeProperty: (tileId: number) => void;
  sellHouse: (tileId: number) => void;
  mortgageProperty: (tileId: number) => void;
  unmortgageProperty: (tileId: number) => void;
  confirmRent: () => void;
  confirmTax: () => void;
  confirmCard: () => void;
  payJailBail: () => void;
  useJailCard: () => void;
  endTurn: () => void;
}

let colyseusDispatcher: ColyseusDispatcher | null = null;
let isOnlineMoveAnimating = false;
let pendingOnlineSyncState: any = null;

export function registerColyseusDispatcher(dispatcher: ColyseusDispatcher | null) {
  colyseusDispatcher = dispatcher;
}

interface GameActions {
  rollDice: () => void;
  movePlayerSteps: (steps: number, onComplete?: () => void) => void;
  finishMoving: () => void;
  buyProperty: (tileId?: number) => void;
  skipBuyProperty: () => void;
  upgradeProperty: (tileId: number) => void;
  startAuction: (tileId: number) => void;
  placeBid: (bidAmount: number, playerId?: string) => void;
  foldAuction: (playerId?: string) => void;
  finishAuction: () => void;
  runAiAuctionTurn: () => void;
  executeTradeAction: (offer: TradeOffer) => { success: boolean; reason?: string };
  mortgageProperty: (tileId: number) => void;
  unmortgageProperty: (tileId: number) => void;
  sellHouse: (tileId: number) => void;
  payPendingDebt: () => void;
  declareBankruptcy: () => void;
  payJailBail: () => void;
  tryRollForJailEscape: () => void;
  consumeJailCard: () => void;
  endTurn: () => void;
  closeModal: () => void;
  selectTile: (tileId: number | null) => void;
  addLog: (message: string, type?: GameLog['type'], playerId?: string) => void;
  resetGame: () => void;
  updatePlayer: (id: string, updates: Partial<PlayerState>) => void;
  setPlayers: (players: PlayerState[]) => void;
  initGameWithPlayers: (players: PlayerState[], startingMoney?: number) => void;
  tickTimer: () => void;
  resetTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setOnlineMode: (isOnline: boolean, mySessionId?: string, roomId?: string) => void;
  syncFromServer: (serverState: any) => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  players: INITIAL_PLAYERS,
  board: JSON.parse(JSON.stringify(INITIAL_BOARD_DATA)),
  currentTurnIndex: 0,
  turnPhase: 'ROLLING',
  dice: {
    dice1: 1,
    dice2: 1,
    isRolling: false,
    doublesCount: 0,
  },
  logs: [
    {
      id: 'log_0',
      timestamp: Date.now(),
      message: 'Trò chơi Cờ Tỷ Phú 3D bắt đầu! Chúc các tỷ phú may mắn.',
      type: 'info',
    },
  ],
  selectedTileId: null,
  activeModal: null,
  activeCardData: null,
  pendingRentInfo: null,
  pendingDebt: null,
  auction: null,
  bankHouses: GAME_CONFIG.TOTAL_BANK_HOUSES,
  bankHotels: GAME_CONFIG.TOTAL_BANK_HOTELS,
  turnTimer: {
    timeLeft: TURN_TIMER_CONFIG.ROLLING,
    maxTime: TURN_TIMER_CONFIG.ROLLING,
    isRunning: true,
  },
  isOnline: false,
  mySessionId: null,
  roomId: null,

  tickTimer: () => {
    const { turnTimer, turnPhase, activeModal, dice, isOnline } = get();
    if (!turnTimer.isRunning) return;

    if (turnTimer.timeLeft <= 1) {
      // 🔒 Khi chơi Online: Colyseus Server làm trọng tài duy nhất quản lý timeout!
      // Client chỉ dừng đếm ngược trên HUD, tuyệt đối KHÔNG tự động dispatch rollDice / endTurn cục bộ.
      if (isOnline) {
        set({
          turnTimer: {
            ...turnTimer,
            timeLeft: 0,
            isRunning: false,
          },
        });
        return;
      }

      // Hết giờ tự động xử lý theo giai đoạn (Chế độ chơi Đơn Offline)
      if (activeModal === 'DEBT_SETTLEMENT') {
        const { pendingDebt, players } = get();
        if (pendingDebt) {
          const debtor = players.find((p) => p.id === pendingDebt.debtorId);
          if (debtor && debtor.money >= pendingDebt.amount) {
            get().payPendingDebt();
          } else {
            get().declareBankruptcy();
          }
        }
        return;
      } else if (turnPhase === 'ROLLING') {
        if (!dice.isRolling) {
          get().rollDice();
        }
      } else if (turnPhase === 'TILE_ACTION') {
        if (activeModal === 'BUY_PROPERTY') {
          get().skipBuyProperty();
        } else if (activeModal === 'RENT_PAID' || activeModal === 'CARD_DRAW') {
          get().closeModal();
        }
      } else if (turnPhase === 'AUCTION' || activeModal === 'AUCTION') {
        get().finishAuction();
      } else if (activeModal === 'JAIL_CHOICE') {
        get().tryRollForJailEscape();
      } else if (turnPhase === 'TURN_END') {
        if (dice.doublesCount > 0) {
          get().rollDice();
        } else {
          get().endTurn();
        }
      }
      return;
    }

    set({
      turnTimer: {
        ...turnTimer,
        timeLeft: turnTimer.timeLeft - 1,
      },
    });
  },

  resetTimer: (seconds: number) => {
    set({
      turnTimer: {
        timeLeft: seconds,
        maxTime: seconds,
        isRunning: true,
      },
    });
  },

  pauseTimer: () => {
    set((state) => ({
      turnTimer: {
        ...state.turnTimer,
        isRunning: false,
      },
    }));
  },

  resumeTimer: () => {
    set((state) => ({
      turnTimer: {
        ...state.turnTimer,
        isRunning: true,
      },
    }));
  },

  setOnlineMode: (isOnline: boolean, mySessionId?: string, roomId?: string) => {
    isOnlineMoveAnimating = false;
    pendingOnlineSyncState = null;
    set({
      isOnline,
      mySessionId: mySessionId || null,
      roomId: roomId || null,
      turnPhase: isOnline ? 'LOBBY' : 'ROLLING',
    });
  },

  syncFromServer: (serverState: any) => {
    if (!serverState) return;

    // Nếu đang diễn hoạt đổ xúc xắc & nhảy quân cờ, hoãn state mới vào hàng đợi
    if (isOnlineMoveAnimating) {
      pendingOnlineSyncState = serverState;
      return;
    }

    const rawPlayers = Array.from(serverState.players || []);
    const players: PlayerState[] = rawPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      hexColor: p.hexColor,
      tokenId: p.tokenId,
      position: p.position,
      money: p.money,
      inJail: p.inJail,
      jailTurns: p.jailTurns,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards,
      isBankrupt: p.isBankrupt,
      isAI: p.isAI,
    }));

    const rawBoard = Array.from(serverState.board || []);
    const board: TileData[] = rawBoard.map((t: any) => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      type: t.type,
      colorGroup: t.colorGroup || undefined,
      price: t.price || undefined,
      houseCost: t.houseCost || undefined,
      rent: Array.from(t.rent || []).map(Number),
      mortgageValue: t.mortgageValue || undefined,
      ownerId: t.ownerId || null,
      houses: t.houses || 0,
      isMortgaged: !!t.isMortgaged,
    }));

    const rawLogs = Array.from(serverState.logs || []);
    const logs: GameLog[] = rawLogs.map((l: any) => ({
      id: l.id,
      timestamp: l.timestamp,
      message: l.message,
      type: l.type,
      playerId: l.playerId || undefined,
    }));

    const auction = serverState.auction?.isActive ? {
      tileId: serverState.auction.tileId,
      currentBid: serverState.auction.currentBid,
      highestBidderId: serverState.auction.highestBidderId || null,
      activeBidderIds: Array.from(serverState.auction.activeBidderIds || []).map(String),
      minIncrement: serverState.auction.minIncrement || 10,
      history: [],
    } : null;

    const activeCardData = serverState.activeCard?.title ? {
      title: serverState.activeCard.title,
      description: serverState.activeCard.description,
      type: serverState.activeCard.type,
      actionType: serverState.activeCard.actionType,
      rewardOrPenalty: serverState.activeCard.rewardOrPenalty,
      targetPosition: serverState.activeCard.targetPosition,
      sendToJail: serverState.activeCard.sendToJail,
    } : null;

    const pendingRentInfo = serverState.pendingRent?.amount > 0 ? {
      tenantId: serverState.pendingRent.tenantId,
      landlordId: serverState.pendingRent.landlordId,
      amount: serverState.pendingRent.amount,
      tileName: serverState.pendingRent.tileName,
    } : null;

    const prevDice = get().dice;
    const activeIndex = serverState.currentTurnIndex ?? get().currentTurnIndex;
    const currentLocalPlayer = get().players[activeIndex];
    const targetServerPlayer = players[activeIndex];

    const hasNewDiceRoll =
      serverState.dice &&
      serverState.dice.dice1 > 0 &&
      serverState.dice.dice2 > 0 &&
      (serverState.dice.dice1 !== prevDice.dice1 ||
       serverState.dice.dice2 !== prevDice.dice2 ||
       serverState.dice.doublesCount !== prevDice.doublesCount);

    const hasPositionChanged =
      !!(currentLocalPlayer &&
      targetServerPlayer &&
      currentLocalPlayer.position !== targetServerPlayer.position);

    const isMoveEvent =
      hasPositionChanged &&
      (hasNewDiceRoll || get().turnPhase === 'ROLLING' || get().turnPhase === 'TURN_END' || serverState.turnPhase === 'TILE_ACTION' || serverState.turnPhase === 'MOVING');

    // 🎲 CHOREOGRAPHY PIPELINE: Khi vừa có sự kiện đổ xúc xắc và di chuyển trong trận đấu Online
    if (get().isOnline && isMoveEvent && !isOnlineMoveAnimating) {
      isOnlineMoveAnimating = true;
      const oldPos = currentLocalPlayer.position;
      const newPos = targetServerPlayer.position;
      let steps = (newPos - oldPos + 40) % 40;
      if (steps === 0 && (serverState.dice.dice1 + serverState.dice.dice2) === 40) {
        steps = 40;
      }

      const wasSentToJail = targetServerPlayer.inJail && !currentLocalPlayer.inJail;

      if (serverState.dice.dice1 === serverState.dice.dice2 && serverState.dice.dice1 > 0) {
        soundEngine.playDoubleFanfare();
      } else {
        soundEngine.playDiceRoll();
      }

      // Giữ vị trí cũ của quân cờ tạm thời, đặt isRolling = true để xúc xắc 3D rơi và xoay lộn nhào
      const playersHoldingPos = players.map((p) =>
        p.id === currentLocalPlayer.id ? { ...p, position: oldPos } : p
      );

      set({
        players: playersHoldingPos.length > 0 ? playersHoldingPos : get().players,
        board: board.length > 0 ? board : get().board,
        currentTurnIndex: activeIndex,
        turnPhase: 'MOVING',
        dice: {
          dice1: serverState.dice?.dice1 ?? get().dice.dice1,
          dice2: serverState.dice?.dice2 ?? get().dice.dice2,
          isRolling: true,
          doublesCount: serverState.dice?.doublesCount ?? 0,
        },
        logs: logs.length > 0 ? logs : get().logs,
        activeModal: null, // Hoãn mở modal cho đến khi quân cờ tiếp đất
      });

      // Sau 1200ms: Xúc xắc tiếp đất xong -> quân cờ bắt đầu nhảy từng bước
      setTimeout(() => {
        set((state) => ({
          dice: { ...state.dice, isRolling: false },
        }));

        if (wasSentToJail) {
          soundEngine.playJailSound();
          setTimeout(() => {
            isOnlineMoveAnimating = false;
            const finalState = pendingOnlineSyncState || serverState;
            pendingOnlineSyncState = null;
            get().syncFromServer(finalState);
          }, 600);
          return;
        }

        // Nhảy từng ô (Arc Jump ~240ms/bước)
        get().movePlayerSteps(steps, () => {
          isOnlineMoveAnimating = false;
          const finalState = pendingOnlineSyncState || serverState;
          pendingOnlineSyncState = null;
          get().syncFromServer(finalState);
        });
      }, 1200);

      return;
    }

    if (serverState.dice && (serverState.dice.dice1 !== prevDice.dice1 || serverState.dice.dice2 !== prevDice.dice2)) {
      if (serverState.dice.dice1 === serverState.dice.dice2) {
        soundEngine.playDoubleFanfare();
      } else {
        soundEngine.playDiceRoll();
      }
    }

    set({
      players: players.length > 0 ? players : get().players,
      board: board.length > 0 ? board : get().board,
      currentTurnIndex: serverState.currentTurnIndex ?? get().currentTurnIndex,
      turnPhase: (serverState.turnPhase || get().turnPhase) as any,
      dice: {
        dice1: serverState.dice?.dice1 ?? get().dice.dice1,
        dice2: serverState.dice?.dice2 ?? get().dice.dice2,
        isRolling: !!serverState.dice?.isRolling,
        doublesCount: serverState.dice?.doublesCount ?? 0,
      },
      logs: logs.length > 0 ? logs : get().logs,
      selectedTileId: serverState.selectedTileId >= 0 ? serverState.selectedTileId : null,
      activeModal: (serverState.activeModal || null) as any,
      activeCardData,
      pendingRentInfo,
      auction,
      bankHouses: serverState.bankHouses ?? get().bankHouses,
      bankHotels: serverState.bankHotels ?? get().bankHotels,
      turnTimer: serverState.turnTimer ? {
        timeLeft: serverState.turnTimer.timeLeft,
        maxTime: serverState.turnTimer.maxTime,
        isRunning: serverState.turnTimer.isRunning,
      } : get().turnTimer,
    });
  },

  addLog: (message: string, type: GameLog['type'] = 'info', playerId?: string) => {
    const newLog: GameLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      message,
      type,
      playerId,
    };
    set((state) => ({ logs: [newLog, ...state.logs].slice(0, 50) }));
  },

  selectTile: (tileId: number | null) => {
    soundEngine.playButtonClick();
    set({ selectedTileId: tileId });
  },

  closeModal: () => {
    soundEngine.playButtonClick();
    if (get().isOnline) {
      const modal = get().activeModal;
      const { mySessionId, players, currentTurnIndex, pendingRentInfo } = get();
      const currentP = players[currentTurnIndex];

      if (modal === 'RENT_PAID') {
        const isParticipant =
          !pendingRentInfo ||
          !mySessionId ||
          pendingRentInfo.tenantId === mySessionId ||
          pendingRentInfo.landlordId === mySessionId ||
          !players.some((p) => p.id === mySessionId);
        if (isParticipant) {
          colyseusDispatcher?.confirmRent();
        }
      } else if (modal === 'CARD_DRAW') {
        const isDrawer =
          !currentP ||
          !mySessionId ||
          currentP.id === mySessionId ||
          !players.some((p) => p.id === mySessionId);
        if (isDrawer) {
          colyseusDispatcher?.confirmCard();
        }
      }
      set({
        activeModal: null,
        selectedTileId: null,
        activeCardData: null,
        pendingRentInfo: null,
      });
      return;
    }

    const { activeModal, activeCardData, players, currentTurnIndex } = get();
    const currentPlayer = players[currentTurnIndex];

    if (activeModal === 'CARD_DRAW' && activeCardData && currentPlayer) {
      // 1. Thẻ di chuyển (MOVE_TO - ví dụ: Đến ô GO, Phố Tràng Tiền)
      if (activeCardData.actionType === 'MOVE_TO' && activeCardData.targetPosition !== undefined) {
        const targetPos = activeCardData.targetPosition;
        const currentPos = currentPlayer.position;
        let steps = (targetPos - currentPos + 40) % 40;
        if (steps === 0) steps = 40; // Nếu đang ở GO mà bốc trúng thẻ GO -> đi đủ 1 vòng 40 bước

        set({
          activeModal: null,
          activeCardData: null,
          selectedTileId: null,
          turnPhase: 'MOVING',
          turnTimer: { timeLeft: 0, maxTime: 0, isRunning: false },
        });

        // Bắt đầu hoạt ảnh nhảy từng bước (Arc Jump Animation)
        get().movePlayerSteps(steps);
        return;
      }

      // 2. Thẻ bị bắt vào tù (JAIL)
      if (activeCardData.actionType === 'JAIL') {
        soundEngine.playJailSound();
        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, position: 10, inJail: true, jailTurns: 0 }
            : p
        );
        get().addLog(`${currentPlayer.name} bị bắt giam vào tù theo hiệu ứng thẻ bài!`, 'jail', currentPlayer.id);
        set({
          players: updatedPlayers,
          activeModal: null,
          activeCardData: null,
          selectedTileId: null,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        return;
      }

      // 3. Thẻ thưởng tiền (MONEY_REWARD)
      if (activeCardData.actionType === 'MONEY_REWARD') {
        soundEngine.playMoneySound();
        const rewardAmount = activeCardData.rewardOrPenalty || 0;
        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, money: p.money + rewardAmount }
            : p
        );
        set({
          players: updatedPlayers,
          activeModal: null,
          activeCardData: null,
          selectedTileId: null,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        return;
      }

      // 4. Thẻ phạt tiền (MONEY_PENALTY)
      if (activeCardData.actionType === 'MONEY_PENALTY') {
        const penaltyAmount = activeCardData.rewardOrPenalty || 0;
        if (currentPlayer.money < penaltyAmount) {
          set({
            pendingDebt: {
              debtorId: currentPlayer.id,
              creditorId: null,
              amount: penaltyAmount,
              reason: `Nộp phạt thẻ [${activeCardData.title}]`,
            },
            activeModal: 'DEBT_SETTLEMENT',
            activeCardData: null,
            selectedTileId: null,
            turnPhase: 'TILE_ACTION',
            turnTimer: {
              timeLeft: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              maxTime: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              isRunning: true,
            },
          });
          get().addLog(
            `⚠️ ${currentPlayer.name} không đủ $${penaltyAmount} nộp phạt thẻ [${activeCardData.title}]! Cần xử lý nợ.`,
            'chance',
            currentPlayer.id
          );
          return;
        }

        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, money: p.money - penaltyAmount }
            : p
        );
        set({
          players: updatedPlayers,
          activeModal: null,
          activeCardData: null,
          selectedTileId: null,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        return;
      }

      // 5. Thẻ miễn đi tù (GET_OUT_OF_JAIL)
      if (activeCardData.actionType === 'GET_OUT_OF_JAIL') {
        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, getOutOfJailFreeCards: (p.getOutOfJailFreeCards || 0) + 1 }
            : p
        );
        get().addLog(`${currentPlayer.name} nhận được 1 Thẻ Ra Tù Miễn Phí!`, 'chance', currentPlayer.id);
        set({
          players: updatedPlayers,
          activeModal: null,
          activeCardData: null,
          selectedTileId: null,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        return;
      }
    }

    set({
      activeModal: null,
      selectedTileId: null,
      activeCardData: null,
      turnPhase: 'TURN_END',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.TURN_END,
        maxTime: TURN_TIMER_CONFIG.TURN_END,
        isRunning: true,
      },
    });
  },

  movePlayerSteps: (steps: number, onComplete?: () => void) => {
    set({
      turnPhase: 'MOVING',
      turnTimer: {
        timeLeft: 0,
        maxTime: 0,
        isRunning: false,
      },
    });

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      const state = get();
      const currentTurnIndex = state.currentTurnIndex;
      const player = state.players[currentTurnIndex];
      if (!player) {
        clearInterval(stepInterval);
        return;
      }

      const nextPos = (player.position + 1) % 40;
      let nextMoney = player.money;

      // Đi qua ô Khởi Hành (GO) -> Nhận thưởng $200
      if (nextPos === 0 && !player.inJail) {
        nextMoney += GAME_CONFIG.GO_REWARD;
        soundEngine.playMoneySound();
        state.addLog(
          `💰 ${player.name} đi qua ô Khởi Hành, nhận $${GAME_CONFIG.GO_REWARD}`,
          'info',
          player.id
        );
      }

      soundEngine.playStepSound();

      const updatedPlayers = state.players.map((p) =>
        p.id === player.id ? { ...p, position: nextPos, money: nextMoney } : p
      );

      set({
        players: updatedPlayers,
      });

      // Khi đã nhảy đủ số bước
      if (currentStep >= steps) {
        clearInterval(stepInterval);
        // Chờ 400ms để quân cờ nảy đàn hồi tiếp đất xong rồi kích hoạt modal / kết thúc di chuyển
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            get().finishMoving();
          }
        }, 400);
      }
    }, 240);
  },

  rollDice: () => {
    if (get().isOnline) {
      colyseusDispatcher?.rollDice();
      return;
    }
    const { turnPhase, dice, players, currentTurnIndex, addLog } = get();
    const canRoll = turnPhase === 'ROLLING' || (turnPhase === 'TURN_END' && dice.doublesCount > 0);
    if (!canRoll) return;

    const currentPlayer = players[currentTurnIndex];
    if (currentPlayer.isBankrupt) {
      get().endTurn();
      return;
    }

    // Nếu đang trong tù -> mở modal chọn cách ra tù
    if (currentPlayer.inJail) {
      set({
        activeModal: 'JAIL_CHOICE',
        turnTimer: {
          timeLeft: TURN_TIMER_CONFIG.JAIL_CHOICE,
          maxTime: TURN_TIMER_CONFIG.JAIL_CHOICE,
          isRunning: true,
        },
      });
      return;
    }

    const [d1, d2] = rollDiceValues(2, 6);
    const isDouble = d1 === d2;
    const diceSum = d1 + d2;
    const newDoublesCount = isDouble ? dice.doublesCount + 1 : 0;

    if (isDouble && newDoublesCount < 3) {
      soundEngine.playDoubleFanfare();
    } else {
      soundEngine.playDiceRoll();
    }

    set({
      dice: {
        dice1: d1,
        dice2: d2,
        isRolling: true,
        doublesCount: newDoublesCount,
      },
      turnPhase: 'MOVING',
      turnTimer: {
        timeLeft: 0,
        maxTime: 0,
        isRunning: false,
      },
    });

    addLog(
      `${currentPlayer.name} đổ được ${d1} và ${d2} (Tổng: ${diceSum})${isDouble ? ' - ĐỔ ĐÔI!' : ''}`,
      'info',
      currentPlayer.id
    );

    // 3 lần đôi liên tiếp -> Đi tù
    if (newDoublesCount >= 3) {
      setTimeout(() => {
        soundEngine.playJailSound();
        addLog(`${currentPlayer.name} đổ đôi 3 lần liên tiếp và bị bắt vào tù!`, 'jail', currentPlayer.id);
        set((state) => {
          const updatedPlayers = [...state.players];
          updatedPlayers[currentTurnIndex] = {
            ...currentPlayer,
            position: 10,
            inJail: true,
            jailTurns: 0,
          };
          return {
            players: updatedPlayers,
            turnPhase: 'TURN_END',
            dice: { ...state.dice, isRolling: false, doublesCount: 0 },
            turnTimer: {
              timeLeft: TURN_TIMER_CONFIG.TURN_END,
              maxTime: TURN_TIMER_CONFIG.TURN_END,
              isRunning: true,
            },
          };
        });
      }, 1000);
      return;
    }

    // Di chuyển quân cờ từng ô liên hoàn (Step-by-Step Arc Movement)
    setTimeout(() => {
      set((state) => ({
        dice: { ...state.dice, isRolling: false },
      }));

      get().movePlayerSteps(diceSum);
    }, 1250);
  },

  payJailBail: () => {
    if (get().isOnline) {
      colyseusDispatcher?.payJailBail();
      return;
    }
    const { players, currentTurnIndex, addLog } = get();
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer) return;

    if (currentPlayer.money < 50) {
      set({
        pendingDebt: {
          debtorId: currentPlayer.id,
          creditorId: null,
          amount: 50,
          reason: 'Tiền bảo lãnh ra tù',
        },
        activeModal: 'DEBT_SETTLEMENT',
        turnTimer: {
          timeLeft: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
          maxTime: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
          isRunning: true,
        },
      });
      addLog(`⚠️ ${currentPlayer.name} không đủ $50 nộp bảo lãnh! Cần thế chấp đất hoặc bán nhà.`, 'jail', currentPlayer.id);
      return;
    }

    soundEngine.playMoneySound();
    const updatedPlayers = players.map((p) =>
      p.id === currentPlayer.id
        ? { ...p, money: p.money - 50, inJail: false, jailTurns: 0 }
        : p
    );

    addLog(`${currentPlayer.name} nộp $50 tiền bảo lãnh và được tự do!`, 'jail', currentPlayer.id);

    set({
      players: updatedPlayers,
      activeModal: null,
      turnPhase: 'ROLLING',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.ROLLING,
        maxTime: TURN_TIMER_CONFIG.ROLLING,
        isRunning: true,
      },
    });
  },

  tryRollForJailEscape: () => {
    if (get().isOnline) {
      colyseusDispatcher?.rollDice();
      return;
    }
    const { players, currentTurnIndex, addLog } = get();
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || !currentPlayer.inJail) return;

    const [d1, d2] = rollDiceValues(2, 6);
    const isDouble = d1 === d2;
    const diceSum = d1 + d2;

    if (isDouble) {
      soundEngine.playDoubleFanfare();
    } else {
      soundEngine.playDiceRoll();
    }

    // 1. Đóng modal và kích hoạt animation ném xúc xắc 3D
    set({
      activeModal: null,
      turnPhase: 'MOVING',
      dice: {
        dice1: d1,
        dice2: d2,
        isRolling: true,
        doublesCount: isDouble ? 1 : 0,
      },
      turnTimer: {
        timeLeft: 0,
        maxTime: 0,
        isRunning: false,
      },
    });

    addLog(
      `${currentPlayer.name} trong tù đang thử đổ xúc xắc cầu đôi...`,
      'jail',
      currentPlayer.id
    );

    // 2. Sau 1.25s khi xúc xắc 3D rơi và nảy tiếp đất xong
    setTimeout(() => {
      set((state) => ({
        dice: { ...state.dice, isRolling: false },
      }));

      if (isDouble) {
        // ĐỔ RA ĐÔI -> THOÁT TÙ THÀNH CÔNG VÀ TIẾP TỤC ĐI
        soundEngine.playBuySuccess();
        addLog(
          `🎉 ${currentPlayer.name} đổ được đôi ${d1}-${d2} và được THOÁT TÙ MIỄN PHÍ! Đi tiếp ${diceSum} bước.`,
          'jail',
          currentPlayer.id
        );

        // Mở khóa ra tù trước khi bắt đầu bước đi
        const freedPlayers = get().players.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, inJail: false, jailTurns: 0 }
            : p
        );
        set({ players: freedPlayers });

        let currentStep = 0;
        const stepInterval = setInterval(() => {
          currentStep++;
          const state = get();
          const player = state.players[currentTurnIndex];
          if (!player) {
            clearInterval(stepInterval);
            return;
          }

          const nextPos = (player.position + 1) % 40;
          let nextMoney = player.money;

          if (nextPos === 0) {
            nextMoney += GAME_CONFIG.GO_REWARD;
            soundEngine.playMoneySound();
            state.addLog(
              `💰 ${player.name} đi qua ô Khởi Hành, nhận $${GAME_CONFIG.GO_REWARD}`,
              'info',
              player.id
            );
          }

          soundEngine.playStepSound();

          const updatedPlayers = state.players.map((p) =>
            p.id === player.id ? { ...p, position: nextPos, money: nextMoney } : p
          );

          set({ players: updatedPlayers });

          if (currentStep >= diceSum) {
            clearInterval(stepInterval);
            setTimeout(() => {
              get().finishMoving();
            }, 400);
          }
        }, 240);
      } else {
        // KHÔNG RA ĐÔI
        const newJailTurns = currentPlayer.jailTurns + 1;
        if (newJailTurns >= 3) {
          // Đã ở tù đủ 3 lượt -> Buộc nộp phạt $50
          if (currentPlayer.money < 50) {
            set({
              pendingDebt: {
                debtorId: currentPlayer.id,
                creditorId: null,
                amount: 50,
                reason: 'Tiền bảo lãnh ra tù sau 3 lượt',
              },
              turnPhase: 'TILE_ACTION',
              activeModal: 'DEBT_SETTLEMENT',
              turnTimer: {
                timeLeft: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
                maxTime: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
                isRunning: true,
              },
            });
            addLog(
              `⚠️ ${currentPlayer.name} đổ ${d1}-${d2} (Hết 3 lượt) nhưng không đủ $50 tiền bảo lãnh! Cần xử lý nợ hoặc phá sản.`,
              'jail',
              currentPlayer.id
            );
            return;
          }

          soundEngine.playMoneySound();
          addLog(
            `${currentPlayer.name} đổ ${d1}-${d2} không ra đôi (Hết 3 lượt), buộc nộp $50 tiền bảo lãnh để ra tù đi tiếp ${diceSum} bước!`,
            'jail',
            currentPlayer.id
          );

          soundEngine.playStepSound();
          const oldPos = currentPlayer.position;
          const newPos = (oldPos + diceSum) % 40;
          let newMoney = currentPlayer.money - 50;
          if (newPos < oldPos) {
            newMoney += GAME_CONFIG.GO_REWARD;
            soundEngine.playMoneySound();
            addLog(`${currentPlayer.name} đi qua ô Khởi Hành, nhận $${GAME_CONFIG.GO_REWARD}`, 'info', currentPlayer.id);
          }

          const updatedPlayers = get().players.map((p) =>
            p.id === currentPlayer.id
              ? {
                  ...p,
                  money: newMoney,
                  inJail: false,
                  jailTurns: 0,
                  position: newPos,
                }
              : p
          );

          set({
            players: updatedPlayers,
          });

          setTimeout(() => {
            get().finishMoving();
          }, 1200);
        } else {
          // Chưa đủ 3 lượt -> Thất bại, ở lại tù và chuyển sang TURN_END
          soundEngine.playJailSound();
          addLog(
            `❌ ${currentPlayer.name} đổ ${d1}-${d2} (Không ra đôi) -> Tiếp tục ở lại trong tù (Lượt ${newJailTurns}/3).`,
            'jail',
            currentPlayer.id
          );

          const updatedPlayers = get().players.map((p) =>
            p.id === currentPlayer.id ? { ...p, jailTurns: newJailTurns } : p
          );

          set({
            players: updatedPlayers,
            turnPhase: 'TURN_END',
            turnTimer: {
              timeLeft: TURN_TIMER_CONFIG.TURN_END,
              maxTime: TURN_TIMER_CONFIG.TURN_END,
              isRunning: true,
            },
          });
        }
      }
    }, 1250);
  },

  consumeJailCard: () => {
    if (get().isOnline) {
      colyseusDispatcher?.useJailCard();
      return;
    }
    const { players, currentTurnIndex, addLog } = get();
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || currentPlayer.getOutOfJailFreeCards <= 0) return;

    soundEngine.playBuySuccess();
    const updatedPlayers = players.map((p) =>
      p.id === currentPlayer.id
        ? {
            ...p,
            getOutOfJailFreeCards: p.getOutOfJailFreeCards - 1,
            inJail: false,
            jailTurns: 0,
          }
        : p
    );

    addLog(`${currentPlayer.name} sử dụng Thẻ Miễn Đi Tù để được tự do!`, 'jail', currentPlayer.id);

    set({
      players: updatedPlayers,
      activeModal: null,
      turnPhase: 'ROLLING',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.ROLLING,
        maxTime: TURN_TIMER_CONFIG.ROLLING,
        isRunning: true,
      },
    });
  },

  finishMoving: () => {
    const { players, currentTurnIndex, board, dice } = get();
    const currentPlayer = players[currentTurnIndex];
    const tile = board[currentPlayer.position];
    const diceTotal = dice.dice1 + dice.dice2;

    const resolution = dispatchTileEvent(tile, currentPlayer, players, board, diceTotal);

    if (resolution.log) {
      get().addLog(resolution.log.message, resolution.log.type, resolution.log.playerId);
    }

    switch (resolution.action) {
      case 'PROMPT_BUY':
        set({
          turnPhase: 'TILE_ACTION',
          activeModal: 'BUY_PROPERTY',
          selectedTileId: resolution.tile.id,
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.BUY_PROPERTY,
            maxTime: TURN_TIMER_CONFIG.BUY_PROPERTY,
            isRunning: true,
          },
        });
        break;

      case 'PAY_RENT': {
        const landlord = players.find((p) => p.id === resolution.landlordId);
        if (currentPlayer.money < resolution.amount) {
          // Thiếu tiền trả tiền thuê -> Kích hoạt Xử lý nợ
          set({
            pendingDebt: {
              debtorId: currentPlayer.id,
              creditorId: resolution.landlordId,
              amount: resolution.amount,
              reason: `Tiền thuê [${resolution.tile.name}]`,
            },
            turnPhase: 'TILE_ACTION',
            activeModal: 'DEBT_SETTLEMENT',
            turnTimer: {
              timeLeft: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              maxTime: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              isRunning: true,
            },
          });
          get().addLog(
            `⚠️ ${currentPlayer.name} không đủ $${resolution.amount} tiền thuê trả cho ${landlord?.name || 'chủ nhà'}! Cần xử lý nợ.`,
            'rent',
            currentPlayer.id
          );
          break;
        }

        soundEngine.playMoneySound();
        const updatedPlayers = players.map((p) => {
          if (p.id === resolution.tenantId) {
            return { ...p, money: p.money - resolution.amount };
          }
          if (p.id === resolution.landlordId) {
            return { ...p, money: p.money + resolution.amount };
          }
          return p;
        });

        set({
          players: updatedPlayers,
          turnPhase: 'TILE_ACTION',
          activeModal: 'RENT_PAID',
          pendingRentInfo: {
            tenantId: resolution.tenantId,
            landlordId: resolution.landlordId,
            amount: resolution.amount,
            tileName: resolution.tile.name,
          },
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.PAY_RENT,
            maxTime: TURN_TIMER_CONFIG.PAY_RENT,
            isRunning: true,
          },
        });
        break;
      }

      case 'PAY_TAX': {
        if (currentPlayer.money < resolution.amount) {
          // Thiếu tiền nộp thuế -> Kích hoạt Xử lý nợ
          set({
            pendingDebt: {
              debtorId: currentPlayer.id,
              creditorId: null,
              amount: resolution.amount,
              reason: `Nộp thuế tại [${tile.name}]`,
            },
            turnPhase: 'TILE_ACTION',
            activeModal: 'DEBT_SETTLEMENT',
            turnTimer: {
              timeLeft: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              maxTime: TURN_TIMER_CONFIG.DEBT_SETTLEMENT,
              isRunning: true,
            },
          });
          get().addLog(
            `⚠️ ${currentPlayer.name} không đủ $${resolution.amount} nộp thuế! Cần thế chấp đất hoặc bán nhà.`,
            'tax',
            currentPlayer.id
          );
          break;
        }

        soundEngine.playMoneySound();
        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id ? { ...p, money: p.money - resolution.amount } : p
        );
        set({
          players: updatedPlayers,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        break;
      }

      case 'GO_TO_JAIL': {
        soundEngine.playJailSound();
        const updatedPlayers = players.map((p) =>
          p.id === currentPlayer.id ? { ...p, position: 10, inJail: true, jailTurns: 0 } : p
        );
        set({
          players: updatedPlayers,
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        break;
      }

      case 'DRAW_CARD': {
        set({
          turnPhase: 'TILE_ACTION',
          activeModal: 'CARD_DRAW',
          activeCardData: {
            title: resolution.card.title,
            description: resolution.card.description,
            type: resolution.card.type,
            actionType: resolution.card.actionType,
            rewardOrPenalty: resolution.card.value,
            targetPosition: resolution.cardEffect.newPosition,
            sendToJail: resolution.cardEffect.sendToJail,
          },
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.CARD_DRAW,
            maxTime: TURN_TIMER_CONFIG.CARD_DRAW,
            isRunning: true,
          },
        });
        break;
      }

      case 'NO_ACTION':
      default:
        set({
          turnPhase: 'TURN_END',
          turnTimer: {
            timeLeft: TURN_TIMER_CONFIG.TURN_END,
            maxTime: TURN_TIMER_CONFIG.TURN_END,
            isRunning: true,
          },
        });
        break;
    }
  },

  executeTradeAction: (offer: TradeOffer) => {
    const { players, board, addLog } = get();
    const validation = validateTrade(offer, players, board);
    if (!validation.isValid) {
      return { success: false, reason: validation.reason };
    }

    const { updatedPlayers, updatedBoard } = executeTradeEngine(offer, players, board);
    soundEngine.playBuySuccess();

    const sender = players.find((p) => p.id === offer.senderId);
    const receiver = players.find((p) => p.id === offer.receiverId);

    addLog(
      `🤝 Giao dịch thành công giữa ${sender?.name || 'Người chơi 1'} và ${receiver?.name || 'Người chơi 2'}!`,
      'trade',
      offer.senderId
    );

    set({
      players: updatedPlayers,
      board: updatedBoard,
    });

    return { success: true };
  },

  mortgageProperty: (tileId: number) => {
    const { board, players, currentTurnIndex, pendingDebt, addLog } = get();
    const debtorId = pendingDebt ? pendingDebt.debtorId : players[currentTurnIndex]?.id;
    const tile = board[tileId];

    if (!tile || tile.ownerId !== debtorId || tile.isMortgaged) return;
    if ((tile.houses || 0) > 0) return; // Must sell houses first

    const mortgageValue = tile.mortgageValue || Math.floor((tile.price || 0) * 0.5);
    soundEngine.playMoneySound();

    const updatedBoard = board.map((t) =>
      t.id === tileId ? { ...t, isMortgaged: true } : t
    );

    const updatedPlayers = players.map((p) =>
      p.id === debtorId ? { ...p, money: p.money + mortgageValue } : p
    );

    const owner = players.find((p) => p.id === debtorId);
    addLog(
      `🏦 ${owner?.name || 'Người chơi'} thế chấp [${tile.name}], nhận +$${mortgageValue}`,
      'buy',
      debtorId
    );

    set({
      board: updatedBoard,
      players: updatedPlayers,
    });
  },

  unmortgageProperty: (tileId: number) => {
    const { board, players, currentTurnIndex, addLog } = get();
    const currentPlayer = players[currentTurnIndex];
    const tile = board[tileId];

    if (!tile || tile.ownerId !== currentPlayer.id || !tile.isMortgaged) return;

    const unmortgageCost = Math.floor((tile.price || 0) * 0.55);
    if (currentPlayer.money < unmortgageCost) return;

    soundEngine.playBuySuccess();

    const updatedBoard = board.map((t) =>
      t.id === tileId ? { ...t, isMortgaged: false } : t
    );

    const updatedPlayers = players.map((p) =>
      p.id === currentPlayer.id ? { ...p, money: p.money - unmortgageCost } : p
    );

    addLog(
      `💸 ${currentPlayer.name} đã chuộc lại [${tile.name}] với giá $${unmortgageCost}`,
      'buy',
      currentPlayer.id
    );

    set({
      board: updatedBoard,
      players: updatedPlayers,
    });
  },

  sellHouse: (tileId: number) => {
    const { board, players, currentTurnIndex, pendingDebt, addLog, bankHouses, bankHotels } = get();
    const debtorId = pendingDebt ? pendingDebt.debtorId : players[currentTurnIndex]?.id;
    const tile = board[tileId];
    const debtor = players.find((p) => p.id === debtorId);

    if (!tile || !debtor) return;

    const sellCheck = canSellHouse(tile, board, debtor);
    if (!sellCheck.canSell) {
      addLog(`⚠️ Không thể bán nhà: ${sellCheck.reason}`, 'info', debtorId);
      return;
    }

    const refund = Math.floor((tile.houseCost || 0) * 0.5);
    soundEngine.playMoneySound();

    const wasHotel = tile.houses === 5;
    let newBankHouses = bankHouses;
    let newBankHotels = bankHotels;
    if (wasHotel) {
      // Bán khách sạn về 4 nhà: Trả lại 1 khách sạn cho kho Ngân Hàng, lấy ra 4 nhà nhỏ
      newBankHotels += 1;
      newBankHouses = Math.max(0, newBankHouses - 4);
    } else {
      // Bán 1 nhà: Trả lại 1 nhà cho kho Ngân Hàng
      newBankHouses += 1;
    }

    const updatedBoard = board.map((t) =>
      t.id === tileId ? { ...t, houses: t.houses! - 1 } : t
    );

    const updatedPlayers = players.map((p) =>
      p.id === debtorId ? { ...p, money: p.money + refund } : p
    );

    addLog(
      `🏠 ${debtor.name} bán bớt 1 công trình tại [${tile.name}], nhận lại +$${refund} (Kho NH: ${newBankHouses}/32 nhà, ${newBankHotels}/12 KS)`,
      'buy',
      debtorId
    );

    set({
      board: updatedBoard,
      players: updatedPlayers,
      bankHouses: newBankHouses,
      bankHotels: newBankHotels,
    });
  },

  payPendingDebt: () => {
    const { pendingDebt, players, addLog } = get();
    if (!pendingDebt) return;

    const debtor = players.find((p) => p.id === pendingDebt.debtorId);
    if (!debtor || debtor.money < pendingDebt.amount) return;

    soundEngine.playMoneySound();

    const updatedPlayers = players.map((p) => {
      if (p.id === pendingDebt.debtorId) {
        return { ...p, money: p.money - pendingDebt.amount };
      }
      if (pendingDebt.creditorId && p.id === pendingDebt.creditorId) {
        return { ...p, money: p.money + pendingDebt.amount };
      }
      return p;
    });

    const creditor = pendingDebt.creditorId ? players.find((p) => p.id === pendingDebt.creditorId) : null;
    const creditorName = creditor ? creditor.name : 'Ngân hàng';

    addLog(
      `✅ ${debtor.name} đã thanh toán khoản nợ $${pendingDebt.amount} cho ${creditorName} thành công!`,
      'rent',
      debtor.id
    );

    set({
      players: updatedPlayers,
      pendingDebt: null,
      activeModal: null,
      turnPhase: 'TURN_END',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.TURN_END,
        maxTime: TURN_TIMER_CONFIG.TURN_END,
        isRunning: true,
      },
    });
  },

  declareBankruptcy: () => {
    const { pendingDebt, players, board, currentTurnIndex, addLog } = get();
    const debtorId = pendingDebt ? pendingDebt.debtorId : players[currentTurnIndex]?.id;
    const debtor = players.find((p) => p.id === debtorId);
    if (!debtor) return;

    soundEngine.playJailSound();

    const creditorId = pendingDebt?.creditorId;
    const creditor = creditorId ? players.find((p) => p.id === creditorId) : null;

    let updatedBoard = [...board];
    let updatedPlayers = players.map((p) => {
      if (p.id === debtorId) {
        return {
          ...p,
          isBankrupt: true,
          money: 0,
        };
      }
      return p;
    });

    if (creditor) {
      // Chuyển toàn bộ đất và tiền còn lại của con nợ cho chủ nợ
      const remainingDebtorCash = Math.max(0, debtor.money);
      updatedBoard = updatedBoard.map((t) =>
        t.ownerId === debtorId ? { ...t, ownerId: creditor.id, houses: 0 } : t
      );
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === creditor.id ? { ...p, money: p.money + remainingDebtorCash } : p
      );

      addLog(
        `💀 ${debtor.name} TUYÊN BỐ PHÁ SẢN! Toàn bộ đất đai và $${remainingDebtorCash} tiền mặt được chuyển giao cho ${creditor.name}.`,
        'jail',
        debtor.id
      );
    } else {
      // Phá sản do Ngân Hàng (Thuế, Tù, Thẻ) -> Giải phóng toàn bộ đất thành vô chủ
      updatedBoard = updatedBoard.map((t) =>
        t.ownerId === debtorId
          ? { ...t, ownerId: null, houses: 0, isMortgaged: false }
          : t
      );

      addLog(
        `💀 ${debtor.name} TUYÊN BỐ PHÁ SẢN! Toàn bộ bất động sản được hoàn trả về Ngân Hàng.`,
        'jail',
        debtor.id
      );
    }

    // Kiểm tra số người chơi còn lại chưa phá sản
    const remainingActivePlayers = updatedPlayers.filter((p) => !p.isBankrupt);

    if (remainingActivePlayers.length <= 1) {
      const winner = remainingActivePlayers[0] || debtor;
      soundEngine.playMonopolyFanfare();
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8', '#EC4899'],
        });
      }

      addLog(
        `🏆 TRÒ CHƠI KẾT THÚC! ${winner.name} ĐÃ TRỞ THÀNH TỶ PHÚ DUY NHẤT VÀ VÔ ĐỊCH TOÀN BÀN CỜ!`,
        'info',
        winner.id
      );

      set({
        players: updatedPlayers,
        board: updatedBoard,
        pendingDebt: null,
        activeModal: 'GAME_OVER',
        turnPhase: 'GAME_OVER',
        turnTimer: {
          timeLeft: 0,
          maxTime: 0,
          isRunning: false,
        },
      });
    } else {
      // Chuyển lượt cho người chơi tiếp theo chưa phá sản
      let nextTurnIndex = (currentTurnIndex + 1) % updatedPlayers.length;
      let attempts = 0;
      while (updatedPlayers[nextTurnIndex].isBankrupt && attempts < updatedPlayers.length) {
        nextTurnIndex = (nextTurnIndex + 1) % updatedPlayers.length;
        attempts++;
      }
      const nextPlayer = updatedPlayers[nextTurnIndex];
      const isNextInJail = nextPlayer.inJail;
      const initialTimer = isNextInJail ? TURN_TIMER_CONFIG.JAIL_CHOICE : TURN_TIMER_CONFIG.ROLLING;

      addLog(`Chuyển lượt cho ${nextPlayer.name}`, 'info', nextPlayer.id);

      set({
        players: updatedPlayers,
        board: updatedBoard,
        pendingDebt: null,
        currentTurnIndex: nextTurnIndex,
        turnPhase: 'ROLLING',
        selectedTileId: null,
        activeModal: isNextInJail ? 'JAIL_CHOICE' : null,
        turnTimer: {
          timeLeft: initialTimer,
          maxTime: initialTimer,
          isRunning: true,
        },
      });
    }
  },

  buyProperty: (tileId?: number) => {
    if (get().isOnline) {
      colyseusDispatcher?.buyProperty();
      return;
    }
    const { players, currentTurnIndex, board, addLog } = get();
    const currentPlayer = players[currentTurnIndex];
    const targetTileId = tileId !== undefined ? tileId : currentPlayer.position;
    const tile = board[targetTileId];

    if (!tile || tile.ownerId || !tile.price || currentPlayer.money < tile.price) {
      return;
    }

    soundEngine.playBuySuccess();

    const updatedPlayers = players.map((p) =>
      p.id === currentPlayer.id ? { ...p, money: p.money - tile.price! } : p
    );

    const updatedBoard = board.map((t) =>
      t.id === targetTileId ? { ...t, ownerId: currentPlayer.id, houses: 0 } : t
    );

    addLog(
      `${currentPlayer.name} đã mua thành công bất động sản [${tile.name}] với giá $${tile.price}`,
      'buy',
      currentPlayer.id
    );

    // Kiểm tra gom trọn bộ đất (Monopoly Full-Set Celebration)
    if (tile.colorGroup) {
      const colorGroupTiles = updatedBoard.filter((t) => t.colorGroup === tile.colorGroup);
      const isMonopolyOwned = colorGroupTiles.every((t) => t.ownerId === currentPlayer.id);

      if (isMonopolyOwned) {
        soundEngine.playMonopolyFanfare();
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8'],
          });
        }
        addLog(
          `👑 CHÚC MỪNG! ${currentPlayer.name} đã gom trọn bộ ${colorGroupTiles.length} ô khu đất [${tile.colorGroup.toUpperCase()}]! Bắt đầu được phép xây nhà!`,
          'buy',
          currentPlayer.id
        );
      }
    }

    set({
      players: updatedPlayers,
      board: updatedBoard,
      activeModal: null,
      selectedTileId: null,
      turnPhase: 'TURN_END',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.TURN_END,
        maxTime: TURN_TIMER_CONFIG.TURN_END,
        isRunning: true,
      },
    });
  },

  skipBuyProperty: () => {
    if (get().isOnline) {
      colyseusDispatcher?.declineProperty();
      return;
    }
    soundEngine.playButtonClick();
    const { selectedTileId, players, currentTurnIndex, board } = get();
    const currentPlayer = players[currentTurnIndex];
    const targetTileId = selectedTileId !== null ? selectedTileId : currentPlayer?.position;
    const tile = targetTileId !== undefined ? board[targetTileId] : null;

    if (tile && !tile.ownerId) {
      get().startAuction(tile.id);
    } else {
      set({
        activeModal: null,
        selectedTileId: null,
        turnPhase: 'TURN_END',
        turnTimer: {
          timeLeft: TURN_TIMER_CONFIG.TURN_END,
          maxTime: TURN_TIMER_CONFIG.TURN_END,
          isRunning: true,
        },
      });
    }
  },

  upgradeProperty: (tileId: number) => {
    if (get().isOnline) {
      colyseusDispatcher?.upgradeProperty(tileId);
      return;
    }
    const { players, currentTurnIndex, board, addLog, bankHouses, bankHotels } = get();
    const currentPlayer = players[currentTurnIndex];
    const tile = board[tileId];

    if (!tile || !currentPlayer) return;

    const upgradeCheck = canUpgradeProperty(tile, board, currentPlayer, bankHouses, bankHotels);
    if (!upgradeCheck.canUpgrade) {
      addLog(`⚠️ Không thể xây nhà: ${upgradeCheck.reason}`, 'info', currentPlayer.id);
      return;
    }

    soundEngine.playBuySuccess();

    const newHouseCount = (tile.houses || 0) + 1;
    const isHotel = newHouseCount === 5;

    let newBankHouses = bankHouses;
    let newBankHotels = bankHotels;
    if (isHotel) {
      // Lên khách sạn: Trừ 1 khách sạn trong kho, hoàn trả 4 nhà nhỏ về kho Ngân Hàng!
      newBankHotels -= 1;
      newBankHouses += 4;
    } else {
      // Xây thêm 1 nhà: Trừ 1 nhà trong kho
      newBankHouses -= 1;
    }

    const updatedPlayers = players.map((p) =>
      p.id === currentPlayer.id ? { ...p, money: p.money - tile.houseCost! } : p
    );

    const updatedBoard = board.map((t) =>
      t.id === tileId ? { ...t, houses: newHouseCount } : t
    );

    addLog(
      `${currentPlayer.name} xây thêm ${isHotel ? 'KHÁCH SẠN VIP' : `Ngôi nhà thứ ${newHouseCount}`} tại [${tile.name}] (-$${tile.houseCost}) • Kho NH còn: ${newBankHouses}/32 nhà, ${newBankHotels}/12 KS`,
      'buy',
      currentPlayer.id
    );

    set({
      players: updatedPlayers,
      board: updatedBoard,
      bankHouses: newBankHouses,
      bankHotels: newBankHotels,
    });
  },

  endTurn: () => {
    if (get().isOnline) {
      colyseusDispatcher?.endTurn();
      return;
    }
    const { players, currentTurnIndex, dice, addLog } = get();
    soundEngine.playButtonClick();

    // Tìm người chơi tiếp theo chưa phá sản
    let nextTurnIndex = (currentTurnIndex + 1) % players.length;
    let attempts = 0;
    while (players[nextTurnIndex].isBankrupt && attempts < players.length) {
      nextTurnIndex = (nextTurnIndex + 1) % players.length;
      attempts++;
    }

    const nextPlayer = players[nextTurnIndex];
    addLog(`Chuyển lượt cho ${nextPlayer.name}`, 'info', nextPlayer.id);

    const isNextInJail = nextPlayer.inJail;
    const initialTimer = isNextInJail ? TURN_TIMER_CONFIG.JAIL_CHOICE : TURN_TIMER_CONFIG.ROLLING;

    set({
      currentTurnIndex: nextTurnIndex,
      turnPhase: 'ROLLING',
      selectedTileId: null,
      activeModal: isNextInJail ? 'JAIL_CHOICE' : null,
      dice: {
        ...dice,
        isRolling: false,
        doublesCount: 0,
      },
      turnTimer: {
        timeLeft: initialTimer,
        maxTime: initialTimer,
        isRunning: true,
      },
    });
  },

  resetGame: () => {
    reshuffleAllDecks();
    soundEngine.playButtonClick();
    set({
      players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
      board: JSON.parse(JSON.stringify(INITIAL_BOARD_DATA)),
      currentTurnIndex: 0,
      turnPhase: 'ROLLING',
      activeModal: null,
      selectedTileId: null,
      bankHouses: GAME_CONFIG.TOTAL_BANK_HOUSES,
      bankHotels: GAME_CONFIG.TOTAL_BANK_HOTELS,
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.ROLLING,
        maxTime: TURN_TIMER_CONFIG.ROLLING,
        isRunning: true,
      },
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          message: 'Bàn cờ đã được làm mới. Ván đấu mới bắt đầu!',
          type: 'info',
        },
      ],
    });
  },

  updatePlayer: (id: string, updates: Partial<PlayerState>) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  setPlayers: (newPlayers: PlayerState[]) => {
    set({ players: newPlayers });
  },

  initGameWithPlayers: (configuredPlayers: PlayerState[], startingMoney = GAME_CONFIG.STARTING_MONEY) => {
    reshuffleAllDecks();
    soundEngine.playButtonClick();
    const readyPlayers = configuredPlayers.map((p) => ({
      ...p,
      money: startingMoney,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      isBankrupt: false,
    }));

    set({
      players: readyPlayers,
      board: JSON.parse(JSON.stringify(INITIAL_BOARD_DATA)),
      currentTurnIndex: 0,
      turnPhase: 'ROLLING',
      activeModal: null,
      selectedTileId: null,
      bankHouses: GAME_CONFIG.TOTAL_BANK_HOUSES,
      bankHotels: GAME_CONFIG.TOTAL_BANK_HOTELS,
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.ROLLING,
        maxTime: TURN_TIMER_CONFIG.ROLLING,
        isRunning: true,
      },
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          message: 'Trận đấu Cờ Tỷ Phú 3D chính thức khai màn! Chúc các tỷ phú may mắn.',
          type: 'info',
        },
      ],
    });
  },

  startAuction: (tileId: number) => {
    const { board, players, addLog } = get();
    const tile = board[tileId];
    if (!tile) return;

    const newAuction = createAuction(tile, players);
    addLog(`🔨 Ngân hàng mở phiên đấu giá cho mảnh đất [${tile.name}]!`, 'buy');

    set({
      auction: newAuction,
      activeModal: 'AUCTION',
      selectedTileId: tileId,
      turnPhase: 'AUCTION',
      turnTimer: {
        timeLeft: TURN_TIMER_CONFIG.AUCTION,
        maxTime: TURN_TIMER_CONFIG.AUCTION,
        isRunning: true,
      },
    });

    // Kích hoạt AI bot bidding nếu có bot tham gia
    setTimeout(() => {
      get().runAiAuctionTurn();
    }, 1200);
  },

  placeBid: (bidAmount: number, playerId?: string) => {
    if (get().isOnline) {
      colyseusDispatcher?.bidAuction(bidAmount);
      return;
    }
    const { auction, players, currentTurnIndex, addLog } = get();
    if (!auction) return;

    const bidderId = playerId || players[currentTurnIndex]?.id;
    const bidder = players.find((p) => p.id === bidderId);
    if (!bidder) return;

    const result = placeBidHandler(auction, bidder.id, bidAmount, bidder.money);
    if (!result.valid || !result.newAuction) {
      if (!bidder.isAI) {
        addLog(`⚠️ Đặt giá không hợp lệ: ${result.reason}`, 'info', bidder.id);
      }
      return;
    }

    soundEngine.playMoneySound();
    addLog(`🔨 ${bidder.name} trả giá $${bidAmount} cho phiên đấu giá!`, 'buy', bidder.id);

    // Reset đếm ngược về ít nhất 10s mỗi khi có người nâng giá
    set({
      auction: result.newAuction,
      turnTimer: {
        timeLeft: Math.max(10, get().turnTimer.timeLeft),
        maxTime: TURN_TIMER_CONFIG.AUCTION,
        isRunning: true,
      },
    });

    // Cho AI tiếp tục lượt đấu giá
    setTimeout(() => {
      get().runAiAuctionTurn();
    }, 1500);
  },

  foldAuction: (playerId?: string) => {
    if (get().isOnline) {
      colyseusDispatcher?.foldAuction();
      return;
    }
    const { auction, players, currentTurnIndex, addLog } = get();
    if (!auction) return;

    const folderId = playerId || players[currentTurnIndex]?.id;
    const folder = players.find((p) => p.id === folderId);
    if (!folder) return;

    const result = foldAuctionHandler(auction, folder.id);
    addLog(`🏳️ ${folder.name} đã rút lui khỏi phiên đấu giá.`, 'info', folder.id);

    if (result.isEnded) {
      set({ auction: result.newAuction });
      get().finishAuction();
      return;
    }

    set({ auction: result.newAuction });

    // Cho AI tiếp tục
    setTimeout(() => {
      get().runAiAuctionTurn();
    }, 1000);
  },

  finishAuction: () => {
    const { auction, board, players, addLog } = get();
    if (!auction) return;

    const tile = board[auction.tileId];
    const winner = auction.highestBidderId
      ? players.find((p) => p.id === auction.highestBidderId)
      : null;

    if (winner && tile && auction.currentBid > 0) {
      soundEngine.playBuySuccess();
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#10B981'],
        });
      }

      addLog(
        `🏆 ${winner.name} đã thắng đấu giá [${tile.name}] với giá $${auction.currentBid}!`,
        'buy',
        winner.id
      );

      const updatedBoard = board.map((t) =>
        t.id === tile.id ? { ...t, ownerId: winner.id } : t
      );

      const updatedPlayers = players.map((p) =>
        p.id === winner.id ? { ...p, money: p.money - auction.currentBid } : p
      );

      set({
        board: updatedBoard,
        players: updatedPlayers,
        auction: null,
        activeModal: null,
        selectedTileId: null,
        turnPhase: 'TURN_END',
        turnTimer: {
          timeLeft: TURN_TIMER_CONFIG.TURN_END,
          maxTime: TURN_TIMER_CONFIG.TURN_END,
          isRunning: true,
        },
      });
    } else {
      addLog(`🔨 Phiên đấu giá kết thúc không có người mua. Đất thuộc về Ngân Hàng.`, 'info');
      set({
        auction: null,
        activeModal: null,
        selectedTileId: null,
        turnPhase: 'TURN_END',
        turnTimer: {
          timeLeft: TURN_TIMER_CONFIG.TURN_END,
          maxTime: TURN_TIMER_CONFIG.TURN_END,
          isRunning: true,
        },
      });
    }
  },

  runAiAuctionTurn: () => {
    const { auction, board, players } = get();
    if (!auction || get().activeModal !== 'AUCTION') return;

    const tile = board[auction.tileId];
    if (!tile) return;

    // Tìm các bot AI còn trong danh sách activeBidderIds và chưa phải là người giữ giá cao nhất
    const activeBots = players.filter(
      (p) =>
        p.isAI &&
        !p.isBankrupt &&
        auction.activeBidderIds.includes(p.id) &&
        auction.highestBidderId !== p.id
    );

    if (activeBots.length === 0) return;

    // Chọn ngẫu nhiên 1 bot để suy nghĩ và đưa ra quyết định
    const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
    const decision = getAiBidDecision(auction, bot, tile, board, players);

    if (decision.shouldBid && decision.bidAmount > 0) {
      get().placeBid(decision.bidAmount, bot.id);
    } else {
      get().foldAuction(bot.id);
    }
  },
}));
