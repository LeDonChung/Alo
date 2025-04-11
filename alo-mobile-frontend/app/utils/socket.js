import { io } from 'socket.io-client';
import Constants from 'expo-constants';
const SOCKET_URL = Constants.expoConfig?.extra?.SOCKET_URL;

const socket = io(SOCKET_URL, {
    withCredentials: true,
});

export default socket;
