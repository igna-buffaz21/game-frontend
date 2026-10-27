import { useId } from "react";
import {
  BASES,
  CARGO_SPAWNS,
  DEPOTS,
  DOCK,
  OBSTACLES,
  WORLD,
  center,
} from "../game/shared/map";
import type { MatchState, Team } from "../types/game";

interface Props {
  state?: MatchState;
  localId?: string;
  preview?: boolean;
  team?: Team;
}
const colors = { blue: "#74c9f5", red: "#f59180" };

export default function PortMap({
  state,
  localId,
  preview = false,
  team = "blue",
}: Props) {
  const id = useId().replace(/:/g, "");
  const localTeam =
    state?.players.find((player) => player.id === localId)?.team ?? team;
  const rival = localTeam === "blue" ? "red" : "blue";
  const target = center(DEPOTS[rival].apron);
  const base = center(BASES[localTeam]);
  const cargo =
    state?.cargo ??
    CARGO_SPAWNS.map((item, i) => ({ ...item, id: String(i), availableAt: 0 }));
  return (
    <svg
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className={preview ? "port-map preview-map" : "port-map"}
      role="img"
      aria-label={`Plano del puerto. Tu base es ${localTeam === "blue" ? "azul" : "roja"}. Objetivo: depósito ${rival === "blue" ? "azul" : "rojo"}.`}
    >
      <defs>
        <linearGradient id={`${id}-sea`} x2="0" y2="1">
          <stop stopColor="#123e50" />
          <stop offset="1" stopColor="#071e2e" />
        </linearGradient>
        <linearGradient id={`${id}-land`} x2="1" y2="1">
          <stop stopColor="#425b60" />
          <stop offset="1" stopColor="#293c46" />
        </linearGradient>
        <pattern
          id={`${id}-grid`}
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M80 0H0V80"
            fill="none"
            stroke="#bdd5cc"
            strokeOpacity=".09"
            strokeWidth="2"
          />
        </pattern>
      </defs>
      <rect
        width={WORLD.width}
        height={WORLD.height}
        fill={`url(#${id}-sea)`}
      />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d={`M40 ${i * 110} h90 m600 0 h160 m600 0 h200`}
          stroke="#75b5c7"
          strokeOpacity=".12"
          strokeWidth="3"
        />
      ))}
      <rect
        x={DOCK.x - 16}
        y={DOCK.y - 16}
        width={DOCK.width + 32}
        height={DOCK.height + 32}
        fill="none"
        stroke="#448da0"
        strokeWidth="20"
        opacity=".25"
      />
      <rect
        {...DOCK}
        fill={`url(#${id}-land)`}
        stroke="#7a9ca2"
        strokeWidth="8"
      />
      <rect {...DOCK} fill={`url(#${id}-grid)`} />
      {[475, 935, 1300, 1725].map((x) => (
        <path
          key={x}
          d={`M${x} 180 V1420`}
          stroke="#e9d3a0"
          strokeWidth="4"
          strokeDasharray="24 24"
          opacity=".2"
        />
      ))}
      {Object.entries(BASES).map(([owner, rect]) => (
        <g key={owner}>
          <rect
            {...rect}
            rx="7"
            fill={colors[owner as Team]}
            fillOpacity=".15"
            stroke={colors[owner as Team]}
            strokeWidth="7"
          />
          <circle
            cx={rect.x + rect.width / 2}
            cy={rect.y + rect.height / 2}
            r="60"
            fill="none"
            stroke={colors[owner as Team]}
            strokeWidth="3"
            opacity=".5"
          />
          <text
            x={rect.x + rect.width / 2}
            y={rect.y + rect.height / 2 + 12}
            textAnchor="middle"
            fill={colors[owner as Team]}
            fontFamily="monospace"
            fontSize="35"
          >
            {owner === localTeam ? "BASE" : "RIVAL"}
          </text>
        </g>
      ))}
      {OBSTACLES.map((obstacle, i) => (
        <g key={i}>
          <rect
            x={obstacle.x + 9}
            y={obstacle.y + 12}
            width={obstacle.width}
            height={obstacle.height}
            fill="#071e2a"
            opacity=".5"
          />
          <rect
            x={obstacle.x}
            y={obstacle.y}
            width={obstacle.width}
            height={obstacle.height}
            rx="3"
            fill={`#${obstacle.color.toString(16).padStart(6, "0")}`}
            stroke="#172b37"
            strokeWidth="5"
          />
          {obstacle.kind === "container" &&
            Array.from({ length: 5 }, (_, rib) => (
              <path
                key={rib}
                d={
                  obstacle.width > obstacle.height
                    ? `M${obstacle.x + 20 + rib * 40} ${obstacle.y + 8}v${obstacle.height - 16}`
                    : `M${obstacle.x + 8} ${obstacle.y + 20 + rib * 45}h${obstacle.width - 16}`
                }
                stroke="#d0d8c8"
                strokeOpacity=".12"
                strokeWidth="3"
              />
            ))}
        </g>
      ))}
      {Object.entries(DEPOTS).map(([owner, depot]) => (
        <g key={owner}>
          <rect
            {...depot.apron}
            rx="8"
            fill={colors[owner as Team]}
            fillOpacity=".09"
            stroke={colors[owner as Team]}
            strokeWidth="4"
            strokeDasharray="12 8"
          />
          <path
            d={`M${depot.building.x + 20} ${depot.building.y + 7}h${depot.building.width - 40}`}
            stroke={colors[owner as Team]}
            strokeWidth="10"
          />
          <text
            x={depot.building.x + depot.building.width / 2}
            y={depot.building.y + depot.building.height / 2 + 8}
            textAnchor="middle"
            fill={colors[owner as Team]}
            fontSize="27"
            fontFamily="monospace"
          >
            DEPÓSITO {owner === "blue" ? "AZUL" : "ROJO"}
          </text>
        </g>
      ))}
      {preview && (
        <>
          <path
            d={`M${base.x} ${base.y} L960 800 L${target.x} ${target.y}`}
            fill="none"
            stroke="#efd394"
            strokeWidth="5"
            strokeDasharray="12 18"
            opacity=".65"
          />
          <circle
            cx={target.x}
            cy={target.y}
            r="110"
            fill="none"
            stroke="#efd394"
            strokeWidth="4"
            opacity=".6"
          />
          <circle
            cx={target.x}
            cy={target.y}
            r="145"
            fill="none"
            stroke="#efd394"
            strokeWidth="2"
            opacity=".2"
          />
          <text
            x="1120"
            y="780"
            textAnchor="middle"
            fill="#c1d0c4"
            fillOpacity=".45"
            fontSize="30"
            fontFamily="monospace"
            letterSpacing="8"
          >
            TERMINAL 07
          </text>
        </>
      )}
      {cargo
        .filter((item) => !state || item.availableAt <= state.now)
        .map((item) => (
          <g key={item.id}>
            <circle
              cx={item.x}
              cy={item.y}
              r={item.kind === "diamonds" ? 25 : 18}
              fill={item.kind === "diamonds" ? "#d3f7f0" : "#f4d089"}
              stroke={colors[item.owner]}
              strokeWidth="6"
            />
          </g>
        ))}
      {state?.players
        .filter((player) => player.health > 0)
        .map((player) => (
          <circle
            key={player.id}
            cx={player.x}
            cy={player.y}
            r={player.id === localId ? 23 : 16}
            fill={colors[player.team]}
            stroke={player.id === localId ? "#fff3ca" : "#10242d"}
            strokeWidth="6"
          />
        ))}
      <path
        d="M290 1510h400l50 40-50 30H290l-40-30Z"
        fill="#344954"
        stroke="#78929b"
        strokeWidth="3"
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={310 + i * 115}
          y="1522"
          width="95"
          height="45"
          fill={["#496f82", "#ab704f", "#a89054"][i]}
        />
      ))}
    </svg>
  );
}
