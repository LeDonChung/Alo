import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from 'expo-secure-store';

const initialState = {
    isSending: false,
    isLoadMessage: false,
    messages: [],
    limit: 20,
    inputMessage: {
        messageType: 'text',
        content: '',
    },
    messageParent: null,
    messageUpdate: null,
    isSearching: false,
    searchResults: [],
    currentSearchIndex: 0,
    error: null,
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
        console.log(error);
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

const forwardMessage = createAsyncThunk(
    'MessageSlice/forwardMessage',
    async ({ messageId, conversationIds }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/message/${messageId}/send-continue`, {
                conversationIds: conversationIds,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const updateReaction = createAsyncThunk('MessageSlice/updateReaction', async ({ messageId, type }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/reaction`, {
            type: type
        });
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

const updateMessageStatus = createAsyncThunk(
    'MessageSlice/updateMessageStatus',
    async ({ messageId, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/message/${messageId}/status?status=${status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const seenAll = createAsyncThunk('MessageSlice/seenAll', async (messageIds, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/seen-messages`, {
            messageIds
        });
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

const removeOfMe = createAsyncThunk('MessageSlice/removeOfMe', async (messageId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/api/message/${messageId}/remove-of-me`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const searchMessages = createAsyncThunk(
    'MessageSlice/searchMessages',
    async ({ keyword }, { getState, rejectWithValue }) => {
        try {
            const { message } = getState();
            const { messages } = message;

            const filteredMessages = messages.filter(msg => {
                if (msg.messageType === 'text' && msg.content) {
                    return msg.content.toLowerCase().includes(keyword.toLowerCase());
                }
                return false;
            });

            const sortedFilteredMessages = [...filteredMessages].sort((a, b) => b.timestamp - a.timestamp);

            return { data: sortedFilteredMessages };
        } catch (error) {
            return rejectWithValue(error.message || "Lỗi khi tìm kiếm tin nhắn");
        }
    }
);

const MessageSlice = createSlice({
    name: 'MessageSlice',
    initialState: initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        increaseLimit: (state, action) => {
            state.limit += action.payload;
        },
        handlerUpdateReaction: (state, action) => {
            const { messageId, updatedReaction } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) {
                state.messages[index].reaction = updatedReaction;
            }
        },
        updateMessage: (state, action) => {
            const index = state.messages.findIndex(message => {
                return message.requestId === Number(action.payload.requestId);
            });
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setInputMessage: (state, action) => {
            state.inputMessage = action.payload;
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
        updateSeenAllMessage: (state, action) => {
            const messageSeens = action.payload;
            state.messages = state.messages.map((msg) => {
                const updated = messageSeens.find((m) => m.id === msg.id);
                if (updated) {
                    return {
                        ...msg,
                        seen: updated.seen,
                    };
                }
                return msg;
            });
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
        navigateToPreviousResult: (state) => {
            if (state.currentSearchIndex > 0) {
                state.currentSearchIndex -= 1;
            }
        },
        navigateToNextResult: (state) => {
            if (state.currentSearchIndex < state.searchResults.length - 1) {
                state.currentSearchIndex += 1;
            }
        },
        resetSearch: (state) => {
            state.searchResults = [];
            state.currentSearchIndex = 0;
            state.isSearching = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(sendMessage.pending, (state) => {
            state.isSending = true;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.isSending = false;
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.isSending = false;
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
            state.isLoadMessage = false;
        });

        builder.addCase(forwardMessage.pending, (state) => {
            state.isSending = true;
        });
        builder.addCase(forwardMessage.fulfilled, (state, action) => {
            state.isSending = false;
        });
        builder.addCase(forwardMessage.rejected, (state, action) => {
            state.isSending = false;
        });

        builder.addCase(updateReaction.pending, (state) => { });
        builder.addCase(updateReaction.fulfilled, (state, action) => { });
        builder.addCase(updateReaction.rejected, (state, action) => { });

        builder.addCase(removeAllReaction.pending, (state) => { });
        builder.addCase(removeAllReaction.fulfilled, (state, action) => { });
        builder.addCase(removeAllReaction.rejected, (state, action) => { });

        builder.addCase(updateMessageStatus.pending, (state) => {
            state.messageUpdate = null;
        });
        builder.addCase(updateMessageStatus.fulfilled, (state, action) => {
            const updatedMessage = action.payload.data;
            const index = state.messages.findIndex(message => message.id === updatedMessage.id);
            if (index !== -1) {
                state.messages[index] = { ...state.messages[index], status: updatedMessage.status };
            }
            state.messageUpdate = updatedMessage;
        });
        builder.addCase(updateMessageStatus.rejected, (state, action) => {
            state.messageUpdate = null;
        });

        builder.addCase(seenAll.pending, (state) => { });
        builder.addCase(seenAll.fulfilled, (state, action) => { });
        builder.addCase(seenAll.rejected, (state, action) => { });

        builder.addCase(seenOne.pending, (state) => { });
        builder.addCase(seenOne.fulfilled, (state, action) => { });
        builder.addCase(seenOne.rejected, (state, action) => { });

        builder.addCase(removeOfMe.pending, (state) => { });
        builder.addCase(removeOfMe.fulfilled, (state, action) => { });
        builder.addCase(removeOfMe.rejected, (state, action) => { });

        builder.addCase(searchMessages.pending, (state) => {
            state.isSearching = true;
            state.searchResults = [];
            state.currentSearchIndex = 0;
            state.error = null;
        });
        builder.addCase(searchMessages.fulfilled, (state, action) => {
            state.searchResults = action.payload.data;
            state.isSearching = false;
        });
        builder.addCase(searchMessages.rejected, (state, action) => {
            state.isSearching = false;
            state.searchResults = [];
            state.error = action.payload?.message || "Lỗi không xác định";
        });
    }
});

export const {
    setMessages,
    increaseLimit,
    handlerUpdateReaction,
    updateMessage,
    addMessage,
    setInputMessage,
    setMessageParent,
    setMessageUpdate,
    updateSeenAllMessage,
    setMessageRemoveOfMe,
    navigateToPreviousResult,
    navigateToNextResult,
    resetSearch,
} = MessageSlice.actions;

export {
    sendMessage,
    getMessagesByConversationId,
    updateReaction,
    removeAllReaction,
    forwardMessage,
    updateMessageStatus,
    seenAll,
    seenOne,
    removeOfMe,
    searchMessages,
};

export default MessageSlice.reducer;