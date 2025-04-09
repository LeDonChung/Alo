import { io } from 'socket.io-client';

export const socket = io("http://192.168.136.63:5001", {
    withCredentials: true,
});

