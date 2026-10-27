import Phaser from "phaser";
import {
  BASES,
  CARGO_SPAWNS,
  DEPOTS,
  DOCK,
  OBSTACLES,
  WORLD,
  center,
} from "../shared/map";
import type { Team } from "../shared/types";

type Graphics = Phaser.GameObjects.Graphics;
const TEAM_COLOR = { blue: 0x71caff, red: 0xff927f };
const style = {
  fontFamily: "monospace",
  fontSize: "13px",
  color: "#dce4df",
  letterSpacing: 2,
};

function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = "#c6d5cf",
  size = 13,
) {
  return scene.add
    .text(x, y, text, {
      ...style,
      color,
      fontSize: `${size}px`,
      align: "center",
    })
    .setOrigin(0.5);
}

function drawWater(scene: Phaser.Scene) {
  const texture = scene.textures.createCanvas("port-water", 256, 256)!;
  const ctx = texture.context;
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, "#0a3548");
  gradient.addColorStop(0.5, "#0c3b4c");
  gradient.addColorStop(1, "#0a3548");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 65; i++) {
    const x = (i * 71) % 256,
      y = (i * 37) % 256;
    ctx.strokeStyle = i % 3 ? "#75c6d212" : "#75c6d225";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 9, y - 3, x + 20 + (i % 12), y);
    ctx.stroke();
  }
  texture.refresh();
  return scene.add
    .tileSprite(0, 0, WORLD.width, WORLD.height, "port-water")
    .setOrigin(0)
    .setDepth(-2);
}

function drawCrane(
  g: Graphics,
  x: number,
  y: number,
  color: number,
  direction: number,
) {
  g.fillStyle(0x071b29, 0.5).fillRect(x - 25, y - 25, 95, 80);
  g.fillStyle(0x243d4a).fillRect(x - 30, y - 30, 60, 60);
  g.lineStyle(3, color).strokeRect(x - 26, y - 26, 52, 52);
  g.lineStyle(12, 0x162b38).lineBetween(x, y, x + direction * 170, y - 38);
  g.lineStyle(7, color).lineBetween(x, y, x + direction * 170, y - 38);
  for (let i = 0; i < 5; i++) {
    const a = x + direction * i * 32,
      b = x + direction * (i + 1) * 32;
    g.lineStyle(2, 0x172a35).lineBetween(
      a,
      y - i * 7 - 5,
      b,
      y - (i + 1) * 7 + 5,
    );
  }
  g.fillStyle(0x75939a).fillCircle(x, y, 12);
  g.lineStyle(2, 0x829d9e).lineBetween(
    x + direction * 170,
    y - 38,
    x + direction * 170,
    y + 42,
  );
  g.fillStyle(color).fillRect(x + direction * 170 - 18, y + 40, 36, 26);
}

function drawBase(scene: Phaser.Scene, g: Graphics, team: Team) {
  const base = BASES[team],
    point = center(base),
    color = TEAM_COLOR[team];
  g.fillStyle(0x122b3a, 0.8).fillRoundedRect(
    base.x,
    base.y,
    base.width,
    base.height,
    8,
  );
  g.fillStyle(color, 0.08).fillRoundedRect(
    base.x + 5,
    base.y + 5,
    base.width - 10,
    base.height - 10,
    5,
  );
  g.lineStyle(2, color, 0.55).strokeRoundedRect(
    base.x,
    base.y,
    base.width,
    base.height,
    8,
  );
  g.lineStyle(1, color, 0.15).strokeRect(
    base.x + 14,
    base.y + 14,
    base.width - 28,
    base.height - 28,
  );
  for (const x of [base.x, base.x + base.width - 38])
    for (const y of [base.y, base.y + base.height]) {
      g.lineStyle(4, color).lineBetween(x, y, x + 38, y);
    }
  g.lineStyle(2, color, 0.35).strokeCircle(point.x, point.y + 5, 45);
  g.lineStyle(1, color, 0.2).strokeCircle(point.x, point.y + 5, 55);
  g.lineStyle(2, color, 0.55).strokePoints(
    [
      { x: point.x, y: point.y - 16 },
      { x: point.x + 21, y: point.y + 5 },
      { x: point.x, y: point.y + 26 },
      { x: point.x - 21, y: point.y + 5 },
    ],
    true,
  );
  label(
    scene,
    point.x,
    base.y + 37,
    `BASE ${team === "blue" ? "AZUL" : "ROJA"}`,
    team === "blue" ? "#a4dcff" : "#ffbeac",
    17,
  );
  label(
    scene,
    point.x,
    base.y + base.height - 32,
    "ASEGURAR CARGAMENTO",
    "#9dafb2",
    9,
  );
}

