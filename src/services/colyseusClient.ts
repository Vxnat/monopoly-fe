import { Client, Room } from '@colyseus/sdk';
import { useGameStore, registerColyseusDispatcher } from '../store/gameStore';
import { soundEngine } from '../utils/audio';

export enum MessageType {
  START_GAME = 'START_GAME',
  ADD_AI_BOT = 'ADD_AI_BOT',
  REMOVE_AI_BOT = 'REMOVE_AI_BOT',

  ROLL_DICE = 'ROLL_DICE',
  BUY_PROPERTY = 'BUY_PROPERTY',
  DECLINE_PROPERTY = 'DECLINE_PROPERTY',
  END_TURN = 'END_TURN',

  UPGRADE_PROPERTY = 'UPGRADE_PROPERTY',
  SELL_HOUSE = 'SELL_HOUSE',
  MORTGAGE_PROPERTY = 'MORTGAGE_PROPERTY',
  UNMORTGAGE_PROPERTY = 'UNMORTGAGE_PROPERTY',

  AUCTION_BID = 'AUCTION_BID',
  AUCTION_FOLD = 'AUCTION_FOLD',

  PAY_RENT_CONFIRM = 'PAY_RENT_CONFIRM',
  PAY_TAX_CONFIRM = 'PAY_TAX_CONFIRM',
  CARD_CONFIRM = 'CARD_CONFIRM',
  JAIL_PAY_BAIL = 'JAIL_PAY_BAIL',
  JAIL_USE_CARD = 'JAIL_USE_CARD',
  DECLARE_BANKRUPTCY = 'DECLARE_BANKRUPTCY',

  TRADE_PROPOSE = 'TRADE_PROPOSE',
  TRADE_ACCEPT = 'TRADE_ACCEPT',
  TRADE_REJECT = 'TRADE_REJECT',
  TRADE_CANCEL = 'TRADE_CANCEL',
}

