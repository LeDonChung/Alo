import axios, { AxiosInstance } from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

let isRefreshing = false;
let failedQueue =  [];

const processQueue = (error, token = null) => {
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
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response: xử lý tự động refresh token nếu 403
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu là lỗi 403 từ verify, thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/api/auth/refresh") {
            console.log(
                originalRequest.url,
                originalRequest._retry,
                error.response?.status,
            )
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post("http://localhost:5000/api/auth/refresh", {
                    token: localStorage.getItem('refreshToken')
                });

                console.log('Token mới:', res.data.data);
                const newAccessToken = res.data.data;
                localStorage.setItem('accessToken', newAccessToken);

                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                processQueue(null, newAccessToken);
                return axiosInstance(originalRequest);
            } catch (err) {
                console.log(err)
                processQueue(err, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; 
                return Promise.reject(err); 
            } finally {
                isRefreshing = false;
            }
        }

        // Nếu là lỗi 401 -> không có token -> chuyển hướng login luôn
        if (error.response?.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }

        return Promise.reject(error);
    }
);

export { axiosInstance };