function drawDepots(scene: Phaser.Scene, g: Graphics) {
  for (const team of ["blue", "red"] as const) {
    const { building, apron } = DEPOTS[team],
      color = TEAM_COLOR[team];
    g.fillStyle(color, 0.055).fillRoundedRect(
      apron.x - 12,
      apron.y - 10,
      apron.width + 24,
      apron.height + 20,
      7,
    );
    g.lineStyle(2, color, 0.4).strokeRoundedRect(
      apron.x - 12,
      apron.y - 10,
      apron.width + 24,
      apron.height + 20,
      7,
    );
    for (const cargo of CARGO_SPAWNS.filter((item) => item.owner === team)) {
      g.fillStyle(0x122b35, 0.65).fillRoundedRect(
        cargo.x - 32,
        cargo.y - 28,
        64,
        58,
        4,
      );
      g.lineStyle(1, color, 0.3).strokeRoundedRect(
        cargo.x - 32,
        cargo.y - 28,
        64,
        58,
        4,
      );
    }
    // Door lamps and team markings make depot ownership visible at a glance.
    const doorY =
      team === "blue" ? building.y + building.height - 5 : building.y + 5;
    g.fillStyle(0x172a32).fillRect(building.x + 95, doorY - 8, 120, 16);
    g.fillStyle(color, 0.15)
      .fillCircle(building.x + 100, doorY, 35)
      .fillCircle(building.x + 210, doorY, 35);
    g.fillStyle(color)
      .fillRect(building.x + 95, doorY - 3, 8, 6)
      .fillRect(building.x + 207, doorY - 3, 8, 6);
    g.fillStyle(color).fillRect(
      building.x + 8,
      building.y + 8,
      building.width - 16,
      4,
    );
    label(
      scene,
      building.x + building.width / 2,
      building.y + building.height / 2,
      `DEPÓSITO ${team === "blue" ? "AZUL" : "ROJO"}`,
      team === "blue" ? "#b2e1ff" : "#ffc1af",
      16,
    );
    label(
      scene,
      building.x + building.width / 2,
      building.y + building.height / 2 + 25,
      "ALMACÉN DE VALORES",
      "#839ba3",
      8,
    );
  }
}

