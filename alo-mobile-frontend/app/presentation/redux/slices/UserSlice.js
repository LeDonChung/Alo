import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

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
        return rejectWithValue(error);
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
        return rejectWithValue(error.response.data);
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
        const response = await axiosInstance.post('/api/auth/logout');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const changePassword = createAsyncThunk('UserSlice/changePassword', 
    async ({ phoneNumber, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        const response = await axiosInstance.post('/api/auth/change-password',{ phoneNumber, oldPassword, newPassword}, {
            headers: {
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${accessToken}`, 
                 },
          });
        return response.data;
    } catch (error) {
        console.log("API Error:", error);
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
            console.log("User login: ", action);

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


    }
});

export const { setUserOnlines, setUserLogin } = UserSlice.actions;
export { uploadAvatar, uploadBackground, getProfile, updateProfile, login, verifyOtp, generateOtp, logout, changePassword };
export default UserSlice.reducer;