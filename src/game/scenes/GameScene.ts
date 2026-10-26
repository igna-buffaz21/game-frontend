import Phaser from "phaser";
import { createGameSocket } from "../../services/socket";
import type {
  PlayerInput,
  PlayerState,
  GameState,
  GameJoined,
} from "../../types/game";

export class GameScene extends Phaser.Scene {
  private socket = createGameSocket();

  private players = new Map<
    string,
    Phaser.GameObjects.Rectangle
  >();

  private localPlayerId: string | null = null;

  private keys!: Record<
    "W" | "A" | "S" | "D",
    Phaser.Input.Keyboard.Key
  >;

  private lastInput: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  constructor() {
    super("GameScene");
  }

  create() {
    // Configurar teclado
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D"
    ) as typeof this.keys;

    //La funcion handleJoined de ejectuta cuando el servidor envie un evento "game:joined".
    this.socket.on("game:joined", this.handleJoined);
    this.socket.on("game:state", this.handleGameState);
    this.socket.on("game:error", this.handleGameError);
    this.socket.on("connect_error", this.handleConnectError);

    // Phaser puede destruir una escena sin emitir antes "shutdown".
    this.events.once("shutdown", this.cleanup);
    this.events.once("destroy", this.cleanup);

    // Conectarse al servidor
    this.socket.connect();
  }

  private cleanup = () => {
    this.events.off("shutdown", this.cleanup);
    this.events.off("destroy", this.cleanup);

    this.socket.off("game:joined", this.handleJoined);
    this.socket.off("game:state", this.handleGameState);
    this.socket.off("game:error", this.handleGameError);
    this.socket.off("connect_error", this.handleConnectError);
    this.socket.disconnect();

    this.players.clear();
    this.localPlayerId = null;
    this.lastInput = { up: false, down: false, left: false, right: false };
  };

  private handleJoined = (data: GameJoined) => {
    this.localPlayerId = data.playerId;

    console.log("Mi jugador es:", data.playerId);
  };

  private handleGameError = (data: { message: string }) => {
    console.error("Error del servidor:", data.message);
  };

  private handleConnectError = (error: Error) => {
    console.error("No se pudo conectar al servidor Socket.IO:", error.message);
  };

  private handleGameState = (state: GameState) => {
    if (!this.sys.isActive()) return;

    const connectedIds = new Set<string>();

    for (const player of state.players) {
      connectedIds.add(player.id);
      this.updatePlayer(player);
    }

    for (const [id, sprite] of this.players) {
      if (!connectedIds.has(id)) {
        sprite.destroy();
        this.players.delete(id);
      }
    }
  };

  private updatePlayer(player: PlayerState) {
    if (!this.add || !this.sys.isActive()) return;

    let sprite = this.players.get(player.id);

    if (!sprite) {
      const isLocal = player.id === this.localPlayerId;

      sprite = this.add.rectangle(
        player.x,
        player.y,
        32,
        32,
        isLocal ? 0x3b82f6 : 0xef4444
      );

      this.players.set(player.id, sprite);
    }

    sprite.setPosition(player.x, player.y);

    sprite.setFillStyle(
      player.id === this.localPlayerId
        ? 0x3b82f6
        : 0xef4444
    );
  }

  ///aca enviamos al servidor los inputs del jugador local
  update() {
    if (!this.socket.connected || !this.localPlayerId) {
      return;
    }

    //Obtiene los inputs del jugador local, true o false dependiendo si la tecla esta presionada o no
    const input: PlayerInput = {
      up: this.keys.W.isDown,
      down: this.keys.S.isDown,
      left: this.keys.A.isDown,
      right: this.keys.D.isDown,
    };

    // Enviar solo cuando cambian los controles
    const hasChanged =
      input.up !== this.lastInput.up ||
      input.down !== this.lastInput.down ||
      input.left !== this.lastInput.left ||
      input.right !== this.lastInput.right;

    if (hasChanged) {
      this.socket.emit("player:input", input);

      this.lastInput = { ...input };
    }
  }
}
