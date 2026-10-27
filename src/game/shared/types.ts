// Generado desde game-backend/src/shared/types.ts. Ejecutar npm run sync:protocol.
export const PROTOCOL_VERSION = 2;
export const TEAM_CAPACITY = 10;
export type Team = "blue" | "red";
export type Role = "assault" | "medic" | "hacker";
export type CargoKind = "cash" | "gold" | "diamonds";
export interface Point {
  x: number;
  y: number;
}
export interface Rect extends Point {
  width: number;
  height: number;
}
export interface Obstacle extends Rect {
  kind: "container" | "warehouse";
  color: number;
}
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  angle: number;
  fire: boolean;
  interact: boolean;
  drop: boolean;
  ability: boolean;
}
export interface PlayerState extends Point {
  id: string;
  name: string;
  team: Team;
  role: Role;
  health: number;
  angle: number;
  cargoId: string | null;
  respawnAt: number | null;
  invulnerableUntil: number;
  bot: boolean;
}
export interface CargoState extends Point {
  id: string;
  kind: CargoKind;
  owner: Team;
  home: Point;
  carriers: string[];
  returnAt: number | null;
  availableAt: number;
  locked: boolean;
  hackProgress: number;
}
export interface BulletState extends Point {
  id: number;
  team: Team;
  angle: number;
  ownerId: string;
  expiresAt: number;
  damage: number;
}
export interface MatchState {
  players: PlayerState[];
  cargo: CargoState[];
  bullets: BulletState[];
  scores: Record<Team, number>;
  remainingMs: number;
  ended: boolean;
  now: number;
  event: string;
}
export interface JoinOptions {
  name: string;
  role: Role;
  mode: "practice" | "online";
  team?: Team;
}
export interface Joined {
  playerId: string;
  roomId: string;
  protocolVersion: number;
}
export const emptyInput = (): PlayerInput => ({
  up: false,
  down: false,
  left: false,
  right: false,
  angle: 0,
  fire: false,
  interact: false,
  drop: false,
  ability: false,
});
export const ROLE_NAMES: Record<Role, string> = {
  assault: "Assault",
  medic: "Medic",
  hacker: "Hacker",
};
export const CARGO_RULES = {
  cash: { name: "Bolsa de dinero", value: 500, hands: false, carriers: 1 },
  gold: { name: "Lingotes de oro", value: 1500, hands: true, carriers: 1 },
  diamonds: {
    name: "Carretilla de diamantes",
    value: 5000,
    hands: true,
    carriers: 2,
  },
} as const;
