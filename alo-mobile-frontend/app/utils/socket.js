import { io } from 'socket.io-client';

const socket = io("http://192.168.1.73:5001", {
    withCredentials: true,
});
socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export default socket;
