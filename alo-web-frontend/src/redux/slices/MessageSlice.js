import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../api/APIClient";

const initialState = {
    isSending: false,
    isLoadMessage: false,
    messages: [],
    limit: 20,
    messageParent: null,
    messageUpdate: null,
    conversationsShareMessage: [],
};

// Thunks
const sendMessage = createAsyncThunk('MessageSlice/sendMessage', async ({ message, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        if (file) formData.append("file", file);
        for (const key in message) formData.append(key, message[key]);

        const response = await axiosInstance.post('/api/message/create-message', formData, {
            headers: { "Content-Type": "multipart/form-data" }
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

const updateMessageStatus = createAsyncThunk('MessageSlice/updateMessageStatus', async ({ messageId, status }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/status?status=${status}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const updateReaction = createAsyncThunk('MessageSlice/updateReaction', async ({ messageId, type }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/reaction`, { type });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removeAllReaction = createAsyncThunk('MessageSlice/removeAllReaction', async ({ messageId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/api/message/${messageId}/reaction`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const seenAll = createAsyncThunk('MessageSlice/seenAll', async (messageIds, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/seen-messages`, { messageIds });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const seenOne = createAsyncThunk('MessageSlice/seenOne', async (messageId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/seen`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const forwardMessage = createAsyncThunk('MessageSlice/forwardMessage', async ({ messageId, conversationIds }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/message/${messageId}/send-continue`, { conversationIds });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removeOfMe = createAsyncThunk('MessageSlice/removeOfMe', async (messageId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/remove-of-me`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

// Slice
const MessageSlice = createSlice({
    name: 'MessageSlice',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        increaseLimit: (state, action) => {
            state.limit += action.payload;
        },
        addMessage: (state, action) => {
            console.log("addMessage", action.payload);
            state.messages.push(action.payload);
        },
        setMessageParent: (state, action) => {
            state.messageParent = action.payload;
        },
        setMessageUpdate: (state, action) => {
            const { messageId, status, reaction } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) {
                if (status !== undefined) {
                    state.messages[index].status = status;
                }
                if (reaction !== undefined) {
                    state.messages[index].reaction = reaction || {};
                }
            }
        },
        setMessageRemoveOfMe: (state, action) => {
            const { messageId, userId } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) {
                const hasUserId = state.messages[index].removeOfme?.includes(userId);
                if (!hasUserId) {
                    state.messages[index].removeOfme = [
                        ...(state.messages[index].removeOfme || []),
                        userId
                    ];
                }
            }
        },
        updateMessage: (state, action) => {
            const index = state.messages.findIndex(message => {
                return message.requestId === Number(action.payload.requestId);
            });
            if (index !== -1) {
                console.log("updateMessage", action.payload);
                state.messages[index] = action.payload;
            }
        },
        handlerUpdateReaction: (state, action) => {
            const { messageId, updatedReaction } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) {
                state.messages[index].reaction = updatedReaction || {};
            }
        },
        updateSeenAllMessage: (state, action) => {
            const messageSeens = action.payload;
            state.messages = state.messages.map((msg) => {
                const updated = messageSeens.find((m) => m.id === msg.id);
                if (updated) {
                    return { ...msg, seen: updated.seen };
                }
                return msg;
            });
        },
        setConversationsShareMessage: (state, action) => {
            state.conversationsShareMessage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => { state.isSending = true; })
            .addCase(sendMessage.fulfilled, (state) => { state.isSending = false; })
            .addCase(sendMessage.rejected, (state) => { state.isSending = false; })

            .addCase(getMessagesByConversationId.pending, (state) => {
                state.isLoadMessage = true;
                state.messages = [];
            })
            .addCase(getMessagesByConversationId.fulfilled, (state, action) => {
                state.messages = action.payload.data;
                state.isLoadMessage = false;
            })
            .addCase(getMessagesByConversationId.rejected, (state) => {
                state.isLoadMessage = false;
            })

            .addCase(updateMessageStatus.pending, (state) => {
                state.messageUpdate = null;
            })
            .addCase(updateMessageStatus.fulfilled, (state, action) => {
                state.messageUpdate = action.payload.data;
            })
            .addCase(updateMessageStatus.rejected, (state) => {
                state.messageUpdate = null;
            })

            .addCase(updateReaction.fulfilled, () => {})
            .addCase(removeAllReaction.fulfilled, () => {})
            .addCase(seenAll.fulfilled, () => {})
            .addCase(seenOne.fulfilled, () => {})
            .addCase(forwardMessage.pending, (state) => { state.isSending = true; })
            .addCase(forwardMessage.fulfilled, (state) => { state.isSending = false; })
            .addCase(forwardMessage.rejected, (state) => { state.isSending = false; })
            .addCase(removeOfMe.fulfilled, () => {});
    }
});

// Exports
export const {
    setMessages,
    increaseLimit,
    addMessage,
    setMessageParent,
    setMessageUpdate,
    updateMessage,
    handlerUpdateReaction,
    updateSeenAllMessage,
    setMessageRemoveOfMe,
    setConversationsShareMessage
} = MessageSlice.actions;

export {
    sendMessage,
    getMessagesByConversationId,
    updateMessageStatus,
    updateReaction,
    removeAllReaction,
    seenAll,
    seenOne,
    forwardMessage,
    removeOfMe
};

export default MessageSlice.reducer;
