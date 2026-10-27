const controls = [
  ["WASD", "Moverte"],
  ["MOUSE", "Apuntar / disparar"],
  ["E", "Recoger / hackear"],
  ["G", "Soltar"],
  ["Q", "Curar / reanimar"],
];

export default function ControlsLegend() {
  return (
    <footer className="controls-footer">
      {controls.map(([key, label]) => (
        <span key={key}>
          <kbd>{key}</kbd>
          {label}
        </span>
      ))}
    </footer>
  );
}
