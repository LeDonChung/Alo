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

const sendMessage = createAsyncThunk('MessageSlice/sendMessage', async ({ message, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        if (file) {
            formData.append("file", file);
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


const updateMessageStatus = createAsyncThunk('MessageSlice/updateMessageStatus', async ({ messageId, status }, { rejectWithValue }) => {
    try {
        console.log(messageId, status);

        const response = await axiosInstance.put(`/api/message/${messageId}/status?status=${status}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

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
})
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
        addMessage: (state, action) => {
            state.messages.push(action.payload)
        },
        setMessageParent: (state, action) => {
            state.messageParent = action.payload;
        },
        setMessageUpdate: (state, action) => {
            const { messageId, status } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) {
                state.messages[index].status = status;
            }
        },
        setConversationsShareMessage: (state, action) => {
            state.conversationsShareMessage = action.payload;
        },
        updateMessage: (state, action) => {

            const index = state.messages.findIndex(message => {
                return message.requestId === Number(action.payload.requestId)
            });
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },
        updateSeenAllMessage: (state, action) => {
            const messageSeens = action.payload;

            state.messages = state.messages.map((msg) => {
                const updated = messageSeens.find((m) => m.id === msg.id);
                if (updated) {
                    return {
                        ...msg,
                        seen: updated.seen, // Chỉ update trường seen
                    };
                }
                return msg;
            });
        },


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

        builder.addCase(updateMessageStatus.pending, (state) => {
            state.messageUpdate = null;
        });
        builder.addCase(updateMessageStatus.fulfilled, (state, action) => {
            state.messageUpdate = action.payload.data;
        });
        builder.addCase(updateMessageStatus.rejected, (state, action) => {
            state.messageUpdate = null;
        });

        builder.addCase(seenAll.pending, (state) => {
        });
        builder.addCase(seenAll.fulfilled, (state, action) => {
        });
        builder.addCase(seenAll.rejected, (state, action) => {
        });

        builder.addCase(seenOne.pending, (state) => {
        });
        builder.addCase(seenOne.fulfilled, (state, action) => {
        });
        builder.addCase(seenOne.rejected, (state, action) => {
        });
    }
});

export const { setMessages, increaseLimit, addMessage, setMessageParent, setMessageUpdate, updateMessage, updateSeenAllMessage } = MessageSlice.actions;
export { sendMessage, getMessagesByConversationId, updateMessageStatus, seenAll, seenOne };
export default MessageSlice.reducer;