import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.API_URL;

const initialState = {
    avatar: null,
    userLogin: null,
    userOnlines: [],
};

const getProfile = createAsyncThunk('UserSlice/getProfile', async (token, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/api/user/profile');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const getUserById = createAsyncThunk('UserSlice/getUserById', async (userId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/api/user/get-profile/' + userId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const getUserByIds = createAsyncThunk('UserSlice/getUserByIds', async (userIds, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/user/get-user-by-ids', { userIds });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const uploadAvatar = createAsyncThunk('UserSlice/uploadAvatar', async (file, { rejectWithValue }) => {
    try {
        console.log("File: ", file);
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/api/user/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})
const login = createAsyncThunk('UserSlice/login', async (user, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/login', user);
        return response.data;
    } catch (error) {
        console.log("Login error 222: ", error);
        return rejectWithValue(error);
    }
});

const uploadBackground = createAsyncThunk('UserSlice/uploadBackground', async (file, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/api/user/upload-background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})

const updateProfile = createAsyncThunk('UserSlice/updateProfile', async (user, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/api/user/update-profile', user);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});


const generateOtp = createAsyncThunk('UserSlice/generateOtp', async (phoneNumber, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/generate-otp?phoneNumber=' + phoneNumber);
        console.log("Response: ", response);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const verifyOtp = createAsyncThunk('UserSlice/verifyOtp', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/verify-otp?phoneNumber=' + request.phoneNumber + '&otp=' + request.otp);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});
const logout = createAsyncThunk('UserSlice/logout', async (_, { rejectWithValue }) => {
    try {
        const headers = {
            Authorization: `Bearer ${SecureStore.getItem('refreshToken')}`
        };

        const response = await axios.post(`${API_URL}/api/auth/logout`, {}, { headers });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const changePassword = createAsyncThunk('UserSlice/changePassword',
    async ({ phoneNumber, oldPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/auth/change-password', { phoneNumber, oldPassword, newPassword });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    });
const forgetPassword = createAsyncThunk('UserSlice/forgetPassword', async ({ phoneNumber, passwordNew }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/reset-password', { phoneNumber, passwordNew });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const UserSlice = createSlice({
    name: 'UserSlice',
    initialState: initialState,
    reducers: {
        setUserOnlines: (state, action) => {
            state.userOnlines = action.payload;
        },
        setUserLogin: (state, action) => {
            state.userLogin = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.userLogin = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            SecureStore.setItemAsync("accessToken", action.payload.data.accessToken);
            SecureStore.setItemAsync("refreshToken", action.payload.data.refreshToken);
        });
        builder.addCase(login.rejected, (state) => {
            state.userLogin = null;
        });
        builder.addCase(uploadAvatar.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadAvatar.fulfilled, (state, action) => {
            state.avatar = action.payload.data;
            const user = JSON.parse(SecureStore.getItem('userLogin'));
            SecureStore.setItem('userLogin', JSON.stringify({
                ...user,
                avatarLink: action.payload.data
            }));
            state.userLogin = JSON.parse(SecureStore.getItem('userLogin'));
        });
        builder.addCase(uploadAvatar.rejected, (state, action) => {
            console.log(action)

            state.avatar = null;
        });

        builder.addCase(uploadBackground.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadBackground.fulfilled, (state, action) => {
            state.avatar = action.payload.data;
            const user = JSON.parse(SecureStore.getItem('userLogin'));

            SecureStore.setItem('userLogin', JSON.stringify({
                ...user,
                backgroundLink: action.payload.data
            }));

            state.userLogin = JSON.parse(SecureStore.getItem('userLogin'));
        });
        builder.addCase(uploadBackground.rejected, (state, action) => {
            console.log(action)
            state.avatar = null;
        });

        builder.addCase(getProfile.pending, (state) => {
        });
        builder.addCase(getProfile.fulfilled, (state, action) => {
            SecureStore.setItem('userLogin', JSON.stringify(action.payload.data));
            state.userLogin = JSON.parse(SecureStore.getItem('userLogin'));
            console.log("User login: ", state.userLogin);
        });
        builder.addCase(getProfile.rejected, (state, action) => {
            state.userLogin = null;

        });

        builder.addCase(updateProfile.pending, (state) => {
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.userLogin = action.payload.data;
            SecureStore.setItem('userLogin', JSON.stringify(action.payload.data));
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.userLogin = null;
        });

        builder.addCase(generateOtp.pending, (state) => {
        });

        builder.addCase(generateOtp.fulfilled, (state, action) => {
        });

        builder.addCase(generateOtp.rejected, (state, action) => {
        });

        builder.addCase(verifyOtp.pending, (state) => {
        });

        builder.addCase(verifyOtp.fulfilled, (state, action) => {

        });

        builder.addCase(verifyOtp.rejected, (state, action) => {

        });

        builder.addCase(logout.pending, (state) => {
        });
        builder.addCase(logout.fulfilled, (state, action) => {
        });
        builder.addCase(logout.rejected, (state, action) => {
        });

        builder.addCase(changePassword.pending, (state) => {
        });
        builder.addCase(changePassword.fulfilled, (state, action) => {
        });
        builder.addCase(changePassword.rejected, (state, action) => {
        });


        builder.addCase(forgetPassword.pending, (state) => {
        });
        builder.addCase(forgetPassword.fulfilled, (state, action) => {
        });
        builder.addCase(forgetPassword.rejected, (state, action) => {
        });

        builder.addCase(getUserById.pending, (state) => {
        });
        builder.addCase(getUserById.fulfilled, (state, action) => {
            state.userLogin = action.payload.data;
        });
        builder.addCase(getUserById.rejected, (state, action) => {
            state.userLogin = null;
        });

        builder.addCase(getUserByIds.pending, (state) => {
        });
        builder.addCase(getUserByIds.fulfilled, (state, action) => {
        });
        builder.addCase(getUserByIds.rejected, (state, action) => {
        });
    }
});

export const { setUserOnlines, setUserLogin } = UserSlice.actions;
export { uploadAvatar, uploadBackground, getProfile, updateProfile, login, verifyOtp, generateOtp, logout, forgetPassword, changePassword, getUserById, getUserByIds };
export default UserSlice.reducer;