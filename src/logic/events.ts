/**
 * 📢 ĐỊNH NGHĨA TOÀN BỘ SỰ KIỆN TRONG GAME (GAME EVENTS)
 * 
 * Kiến trúc Event-Driven giúp Client và Server giao tiếp thông qua các gói tin sự kiện
 * rõ ràng, không bị phụ thuộc lồng chéo logic vào nhau.
 */

export type GameEventType =
  | 'DICE_ROLLED'
  | 'PLAYER_MOVED'
  | 'TILE_LANDED'
  | 'PROPERTY_BOUGHT'
  | 'PROPERTY_UPGRADED'
  | 'RENT_PAID'
  | 'TAX_PAID'
  | 'CARD_DRAWN'
  | 'SENT_TO_JAIL'
  | 'TURN_ENDED'
  | 'GAME_OVER';

export interface BaseEvent {
  type: GameEventType;
  timestamp: number;
}

export interface DiceRolledEvent extends BaseEvent {
  type: 'DICE_ROLLED';
  payload: {
    playerId: string;
    dice1: number;
    dice2: number;
    diceSum: number;
    isDouble: boolean;
    doublesCount: number;
  };
}

export interface PlayerMovedEvent extends BaseEvent {
  type: 'PLAYER_MOVED';
  payload: {
    playerId: string;
    fromPosition: number;
    toPosition: number;
    passedGo: boolean;
    goReward: number;
  };
}

export interface TileLandedEvent extends BaseEvent {
  type: 'TILE_LANDED';
  payload: {
    playerId: string;
    tileId: number;
  };
}

export interface PropertyBoughtEvent extends BaseEvent {
  type: 'PROPERTY_BOUGHT';
  payload: {
    playerId: string;
    tileId: number;
    price: number;
  };
}

export interface PropertyUpgradedEvent extends BaseEvent {
  type: 'PROPERTY_UPGRADED';
  payload: {
    playerId: string;
    tileId: number;
    cost: number;
    newHouseCount: number;
    isHotel: boolean;
  };
}

export interface RentPaidEvent extends BaseEvent {
  type: 'RENT_PAID';
  payload: {
    tenantId: string;
    landlordId: string;
    tileId: number;
    amount: number;
  };
}

export interface TaxPaidEvent extends BaseEvent {
  type: 'TAX_PAID';
  payload: {
    playerId: string;
    tileId: number;
    taxAmount: number;
  };
}

export interface CardDrawnEvent extends BaseEvent {
  type: 'CARD_DRAWN';
  payload: {
    playerId: string;
    cardId: string;
    title: string;
    description: string;
    cardType: 'chance' | 'community';
    rewardOrPenalty: number;
  };
}

export interface SentToJailEvent extends BaseEvent {
  type: 'SENT_TO_JAIL';
  payload: {
    playerId: string;
    reason: 'LANDED_ON_JAIL_TILE' | 'THREE_DOUBLES' | 'CARD';
  };
}

export interface TurnEndedEvent extends BaseEvent {
  type: 'TURN_ENDED';
  payload: {
    previousPlayerId: string;
    nextPlayerId: string;
    nextTurnIndex: number;
  };
}

export type AnyGameEvent =
  | DiceRolledEvent
  | PlayerMovedEvent
  | TileLandedEvent
  | PropertyBoughtEvent
  | PropertyUpgradedEvent
  | RentPaidEvent
  | TaxPaidEvent
  | CardDrawnEvent
  | SentToJailEvent
  | TurnEndedEvent;
