import { io } from 'socket.io-client';
import Constants from 'expo-constants';
const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL;

const socket = io(SOCKET_URL, {
    withCredentials: true,
});
socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export default socket;
