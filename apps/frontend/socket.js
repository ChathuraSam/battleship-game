"use client";

import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3001";

console.log("Socket URL:", URL);

// Create socket with proper configuration
export const socket = io(URL, {
  autoConnect: false, // Don't auto-connect
  transports: ["polling", "websocket"], // Start with polling, then upgrade
  timeout: 20000,
  forceNew: false, // Don't force new connection every time
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  randomizationFactor: 0.5,
  upgrade: true, // Allow transport upgrades
  rememberUpgrade: true, // Remember the upgrade for future connections
});