class ColyseusClientService {
  private client: Client;
  private room: Room | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = this.resolveServerUrl();
    this.client = new Client(this.serverUrl);
  }

  public resolveServerUrl(): string {
    if (typeof window !== 'undefined') {
      // 1. URL Query parameter (e.g. ?server=wss://... hoặc ?server=http://...)
      const params = new URLSearchParams(window.location.search);
      const queryServer = params.get('server');
      if (queryServer) {
        let normalized = queryServer.trim();
        if (normalized.startsWith('http://')) normalized = normalized.replace('http://', 'ws://');
        if (normalized.startsWith('https://')) normalized = normalized.replace('https://', 'wss://');
        try {
          localStorage.setItem('MONOPOLY_CUSTOM_SERVER_URL', normalized);
        } catch {
          // Ignore localStorage errors
        }
        return normalized;
      }

      // 2. LocalStorage lưu trước đó
      try {
        const stored = localStorage.getItem('MONOPOLY_CUSTOM_SERVER_URL');
        if (stored) return stored;
      } catch {
        // Ignore
      }

      // 3. Nếu chạy trên HTTPS trong trình duyệt và không có env -> tránh Mixed Content
      if (window.location.protocol === 'https:' && !process.env.NEXT_PUBLIC_COLYSEUS_URL) {
        return `wss://${window.location.host}`;
      }
    }

    // 4. Biến môi trường Next.js
    const envUrl = process.env.NEXT_PUBLIC_COLYSEUS_URL;
    if (envUrl) return envUrl;

    // 5. Mặc định môi trường dev local
    return 'ws://localhost:2567';
  }

  public getServerWsUrl(): string {
    return this.serverUrl;
  }

  public getServerHttpUrl(): string {
    return this.serverUrl.replace(/^ws(s?):/, 'http$1:');
  }

  public setServerUrl(newUrl: string): void {
    let normalized = newUrl.trim();
    if (normalized.startsWith('http://')) normalized = normalized.replace('http://', 'ws://');
    if (normalized.startsWith('https://')) normalized = normalized.replace('https://', 'wss://');
    this.serverUrl = normalized;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('MONOPOLY_CUSTOM_SERVER_URL', normalized);
      } catch {
        // Ignore
      }
    }
    this.client = new Client(this.serverUrl);
  }

  public async checkHealth(): Promise<boolean> {
    try {
      // Refresh URL nếu người dùng vừa đổi
      const currentUrl = this.resolveServerUrl();
      if (currentUrl !== this.serverUrl) {
        this.serverUrl = currentUrl;
        this.client = new Client(this.serverUrl);
      }
      const httpUrl = this.getServerHttpUrl();
      const res = await fetch(`${httpUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(4000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  public isConnected(): boolean {
    return !!this.room;
  }

  public getSessionId(): string | null {
    return this.room ? this.room.sessionId : null;
  }

  public getRoomId(): string | null {
    return this.room ? this.room.roomId : null;
  }

  private setupRoomListeners(room: Room): void {
    this.room = room;
    const store = useGameStore.getState();

    store.setOnlineMode(true, this.room.sessionId, this.room.roomId);

    // Lắng nghe đồng bộ State từ Server
    this.room.onStateChange((serverState) => {
      useGameStore.getState().syncFromServer(serverState);
    });

    this.room.onLeave((code) => {
      console.log('🚪 Rời khỏi phòng Colyseus:', code);
      useGameStore.getState().setOnlineMode(false, undefined, undefined);
      this.room = null;
    });

    this.room.onError((code, message) => {
      console.error('❌ Lỗi kết nối Colyseus:', code, message);
    });
  }

  /**
   * Kết nối và tham gia phòng chơi Multiplayer (Tạo mới hoặc vào phòng sẵn có)
   */
  public async joinOrCreateRoom(options: {
    name: string;
    avatar?: string;
    tokenId?: string;
    autoStart?: boolean;
  }): Promise<Room> {
    if (this.room) {
      this.leaveRoom();
    }

    try {
      const room = await this.client.joinOrCreate('monopoly_room', options);
      this.setupRoomListeners(room);
      return room;
    } catch (err) {
      console.error('❌ Không thể kết nối tới máy chủ Colyseus:', err);
      throw err;
    }
  }

  /**
   * Chủ động tạo một phòng chơi hoàn toàn mới
   */
  public async createRoom(options: {
    name: string;
    avatar?: string;
    tokenId?: string;
  }): Promise<Room> {
    if (this.room) {
      this.leaveRoom();
    }

    try {
      const room = await this.client.create('monopoly_room', options);
      this.setupRoomListeners(room);
      return room;
    } catch (err) {
      console.error('❌ Không thể tạo phòng mới trên Colyseus:', err);
      throw err;
    }
  }

  /**
   * Tham gia vào phòng chơi theo mã phòng Room ID
   */
  public async joinRoomById(roomId: string, options: {
    name: string;
    avatar?: string;
    tokenId?: string;
  }): Promise<Room> {
    if (this.room) {
      this.leaveRoom();
    }

    try {
      const room = await this.client.joinById(roomId, options);
      this.setupRoomListeners(room);
      return room;
    } catch (err) {
      console.error('❌ Không thể tham gia phòng theo mã ID:', err);
      throw err;
    }
  }

  /**
   * Gửi thông điệp / hành động lên Server Authoritative
   */
  public send(type: MessageType | string, payload?: any): void {
    if (!this.room) {
      console.warn('⚠️ Chưa kết nối phòng máy chủ, không thể gửi message:', type);
      return;
    }
    this.room.send(type, payload);
  }

  public startOnlineGame(): void {
    this.send(MessageType.START_GAME);
  }

  public addAiBot(): void {
    this.send(MessageType.ADD_AI_BOT);
  }

  public rollDice(): void {
    soundEngine.playDiceRoll();
    this.send(MessageType.ROLL_DICE);
  }

  public buyProperty(): void {
    this.send(MessageType.BUY_PROPERTY);
  }

  public declineProperty(): void {
    this.send(MessageType.DECLINE_PROPERTY);
  }

  public bidAuction(amount?: number): void {
    this.send(MessageType.AUCTION_BID, { amount });
  }

  public foldAuction(): void {
    this.send(MessageType.AUCTION_FOLD);
  }

  public upgradeProperty(tileId: number): void {
    this.send(MessageType.UPGRADE_PROPERTY, { tileId });
  }

  public sellHouse(tileId: number): void {
    this.send(MessageType.SELL_HOUSE, { tileId });
  }

  public mortgageProperty(tileId: number): void {
    this.send(MessageType.MORTGAGE_PROPERTY, { tileId });
  }

  public unmortgageProperty(tileId: number): void {
    this.send(MessageType.UNMORTGAGE_PROPERTY, { tileId });
  }

  public confirmRent(): void {
    this.send(MessageType.PAY_RENT_CONFIRM);
  }

  public confirmTax(): void {
    this.send(MessageType.PAY_TAX_CONFIRM);
  }

  public confirmCard(): void {
    this.send(MessageType.CARD_CONFIRM);
  }

  public payJailBail(): void {
    this.send(MessageType.JAIL_PAY_BAIL);
  }

  public useJailCard(): void {
    this.send(MessageType.JAIL_USE_CARD);
  }

  public proposeTrade(payload: {
    targetPlayerId: string;
    offeredMoney: number;
    offeredTileIds: number[];
    requestedMoney: number;
    requestedTileIds: number[];
  }): void {
    this.send(MessageType.TRADE_PROPOSE, payload);
  }

  public acceptTrade(): void {
    this.send(MessageType.TRADE_ACCEPT);
  }

  public rejectTrade(): void {
    this.send(MessageType.TRADE_REJECT);
  }

  public cancelTrade(): void {
    this.send(MessageType.TRADE_CANCEL);
  }

  public endTurn(): void {
    this.send(MessageType.END_TURN);
  }

  public leaveRoom(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    useGameStore.getState().setOnlineMode(false, undefined, undefined);
  }
}

export const colyseusClient = new ColyseusClientService();
registerColyseusDispatcher(colyseusClient);
