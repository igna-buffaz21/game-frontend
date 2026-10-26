import PhaserGame from "./components/PhaserGame";

function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        Nuestro videojuego
      </h1>

      <p className="text-gray-400">
        Mové al personaje usando WASD
      </p>

      <PhaserGame />
    </main>
  );
}

export default App;