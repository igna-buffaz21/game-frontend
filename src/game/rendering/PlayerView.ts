import Phaser from "phaser";
import type { PlayerState } from "../shared/types";

export class PlayerView {
  readonly root: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Container;
  private name: Phaser.GameObjects.Text;
  private health: Phaser.GameObjects.Graphics;
  private ring: Phaser.GameObjects.Arc;
  private target: PlayerState;

  constructor(scene: Phaser.Scene, player: PlayerState) {
    this.target = player;
    const color = player.team === "blue" ? 0x78c4e9 : 0xf38c76;
    const shadow = scene.add.ellipse(4, 8, 39, 25, 0x071b22, 0.55);
    this.ring = scene.add.circle(0, 0, 23).setStrokeStyle(2, 0xe9d7a2, 0.9);
    const torso = scene.add
      .rectangle(0, 0, 27, 26, color)
      .setStrokeStyle(2, 0x142a32);
    const vest = scene.add.rectangle(-2, 0, 12, 23, 0x243c43);
    const helmet = scene.add
      .circle(2, 0, 10, 0x344e5b)
      .setStrokeStyle(3, color);
    const weapon = scene.add
      .rectangle(20, 8, 24, 6, 0x17252c)
      .setStrokeStyle(1, 0x8c9d99);
    const visor = scene.add.rectangle(8, 0, 5, 12, 0xa5c6c6);
    const leftBoot = scene.add.rectangle(-9, -9, 15, 8, 0x182d3b);
    const rightBoot = scene.add.rectangle(-9, 9, 15, 8, 0x182d3b);
    const shoulder = scene.add
      .circle(0, -13, 5, color)
      .setStrokeStyle(1, 0x1c3544);
    this.body = scene.add.container(0, 0, [
      leftBoot,
      rightBoot,
      torso,
      vest,
      shoulder,
      helmet,
      visor,
      weapon,
    ]);
    this.health = scene.add.graphics();
    this.name = scene.add
      .text(0, -42, "", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#e0e9e5",
        backgroundColor: "#11252cbb",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5);
    this.root = scene.add
      .container(player.x, player.y, [
        shadow,
        this.ring,
        this.body,
        this.health,
        this.name,
      ])
      .setDepth(200);
  }

  setState(player: PlayerState, local: boolean) {
    this.target = player;
    this.ring.setVisible(local);
    this.name.setText(
      `${local ? "VOS · " : ""}${player.name}${player.bot ? " [BOT]" : ""}`,
    );
    this.name.setColor(player.team === "blue" ? "#b6e5fa" : "#ffc2b2");
    this.body.setRotation(player.angle);
    this.body.setAlpha(player.health ? 1 : 0.25);
    this.health.clear();
    if (player.health) {
      const maximum =
        player.role === "assault" ? 120 : player.role === "medic" ? 90 : 100;
      this.health.fillStyle(0x10282e).fillRect(-20, -29, 40, 4);
      this.health
        .fillStyle(player.team === "blue" ? 0x8bc7b4 : 0xf2a084)
        .fillRect(-20, -29, (40 * player.health) / maximum, 4);
    }
    this.root.setAlpha(player.health ? 1 : 0.65);
  }

  update(delta: number, now: number) {
    const blend = 1 - Math.exp(-delta / 45);
    // Snap only after respawn/reconnection; regular snapshots interpolate.
    if (
      Phaser.Math.Distance.Between(
        this.root.x,
        this.root.y,
        this.target.x,
        this.target.y,
      ) > 300
    )
      this.root.setPosition(this.target.x, this.target.y);
    else
      this.root.setPosition(
        Phaser.Math.Linear(this.root.x, this.target.x, blend),
        Phaser.Math.Linear(this.root.y, this.target.y, blend),
      );
    this.ring.setAlpha(
      this.target.invulnerableUntil > now
        ? 0.45 + Math.sin(now / 80) * 0.4
        : 0.9,
    );
  }

  destroy() {
    this.root.destroy();
  }
}
