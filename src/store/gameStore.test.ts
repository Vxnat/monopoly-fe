import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore, registerColyseusDispatcher } from './gameStore';

describe('🎮 Game Store State & Flow Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('initializes with 4 players, starting funds, and ROLLING phase', () => {
    const state = useGameStore.getState();
    expect(state.players).toHaveLength(4);
    expect(state.players[0].money).toBe(1500);
    expect(state.turnPhase).toBe('ROLLING');
    expect(state.currentTurnIndex).toBe(0);
    expect(state.board).toHaveLength(40);
  });

  it('buyProperty correctly deducts money and registers ownership on board', () => {
    const store = useGameStore.getState();
    const p1 = store.players[0];
    const initialMoney = p1.money;

    // Buy Tile 1 (Phố Cổ Đồng Xuân, price $60)
    store.buyProperty(1);

    const updatedState = useGameStore.getState();
    const updatedTile = updatedState.board[1];
    const updatedP1 = updatedState.players[0];

    expect(updatedTile.ownerId).toBe(p1.id);
    expect(updatedP1.money).toBe(initialMoney - (updatedTile.price || 60));
  });

  it('upgradeProperty builds houses and deducts construction cost when monopoly set is owned', () => {
    const store = useGameStore.getState();
    // First buy all tiles in brown group (tile 1 and tile 3) to complete Monopoly Set
    store.buyProperty(1);
    store.buyProperty(3);
    const p1MoneyAfterBuy = useGameStore.getState().players[0].money;

    // Upgrade house on tile 1
    store.upgradeProperty(1);

    const updatedState = useGameStore.getState();
    const updatedTile = updatedState.board[1];
    const updatedP1 = updatedState.players[0];

    expect(updatedTile.houses).toBe(1);
    expect(updatedP1.money).toBe(p1MoneyAfterBuy - (updatedTile.houseCost || 50));
  });

  it('endTurn cycles to the next player and resets turn phase to ROLLING', () => {
    const store = useGameStore.getState();
    expect(store.currentTurnIndex).toBe(0);

    store.endTurn();
    const nextState = useGameStore.getState();
    expect(nextState.currentTurnIndex).toBe(1);
    expect(nextState.turnPhase).toBe('ROLLING');
  });

  it('payJailBail frees player from jail for $50 fee', () => {
    // Put player 1 in jail
    useGameStore.setState((state) => ({
      players: state.players.map((p, idx) =>
        idx === 0 ? { ...p, inJail: true, jailTurns: 1, position: 10 } : p
      ),
    }));

    const store = useGameStore.getState();
    expect(store.players[0].inJail).toBe(true);
    const initialMoney = store.players[0].money;

    store.payJailBail();

    const freedState = useGameStore.getState();
    expect(freedState.players[0].inJail).toBe(false);
    expect(freedState.players[0].money).toBe(initialMoney - 50);
  });

  it('closeModal resets activeModal, selectedTileId, and transitions turnPhase to TURN_END', () => {
    useGameStore.setState({
      turnPhase: 'TILE_ACTION',
      activeModal: 'CARD_DRAW',
      selectedTileId: 7,
    });

    const store = useGameStore.getState();
    expect(store.turnPhase).toBe('TILE_ACTION');
    expect(store.activeModal).toBe('CARD_DRAW');

    store.closeModal();

    const updated = useGameStore.getState();
    expect(updated.activeModal).toBeNull();
    expect(updated.selectedTileId).toBeNull();
    expect(updated.turnPhase).toBe('TURN_END');
  });

  it('turnTimer initializes and tickTimer decrements seconds', () => {
    const store = useGameStore.getState();
    expect(store.turnTimer.isRunning).toBe(true);
    expect(store.turnTimer.timeLeft).toBe(10);

    store.tickTimer();
    expect(useGameStore.getState().turnTimer.timeLeft).toBe(9);
  });

  it('timeout during BUY_PROPERTY automatically triggers skipBuyProperty and opens AUCTION', () => {
    useGameStore.setState({
      turnPhase: 'TILE_ACTION',
      activeModal: 'BUY_PROPERTY',
      selectedTileId: 1,
      turnTimer: { timeLeft: 1, maxTime: 15, isRunning: true },
    });

    useGameStore.getState().tickTimer();

    const updated = useGameStore.getState();
    expect(updated.activeModal).toBe('AUCTION');
    expect(updated.turnPhase).toBe('AUCTION');
    expect(updated.auction).not.toBeNull();
  });

  it('tryRollForJailEscape triggers 3D rolling animation and closes modal', () => {
    useGameStore.setState((state) => ({
      players: state.players.map((p, idx) =>
        idx === 0 ? { ...p, inJail: true, jailTurns: 0, position: 10 } : p
      ),
      activeModal: 'JAIL_CHOICE',
    }));

    useGameStore.getState().tryRollForJailEscape();

    const state = useGameStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.dice.isRolling).toBe(true);
    expect(state.turnPhase).toBe('MOVING');
  });

  it('mortgageProperty mortgages unbuilt property and gives 50% cash', () => {
    const store = useGameStore.getState();
    store.buyProperty(1); // Buy tile 1 (price 60)
    const moneyBefore = useGameStore.getState().players[0].money;

    store.mortgageProperty(1);

    const updated = useGameStore.getState();
    expect(updated.board[1].isMortgaged).toBe(true);
    expect(updated.players[0].money).toBe(moneyBefore + 30); // 50% of 60
  });

  it('sellHouse reduces house count and refunds 50% house cost', () => {
    const store = useGameStore.getState();
    store.buyProperty(1);
    store.buyProperty(3);
    store.upgradeProperty(1); // 1 house (houseCost 50)
    const moneyBefore = useGameStore.getState().players[0].money;

    store.sellHouse(1);

    const updated = useGameStore.getState();
    expect(updated.board[1].houses).toBe(0);
    expect(updated.players[0].money).toBe(moneyBefore + 25); // 50% of 50
  });

  it('payPendingDebt deducts money from debtor, pays creditor, and resolves modal', () => {
    useGameStore.setState({
      pendingDebt: {
        debtorId: 'p1',
        creditorId: 'p2',
        amount: 200,
        reason: 'Tiền thuê đất',
      },
      activeModal: 'DEBT_SETTLEMENT',
    });

    const p1MoneyBefore = useGameStore.getState().players[0].money;
    const p2MoneyBefore = useGameStore.getState().players[1].money;

    useGameStore.getState().payPendingDebt();

    const updated = useGameStore.getState();
    expect(updated.pendingDebt).toBeNull();
    expect(updated.activeModal).toBeNull();
    expect(updated.players[0].money).toBe(p1MoneyBefore - 200);
    expect(updated.players[1].money).toBe(p2MoneyBefore + 200);
  });

  it('declareBankruptcy transfers assets to creditor and eliminates debtor', () => {
    // Player 1 owns Tile 1, owes Player 2
    useGameStore.setState((state) => ({
      board: state.board.map((t) => (t.id === 1 ? { ...t, ownerId: 'p1' } : t)),
      pendingDebt: {
        debtorId: 'p1',
        creditorId: 'p2',
        amount: 500,
        reason: 'Tiền thuê đất',
      },
      activeModal: 'DEBT_SETTLEMENT',
    }));

    useGameStore.getState().declareBankruptcy();

    const updated = useGameStore.getState();
    expect(updated.players[0].isBankrupt).toBe(true);
    expect(updated.board[1].ownerId).toBe('p2'); // transferred to creditor
    expect(updated.pendingDebt).toBeNull();
  });

  it('declareBankruptcy triggers GAME_OVER when only 1 non-bankrupt player remains', () => {
    // 3 players already bankrupt, player 4 declares bankruptcy
    useGameStore.setState((state) => ({
      players: state.players.map((p, idx) => ({
        ...p,
        isBankrupt: idx > 1, // p3, p4 bankrupt
      })),
      pendingDebt: {
        debtorId: 'p2',
        creditorId: 'p1',
        amount: 1000,
        reason: 'Tiền thuê đất',
      },
      activeModal: 'DEBT_SETTLEMENT',
    }));

    useGameStore.getState().declareBankruptcy();

    const updated = useGameStore.getState();
    expect(updated.players[1].isBankrupt).toBe(true);
    expect(updated.turnPhase).toBe('GAME_OVER');
    expect(updated.activeModal).toBe('GAME_OVER');
  });

  it('endTurn skips bankrupt players', () => {
    useGameStore.setState((state) => ({
      currentTurnIndex: 0,
      players: state.players.map((p, idx) =>
        idx === 1 ? { ...p, isBankrupt: true } : p // p2 is bankrupt
      ),
    }));

    useGameStore.getState().endTurn();

    const updated = useGameStore.getState();
    expect(updated.currentTurnIndex).toBe(2); // Skipped p2 (index 1) directly to p3 (index 2)
  });

  it('closeModal on CARD_DRAW with MOVE_TO action triggers movePlayerSteps and changes turnPhase to MOVING', () => {
    useGameStore.setState({
      activeModal: 'CARD_DRAW',
      activeCardData: {
        title: 'Tiến Thẳng Đến Ô Khởi Hành',
        description: 'Di chuyển thẳng tới ô Khởi Hành (GO)',
        type: 'chance',
        actionType: 'MOVE_TO',
        rewardOrPenalty: 0,
        targetPosition: 0,
      },
      currentTurnIndex: 0,
      players: useGameStore.getState().players.map((p, idx) =>
        idx === 0 ? { ...p, position: 7 } : p
      ),
    });

    useGameStore.getState().closeModal();

    const state = useGameStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.turnPhase).toBe('MOVING');
  });

  it('auction lifecycle: startAuction, placeBid, and finishAuction awards property to highest bidder', () => {
    const store = useGameStore.getState();
    store.startAuction(1);

    const auctionState = useGameStore.getState();
    expect(auctionState.activeModal).toBe('AUCTION');
    expect(auctionState.auction?.tileId).toBe(1);

    // Player 1 places bid of $50
    store.placeBid(50, 'p1');
    expect(useGameStore.getState().auction?.currentBid).toBe(50);
    expect(useGameStore.getState().auction?.highestBidderId).toBe('p1');

    // Finish auction
    const p1MoneyBefore = useGameStore.getState().players[0].money;
    store.finishAuction();

    const finalState = useGameStore.getState();
    expect(finalState.activeModal).toBeNull();
    expect(finalState.turnPhase).toBe('TURN_END');
    expect(finalState.board[1].ownerId).toBe('p1');
    expect(finalState.players[0].money).toBe(p1MoneyBefore - 50);
  });

  it('online visual choreography holds modal and triggers dice rolling animation when move occurs', () => {
    const store = useGameStore.getState();
    store.setOnlineMode(true, 'p1', 'room123');

    // Giả lập Server State vừa đổ xúc xắc (3 + 1 = 4) và server đã chuyển sang TILE_ACTION
    const mockServerState = {
      currentTurnIndex: 0,
      turnPhase: 'TILE_ACTION',
      activeModal: 'BUY_PROPERTY',
      selectedTileId: 4,
      dice: {
        dice1: 3,
        dice2: 1,
        isRolling: false,
        doublesCount: 0,
      },
      players: [
        {
          id: 'p1',
          name: 'Player 1',
          avatar: '/avatar.jpg',
          color: 'red',
          hexColor: '#EF4444',
          tokenId: 'char_male_a',
          position: 4, // Server đã gán vị trí đích
          money: 1500,
          inJail: false,
          jailTurns: 0,
          getOutOfJailFreeCards: 0,
          isBankrupt: false,
          isAI: false,
        },
      ],
      board: [],
      logs: [],
    };

    // Client nhận State từ Server:
    store.syncFromServer(mockServerState);

    const clientState = useGameStore.getState();
    // 1. Modal chưa được mở đè màn hình
    expect(clientState.activeModal).toBeNull();
    // 2. Kích hoạt animation đổ xúc xắc 3D
    expect(clientState.dice.isRolling).toBe(true);
    expect(clientState.turnPhase).toBe('MOVING');
    // 3. Quân cờ vẫn tạm thời giữ ở vị trí xuất phát (0) trong lúc xúc xắc nảy
    expect(clientState.players[0].position).toBe(0);
  });

  it('tryRollForJailEscape and consumeJailCard dispatch to colyseus in online mode', () => {
    const mockDispatcher = {
      rollDice: vi.fn(),
      buyProperty: vi.fn(),
      declineProperty: vi.fn(),
      bidAuction: vi.fn(),
      foldAuction: vi.fn(),
      upgradeProperty: vi.fn(),
      sellHouse: vi.fn(),
      mortgageProperty: vi.fn(),
      unmortgageProperty: vi.fn(),
      confirmRent: vi.fn(),
      confirmTax: vi.fn(),
      confirmCard: vi.fn(),
      payJailBail: vi.fn(),
      useJailCard: vi.fn(),
      endTurn: vi.fn(),
    };

    registerColyseusDispatcher(mockDispatcher);
    useGameStore.setState({ isOnline: true, mySessionId: 'sess_123' });

    const store = useGameStore.getState();
    store.tryRollForJailEscape();
    expect(mockDispatcher.rollDice).toHaveBeenCalledTimes(1);

    store.consumeJailCard();
    expect(mockDispatcher.useJailCard).toHaveBeenCalledTimes(1);

    store.payJailBail();
    expect(mockDispatcher.payJailBail).toHaveBeenCalledTimes(1);

    // Reset online mode
    useGameStore.setState({ isOnline: false, mySessionId: null });
    registerColyseusDispatcher(null);
  });

  it('tickTimer in online mode does not trigger local auto-actions and stops timer at 0', () => {
    useGameStore.setState({
      isOnline: true,
      mySessionId: 'sess_123',
      turnPhase: 'ROLLING',
      activeModal: null,
      turnTimer: { timeLeft: 1, maxTime: 30, isRunning: true },
    });

    const store = useGameStore.getState();
    store.tickTimer();

    const updated = useGameStore.getState();
    expect(updated.turnTimer.timeLeft).toBe(0);
    expect(updated.turnTimer.isRunning).toBe(false);
    // Turn phase remains ROLLING, not mutated by client auto-move
    expect(updated.turnPhase).toBe('ROLLING');

    useGameStore.setState({ isOnline: false, mySessionId: null });
  });

  it('closeModal in online mode sends confirmRent and confirmCard to dispatcher', () => {
    const mockDispatcher = {
      rollDice: vi.fn(),
      buyProperty: vi.fn(),
      declineProperty: vi.fn(),
      bidAuction: vi.fn(),
      foldAuction: vi.fn(),
      upgradeProperty: vi.fn(),
      sellHouse: vi.fn(),
      mortgageProperty: vi.fn(),
      unmortgageProperty: vi.fn(),
      confirmRent: vi.fn(),
      confirmTax: vi.fn(),
      confirmCard: vi.fn(),
      payJailBail: vi.fn(),
      useJailCard: vi.fn(),
      endTurn: vi.fn(),
    };

    registerColyseusDispatcher(mockDispatcher);
    useGameStore.setState({ isOnline: true, mySessionId: 'sess_123', activeModal: 'RENT_PAID' });

    useGameStore.getState().closeModal();
    expect(mockDispatcher.confirmRent).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().activeModal).toBeNull();

    useGameStore.setState({ activeModal: 'CARD_DRAW' });
    useGameStore.getState().closeModal();
    expect(mockDispatcher.confirmCard).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().activeModal).toBeNull();

    useGameStore.setState({ isOnline: false, mySessionId: null });
    registerColyseusDispatcher(null);
  });

  it('setOnlineMode cleans up room connection and restores singleplayer mode when leaving room', () => {
    useGameStore.getState().setOnlineMode(true, 'sess_host', 'room_xyz');
    expect(useGameStore.getState().isOnline).toBe(true);
    expect(useGameStore.getState().roomId).toBe('room_xyz');
    expect(useGameStore.getState().mySessionId).toBe('sess_host');

    // Giả lập rời phòng
    useGameStore.getState().setOnlineMode(false, undefined, undefined);
    expect(useGameStore.getState().isOnline).toBe(false);
    expect(useGameStore.getState().roomId).toBeNull();
    expect(useGameStore.getState().mySessionId).toBeNull();
  });
});
