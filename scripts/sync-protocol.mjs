import { readFile, writeFile, mkdir } from "node:fs/promises";
const destination = new URL("../src/game/shared/", import.meta.url);
await mkdir(destination, { recursive: true });
for (const file of ["types.ts", "map.ts"]) {
  const source = new URL(
    `../../game-backend/src/shared/${file}`,
    import.meta.url,
  );
  const content = await readFile(source, "utf8");
  await writeFile(
    new URL(file, destination),
    `// Generado desde game-backend/src/shared/${file}. Ejecutar npm run sync:protocol.\n${content}`,
  );
}
console.log("Protocolo y mapa sincronizados desde game-backend.");
