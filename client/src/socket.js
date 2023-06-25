import io from "socket.io-client";
import { createContext } from "react";

export const socket = io(process.env.REACT_APP_CHAT_URL, {
  transports: ["websocket"],
  query: { token: localStorage.jwtToken },
});

export const SocketContext = createContext();
