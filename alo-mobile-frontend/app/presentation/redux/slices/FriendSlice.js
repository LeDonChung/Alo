import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

const initialState = {
  friends: [],
  friend: null,
  error: null, 
};

const getFriends = createAsyncThunk("FriendSlice/getFriends", async (_, { rejectWithValue }) => {
    try {
      // Lấy thông tin người dùng từ SecureStore thay vì localStorage
      const userLogin = JSON.parse(await SecureStore.getItemAsync("userLogin"));
      
      if (!userLogin || !userLogin.id) {
        return rejectWithValue("Không tìm thấy thông tin người dùng.");
      }

      const userId = userLogin.id.trim();
      const response = await axiosInstance.get("/api/friend/get-friends?userId=" + userId);
      console.log("Response getFriends: ", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
  }
);

const FriendSlice = createSlice({
  name: "FriendSlice",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFriends.pending, (state) => {
      state.friends = [];
    });
    builder.addCase(getFriends.fulfilled, (state, action) => {
      state.friends = action.payload.data;
    });
    builder.addCase(getFriends.rejected, (state, action) => {
      state.friends = [];
      state.error = action.payload;
    });
  },
});

export const {} = FriendSlice.actions;
export { getFriends };
export default FriendSlice.reducer;
