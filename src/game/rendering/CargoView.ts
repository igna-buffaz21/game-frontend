import Phaser from "phaser";
import { HACK_DURATION_MS } from "../shared/map";
import { CARGO_RULES } from "../shared/types";
import type { CargoState, Team } from "../shared/types";

export class CargoView {
  readonly root: Phaser.GameObjects.Container;
  private label: Phaser.GameObjects.Text;
  private detail: Phaser.GameObjects.Text;
  private shape: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, cargo: CargoState) {
    this.shape = scene.add.graphics();
    this.label = scene.add
      .text(0, -35, "", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#f2d48b",
        backgroundColor: "#15292ddd",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5);
    this.detail = scene.add
      .text(0, 32, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#e0e3cf",
      })
      .setOrigin(0.5);
    this.root = scene.add
      .container(cargo.x, cargo.y, [this.shape, this.label, this.detail])
      .setDepth(150);
  }

  setState(cargo: CargoState, now: number, localTeam?: Team) {
    this.root
      .setPosition(cargo.x, cargo.y)
      .setVisible(cargo.availableAt <= now);
    this.root.setAlpha(cargo.carriers.length ? 0.8 : 1);
    const ownCargo = cargo.owner === localTeam;
    const color = cargo.owner === "blue" ? 0x7ecfff : 0xff947f;
    this.label.setColor(ownCargo ? "#9db7bf" : "#ffe0a3");
    this.shape.clear();
    this.shape.fillStyle(color, 0.06).fillCircle(0, 0, 30);
    this.shape.lineStyle(2, color, 0.65).strokeCircle(0, 0, 26);
    this.shape.fillStyle(color).fillRoundedRect(-12, 18, 24, 3, 1);
    this.shape
      .lineStyle(1, 0xe9bc65, 0.3)
      .strokeCircle(0, 0, cargo.kind === "diamonds" ? 29 : 22);
    this.shape.fillStyle(0x10232a, 0.5).fillEllipse(3, 12, 35, 18);
    if (cargo.kind === "cash") {
      this.shape.fillStyle(0x9ca97b).fillRoundedRect(-11, -12, 22, 27, 7);
      this.shape.lineStyle(2, 0xe9d49b).lineBetween(-8, -7, 8, -7);
      this.shape.fillStyle(0xe6d5a2).fillRect(-3, -2, 6, 10);
    } else if (cargo.kind === "gold") {
      this.shape.fillStyle(0x745135).fillRect(-17, -12, 34, 27);
      this.shape.lineStyle(2, 0xceb36c).strokeRect(-17, -12, 34, 27);
      for (const x of [-12, 1])
        this.shape.fillStyle(0xf1c15e).fillRect(x, -7, 10, 17);
    } else {
      this.shape
        .fillStyle(cargo.locked ? 0x46545b : 0x367f8e)
        .fillRoundedRect(-22, -18, 44, 36, 4);
      this.shape
        .lineStyle(2, cargo.locked ? 0xd4b467 : 0x8bdde4)
        .strokeRoundedRect(-22, -18, 44, 36, 4);
      this.shape
        .fillStyle(0x152b32)
        .fillCircle(-16, 21, 5)
        .fillCircle(16, 21, 5);
      this.shape
        .fillStyle(cargo.locked ? 0xd4b467 : 0xc1f4ee)
        .fillTriangle(0, -10, -10, 0, 10, 0)
        .fillTriangle(-10, 0, 10, 0, 0, 12);
      if (cargo.hackProgress) {
        this.shape.fillStyle(0x1b2d31).fillRect(-30, 45, 60, 5);
        this.shape
          .fillStyle(0xe9bc65)
          .fillRect(-30, 45, 60 * cargo.hackProgress, 5);
      }
    }
    this.label.setText(
      `$${CARGO_RULES[cargo.kind].value.toLocaleString("es-AR")}`,
    );
    this.detail.setText(
      ownCargo
        ? cargo.returnAt !== null
          ? "E · RECUPERAR"
          : `DEPÓSITO ${cargo.owner === "blue" ? "AZUL" : "ROJO"}`
        : cargo.locked
          ? cargo.hackProgress
            ? `HACKEO · ${Math.ceil(((1 - cargo.hackProgress) * HACK_DURATION_MS) / 1000)}s`
            : "HACKER · MANTENER E"
          : cargo.returnAt
            ? `VUELVE EN ${Math.ceil((cargo.returnAt - now) / 1000)}s`
            : cargo.kind === "diamonds"
              ? `${cargo.carriers.length}/2 OPERADORES`
              : cargo.kind === "gold"
                ? "ORO · DOS MANOS"
                : "DINERO",
    );
  }

  destroy() {
    this.root.destroy();
  }
}
