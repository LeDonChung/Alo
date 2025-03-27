import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    friends: [],
    friend: null,
    error: null,
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

const unfriend = createAsyncThunk('FriendSlice/unfriend', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/unfriend', request);
        console.log("response", response.data);        
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const blockFriend = createAsyncThunk('FriendSlice/block-friend', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/block-friend', request);
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

        // getFriends
        builder.addCase(getFriends.pending, (state) => {
            state.friends = [];
        });
        builder.addCase(getFriends.fulfilled, (state, action) => {            
            state.friends = action.payload.data;
        });
        builder.addCase(getFriends.rejected, (state, action) => {
            state.friends = [];
        });

        // unfriend
        builder.addCase(unfriend.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(unfriend.fulfilled, (state, action) => {
            console.log("action.payload.data", action.payload.data);
            
            state.friend = action.payload.data;
        });
        builder.addCase(unfriend.rejected, (state, action) => {
            state.friend = null;
        });

        // blockFriend
        builder.addCase(blockFriend.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(blockFriend.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(blockFriend.rejected, (state, action) => {
            state.friend = null;
        });

    }
});

export const { } = FriendSlice.actions;
export { getFriends, unfriend, blockFriend };
export default FriendSlice.reducer;