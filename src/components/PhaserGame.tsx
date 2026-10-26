import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameScene } from "../game/scenes/GameScene";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,

      width: 800,
      height: 600,

      parent: containerRef.current,

      backgroundColor: "#1e293b",

      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },

      scene: [GameScene],
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} />;
}