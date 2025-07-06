import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.MODE === "development" ? "http://localhost:3008" : "/",
  { 
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  }
);

socket.on("connect", () => {
  console.log("🔍 DEBUG - Socket connected successfully, ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔍 DEBUG - Socket disconnected, reason:", reason);
});

socket.on("connect_error", (error) => {
  console.error("🔍 DEBUG - Socket connection error:", error);
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔍 DEBUG - Socket reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("🔍 DEBUG - Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("🔍 DEBUG - Socket reconnection failed");
});

export const connectSocket = () => {
  if (socket.disconnected) {
    console.log("🔍 DEBUG - Manually connecting socket");
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("🔍 DEBUG - Manually disconnecting socket");
    socket.disconnect();
  }
}; 