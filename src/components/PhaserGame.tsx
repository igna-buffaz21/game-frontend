import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameScene } from "../game/scenes/GameScene";
import type { GameCallbacks } from "../game/scenes/GameScene";
import type { JoinOptions } from "../types/game";

interface Props extends GameCallbacks {
  options: JoinOptions;
}

export default function PhaserGame({ options, onState, onStatus }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#092d3a",
      antialias: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      },
      scene: [new GameScene(options, { onState, onStatus })],
    });
    return () => game.destroy(true);
  }, [options, onState, onStatus]);

  return (
    <div
      ref={containerRef}
      className="game-canvas"
      aria-label="Puerto industrial. Usá WASD para moverte, mouse para apuntar y E para recoger cargamentos."
    />
  );
}
