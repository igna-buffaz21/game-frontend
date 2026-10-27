# Puerto Negro — frontend

Prototipo del juego competitivo del puerto definido en `docs/Documento base juego (1).pdf`.
React + TypeScript para la interfaz, Phaser para el mapa y Socket.IO para el enlace.
Las reglas y posiciones se calculan en **game-backend**, proyecto independiente.

## Ejecutar

Node.js 24 recomendado. En dos terminales:

```sh
# Terminal 1
cd ../game-backend
npm install
npm run dev
```

```sh
# Terminal 2, desde game-frontend
npm install
npm run dev
```

Abrir http://localhost:5173. Práctica crea una partida privada 3 vs 3 con bots;
Online permite elegir equipo azul o rojo, con hasta diez personas por equipo. Para probar Online,
abrir dos pestañas y entrar en el mismo modo. Ambos proyectos necesitan los cambios
nuevos; si el servidor estaba ejecutándose, reiniciarlo.

## Controles

| Control                | Acción                                                |
| ---------------------- | ----------------------------------------------------- |
| WASD                   | Moverse                                               |
| Mouse + clic izquierdo | Apuntar y disparar                                    |
| E                      | Recoger cargamento; mantener para hackear como Hacker |
| G                      | Soltar cargamento                                     |
| Q                      | Curar o reanimar un aliado cercano como Medic         |

La entrega ocurre al entrar en la base propia. Oro y diamantes impiden disparar.
Los diamantes necesitan diez segundos de hackeo y dos aliados para moverse;
un bot aliado puede ayudar. Al morir, se reaparece en cinco segundos y el cargamento
cae durante diez segundos antes de volver a origen. Gana el mayor valor asegurado
al terminar los cinco minutos. Volver al menú para iniciar una nueva partida.

## Estructura

- `src/components`: integración de Phaser y minimapa SVG.
- `src/game/scenes`: conexión, controles y aplicación de snapshots.
- `src/game/rendering`: mapa, jugadores y cargamentos; sin reglas de negocio.
- `src/game/shared`: copia generada del contrato y mapa del backend.
- `src/services`: creación del socket, sin conexiones al importar módulos.
- `scripts/sync-protocol.mjs`: sincroniza el contrato sin acoplar las compilaciones.

`game-backend/src/shared` es la fuente del mapa y los tipos. Después de cambiarlos:

```sh
npm run sync:protocol
npm run build
npm run lint
```

Las pruebas de reglas se ejecutan con `npm test` en game-backend. Vite usa el puerto
5173 y reenvía `/socket.io` a localhost:3001. Para producción hay que configurar ese
mismo proxy en el alojamiento; `vite preview` sirve solamente para revisar el build.

## Alcance de esta entrega

Mapa 2D procedural con colisiones compartidas, equipos, cargamentos, combate, tres
roles, temporizador, resultados, radar y práctica con bots. Los gráficos son
provisionales. Faltan arte final, audio, lobby, persistencia y pruebas de carga 10 vs 10.
Los bots usan navegación por grilla y son una herramienta de práctica, no IA final.
Las rutas alternativas y los minijuegos de hackeo quedan para después de la beta,
como especifica el documento.

Los depósitos tienen dueño: solo se puede transportar y puntuar cargamento rival.
Recuperar un objeto propio caído lo devuelve al depósito sin sumar dinero. Si el
equipo elegido está completo, se informa para poder elegir el otro.
