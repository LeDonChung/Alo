import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";
const initialState = {
    isSending: false,
};

const sendMessage = createAsyncThunk('MessageSlice/sendMessage', async (request, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/api/message/create-message', request);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const MessageSlice = createSlice({
    name: 'MessageSlice',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {

        builder.addCase(sendMessage.pending, (state) => {
            state.isSending = true;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isSending = false
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.isSending = false
        });
    }
});

export const { } = MessageSlice.actions;
export { sendMessage };
export default MessageSlice.reducer;