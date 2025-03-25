import axios, { AxiosInstance } from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    }
})

// Add an interceptor to include the authorization token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => { 
        localStorage.removeItem('accessToken');
        return Promise.reject(error);
    }
);

export { axiosInstance };