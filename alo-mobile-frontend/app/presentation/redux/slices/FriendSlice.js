
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

const initialState = {
    friends: [],
    friend: null,
    error: null,
    sentRequests: [],
    friendRequests: [],
};
const getFriends = createAsyncThunk('FriendSlice/getFriends', async (_, { rejectWithValue }) => {
    const userLogin = JSON.parse(await SecureStore.getItemAsync('userLogin'));
    // console.log("userLoginXXX", userLogin);
    try {
        const response = await axiosInstance.get(`/api/friend/get-friends?userId=${userLogin.id}`);
        console.log("Friends data from API:", response.data);
        return response.data;

    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const getFriendsRequest = createAsyncThunk('FriendSlice/getFriendsRequest', async (_, { rejectWithValue }) => {
    const userLogin = JSON.parse(await SecureStore.getItemAsync('userLogin'));
    // console.log("userLogin", userLogin);

    try {
        const response = await axiosInstance.get(`/api/friend/get-friend-request?userId=${userLogin.id}`);
        return response.data;
    } catch (error) {
        console.error("Error response:", error.response?.data);
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const unfriend = createAsyncThunk('FriendSlice/unfriend', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/unfriend', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const blockFriend = createAsyncThunk('FriendSlice/block-friend', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/block-friend', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});
const sendFriendRequest = createAsyncThunk('FriendSlice/sendFriendRequest', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/send-friend-request', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});
const acceptFriendRequest = createAsyncThunk('FriendSlice/acceptFriendRequest', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/accept-friend-request', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const rejectFriendRequest = createAsyncThunk('FriendSlice/rejectFriendRequest', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/reject-friend-request', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const getFriendByPhoneNumber = createAsyncThunk('FriendSlice/getFriendByPhoneNumber', async (phoneNumber, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/friend/get-friend-by-phone-number?phoneNumber=${phoneNumber}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const cancelFriend = createAsyncThunk('FriendSlice/cancelFriend', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/friend/cancel-friend', request);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const FriendSlice = createSlice({
    name: 'Friend',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        addSentRequest: (state, action) => {
            state.sentRequests.push(action.payload);
        },
        removeSentRequest: (state, action) => {
            state.sentRequests = state.sentRequests.filter(req => req.friendId !== action.payload);
        },
        clearSentRequests: (state) => {
            state.sentRequests = [];
        },
        setFriendRequests: (state, action) => {
            state.friendRequests = action.payload;
        },
        setFriends: (state, action) => {
            state.friends = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getFriends.pending, (state) => {
            state.friends = [];
        });
        builder.addCase(getFriends.fulfilled, (state, action) => {
            state.friends = action.payload.data;
        });
        builder.addCase(getFriends.rejected, (state, action) => {
            state.friends = [];
        });
        builder.addCase(unfriend.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(unfriend.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(unfriend.rejected, (state, action) => {
            state.friend = null;
        });
        builder.addCase(blockFriend.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(blockFriend.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(blockFriend.rejected, (state, action) => {
            state.friend = null;
        });
        builder.addCase(sendFriendRequest.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(sendFriendRequest.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(sendFriendRequest.rejected, (state, action) => {
            state.friend = null;
        });
        builder.addCase(acceptFriendRequest.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(acceptFriendRequest.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(acceptFriendRequest.rejected, (state, action) => {
            state.friend = null;
        });
        builder.addCase(rejectFriendRequest.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(rejectFriendRequest.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(rejectFriendRequest.rejected, (state, action) => {
            state.friend = null;
        });
        builder.addCase(getFriendByPhoneNumber.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(getFriendByPhoneNumber.fulfilled, (state, action) => {
            state.friend = action.payload.data;
            // console.log("Updated state.friend:", state.friend);
        });
        builder.addCase(getFriendByPhoneNumber.rejected, (state, action) => {
            state.friend = null;
        });

        builder.addCase(getFriendsRequest.pending, (state) => {
            state.friendRequests = [];
        });
        builder.addCase(getFriendsRequest.fulfilled, (state, action) => {
            state.friendRequests = action.payload.data;
        });
        builder.addCase(getFriendsRequest.rejected, (state, action) => {
            state.friendRequests = [];
        });
        builder.addCase(cancelFriend.pending, (state) => {
            state.friend = null;
        });
        builder.addCase(cancelFriend.fulfilled, (state, action) => {
            state.friend = action.payload.data;
        });
        builder.addCase(cancelFriend.rejected, (state, action) => {
            state.friend = null;
        });



    }
});
export const { clearError, addSentRequest, removeSentRequest, clearSentRequests, setFriendRequests, setFriends } = FriendSlice.actions;
export { getFriends, unfriend, blockFriend, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendByPhoneNumber, getFriendsRequest, cancelFriend };
export default FriendSlice.reducer;
