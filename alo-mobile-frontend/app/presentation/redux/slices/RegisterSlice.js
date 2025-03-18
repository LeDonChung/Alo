import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

const initialState = {
    isLoading: false,
    userRegister: {
        phoneNumber: '',
        fullName: '',
        password: '',
        rePassword: ''
    }, 
    error: null
};

// Gửi OTP
const sendOtp = createAsyncThunk('RegisterSlice/sendOtp', async (phoneNumber, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/send-otp', { phoneNumber });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Xác thực OTP
const verifyOtp = createAsyncThunk('RegisterSlice/verifyOtp', async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/verify-otp', { phoneNumber, otp });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Đăng ký tài khoản
const registerUser = createAsyncThunk('RegisterSlice/registerUser', async (userData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const RegisterSlice = createSlice({
    name: 'RegisterSlice',
    initialState,
    reducers: {
        setUserRegister (state, action) {
            state.userRegister = action.payload;
        } 
    },
    extraReducers: (builder) => {
        builder.addCase(sendOtp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(sendOtp.fulfilled, (state, action) => {
            state.isLoading = false;
        });
        builder.addCase(sendOtp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });

        builder.addCase(verifyOtp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(verifyOtp.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });

        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.userRegister = action.payload.data;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});

export { sendOtp, verifyOtp, registerUser };
export const { setUserRegister } = RegisterSlice.actions;
export default RegisterSlice.reducer;
