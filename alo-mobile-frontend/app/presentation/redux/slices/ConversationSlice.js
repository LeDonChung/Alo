import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/APIClient";
import * as SecureStore from "expo-secure-store";

const initialState = {
    conversations: [],
    conversation: null,
    error: null,
    isLeaving: false, // Added from leaveGroup pending case
};

const getAllConversation = createAsyncThunk(
    "ConversationSlice/getAllConversation",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/conversation/get-conversation');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

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

const addMemberToGroup = createAsyncThunk(
    'ConversationSlice/addMemberToGroup',
    async ({ conversationId, memberUserIds }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/add-member`, {
                memberUserIds
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const removeMemberToGroup = createAsyncThunk(
    'ConversationSlice/removeMemberToGroup',
    async ({ conversationId, memberUserId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-member/${memberUserId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const blockMemberToGroup = createAsyncThunk(
    'ConversationSlice/blockMemberToGroup',
    async ({ conversationId, memberUserId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/block/${memberUserId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const unblockMemberToGroup = createAsyncThunk(
    'ConversationSlice/unblockMemberToGroup',
    async ({ conversationId, memberUserId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/unblock/${memberUserId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const addViceLeaderToGroup = createAsyncThunk(
    'ConversationSlice/addViceLeaderToGroup',
    async ({ conversationId, memberUserId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                `/api/conversation/${conversationId}/add-vice-leader/${memberUserId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const removeViceLeaderToGroup = createAsyncThunk(
    'ConversationSlice/removeViceLeaderToGroup',
    async ({ conversationId, memberUserIds }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-vice-leader/${memberUserIds}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);

const changeLeader = createAsyncThunk(
    'ConversationSlice/changeLeader',
    async ({ conversationId, newLeaderId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                `/api/conversation/${conversationId}/change-leader/${newLeaderId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
        }
    }
);


const createGroup = createAsyncThunk('ConversationSlice/createGroup', async ({ data, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        if (file) {
            formData.append("file", {
                uri: file.uri,
                name: file.name,
                type: file.type
            });
        }

        for (const key in data) {
            const value = data[key];
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }

        const response = await axiosInstance.post('/api/conversation/create-group', formData, {
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

const updateProfileGroup = createAsyncThunk('ConversationSlice/updateProfileGroup', async ({ conversationId, data, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        if (file) {
            formData.append("file", {
                uri: file.uri,
                name: file.name,
                type: file.type
            });
        }

        for (const key in data) {
            const value = data[key];
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }

        const response = await axiosInstance.post(`/api/conversation/${conversationId}/update-profile-group`, formData, {
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

const removeAllHistoryMessages = createAsyncThunk('ConversationSlice/removeAllHistoryMessages', async ({ conversationId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-all-history-messages`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const updateAllowUpdateProfileGroup = createAsyncThunk('ConversationSlice/updateAllowUpdateProfileGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-update-profile-group`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});


const updateAllowPinMessageGroup = createAsyncThunk('ConversationSlice/updateAllowPinMessageGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-pin-message`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const updateAllowSendMessageGroup = createAsyncThunk('ConversationSlice/updateAllowSendMessageGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-send-message`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});
const leaveGroup = createAsyncThunk('ConversationSlice/leaveGroup', async ({ conversationId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/leave-group`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const disbandGroup = createAsyncThunk('ConversationSlice/disbandGroup', async ({ conversationId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/api/conversation/${conversationId}/disband-group`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
})
const ConversationSlice = createSlice({
    name: 'ConversationSlice',
    initialState: initialState,
    reducers: {
        setConversation: (state, action) => {
            state.conversation = action.payload;
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
        addMemberGroup: (state, action) => {
            const conversationId = action.payload.conversationId;
            const memberUserIds = action.payload.memberUserIds;
            const memberInfo = action.payload.memberInfo;

            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.memberUserIds = [...state.conversation.memberUserIds, ...memberUserIds];
                state.conversation.members = [...state.conversation.members, ...memberInfo];
            }

            // Cập nhật danh sách conversations
            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].memberUserIds = [...state.conversations[conversationIndex].memberUserIds, ...memberUserIds];
                state.conversations[conversationIndex].members = [...state.conversations[conversationIndex].members, ...memberInfo];

            }
        },
        updateProfileGroupById: (state, action) => {
            const updatedConversation = action.payload;
            const existingConversation = state.conversations.find(conversation => conversation.id === updatedConversation.id);
            if (existingConversation) {
                const index = state.conversations.findIndex(conversation => conversation.id === updatedConversation.id);
                state.conversations[index].name = updatedConversation.name;
                state.conversations[index].avatar = updatedConversation.avatar;
                if (state.conversation?.id === updatedConversation.id) {
                    state.conversation.name = updatedConversation.name;
                    state.conversation.avatar = updatedConversation.avatar;
                }
            }
        },
        removeConversation: (state, action) => {
            const conversationId = action.payload.conversationId;

            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);

            if (conversationIndex !== -1) {
                state.conversations.splice(conversationIndex, 1);
            }
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
        },
        addPinToConversation: (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.pineds.unshift(action.payload);
                if (cons.pineds.length > 5) {
                    cons.pineds.pop();
                }
            }
            state.conversation = { ...cons };
        },
        removePinToConversation: (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.pineds = cons.pineds.filter(pin => pin.messageId !== action.payload.messageId);
            }
            state.conversation = { ...cons };
        },
        updateConversationFromSocket: (state, action) => {
            const { conversationId, message } = action.payload;
            const conversation = state.conversations.find(conv => conv.id === conversationId);
            if (conversation) {
                conversation.lastMessage = message;
                const index = state.conversations.findIndex(conv => conv.id === conversationId);
                state.conversations[index] = conversation;
            }
        },
        clearHistoryMessages: (state, action) => {
            const { conversationId, conversation } = action.payload;
            state.conversations = state.conversations.map(conv =>
                conv.id === conversationId
                    ? { ...conv, lastMessage: null, pineds: [] }
                    : conv
            );
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation = {
                    ...state.conversation,
                    lastMessage: null,
                    pineds: []
                };
            }
        },
        memberLeaveGroup: (state, action) => {
            const conversationId = action.payload.conversationId;
            const memberUserId = action.payload.userId;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.memberUserIds = state.conversation.memberUserIds.filter(id => id !== memberUserId);
                state.conversation.members = state.conversation.members.filter(member => member.id !== memberUserId);
            }
            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].memberUserIds = state.conversations[conversationIndex].memberUserIds.filter(id => id !== memberUserId);
                state.conversations[conversationIndex].members = state.conversations[conversationIndex].members.filter(member => member.id !== memberUserId);
            }

        },
        updatePermissions: (state, action) => {
            const conversationId = action.payload.conversationId;
            const roles = action.payload.roles;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.roles = roles;
            }
            const conversation = state.conversations.find(conversation => conversation.id === conversationId);
            if (conversation) {
                conversation.roles = roles;
                const index = state.conversations.findIndex(convo => convo.id === conversationId);
                state.conversations[index].roles = roles;
            }
        },
        handlerRemoveHistoryMessage: (state, action) => {
            const { conversation } = action.payload;
            if (state.conversation && state.conversation.id === conversation.id) {
                state.conversation.lastMessage = null;
            }
            const conversationIndex = state.conversations.findIndex(
                (conv) => conv.id === conversation.id
            );
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].lastMessage = null;
            }
        },
        removeMemberGroup: (state, action) => {
            const conversationId = action.payload.conversationId;
            const memberUserId = action.payload.memberUserId;
            console.log("removeMemberGroup", state.conversations)
            // Xoas khoir nhoms
            // Xoa khoi nhom dang chon
            if (state.conversation && state.conversation?.id === conversationId) {
                state.conversation.memberUserIds = state.conversation.memberUserIds.filter(id => id !== memberUserId);
                state.conversation.members = state.conversation.members.filter(member => member?.id !== memberUserId);
            }
            // Xoa khoi nhoms dung index
            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].memberUserIds = state.conversations[conversationIndex].memberUserIds.filter(id => id !== memberUserId);
                state.conversations[conversationIndex].members = state.conversations[conversationIndex].members.filter(member => member.id !== memberUserId);
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

        builder.addCase(createPin.pending, (state) => { });
        builder.addCase(createPin.fulfilled, (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.pineds.unshift(action.payload.data);
                if (cons.pineds.length > 5) {
                    cons.pineds.pop();
                }
            }
            state.conversation = { ...cons };
        });
        builder.addCase(createPin.rejected, (state, action) => { });

        builder.addCase(removePin.pending, (state) => { });
        builder.addCase(removePin.fulfilled, (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.pineds = cons.pineds.filter(pin => pin.messageId !== action.payload.data.messageId);
            }
            state.conversation = { ...cons };
        });
        builder.addCase(removePin.rejected, (state, action) => { });

        builder.addCase(addMemberToGroup.pending, (state) => {
        });
        builder.addCase(addMemberToGroup.fulfilled, (state, action) => {

        });
        builder.addCase(addMemberToGroup.rejected, (state, action) => {
        });

        builder.addCase(removeMemberToGroup.pending, (state) => {
        });
        builder.addCase(removeMemberToGroup.fulfilled, (state, action) => {

        });
        builder.addCase(removeMemberToGroup.rejected, (state, action) => {
        });

        builder.addCase(blockMemberToGroup.pending, (state) => {
        });
        builder.addCase(blockMemberToGroup.fulfilled, (state, action) => {

        });
        builder.addCase(blockMemberToGroup.rejected, (state, action) => {
        });

        builder.addCase(unblockMemberToGroup.pending, (state) => {
        });
        builder.addCase(unblockMemberToGroup.fulfilled, (state, action) => {
            let cons = state.conversation;
            if (cons) {
                cons.blockedMembers = cons.blockedMembers.filter(member => !action.payload.data.memberUserId.includes(member.id));
                cons.members = [...cons.members, ...action.payload.data.members];
            }
            state.conversation = { ...cons };
        });
        builder.addCase(unblockMemberToGroup.rejected, (state, action) => {
        });

        builder.addCase(addViceLeaderToGroup.pending, (state) => {
        });
        builder.addCase(addViceLeaderToGroup.fulfilled, (state, action) => {

        });
        builder.addCase(addViceLeaderToGroup.rejected, (state, action) => {
        });

        builder.addCase(removeViceLeaderToGroup.pending, (state) => {
        });
        builder.addCase(removeViceLeaderToGroup.fulfilled, (state, action) => {

        });

        builder.addCase(changeLeader.pending, (state) => {
            state.loading = true;
        });

        builder.addCase(changeLeader.fulfilled, (state, action) => {
            
        });

        builder.addCase(changeLeader.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Lỗi khi thay đổi trưởng nhóm";
        });

        builder.addCase(createGroup.pending, (state) => { });
        builder.addCase(createGroup.fulfilled, (state, action) => {
            console.log(action.payload);
        });
        builder.addCase(createGroup.rejected, (state, action) => { });

        builder.addCase(updateProfileGroup.pending, (state) => { });
        builder.addCase(updateProfileGroup.fulfilled, (state, action) => { });
        builder.addCase(updateProfileGroup.rejected, (state, action) => { });

        builder.addCase(removeAllHistoryMessages.pending, (state) => {
            state.error = null;
        });
        builder.addCase(removeAllHistoryMessages.fulfilled, (state, action) => {
            state.conversations = state.conversations.map(conv =>
                conv.id === action.payload.data.conversationId
                    ? { ...conv, lastMessage: null, pineds: [] }
                    : conv
            );
            if (state.conversation && state.conversation.id === action.payload.data.conversationId) {
                state.conversation.lastMessage = null;
                state.conversation.pineds = [];
            }
        });
        builder.addCase(removeAllHistoryMessages.rejected, (state, action) => {
            state.error = action.payload.message || "Xóa lịch sử thất bại";
        });


        builder.addCase(updateAllowUpdateProfileGroup.pending, (state) => { });
        builder.addCase(updateAllowUpdateProfileGroup.fulfilled, (state, action) => {
            const conversationId = action.payload.data.conversationId;
            const allow = action.payload.data.allow;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.allowUpdateProfile = allow;
            }
            const conversation = state.conversations.find(conv => conv.id === conversationId);
            if (conversation) {
                conversation.allowUpdateProfile = allow;
            }
        });
        builder.addCase(updateAllowUpdateProfileGroup.rejected, (state, action) => {
            state.error = action.payload?.message || "Cập nhật quyền thất bại";
        });

        builder.addCase(updateAllowSendMessageGroup.pending, (state) => { });
        builder.addCase(updateAllowSendMessageGroup.fulfilled, (state, action) => {
            const conversationId = action.payload.data.conversationId;
            const allow = action.payload.data.allow;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.allowSendMessage = allow;
            }
            const conversation = state.conversations.find(conv => conv.id === conversationId);
            if (conversation) {
                conversation.allowSendMessage = allow;
            }
        });
        builder.addCase(updateAllowSendMessageGroup.rejected, (state, action) => {
            state.error = action.payload?.message || "Cập nhật quyền thất bại";
        });

        builder.addCase(updateAllowPinMessageGroup.pending, (state) => { });
        builder.addCase(updateAllowPinMessageGroup.fulfilled, (state, action) => {
            const conversationId = action.payload.data.conversationId;
            const allow = action.payload.data.allow;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.allowPinMessage = allow;
            }
            const conversation = state.conversations.find(conv => conv.id === conversationId);
            if (conversation) {
                conversation.allowPinMessage = allow;
            }
        });
        builder.addCase(updateAllowPinMessageGroup.rejected, (state, action) => {
            state.error = action.payload?.message || "Cập nhật quyền thất bại";
        });
        builder.addCase(leaveGroup.pending, (state) => {
        });
        builder.addCase(leaveGroup.fulfilled, (state, action) => {

        });
        builder.addCase(leaveGroup.rejected, (state, action) => {
        })

        builder.addCase(disbandGroup.pending, (state) => {
        });
        builder.addCase(disbandGroup.fulfilled, (state, action) => {
        });
        builder.addCase(disbandGroup.rejected, (state, action) => {
        });
    }
});

export const {
    setConversation,
    updateLastMessage,
    addPinToConversation,
    removePinToConversation,
    updateConversationFromSocket,
    addConversation,
    removeConversation,
    updateProfileGroupById,
    clearHistoryMessages,
    memberLeaveGroup,
    updatePermissions,
    removeMemberGroup,
    handlerRemoveHistoryMessage,
    addMemberGroup,
} = ConversationSlice.actions;

export {
    getAllConversation,
    getConversationById,
    createPin,
    removePin,
    createGroup,
    updateProfileGroup,
    removeAllHistoryMessages,
    leaveGroup,
    updateAllowUpdateProfileGroup,
    updateAllowSendMessageGroup,
    updateAllowPinMessageGroup,
    addMemberToGroup,
    removeMemberToGroup,
    blockMemberToGroup,
    unblockMemberToGroup,
    addViceLeaderToGroup,
    removeViceLeaderToGroup,
    changeLeader,
    disbandGroup 
};


export default ConversationSlice.reducer;