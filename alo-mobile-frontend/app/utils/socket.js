import { io } from 'socket.io-client';

const socket = io("http://192.168.0.101:5001", {
    withCredentials: true,
});


export const socket = io("http://localhost:5001", {
    withCredentials: true,
});

