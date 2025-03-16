import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    avatar: null,
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

const updateProfile = createAsyncThunk('UserSlice/updateProfile', async (user, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/api/user/update-profile', user);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const UserSlice = createSlice({
    name: 'UserSlice',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
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
export { uploadAvatar, uploadBackground, getProfile, updateProfile };
export default UserSlice.reducer;