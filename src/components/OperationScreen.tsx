import {
  Anchor,
  ChevronRight,
  Crosshair,
  HeartPulse,
  Package,
  Radio,
  Shield,
  Terminal,
  Timer,
  Target,
  Users,
} from "lucide-react";
import PhaserGame from "./PhaserGame";
import PortMap from "./PortMap";
import ControlsLegend from "./ControlsLegend";
import { CARGO_RULES, ROLE_NAMES } from "../game/shared/types";
import { HACK_DURATION_MS, distance } from "../game/shared/map";
import type { JoinOptions, MatchState } from "../types/game";
import type { GameCallbacks } from "../game/scenes/GameScene";

export interface Session {
  state: MatchState;
  localId: string;
}
interface Props extends GameCallbacks {
  options: JoinOptions;
  session: Session | null;
  status: string | null;
  onLeave: () => void;
}
const money = (value: number) => `$${value.toLocaleString("es-AR")}`;
const formatTime = (ms: number) =>
  `${Math.floor(Math.ceil(ms / 1000) / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(Math.ceil(ms / 1000) % 60).toString().padStart(2, "0")}`;

export default function OperationScreen({
  options,
  session,
  status,
  onLeave,
  onState,
  onStatus,
}: Props) {
  const player = session?.state.players.find((p) => p.id === session.localId);
  const carried = session?.state.cargo.find((c) => c.id === player?.cargoId);
  const nearby =
    player &&
    session?.state.cargo
      .filter(
        (c) =>
          c.availableAt <= session.state.now &&
          distance(c, player) < 65 &&
          c.carriers.length < CARGO_RULES[c.kind].carriers,
      )
      .sort((a, b) => distance(a, player) - distance(b, player))[0];
  const rivalName = player?.team === "blue" ? "rojo" : "azul";
  return (
    <section className="operation">
      <div className="operation-header">
        <div className="operation-title">
          <span className="eyebrow">OPERACIÓN EN CURSO</span>
          <h1>
            Terminal 07{" "}
            <span>{options.mode === "practice" ? "PRÁCTICA" : "ONLINE"}</span>
          </h1>
        </div>
        <div className="scoreboard">
          <div className="team-score blue">
            <small>EQUIPO AZUL {player?.team === "blue" ? "· VOS" : ""}</small>
            <strong>{money(session?.state.scores.blue ?? 0)}</strong>
          </div>
          <div className="match-clock">
            <Timer size={14} />
            <strong>{formatTime(session?.state.remainingMs ?? 300000)}</strong>
            <small>TIEMPO RESTANTE</small>
          </div>
          <div className="team-score red">
            <small>EQUIPO ROJO {player?.team === "red" ? "· VOS" : ""}</small>
            <strong>{money(session?.state.scores.red ?? 0)}</strong>
          </div>
        </div>
        <div className="operator-count">
          <Users size={15} />
          <span>
            {session?.state.players.length ?? "—"}
            <small> / {options.mode === "practice" ? 6 : 20}</small>
          </span>
        </div>
      </div>
      <div className="arena">
        <PhaserGame options={options} onState={onState} onStatus={onStatus} />
        {status && (
          <div className="arena-overlay connection-overlay">
            <Radio size={25} />
            <h2>Enlace con el puerto</h2>
            <p role="status">{status}</p>
            <button onClick={onLeave} className="secondary-button">
              Volver al menú
            </button>
          </div>
        )}
        {session && !status && (
          <>
            <div className="arena-label">
              <span className="status-dot" />{" "}
              {options.mode === "practice"
                ? "ENTRENAMIENTO · BOTS ACTIVOS"
                : "ENLACE ACTIVO · MULTIJUGADOR"}
            </div>
            {player && (
              <div className={`mission-target ${player.team}`}>
                <Target size={18} />
                <span>
                  <small>OBJETIVO ACTUAL</small>Robá el depósito {rivalName}
                  <em>Protegé el tuyo · entregá el botín en tu base</em>
                </span>
              </div>
            )}
            <aside className="minimap">
              <div>
                <span>RADAR / PN–07</span>
                <Crosshair size={12} />
              </div>
              <PortMap state={session.state} localId={session.localId} />
              <div className="minimap-legend">
                <span className="blue-dot" /> Azul <span className="red-dot" />{" "}
                Rojo <span className="gold-dot" /> Carga
              </div>
            </aside>
            {player && (
              <div className={`player-panel ${player.team}`}>
                <div className="operator-avatar">
                  {player.role === "assault" ? (
                    <Shield size={22} />
                  ) : player.role === "medic" ? (
                    <HeartPulse size={22} />
                  ) : (
                    <Terminal size={22} />
                  )}
                </div>
                <div>
                  <strong>
                    {player.name}
                    <small>
                      {ROLE_NAMES[player.role]} / EQUIPO{" "}
                      {player.team === "blue" ? "AZUL" : "ROJO"}
                    </small>
                  </strong>
                  <div className="health-track">
                    <span
                      style={{
                        width: `${(player.health / (player.role === "assault" ? 120 : player.role === "medic" ? 90 : 100)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="health-number">
                  {player.health}
                  <small>HP</small>
                </span>
              </div>
            )}
            {player && player.health > 0 && (
              <div className="interaction-prompt">
                {carried ? (
                  <>
                    <Package size={17} />
                    <span>
                      {CARGO_RULES[carried.kind].name}{" "}
                      <b>{money(CARGO_RULES[carried.kind].value)}</b>
                      <small>
                        {carried.kind === "diamonds" &&
                        carried.carriers.length < 2
                          ? "Esperando un compañero. Un bot aliado puede ayudarte."
                          : "Llevá el cargamento a la zona marcada de tu base."}
                        {CARGO_RULES[carried.kind].hands
                          ? " No podés disparar."
                          : ""}
                      </small>
                    </span>
                    <kbd>G</kbd>
                    <span className="prompt-action">Soltar</span>
                  </>
                ) : nearby ? (
                  <>
                    {nearby.owner === player.team &&
                    nearby.returnAt === null ? (
                      <Shield size={17} />
                    ) : (
                      <kbd>E</kbd>
                    )}
                    <span>
                      {nearby.owner === player.team
                        ? nearby.returnAt !== null
                          ? "Recuperar cargamento propio"
                          : "Tu depósito · protegé este cargamento"
                        : nearby.locked
                          ? player.role === "hacker"
                            ? `Mantené para hackear · ${HACK_DURATION_MS / 1000} segundos`
                            : "Se necesita un Hacker para abrir la bóveda"
                          : `Recoger ${CARGO_RULES[nearby.kind].name.toLowerCase()}`}
                      <small>
                        {nearby.owner === player.team
                          ? nearby.returnAt !== null
                            ? "Vuelve a tu depósito sin sumar dinero"
                            : "Solo podés robar cargamento del depósito rival"
                          : nearby.locked && nearby.hackProgress > 0
                            ? `Hackeo: ${Math.ceil(nearby.hackProgress * 100)}%`
                            : nearby.kind === "diamonds"
                              ? "Requiere dos operadores del mismo equipo"
                              : money(CARGO_RULES[nearby.kind].value)}
                      </small>
                    </span>
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    <span>Robá el depósito {rivalName} y volvé a tu base.</span>
                  </>
                )}
              </div>
            )}
            {player?.respawnAt && !session.state.ended ? (
              <div className="respawn-message">
                <span className="eyebrow">OPERADOR INCAPACITADO</span>
                <strong>
                  {Math.max(
                    1,
                    Math.ceil((player.respawnAt - session.state.now) / 1000),
                  )}
                </strong>
                <p>
                  Volvés a tu base en unos segundos.
                  <br />
                  Un Medic cercano puede reanimarte.
                </p>
              </div>
            ) : null}
            {session.state.ended && (
              <div className="arena-overlay results-overlay">
                <Anchor size={32} />
                <span className="eyebrow">OPERACIÓN FINALIZADA</span>
                <h2>
                  {session.state.scores.blue === session.state.scores.red
                    ? "Empate en el puerto"
                    : `Victoria del equipo ${session.state.scores.blue > session.state.scores.red ? "azul" : "rojo"}`}
                </h2>
                <p>
                  Azul {money(session.state.scores.blue)} <span> / </span> Rojo{" "}
                  {money(session.state.scores.red)}
                </p>
                <button className="deploy-button" onClick={onLeave}>
                  Volver al menú <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="operation-feed" aria-live="polite">
        <Radio size={14} />
        <span>
          {session?.state.event ?? "Esperando confirmación del servidor…"}
        </span>
        <span className="feed-tag">COMUNICACIONES</span>
      </div>
      <ControlsLegend />
    </section>
  );
}
