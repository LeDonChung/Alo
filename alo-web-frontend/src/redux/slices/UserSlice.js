import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    avatar: null,
    errorResponse: null,
    userLogin: null
};

const getProfile = createAsyncThunk('UserSlice/getProfile', async (token, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/api/user/profile');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});
const uploadAvatar = createAsyncThunk('UserSlice/uploadAvatar', async (file, { rejectWithValue }) => {
    try {
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

const register = createAsyncThunk('UserSlice/register', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/register', request);
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
})

const login = createAsyncThunk('UserSlice/login', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/auth/login', request);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const UserSlice = createSlice({
    name: 'UserSlice',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {

        // Register
        builder.addCase(register.pending, (state) => {
            state.errorResponse = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.errorResponse = null;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.errorResponse = action.payload;
        });

        // Login
        builder.addCase(login.pending, (state) => {
            state.errorResponse = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            localStorage.setItem('accessToken', action.payload.data.accessToken);
            localStorage.setItem('refreshToken', action.payload.data.refreshToken);
            state.errorResponse = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.errorResponse = action.payload;
        });


        builder.addCase(uploadAvatar.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadAvatar.fulfilled, (state, action) => {
            state.avatar = action.payload.data;
            const user = JSON.parse(localStorage.getItem('userLogin'));
            localStorage.setItem('userLogin', JSON.stringify({
                ...user,
                avatarLink: action.payload.data
            }));
            state.userLogin = JSON.parse(localStorage.getItem('userLogin'));
        });

        builder.addCase(uploadAvatar.rejected, (state, action) => {
            state.avatar = null;
        });

        builder.addCase(uploadBackground.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadBackground.fulfilled, (state, action) => {
            state.avatar = action.payload.data;
            const user = JSON.parse(localStorage.getItem('userLogin'));

            localStorage.setItem('userLogin', JSON.stringify({
                ...user,
                backgroundLink: action.payload.data
            }));

            state.userLogin = JSON.parse(localStorage.getItem('userLogin'));
        });
        builder.addCase(uploadBackground.rejected, (state, action) => {
            state.avatar = null;
        });

        builder.addCase(getProfile.pending, (state) => {
        });
        builder.addCase(getProfile.fulfilled, (state, action) => {
            localStorage.setItem('userLogin', JSON.stringify(action.payload.data));
            state.userLogin = JSON.parse(localStorage.getItem('userLogin'));
        });
        builder.addCase(getProfile.rejected, (state, action) => {
            state.userLogin = null;
        });

        builder.addCase(updateProfile.pending, (state) => {
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.userLogin = action.payload.data;
            localStorage.setItem('userLogin', JSON.stringify(action.payload.data));
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.userLogin = null;
        });
    }
});

export const { } = UserSlice.actions;
export { uploadAvatar, uploadBackground, getProfile, updateProfile, register, login };
export default UserSlice.reducer;