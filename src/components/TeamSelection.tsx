import { Check, Flag } from "lucide-react";
import type { Team } from "../types/game";

interface Props {
  value: Team;
  onChange: (team: Team) => void;
}

export default function TeamSelection({ value, onChange }: Props) {
  return (
    <fieldset className="team-selection">
      <legend className="eyebrow">04 / ELEGÍ TU EQUIPO</legend>
      <div className="team-options">
        {(["blue", "red"] as const).map((team) => (
          <button
            key={team}
            type="button"
            className={`team-option ${team} ${value === team ? "selected" : ""}`}
            aria-pressed={value === team}
            onClick={() => onChange(team)}
          >
            <span className="team-emblem">
              <Flag size={21} />
            </span>
            <span>
              <strong>Equipo {team === "blue" ? "azul" : "rojo"}</strong>
              <small>
                Robá el depósito {team === "blue" ? "rojo" : "azul"} · hasta 10
                jugadores
              </small>
            </span>
            {value === team ? (
              <Check size={17} />
            ) : (
              <span className="radio-indicator" />
            )}
          </button>
        ))}
      </div>
      <p>
        Tu elección se respeta. Si el equipo está completo, podés volver y
        elegir el otro.
      </p>
    </fieldset>
  );
}
