import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    conversations: [],
    conversation: null,

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

const createPin = createAsyncThunk('ConversationSlice/createPin', async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/pin/${messageId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removePin = createAsyncThunk('ConversationSlice/removePin', async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/api/conversation/${conversationId}/pin/${messageId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const createGroup = createAsyncThunk('ConversationSlice/createGroup', async ({ name, memberUserIds, file, avatar }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("memberUserIds", JSON.stringify(memberUserIds));
        if (file) {
            formData.append("file", file);
        } else if (avatar) {
            formData.append("avatar", avatar);
        }

        const response = await axiosInstance.post('/api/conversation/create-group', formData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removeAllHistoryMessages = createAsyncThunk(
    'ConversationSlice/removeAllHistoryMessages',
    async ({ conversationId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-all-history-messages`);
            return { conversationId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi gọi API' });
        }
    }
);

const ConversationSlice = createSlice({
    name: 'ConversationSlice',
    initialState: initialState,
    reducers: {
        setConversation: (state, action) => {
            state.conversation = action.payload;
        },

        // thêm status message vào để khi thu hồi thì bắt  được tin nhắn đã thu hồi -> update lastMessage bên conversation để hiển thị ngay lập tức
        updateLastMessage: (state, action) => {
            const conversationId = action.payload.conversationId;
            const message = action.payload.message;
            const conversation = state.conversations.find(conversation => conversation.id === conversationId);
            if (conversation) {
                conversation.lastMessage = message;
                const index = state.conversations.findIndex(conversation => conversation.id === conversationId);
                state.conversations[index] = conversation;
            }
        },
        addPinToConversation: (state, action) => {
            if (state.conversation && action.payload?.message) {
                state.conversation.pineds = state.conversation.pineds || [];
                state.conversation.pineds.unshift(action.payload);
                if (state.conversation.pineds.length > 5) {
                    state.conversation.pineds.pop();
                }
            }
        },
        removePinToConversation: (state, action) => {
            if (state.conversation && state.conversation.pineds) {
                state.conversation.pineds = state.conversation.pineds.filter(
                    (pin) => pin.messageId !== action.payload.messageId
                );
            }
        },
        addConversation: (state, action) => {
            const newConversation = action.payload;
            const existingConversation = state.conversations.find(conversation => conversation.id === newConversation.id);
            if (!existingConversation) {
                state.conversations.unshift(newConversation);
            } else {
                const index = state.conversations.findIndex(conversation => conversation.id === newConversation.id);
                state.conversations[index] = newConversation;
            }
        },
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

        builder.addCase(createPin.pending, (state) => {
        });
        builder.addCase(createPin.fulfilled, (state, action) => {
            let cons = state.conversation;
            if (cons && action.payload.data?.message) { // Kiểm tra action.payload.data và message
                cons.pineds.unshift(action.payload.data);
                if (cons.pineds.length > 3) {
                    cons.pineds.pop();
                }
            }
            state.conversation = { ...cons };
        });

        builder.addCase(createPin.rejected, (state, action) => {
        });

        builder.addCase(removePin.pending, (state) => {
        });
        builder.addCase(removePin.fulfilled, (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.pineds = cons.pineds.filter(pin => pin.messageId !== action.payload.data.messageId);
            }
            state.conversation = { ...cons };
        });
        builder.addCase(removePin.rejected, (state, action) => {
        });

        builder.addCase(createGroup.pending, (state) => {});
        builder.addCase(createGroup.fulfilled, (state, action) => {
            state.conversations.unshift(action.payload.data); // Thêm nhóm mới vào đầu danh sách
        });
        builder.addCase(createGroup.rejected, (state, action) => {});

        builder.addCase(removeAllHistoryMessages.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeAllHistoryMessages.fulfilled, (state, action) => {
            state.loading = false;
            if (state.conversation && state.conversation.id === action.payload.conversationId) {
                state.conversation.messages = []; // Xóa danh sách tin nhắn
                state.conversation.lastMessage = null; // Xóa lastMessage
            }
            const conversationIndex = state.conversations.findIndex(
                (conv) => conv.id === action.payload.conversationId
            );
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].messages = [];
                state.conversations[conversationIndex].lastMessage = null;
            }
        });
        builder.addCase(removeAllHistoryMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        });
    }
});

export const { setConversation, updateLastMessage, addPinToConversation, removePinToConversation, addConversation } = ConversationSlice.actions;
export { getAllConversation, getConversationById, createPin, removePin, createGroup, removeAllHistoryMessages };
export default ConversationSlice.reducer;