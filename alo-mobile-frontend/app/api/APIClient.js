import axios, { AxiosInstance } from "axios";
import * as SecureStore from 'expo-secure-store';


const axiosInstance = axios.create({
    baseURL: `http://192.168.1.114:5000`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'

    },   
})

// Add an interceptor to include the authorization token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = SecureStore.getItem('accessToken'); 
        console.log("Send request with token: ", token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        SecureStore.deleteItemAsync('accessToken');
        return Promise.reject(error);
    }
);

export { axiosInstance };