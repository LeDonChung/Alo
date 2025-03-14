import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    avatar: null,
};

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

const UserSlice = createSlice({
    name: 'UserSlice',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(uploadAvatar.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadAvatar.fulfilled, (state, action) => {
            state.avatar = action.payload;
        });
        builder.addCase(uploadAvatar.rejected, (state, action) => {
            state.avatar = null;
        });

        builder.addCase(uploadBackground.pending, (state) => {
            state.avatar = null;
        });
        builder.addCase(uploadBackground.fulfilled, (state, action) => {
            state.avatar = action.payload;
        });
        builder.addCase(uploadBackground.rejected, (state, action) => {
            state.avatar = null;
        });
    }
});

export const { } = UserSlice.actions;
export { uploadAvatar, uploadBackground };
export default UserSlice.reducer;