/** Static decoration follows the authoritative geometry; water is the only moving layer. */
export function drawPort(scene: Phaser.Scene) {
  const water = drawWater(scene);
  const g = scene.add.graphics();
  let seed = 71;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  g.lineStyle(25, 0x62cbd1, 0.035).strokeRect(
    DOCK.x - 8,
    DOCK.y - 8,
    DOCK.width + 16,
    DOCK.height + 16,
  );
  g.fillStyle(0x041c29, 0.6).fillRect(
    DOCK.x + 12,
    DOCK.y + 16,
    DOCK.width,
    DOCK.height,
  );
  g.fillStyle(0x667e80).fillRect(
    DOCK.x - 8,
    DOCK.y - 8,
    DOCK.width + 16,
    DOCK.height + 16,
  );
  g.fillStyle(0x35464e).fillRect(DOCK.x, DOCK.y, DOCK.width, DOCK.height);
  for (let x = DOCK.x; x < DOCK.x + DOCK.width; x += 80)
    for (let y = DOCK.y; y < DOCK.y + DOCK.height; y += 80) {
      g.fillStyle(random() > 0.5 ? 0x607171 : 0x223b48, 0.15).fillRect(
        x + 1,
        y + 1,
        78,
        78,
      );
      g.lineStyle(1, 0x102c38, 0.25).strokeRect(x, y, 80, 80);
    }
  for (let i = 0; i < 1400; i++)
    g.fillStyle(random() > 0.5 ? 0xc4c7af : 0x102936, 0.12).fillRect(
      DOCK.x + random() * DOCK.width,
      DOCK.y + random() * DOCK.height,
      2 + random() * 4,
      2,
    );
  g.fillStyle(0x213b48, 0.3)
    .fillRect(905, 160, 110, 1280)
    .fillRect(160, 670, 1920, 120);
  for (const x of [475, 935, 1300, 1725])
    for (let y = 200; y < 1400; y += 60)
      g.fillStyle(0xc7c9ad, 0.22).fillRect(x, y, 4, 27);
  for (const y of [460, 1140])
    for (let x = 200; x < 2000; x += 60)
      g.fillStyle(0xc7c9ad, 0.17).fillRect(x, y, 27, 4);
  for (let x = 160; x < 2100; x += 80)
    for (const y of [130, 1464]) {
      g.fillStyle(0x152a34).fillRoundedRect(x, y - 8, 24, 16, 3);
      g.fillStyle(0xd1ae67).fillRect(x + 8, y - 6, 8, 12);
      g.fillStyle(0x77dce0, 0.06).fillCircle(
        x + 12,
        y + (y < 200 ? -10 : 10),
        22,
      );
    }
  for (let y = 180; y < 1430; y += 80)
    for (const x of [132, 2100]) {
      g.fillStyle(0x142d38).fillRoundedRect(x - 8, y, 16, 24, 3);
      g.fillStyle(0xd1ae67).fillRect(x - 5, y + 7, 10, 10);
    }
  for (const obstacle of OBSTACLES) {
    const { x, y, width, height, color, kind } = obstacle;
    g.fillStyle(0x0a202c, 0.45).fillRoundedRect(
      x + 12,
      y + 15,
      width + 4,
      height + 2,
      3,
    );
    g.fillStyle(0x162d38).fillRoundedRect(
      x - 3,
      y - 3,
      width + 6,
      height + 6,
      3,
    );
    g.fillStyle(color).fillRect(x, y, width, height);
    g.fillStyle(0x0b2633, 0.2).fillRect(x, y + height - 8, width, 8);
    g.lineStyle(2, 0xf0efcf, 0.18).lineBetween(
      x + 3,
      y + 3,
      x + width - 3,
      y + 3,
    );
    const vertical = kind === "container" && height > width;
    for (
      let n = 10;
      n < (vertical ? height : width) - 4;
      n += kind === "container" ? 12 : 16
    ) {
      g.lineStyle(2, 0x102a36, 0.3).lineBetween(
        x + (vertical ? 5 : n),
        y + (vertical ? n : 5),
        x + (vertical ? width - 5 : n),
        y + (vertical ? n : height - 5),
      );
      g.lineStyle(1, 0xf2e7ce, 0.12).lineBetween(
        x + (vertical ? 5 : n + 2),
        y + (vertical ? n + 2 : 5),
        x + (vertical ? width - 5 : n + 2),
        y + (vertical ? n + 2 : height - 5),
      );
    }
    if (kind === "warehouse") {
      g.fillStyle(0x16303c).fillRect(x + 30, y + 58, width - 60, 78);
      for (const ventX of [x + 24, x + width - 49]) {
        g.fillStyle(0x6c8183).fillRect(ventX, y + 18, 25, 25);
        g.lineStyle(2, 0x304a54).strokeCircle(ventX + 12, y + 30, 8);
      }
    } else {
      label(
        scene,
        x + width / 2,
        y + height / 2,
        "PN / 07",
        "#dfd7b9",
        10,
      ).setAlpha(0.5);
      g.fillStyle(0xd5d4b6, 0.45).fillRect(x + 8, y + height - 16, 18, 5);
    }
  }
  drawDepots(scene, g);
  drawBase(scene, g, "blue");
  drawBase(scene, g, "red");
  label(scene, 1120, 790, "TERMINAL 07", "#6d8689", 32).setAlpha(0.35);
  label(
    scene,
    1120,
    825,
    "PUERTO NEGRO / ZONA DE TRÁNSITO",
    "#849b97",
    9,
  ).setAlpha(0.35);
  drawCrane(g, 2020, 75, 0xc58e4d, -1);
  drawCrane(g, 78, 1080, 0x487d9c, 1);
  // Cargo ship lies outside the playable quay.
  g.fillStyle(0x102b39).fillPoints(
    [
      { x: 280, y: 1485 },
      { x: 780, y: 1485 },
      { x: 835, y: 1535 },
      { x: 780, y: 1590 },
      { x: 280, y: 1590 },
      { x: 240, y: 1535 },
    ],
    true,
  );
  g.lineStyle(3, 0x617f87).strokePoints(
    [
      { x: 280, y: 1485 },
      { x: 780, y: 1485 },
      { x: 835, y: 1535 },
      { x: 780, y: 1590 },
      { x: 280, y: 1590 },
      { x: 240, y: 1535 },
    ],
    true,
  );
  for (let i = 0; i < 4; i++) {
    g.fillStyle([0x527e8a, 0xa16848, 0x9c874b, 0x456a7f][i]).fillRect(
      310 + i * 105,
      1502,
      94,
      65,
    );
    for (let n = 8; n < 90; n += 10)
      g.lineStyle(2, 0x182f3b, 0.4).lineBetween(
        310 + i * 105 + n,
        1506,
        310 + i * 105 + n,
        1564,
      );
  }
  for (const [x, y] of [
    [480, 570],
    [940, 875],
    [1300, 700],
    [1720, 1020],
    [300, 1200],
    [1930, 720],
  ]) {
    for (const [radius, alpha] of [
      [100, 0.02],
      [60, 0.035],
      [28, 0.045],
    ])
      g.fillStyle(0xffcf7b, alpha).fillCircle(x, y, radius);
    g.fillStyle(0x172c37).fillCircle(x, y, 8);
    g.fillStyle(0xffd08c).fillCircle(x, y - 2, 3);
  }
  return water;
}
