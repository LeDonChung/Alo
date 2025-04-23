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

const addViceLeader = createAsyncThunk('ConversationSlice/addViceLeader', async ({ conversationId, memberUserId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/add-vice-leader/${memberUserId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removeViceLeader = createAsyncThunk('ConversationSlice/removeViceLeader', async ({ conversationId, memberUserId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-vice-leader/${memberUserId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const removeMember = createAsyncThunk('ConversationSlice/removeMember', async ({ conversationId, memberUserId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-member/${memberUserId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const blockMember = createAsyncThunk('ConversationSlice/blockMember', async ({ conversationId, memberUserId }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/block/${memberUserId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
});

const createGroup = createAsyncThunk('ConversationSlice/createGroup', async (data, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        if (data.file) {
            formData.append("file", {
                uri: data.file.uri,
                name: data.file.name,
                type: data.file.type
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


const updateAllowUpdateProfileGroup = createAsyncThunk('ConversationSlice/updateAllowUpdateProfileGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-update-profile-group`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
})

const updateAllowPinMessageGroup = createAsyncThunk('ConversationSlice/updateAllowPinMessageGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-pin-message`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
})
const updateAllowSendMessageGroup = createAsyncThunk('ConversationSlice/updateAllowSendMessageGroup', async ({ conversationId, allow }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/api/conversation/${conversationId}/allow-send-message`, { allow: allow });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Lỗi khi gọi API");
    }
})
const removeAllHistoryMessages = createAsyncThunk(
    'ConversationSlice/removeAllHistoryMessages',
    async ({ conversationId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/conversation/${conversationId}/remove-all-history-messages`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi gọi API' });
        }
    }
);

const updateProfileGroup = createAsyncThunk('ConversationSlice/updateProfileGroup', async ({ conversationId, data, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        if (file) {
            console.log("file", file)
            formData.append("file", file);
        }

        for (const key in data) {
            const value = data[key];
            if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }
        console.log("formData", formData.get('file'))
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
})

const ConversationSlice = createSlice({
    name: 'ConversationSlice',
    initialState: initialState,
    reducers: {
        setConversation: (state, action) => {
            state.conversation = action.payload;
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
        updatePermissions: (state, action) => {
            const conversationId = action.payload.conversationId;
            const roles = action.payload.roles;
            console.log("roles", roles)
            console.log("state.conversation", conversationId)
            // Cập nhật conversation hiện tại đang chọn nếu có
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.roles = roles;
            }
            // Cập nhật danh sách conversations
            const conversation = state.conversations.find(conversation => conversation.id === conversationId);
            if (conversation) {
                conversation.roles = roles;
                const index = state.conversations.findIndex(convo => convo.id === conversationId);
                state.conversations[index].roles = roles;
            }
        },
        removeMemberGroup: (state, action) => {
            const conversationId = action.payload.conversationId;
            const memberUserId = action.payload.memberUserId;
            console.log("removeMemberGroup", state.conversations)
            // Xoas khoir nhoms
            // Xoa khoi nhom dang chon
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation.memberUserIds = state.conversation.memberUserIds.filter(id => id !== memberUserId);
                state.conversation.members = state.conversation.members.filter(member => member.id !== memberUserId);
            }
            // Xoa khoi nhoms dung index
            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].memberUserIds = state.conversations[conversationIndex].memberUserIds.filter(id => id !== memberUserId);
                state.conversations[conversationIndex].members = state.conversations[conversationIndex].members.filter(member => member.id !== memberUserId);
            }
        },
        handlerRemoveHistoryMessage: (state, action) => {
            const {conversation} = action.payload;
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
        removeConversation: (state, action) => {
            const conversationId = action.payload.conversationId;
            if (state.conversation && state.conversation.id === conversationId) {
                state.conversation = null;
            }
            const conversationIndex = state.conversations.findIndex(convo => convo.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations.splice(conversationIndex, 1);
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
                if (cons.pineds.length > 5) {
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

        builder.addCase(removeAllHistoryMessages.pending, (state) => {
            state.loading = true;
        });
        // add member to group
        builder.addCase(addMemberToGroup.pending, (state) => {
        });
        builder.addCase(addMemberToGroup.fulfilled, (state, action) => {
        });
        builder.addCase(addMemberToGroup.rejected, (state, action) => {
        });

        // create group
        builder.addCase(createGroup.pending, (state) => { });
        builder.addCase(createGroup.fulfilled, (state, action) => {
            state.conversations.unshift(action.payload.data); // Thêm nhóm mới vào đầu danh sách
        });
        builder.addCase(createGroup.rejected, (state, action) => {

        });
        builder.addCase(removeAllHistoryMessages.fulfilled, (state, action) => {
            
        });
        builder.addCase(removeAllHistoryMessages.rejected, (state, action) => {
        });

        builder.addCase(updateProfileGroup.pending, (state) => {
        });
        builder.addCase(updateProfileGroup.fulfilled, (state, action) => {
        });

        builder.addCase(updateProfileGroup.rejected, (state, action) => {
        });

        // add vice leader
        builder.addCase(addViceLeader.pending, (state) => {
        });
        builder.addCase(addViceLeader.fulfilled, (state, action) => {
        });
        builder.addCase(addViceLeader.rejected, (state, action) => {
        });

        // remove vice leader
        builder.addCase(removeViceLeader.pending, (state) => {
        });
        builder.addCase(removeViceLeader.fulfilled, (state, action) => {
        });
        builder.addCase(removeViceLeader.rejected, (state, action) => {
        });


        builder.addCase(updateAllowUpdateProfileGroup.fulfilled, (state) => {

        })
        builder.addCase(updateAllowUpdateProfileGroup.rejected, (state) => {

        })

        builder.addCase(updateAllowSendMessageGroup.fulfilled, (state) => {

        })
        builder.addCase(updateAllowSendMessageGroup.rejected, (state) => {

        })

        builder.addCase(updateAllowPinMessageGroup.fulfilled, (state) => {

        })

        builder.addCase(updateAllowPinMessageGroup.rejected, (state) => {

        })

        // remove member
        builder.addCase(removeMember.pending, (state) => {
        });
        builder.addCase(removeMember.fulfilled, (state, action) => {
        });
        builder.addCase(removeMember.rejected, (state, action) => {
        });


        // block member
        builder.addCase(blockMember.pending, (state) => {
        });
        builder.addCase(blockMember.fulfilled, (state, action) => {
        });
        builder.addCase(blockMember.rejected, (state, action) => {
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
    addMemberGroup,
    removeMemberGroup,
    handlerRemoveHistoryMessage
} = ConversationSlice.actions;

export { 
    getAllConversation, 
    getConversationById, 
    createPin, 
    removePin, 
    createGroup, 
    updateProfileGroup, 
    removeAllHistoryMessages, 
    updateAllowUpdateProfileGroup, 
    updateAllowSendMessageGroup, 
    updateAllowPinMessageGroup ,
    addMemberToGroup,
    removeMember,
    blockMember,
    removeViceLeader,
    addViceLeader,

};
export default ConversationSlice.reducer;