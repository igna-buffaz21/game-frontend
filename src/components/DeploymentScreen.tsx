import { useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  ChevronRight,
  HeartPulse,
  Radio,
  Shield,
  Terminal,
  Timer,
  Users,
} from "lucide-react";
import type { JoinOptions, Role, Team } from "../types/game";
import TeamSelection from "./TeamSelection";
import PortMap from "./PortMap";
import ControlsLegend from "./ControlsLegend";

const roles = [
  {
    id: "assault" as const,
    icon: Shield,
    label: "Assault",
    description: "Abrí el camino. Protegé al equipo y controlá el puerto.",
    detail: "120 de vida · Mayor potencia de fuego",
  },
  {
    id: "medic" as const,
    icon: HeartPulse,
    label: "Medic",
    description: "Mantené al equipo en pie. Curá y reanimá aliados cercanos.",
    detail: "90 de vida · Q para curar o reanimar",
  },
  {
    id: "hacker" as const,
    icon: Terminal,
    label: "Hacker",
    description: "Desbloqueá la bóveda y accedé al cargamento más valioso.",
    detail: "100 de vida · Mantené E para hackear",
  },
];

export default function DeploymentScreen({
  onStart,
}: {
  onStart: (options: JoinOptions) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("assault");
  const [mode, setMode] = useState<JoinOptions["mode"]>("practice");
  const [team, setTeam] = useState<Team>("blue");
  const selected = roles.find((r) => r.id === role)!;
  return (
    <>
      <section className="briefing">
        <div className="briefing-copy">
          <span className="eyebrow">
            <span className="small-line" /> OPERACIÓN / EL PUERTO
          </span>
          <h1>
            Entrá al puerto.
            <br />
            Salí con <em>el botín.</em>
          </h1>
          <p>
            Dos equipos. Cinco minutos. Infiltrate en el depósito rival, protegé
            el tuyo y llevá el botín a tu base.
          </p>
          <div className="mission-facts">
            <span>
              <Users size={17} /> HASTA 10 VS 10
            </span>
            <span>
              <Timer size={17} /> 05:00 MIN
            </span>
            <span>
              <Banknote size={17} /> EL MAYOR BOTÍN GANA
            </span>
          </div>
          <div className="cargo-manifest">
            <span className="eyebrow">MANIFIESTO DE CARGA</span>
            <div>
              <span className="cargo-token cash-token">$</span>
              <span>
                Dinero<small>Una mano libre</small>
              </span>
              <strong>$500</strong>
            </div>
            <div>
              <span className="cargo-token gold-token">▰</span>
              <span>
                Lingotes de oro<small>Dos manos · sin disparar</small>
              </span>
              <strong>$1.500</strong>
            </div>
            <div>
              <span className="cargo-token diamond-token">◇</span>
              <span>
                Diamantes<small>Hackeo · dos operadores</small>
              </span>
              <strong>$5.000</strong>
            </div>
          </div>
        </div>
        <div className="map-brief">
          <div className="map-topline">
            <span>
              <Radio size={14} /> RECONOCIMIENTO DEL ÁREA
            </span>
            <span>PN–07</span>
          </div>
          <PortMap preview team={mode === "online" ? team : "blue"} />
          <div className="map-coordinates">
            33° 18′ S <span>OPERACIÓN NOCTURNA</span> 66° 20′ O
          </div>
          <div className="map-caption">
            <span className="eyebrow">PUERTO INDUSTRIAL</span>
            <p>
              Defendé tu depósito.
              <br />
              El botín está del otro lado.
            </p>
            <ArrowUpRight size={25} />
          </div>
        </div>
      </section>

      <section className="deployment">
        <div className="section-heading">
          <span className="eyebrow">01 / ELEGÍ TU ESPECIALIDAD</span>
          <span>Todos los roles pueden recuperar cargamentos</span>
        </div>
        <div className="role-grid" role="group" aria-label="Elegir rol">
          {roles.map((item) => (
            <button
              key={item.id}
              className={`role-card ${role === item.id ? "selected" : ""}`}
              onClick={() => setRole(item.id)}
              aria-pressed={role === item.id}
            >
              <div className="role-top">
                <item.icon size={23} strokeWidth={1.5} />
                <span className="radio-indicator" />
              </div>
              <h2>{item.label}</h2>
              <p>{item.description}</p>
              <span className="role-detail">{item.detail}</span>
            </button>
          ))}
        </div>
        <form
          className={`deploy-bar ${mode === "online" ? "online" : ""}`}
          onSubmit={(event) => {
            event.preventDefault();
            onStart({
              name: name.trim() || "Operador",
              role,
              mode,
              ...(mode === "online" ? { team } : {}),
            });
          }}
        >
          <label className="callsign">
            <span className="eyebrow">02 / TU IDENTIFICACIÓN</span>
            <input
              value={name}
              maxLength={18}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre de operador"
              aria-label="Nombre de operador"
            />
          </label>
          <div className="mode-selector">
            <span className="eyebrow">03 / TIPO DE OPERACIÓN</span>
            <div role="group" aria-label="Modo de juego">
              <button
                type="button"
                aria-pressed={mode === "practice"}
                className={mode === "practice" ? "active" : ""}
                onClick={() => setMode("practice")}
              >
                Práctica <span>3 vs 3 · bots</span>
              </button>
              <button
                type="button"
                aria-pressed={mode === "online"}
                className={mode === "online" ? "active" : ""}
                onClick={() => setMode("online")}
              >
                Online <span>Hasta 20 jugadores</span>
              </button>
            </div>
          </div>
          {mode === "online" && (
            <TeamSelection value={team} onChange={setTeam} />
          )}
          <button className="deploy-button" type="submit">
            Entrar al puerto <ChevronRight size={20} />
          </button>
        </form>
        <div className="deployment-note">
          <span>
            <selected.icon size={14} /> {selected.label} seleccionado
          </span>
          <span>
            {mode === "practice"
              ? "Práctica privada con dos aliados y tres rivales controlados por el servidor."
              : `Equipo ${team === "blue" ? "azul" : "rojo"}. Coordiná la elección con tus amigos para jugar juntos.`}
          </span>
        </div>
      </section>
      <ControlsLegend />
    </>
  );
}
