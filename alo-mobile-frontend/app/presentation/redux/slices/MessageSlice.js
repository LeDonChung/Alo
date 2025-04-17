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
        console.log(error) 
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
})

const removeAllReaction = createAsyncThunk('MessageSlice/removeAllReaction', async ({ messageId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/api/message/${messageId}/reaction`); 
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
})
 

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
        handlerUpdateReaction: (state, action) => {
            const { messageId, updatedReaction } = action.payload;
            const index = state.messages.findIndex(message => message.id === messageId);
            if (index !== -1) { 
                state.messages[index].reaction = updatedReaction; 
            }
        }, 
        updateMessage: (state, action) => {

            const index = state.messages.findIndex(message => { 
                return message.requestId === Number(action.payload.requestId)
            }); 
            if (index !== -1) {
                state.messages[index] = action.payload; 
            }  
        },
        addMessage: (state, action) => { 
            state.messages.push(action.payload);
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
        builder.addCase(forwardMessage.pending, (state) => {
            state.isSending = true;
        });
        builder.addCase(forwardMessage.fulfilled, (state, action) => {
            state.isSending = false
        });
        builder.addCase(forwardMessage.rejected, (state, action) => {
            state.isSending = false
        });

        builder.addCase(updateReaction.pending, (state) => {
        });

        builder.addCase(updateReaction.fulfilled, (state, action) => {
            
        });


        builder.addCase(updateReaction.rejected, (state, action) => {
        });

        builder.addCase(removeAllReaction.pending, (state) => {
        });

        builder.addCase(removeAllReaction.fulfilled, (state, action) => {
            
        });


        builder.addCase(removeAllReaction.rejected, (state, action) => {
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
 
export const { setMessages, increaseLimit, handlerUpdateReaction, updateMessage, addMessage, updateSeenAllMessage } = MessageSlice.actions;
export { sendMessage, getMessagesByConversationId, updateReaction, removeAllReaction, forwardMessage, seenAll, seenOne };
export default MessageSlice.reducer;