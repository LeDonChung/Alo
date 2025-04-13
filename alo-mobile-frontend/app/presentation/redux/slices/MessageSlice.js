import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

const initialState = {
    isSending: false,
    isLoadMessage: false,
    messages: [],
    limit: 20
};

const sendMessage = createAsyncThunk('MessageSlice/sendMessage', async ({ message, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        if (file) {
            formData.append("file", {
                uri: file.uri,
                name: file.name,
                type: file.type
              });
        }

        for (const key in message) {
            formData.append(key, message[key]);
        }

        const response = await axiosInstance.post('/api/message/create-message', formData, {
            headers: { 
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const getMessagesByConversationId = createAsyncThunk('MessageSlice/getMessagesByConversationId', async (conversationId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/api/message/get-messages/${conversationId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const MessageSlice = createSlice({
    name: 'MessageSlice',
    initialState: initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        increaseLimit: (state, action) => {
            state.limit += action.payload;
        }
    },
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

        builder.addCase(getMessagesByConversationId.pending, (state) => {
            state.isLoadMessage = true;
            state.messages = [];
        });
        builder.addCase(getMessagesByConversationId.fulfilled, (state, action) => {
            state.messages = action.payload.data;
            state.isLoadMessage = false;
        });
        builder.addCase(getMessagesByConversationId.rejected, (state, action) => {
            state.isLoadMessage = false
        });
    }
});

export const { setMessages, increaseLimit } = MessageSlice.actions;
export { sendMessage, getMessagesByConversationId };
export default MessageSlice.reducer;