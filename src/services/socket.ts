import { io } from "socket.io-client";

export const createGameSocket = () =>
  io({
    autoConnect: false,
  });
