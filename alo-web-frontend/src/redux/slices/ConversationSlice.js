import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    conversations: [],
    conversation: null
};


const getAllConversation = createAsyncThunk('ConversationSlice/getAllConversation', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/api/conversation/get-conversation');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const getConversationById = createAsyncThunk('ConversationSlice/getConversationById', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/api/conversation/get-conversation/' + id);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const ConversationSlice = createSlice({
    name: 'ConversationSlice',
    initialState: initialState,
    reducers: {
        setConversation: (state, action) => {
            state.conversation = action.payload;
        },
        updateLastMessage: (state, action) => {
            const conversationId = action.payload.conversationId;
            const message = action.payload.message;
            const conversation = state.conversations.find(conversation => conversation.id === conversationId);
            if (conversation) {
                conversation.lastMessage = message;
                const index = state.conversations.findIndex(conversation => conversation.id === conversationId);
                state.conversations[index] = conversation;
            }
        }
    },
    extraReducers: (builder) => {

        builder.addCase(getAllConversation.pending, (state) => {
            state.conversations = [];
        });
        builder.addCase(getAllConversation.fulfilled, (state, action) => {
            state.conversations = action.payload.data;
        });
        builder.addCase(getAllConversation.rejected, (state, action) => {
            state.conversations = [];
        });


        builder.addCase(getConversationById.pending, (state) => {
            state.conversation = [];
        });
        builder.addCase(getConversationById.fulfilled, (state, action) => {
            state.conversation = action.payload.data;
        });
        builder.addCase(getConversationById.rejected, (state, action) => {
            state.conversation = [];
        });
    }
});

export const { setConversation, updateLastMessage } = ConversationSlice.actions;
export { getAllConversation, getConversationById };
export default ConversationSlice.reducer;