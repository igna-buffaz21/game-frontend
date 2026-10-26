export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  health: number;
}

export interface GameState {
  players: PlayerState[];
}

export interface GameJoined {
  playerId: string;
  roomId: string;
}