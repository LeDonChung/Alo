import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    friends: []
};

const getFriends = createAsyncThunk('FriendSlice/getFriends', async (_, { rejectWithValue }) => {
    const userLogin = JSON.parse(localStorage.getItem('userLogin'));
    const userId = userLogin.id.trim(); 
    try {
        const response = await axiosInstance.get('/api/friend/get-friends?userId=' + userId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const FriendSlice = createSlice({
    name: 'FriendSlice',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {

        // Register
        builder.addCase(getFriends.pending, (state) => {
            state.friends = [];
        });
        builder.addCase(getFriends.fulfilled, (state, action) => {            
            state.friends = action.payload.data;
        });
        builder.addCase(getFriends.rejected, (state, action) => {
            state.friends = [];
        });
    }
});

export const { } = FriendSlice.actions;
export { getFriends };
export default FriendSlice.reducer;