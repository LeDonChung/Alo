import { io } from 'socket.io-client';
import Constants from 'expo-constants';
const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL;
const socket = io(SOCKET_URL, {
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

