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

const addMemberToGroup = createAsyncThunk('ConversationSlice/addMemberToGroup', async ({ conversationId, memberUserIds }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/add-member`, { memberUserIds });
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
        addMemberGroup: (state, action) => {
            const conversationId = action.payload.conversationId;
            const memberUserIds = action.payload.memberUserIds;
            const memberInfo = action.payload.memberInfo;
            console.log("state.conversations: ", state.conversations);
            
            const conversation = state.conversations.find(conversation => conversation.id === conversationId);
            
            if (conversation) {
                conversation.memberUserIds = [...conversation.memberUserIds, ...memberUserIds];
                conversation.members = [...conversation.members, ...memberInfo];
                console.log("conversation add member: ", conversation);
                
                const index = state.conversations.findIndex(convo => convo.id === conversationId);
                state.conversations[index] = conversation;
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
            state.conversation = null;
        });
        builder.addCase(getConversationById.fulfilled, (state, action) => {
            state.conversation = action.payload.data;
        });
        builder.addCase(getConversationById.rejected, (state, action) => {
            state.conversation = null; 
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

        // add member to group
        builder.addCase(addMemberToGroup.pending, (state) => {
        });
        builder.addCase(addMemberToGroup.fulfilled, (state, action) => {
        });
        builder.addCase(addMemberToGroup.rejected, (state, action) => {
        });
    }
});

export const { setConversation, updateLastMessage, addPinToConversation, removePinToConversation, addMemberGroup } = ConversationSlice.actions;
export { getAllConversation, getConversationById, createPin, removePin, addMemberToGroup };
export default ConversationSlice.reducer;