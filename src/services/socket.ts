import { io } from "socket.io-client";
import type { JoinOptions } from "../types/game";

export const createGameSocket = (options: JoinOptions) =>
  io({
    autoConnect: false,
    auth: options,
    reconnectionAttempts: 4,
    timeout: 5000,
  });
