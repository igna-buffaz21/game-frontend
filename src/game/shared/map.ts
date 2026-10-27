// Generado desde game-backend/src/shared/map.ts. Ejecutar npm run sync:protocol.
import type { Obstacle, Point, Rect, Team } from "./types.js";
export const WORLD = { width: 2240, height: 1600 };
export const DOCK: Rect = { x: 140, y: 140, width: 1960, height: 1320 };
export const PLAYER_RADIUS = 17;
export const HACK_DURATION_MS = 10_000;
export const MATCH_DURATION = 5 * 60 * 1000;
export const BASES: Record<Team, Rect> = {
  blue: { x: 190, y: 190, width: 260, height: 230 },
  red: { x: 1790, y: 1180, width: 260, height: 230 },
};
export const center = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});
export const OBSTACLES: Obstacle[] = [
  {
    x: 530,
    y: 200,
    width: 310,
    height: 190,
    kind: "warehouse",
    color: 0x485960,
  },
  {
    x: 1400,
    y: 1210,
    width: 310,
    height: 190,
    kind: "warehouse",
    color: 0x485960,
  },
  ...[
    [620, 570, 110, 260, 0xa8553b],
    [770, 570, 110, 260, 0x396b80],
    [1030, 480, 260, 100, 0x9a793b],
    [1030, 1020, 260, 100, 0x396b80],
    [1360, 770, 110, 260, 0x396b80],
    [1510, 770, 110, 260, 0xa8553b],
    [320, 1010, 220, 100, 0x68734b],
    [1700, 490, 220, 100, 0x68734b],
    [610, 1230, 240, 100, 0x9a793b],
    [1390, 270, 240, 100, 0xa8553b],
  ].map(([x, y, width, height, color]) => ({
    x,
    y,
    width,
    height,
    color,
    kind: "container" as const,
  })),
];
export function contains(rect: Rect, point: Point, padding = 0): boolean {
  return (
    point.x >= rect.x - padding &&
    point.x <= rect.x + rect.width + padding &&
    point.y >= rect.y - padding &&
    point.y <= rect.y + rect.height + padding
  );
}
export function walkable(point: Point, radius = PLAYER_RADIUS): boolean {
  return (
    contains(
      {
        x: DOCK.x + radius,
        y: DOCK.y + radius,
        width: DOCK.width - radius * 2,
        height: DOCK.height - radius * 2,
      },
      point,
    ) && !OBSTACLES.some((o) => contains(o, point, radius))
  );
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
/** Each depot has an accessible loading apron in front of its warehouse. */
export const DEPOTS: Record<Team, { building: Rect; apron: Rect }> = {
  blue: {
    building: { x: 530, y: 200, width: 310, height: 190 },
    apron: { x: 530, y: 410, width: 310, height: 145 },
  },
  red: {
    building: { x: 1400, y: 1210, width: 310, height: 190 },
    apron: { x: 1400, y: 1045, width: 310, height: 145 },
  },
};
const BLUE_CARGO = [
  { kind: "cash" as const, x: 590, y: 440 },
  { kind: "cash" as const, x: 780, y: 440 },
  { kind: "gold" as const, x: 590, y: 520 },
  { kind: "diamonds" as const, x: 780, y: 520 },
];
export const CARGO_SPAWNS = [
  ...BLUE_CARGO.map((cargo) => ({ ...cargo, owner: "blue" as const })),
  ...BLUE_CARGO.map((cargo) => ({
    ...cargo,
    x: WORLD.width - cargo.x,
    y: WORLD.height - cargo.y,
    owner: "red" as const,
  })),
];
