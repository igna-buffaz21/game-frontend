import { useCallback, useState } from "react";
import { Anchor, LogOut } from "lucide-react";
import DeploymentScreen from "./components/DeploymentScreen";
import OperationScreen from "./components/OperationScreen";
import type { Session } from "./components/OperationScreen";
import type { JoinOptions, MatchState } from "./types/game";
import "./App.css";

export default function App() {
  const [options, setOptions] = useState<JoinOptions | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<string | null>(
    "Conectando con el puerto…",
  );
  const onState = useCallback(
    (state: MatchState, localId: string) => setSession({ state, localId }),
    [],
  );
  const onStatus = useCallback(
    (message: string | null) => setStatus(message),
    [],
  );
  const leave = () => {
    setOptions(null);
    setSession(null);
    setStatus("Conectando con el puerto…");
  };
  return (
    <main className={options ? "app in-operation" : "app"}>
      <header className="masthead">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            if (options) leave();
          }}
          aria-label="Puerto Negro, volver al menú"
        >
          <span className="brand-mark">
            <Anchor size={24} strokeWidth={1.6} />
          </span>
          <span>
            PUERTO<span className="brand-secondary">NEGRO</span>
          </span>
        </a>
        <div className="masthead-note">
          <span className="status-dot" /> PROTOTIPO JUGABLE{" "}
          <span className="divider">/</span> TERMINAL 07
        </div>
        {options ? (
          <button className="quiet-button" onClick={leave}>
            <LogOut size={15} /> Salir al menú
          </button>
        ) : (
          <span className="build-tag">DESARROLLO · 0.1</span>
        )}
      </header>
      {options ? (
        <OperationScreen
          options={options}
          session={session}
          status={status}
          onLeave={leave}
          onState={onState}
          onStatus={onStatus}
        />
      ) : (
        <DeploymentScreen onStart={setOptions} />
      )}
    </main>
  );
}
