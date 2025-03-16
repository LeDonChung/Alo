import axios, { AxiosInstance } from "axios";
import * as SecureStore from 'expo-secure-store';


const axiosInstance = axios.create({
    baseURL: `http://192.168.215.63:5000`,
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
        // const token = SecureStore.getItem('accessToken'); 
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwODY3NzEzNTU3IiwidXNlcklkIjoiMjU4Yzg0OGItZTkwNi00ODU5LWEwMTktMDQ4MTE1MzU5MjczIiwicm9sZXMiOlsiVVNFUiJdLCJpYXQiOjE3NDIxMzM5NzYsImV4cCI6MTc0MjczODc3Nn0.Hx1FYAgpyb52qoT9ssBeeBONi8OyaxXb3odqfME8M-4"
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