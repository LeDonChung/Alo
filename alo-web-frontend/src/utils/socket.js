import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'],
});

socket.on("connect_error", (err) => {
  console.error("Socket connect error:", err);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
