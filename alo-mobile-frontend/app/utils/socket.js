import { io } from 'socket.io-client';

const socket = io("http://192.168.34.63:5001", {
    withCredentials: true,
});

export default socket;
