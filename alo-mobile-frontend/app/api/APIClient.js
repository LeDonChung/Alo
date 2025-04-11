import axios, { AxiosInstance } from "axios";
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.API_URL;
import { navigate } from '../presentation/nativagtions/NavigationService'
import { showToast } from "../utils/AppUtils";
const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    },
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/api/auth/refresh") {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            console.log(
                error.response?.status,
                originalRequest._retry,
                originalRequest.url
            )
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) {
                    await SecureStore.deleteItemAsync('accessToken');
                    await SecureStore.deleteItemAsync('refreshToken');
                    await SecureStore.deleteItemAsync('userLogin');
                    navigate('authentication');
                    return Promise.reject(error); // <- Không throw mới nữa
                }

                const res = await axios.post(`${API_URL}/api/auth/refresh`, {
                    token: refreshToken
                });

                const newAccessToken = res.data.data;
                await SecureStore.setItemAsync('accessToken', newAccessToken);

                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                processQueue(null, newAccessToken);
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('userLogin');
                showToast("info", "top", "Thông báo", "Phiên đăng nhập đã hết.");
                navigate('authentication');
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 403) {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('userLogin');
            showToast("info", "top", "Thông báo", "Phiên đăng nhập đã hết.");
            navigate('authentication');
        }

        return Promise.reject(error);
    }
);

export { axiosInstance };