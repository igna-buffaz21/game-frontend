import Phaser from "phaser";
import { createGameSocket } from "../../services/socket";
import type {
  JoinOptions,
  Joined,
  MatchState,
  PlayerInput,
} from "../../types/game";
import { PROTOCOL_VERSION, emptyInput } from "../shared/types";
import { WORLD } from "../shared/map";
import { drawPort } from "../rendering/PortRenderer";
import { PlayerView } from "../rendering/PlayerView";
import { CargoView } from "../rendering/CargoView";

export interface GameCallbacks {
  onState: (state: MatchState, localId: string) => void;
  onStatus: (status: string | null) => void;
}

export class GameScene extends Phaser.Scene {
  private socket;
  private callbacks: GameCallbacks;
  private players = new Map<string, PlayerView>();
  private cargo = new Map<string, CargoView>();
  private bullets = new Map<number, Phaser.GameObjects.Rectangle>();
  private localPlayerId: string | null = null;
  private keys!: Record<
    "W" | "A" | "S" | "D" | "E" | "G" | "Q",
    Phaser.Input.Keyboard.Key
  >;
  private lastSentAt = 0;
  private lastUiAt = 0;
  private handshakeTimer?: ReturnType<typeof setTimeout>;
  private paused = false;
  private ended = false;
  private water?: Phaser.GameObjects.TileSprite;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  private lastInput = "";

  constructor(options: JoinOptions, callbacks: GameCallbacks) {
    super("GameScene");
    this.socket = createGameSocket(options);
    this.callbacks = callbacks;
  }

  create() {
    this.water = drawPort(this);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setZoom(this.scale.width < 800 ? 0.75 : 0.9);
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,E,G,Q",
    ) as typeof this.keys;
    this.input.mouse?.disableContextMenu();
    this.input.setDefaultCursor("crosshair");
    this.socket.on("game:joined", this.handleJoined);
    this.socket.on("game:state", this.handleState);
    this.socket.on("game:error", this.handleError);
    this.socket.on("connect_error", this.handleConnectError);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("connect", this.handleConnect);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.events.once("shutdown", this.cleanup);
    this.events.once("destroy", this.cleanup);
    this.callbacks.onStatus("Estableciendo enlace con game-backend…");
    this.socket.connect();
  }

  private handleConnect = () => {
    clearTimeout(this.handshakeTimer);
    this.handshakeTimer = setTimeout(
      () =>
        this.callbacks.onStatus(
          "El servidor no confirmó el ingreso. Reiniciá game-backend con los cambios nuevos.",
        ),
      6000,
    );
  };

  private handleJoined = (data: Joined) => {
    if (data.protocolVersion !== PROTOCOL_VERSION) {
      this.callbacks.onStatus(
        "El backend está usando la versión anterior. Reiniciá game-backend.",
      );
      this.socket.disconnect();
      return;
    }
    clearTimeout(this.handshakeTimer);
    this.localPlayerId = data.playerId;
    this.lastInput = "";
    this.callbacks.onStatus(null);
  };

  private handleError = (data: { message: string }) => {
    clearTimeout(this.handshakeTimer);
    this.callbacks.onStatus(data.message);
  };
  private handleConnectError = () =>
    this.callbacks.onStatus(
      "No se pudo conectar. Iniciá game-backend con npm run dev.",
    );
  private handleDisconnect = (reason: string) => {
    this.localPlayerId = null;
    if (reason !== "io client disconnect" && reason !== "io server disconnect")
      this.callbacks.onStatus("Se perdió la conexión. Reconectando…");
  };
  private handleBlur = () => {
    this.paused = true;
    this.input.keyboard?.resetKeys();
    this.socket.emit("player:input", emptyInput());
  };
  private handleFocus = () => {
    this.paused = false;
  };
  private handleVisibility = () => {
    if (document.hidden) this.handleBlur();
    else this.handleFocus();
  };

  private handleState = (state: MatchState) => {
    if (!this.sys.isActive() || !this.localPlayerId) return;
    this.ended = state.ended;
    const ids = new Set(state.players.map((p) => p.id));
    for (const [id, view] of this.players)
      if (!ids.has(id)) {
        view.destroy();
        this.players.delete(id);
      }
    for (const player of state.players) {
      let view = this.players.get(player.id);
      if (!view) {
        view = new PlayerView(this, player);
        this.players.set(player.id, view);
        if (player.id === this.localPlayerId)
          this.cameras.main.startFollow(view.root, true, 0.12, 0.12);
      }
      view.setState(player, player.id === this.localPlayerId);
    }
    for (const item of state.cargo) {
      let view = this.cargo.get(item.id);
      if (!view) {
        view = new CargoView(this, item);
        this.cargo.set(item.id, view);
      }
      view.setState(
        item,
        state.now,
        state.players.find((player) => player.id === this.localPlayerId)?.team,
      );
    }
    const bulletIds = new Set(state.bullets.map((b) => b.id));
    for (const [id, view] of this.bullets)
      if (!bulletIds.has(id)) {
        view.destroy();
        this.bullets.delete(id);
      }
    for (const bullet of state.bullets) {
      let view = this.bullets.get(bullet.id);
      if (!view) {
        view = this.add
          .rectangle(
            bullet.x,
            bullet.y,
            13,
            3,
            bullet.team === "blue" ? 0xc4ecff : 0xffc4a0,
          )
          .setDepth(250);
        this.bullets.set(bullet.id, view);
      }
      view.setPosition(bullet.x, bullet.y).setRotation(bullet.angle);
    }
    if (this.time.now - this.lastUiAt >= 100 || state.ended) {
      this.callbacks.onState(state, this.localPlayerId);
      this.lastUiAt = this.time.now;
    }
  };

  update(time: number, delta: number) {
    if (this.water && !this.reducedMotion) {
      this.water.tilePositionX = time * 0.007;
      this.water.tilePositionY = time * 0.004;
    }
    for (const view of this.players.values()) view.update(delta, Date.now());
    if (
      !this.socket.connected ||
      !this.localPlayerId ||
      this.ended ||
      !this.keys
    )
      return;
    const local = this.players.get(this.localPlayerId)?.root;
    const pointer = this.input.activePointer;
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const input: PlayerInput = this.paused
      ? emptyInput()
      : {
          up: this.keys.W.isDown,
          down: this.keys.S.isDown,
          left: this.keys.A.isDown,
          right: this.keys.D.isDown,
          angle: local ? Math.atan2(point.y - local.y, point.x - local.x) : 0,
          fire: pointer.isDown && pointer.leftButtonDown(),
          interact: this.keys.E.isDown,
          drop: this.keys.G.isDown,
          ability: this.keys.Q.isDown,
        };
    const serialized = JSON.stringify(input);
    // Send transitions immediately (E/G) and a heartbeat for held controls.
    if (
      (serialized !== this.lastInput && time - this.lastSentAt >= 16) ||
      time - this.lastSentAt >= 100
    ) {
      this.socket.emit("player:input", input);
      this.lastInput = serialized;
      this.lastSentAt = time;
    }
  }

  private cleanup = () => {
    clearTimeout(this.handshakeTimer);
    this.events.off("shutdown", this.cleanup);
    this.events.off("destroy", this.cleanup);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.players.clear();
    this.cargo.clear();
    this.bullets.clear();
  };
}
