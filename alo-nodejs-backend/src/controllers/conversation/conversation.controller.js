const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const conversationService = require('../../services/conversation.service');
const messageService = require('../../services/message.service');
const fileService = require('../../services/file.service');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
exports.getConversationByToken = async (req, res) => {
    try {
        const token = req.params.token;
        const conversation = await conversationService.getConversationByToken(token);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        return res.json({
            status: 200,
            data: conversation,
            message: "Lấy thông tin cuộc trò chuyện thành công."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
}
exports.updateCreateAt = async (req, res) => {
    try {

        const conversations = await conversationService.getAllConversations();
        conversations.filter(c => !c.isGroup).forEach(async conv => {
            await conversationService.updateCreateAt(conv.id);
        });

        return res.json({
            status: 200,
            message: "Cập nhật thời gian tạo cuộc trò chuyện thành công.",
            data: null
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
}
exports.getConversationsByUserId = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const conversations = await conversationService.getConversationsByUserId(userId);

        const userCache = new Map();

        const updatedConversations = await Promise.all(
            conversations.map(async (conversation) => {
                // Lấy thông tin người dùng
                const memberUserIds = conversation.memberUserIds;

                const members = [];
                for (const memberUserId of memberUserIds) {
                    let memberUser;

                    if (userCache.has(memberUserId)) {
                        memberUser = userCache.get(memberUserId);
                    } else {
                        memberUser = await userService.getUserById(memberUserId);
                        userCache.set(memberUserId, memberUser);
                    }

                    members.push(memberUser);
                }

                // Lấy message của pined
                const pineds = conversation.pineds || [];
                // Sắp xếp ghim giảm dần theo thời gian
                pineds.sort((a, b) => b.timestamp - a.timestamp);
                const pinedMessages = [];
                for (const pined of pineds) {
                    const message = await messageService.getMessageById(pined.messageId);
                    if (message) {
                        pinedMessages.push({ ...pined, message });
                    }
                }

                // Lấy message cuối cùng trong cuộc trò chuyện
                let lastMessage = await messageService.getLastMessageByConversationId(conversation.id);
                if (lastMessage) {
                    lastMessage.sender = await userService.getUserById(lastMessage.senderId);
                }
                console.log("lastMessage: ", lastMessage)

                // Lấy thông tin user bị chặn
                const blockedUserIds = conversation.blockedUserIds || [];
                const blockedUsers = [];
                for (const blockedUserId of blockedUserIds) {
                    let blockedUser;
                    if (userCache.has(blockedUserId)) {
                        blockedUser = userCache.get(blockedUserId);
                    } else {
                        blockedUser = await userService.getUserById(blockedUserId);
                        userCache.set(blockedUserId, blockedUser);
                    }
                    blockedUsers.push(blockedUser);
                }


                return {
                    ...conversation,
                    members,
                    pineds: pinedMessages,
                    lastMessage,
                    blocks: blockedUsers,
                };
            })
        );

        return res.json({
            status: 200,
            data: updatedConversations,
            message: "Lấy danh sách cuộc trò chuyện thành công."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

exports.getConversationById = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        const userCache = new Map();
        const members = [];

        for (const memberUserId of conversation.memberUserIds) {
            let memberUser;
            if (userCache.has(memberUserId)) {
                memberUser = userCache.get(memberUserId);
            } else {
                memberUser = await userService.getUserById(memberUserId);
                userCache.set(memberUserId, memberUser);
            }
            members.push(memberUser);
        }

        // Lấy message cuối cùng
        const lastMessage = await messageService.getLastMessageByConversationId(conversation.id);

        return res.json({
            status: 200,
            data: {
                ...conversation,
                members,
                lastMessage
            },
            message: "Lấy thông tin cuộc trò chuyện thành công."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};


exports.createPin = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, messageId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        console.log(
            "conversation: ", conversation,
            "messageId: ", messageId,
            "userId: ", userId,
            "conversationId: ", conversationId,
        )
        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra ghim tồn tại
        const pineds = conversation.pineds || [];
        const index = pineds.findIndex((pined) => pined.messageId === messageId);
        if (index !== -1) {
            return res.status(400).json({
                status: 400,
                message: "Tin nhắn đã tồn tại trong danh sách ghim.",
                data: null
            });
        }

        // Kiểm tra tin nhắn có tồn tại không
        const message = await messageService.getMessageById(messageId);
        if (!message) {
            return res.status(404).json({
                status: 404,
                message: "Tin nhắn không tồn tại.",
                data: null
            });
        }

        // Sắp xếp ghim giảm dần theo thời gian
        pineds.sort((a, b) => b.timestamp - a.timestamp);
        // Nếu chưa ghim thì thêm vào danh sách ghim và tối đa là 5 ghim, xóa ghim cũ nhất
        if (pineds.length >= 5) {
            // Xóa ghim cũ nhất
            pineds.pop();
        }

        const pin = {
            messageId: messageId,
            userId: userId,
            timestamp: Date.now()
        }
        pineds.unshift(pin); // Thêm ghim mới

        // Cập nhật ghim
        const data = await conversationService.updatePineds(conversationId, pineds);
        console.log("GHIM: ", data)
        pin.message = message;
        return res.json({
            status: 200,
            message: "Ghim cuộc trò chuyện thành công.",
            data: pin
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
}

exports.deletePin = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, messageId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra ghim tồn tại
        const pineds = conversation.pineds || [];
        const index = pineds.findIndex((pined) => pined.messageId === messageId);
        if (index === -1) {
            return res.status(400).json({
                status: 400,
                message: "Tin nhắn không tồn tại trong danh sách ghim.",
                data: null
            });
        }

        pin = pineds[index];

        pineds.splice(index, 1);

        // Cập nhật ghim
        const data = await conversationService.updatePineds(conversationId, pineds);


        return res.json({
            status: 200,
            message: "Xóa ghim cuộc trò chuyện thành công.",
            data: pin
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
}


function generateRandomCode(length = 9) {
    const uuid = uuidv4().replace(/-/g, ''); // xóa dấu -
    return uuid.substring(0, length);
}


// CREATE GROUP CONVERSATION
exports.createGroupConversation = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        let { name, memberUserIds, avatar } = req.body;
        console.log("memberUserIds: ", memberUserIds)
        if (typeof memberUserIds === 'string') {
            memberUserIds = JSON.parse(memberUserIds);
        }
        if (!name || !memberUserIds) {
            return res.status(400).json({
                status: 400,
                message: "Tên cuộc trò chuyện và danh sách thành viên không được để trống.",
                data: null
            });
        }

        // Kiểm tra memberUserIds ít nhất 3 người
        if (memberUserIds.length < 2) {
            return res.status(400).json({
                status: 400,
                message: "Danh sách thành viên phải có ít nhất 2 người.",
                data: null
            });
        }

        // Generate random code
        let code = null;
        // Kiểm tra code tồn tại
        do {
            code = generateRandomCode(9);
            const existingConversation = await conversationService.getConversationByToken(code);
            if (!existingConversation) {
                break;
            }
        } while (true);

        const data = {
            token: code,
            name,
            memberUserIds,
            isGroup: true,
            createdBy: userId,
            createdAt: Date.now(),
            blockedUserIds: [],
            roles: [
                {
                    userIds: [userId],
                    role: "leader",
                    permissions: {
                        changeGroupInfo: true,
                        pinMessages: true,
                        sendMessage: true,
                        removeMember: true,
                        blockMember: true,
                        addMember: true,
                        joinGroupByLink: true
                    }
                },
                {
                    userIds: [],
                    role: "vice_leader",
                    permissions: {
                        changeGroupInfo: true,
                        pinMessages: true,
                        sendMessage: true,
                        removeMember: true,
                        blockMember: true,
                        addMember: true,
                        joinGroupByLink: true
                    }
                },
                {
                    userIds: [
                        ...memberUserIds.filter((memberUserId) => memberUserId !== userId)
                    ],
                    role: "member",
                    permissions: {
                        changeGroupInfo: false,
                        pinMessages: true,
                        sendMessage: true,
                        removeMember: false,
                        blockMember: false,
                        addMember: true,
                        joinGroupByLink: true
                    }
                }
            ]
        };

        if (req.file) {
            const file = req.file;
            console.log("file: ", file)
            data.avatar = await fileService.uploadFile(file);
        } else {
            data.avatar = avatar;
        }

        const conversation = await conversationService.createGroupConversation(data);

        // Lấy thông tin chi tiết các thành viên
        const userCache = new Map();
        const members = [];
        for (const memberUserId of conversation.memberUserIds) {
            let memberUser;
            if (userCache.has(memberUserId)) {
                memberUser = userCache.get(memberUserId);
            } else {
                memberUser = await userService.getUserById(memberUserId);
                userCache.set(memberUserId, memberUser);
            }
            members.push(memberUser);
        }

        return res.json({
            status: 200,
            message: "Tạo cuộc trò chuyện thành công.",
            data: {
                ...conversation,
                members
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

// UPDATE GROUP CONVERSATION
exports.updateProfileGroup = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const { conversationId } = req.params;
        let { name, avatar } = req.body;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền sửa thông tin nhóm
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || !role.permissions?.changeGroupInfo) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền sửa thông tin nhóm.",
                data: null
            });
        }

        if (!name) {
            return res.status(400).json({
                status: 400,
                message: "Tên cuộc trò chuyện không được để trống.",
                data: null
            });
        }

        let newAvatar = conversation.avatar;
        if (req.file) {
            const file = req.file;
            newAvatar = await fileService.uploadFile(file);
        } else {
            if (avatar) {
                newAvatar = avatar;
            } else {
                newAvatar = conversation.avatar;
            }
        }

        const data = { name, avatar: newAvatar };

        await conversationService.updateProfileGroup(conversationId, data);

        return res.json({
            status: 200,
            message: "Cập nhật thông tin cuộc trò chuyện thành công.",
            data: {
                ...conversation,
                name: data.name,
                avatar: data.avatar
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

// ADD MEMBER
exports.addMember = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const { conversationId } = req.params;
        let { memberUserIds } = req.body;

        if (typeof memberUserIds === 'string') {
            memberUserIds = JSON.parse(memberUserIds);
        }

        if (!memberUserIds) {
            return res.status(400).json({
                status: 400,
                message: "Danh sách thành viên không được để trống.",
                data: null
            });
        }

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền thêm thành viên
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || !role.permissions?.addMember) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thêm thành viên.",
                data: null
            });
        }

        // Kiểm tra xem người dùng đã là thành viên chưa
        let newMemberUserIds = memberUserIds.filter(memberUserId => !conversation.memberUserIds.includes(memberUserId));

        if (newMemberUserIds.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Các thành viên đã tồn tại trong cuộc trò chuyện.",
                data: null
            });
        }
        const memberRole = conversation.roles.find(role => role.role === "member");

        if (memberRole) {
            memberRole.userIds.push(...newMemberUserIds);
        }

        conversation.roles = conversation.roles.map(role => {
            if (role.role === "member") {
                return {
                    ...role,
                    userIds: [...new Set(role.userIds)]
                };
            }
            return role;
        });

        // Cập nhật cuộc trò chuyện
        const data = await conversationService.addNewMember(conversationId, {
            memberUserIds: newMemberUserIds,
            roles: conversation.roles
        });

        return res.json({
            status: 200,
            message: "Thêm thành viên vào cuộc trò chuyện thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
exports.removeMember = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, memberUserId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Tìm role của người gọi
        const userRole = conversation.roles.find(role => role.userIds.includes(userId));

        if (!userRole || !userRole.permissions?.removeMember) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền xóa thành viên.",
                data: null
            });
        }

        // Không cho xoá chính mình nếu muốn
        if (memberUserId === userId) {
            return res.status(400).json({
                status: 400,
                message: "Không thể tự xóa chính mình khỏi cuộc trò chuyện.",
                data: null
            });
        }

        // Kiểm tra thành viên tồn tại
        if (!conversation.memberUserIds.includes(memberUserId)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không phải là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        // Tìm role của người bị xóa
        const targetRole = conversation.roles.find(role => role.userIds.includes(memberUserId));

        // Logic phân quyền xoá
        if (userRole.role === "vice_leader" && targetRole?.role !== "member") {
            return res.status(404).json({
                status: 404,
                message: "Bạn chỉ có quyền xóa thành viên có vai trò là member.",
                data: null
            });
        }

        // Cập nhật danh sách thành viên và vai trò
        const updatedMemberUserIds = conversation.memberUserIds.filter(id => id !== memberUserId);
        const updatedRoles = conversation.roles.map(role => {
            return {
                ...role,
                userIds: role.userIds.filter(id => id !== memberUserId)
            };
        });

        const data = await conversationService.removeMember(conversationId, {
            memberUserIds: updatedMemberUserIds,
            roles: updatedRoles
        });

        return res.json({
            status: 200,
            message: "Xóa thành viên khỏi cuộc trò chuyện thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};


// ADD VICE LEADER
exports.addViceLeader = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, memberUserId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader được thêm vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || role.role !== 'leader') {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thêm phó nhóm.",
                data: null
            });
        }

        // Kiểm tra xem người dùng có trong nhóm không
        if (!conversation.memberUserIds.includes(memberUserId)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không phải là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        // Cập nhật vai trò
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'vice_leader') {
                return {
                    ...role,
                    userIds: [...new Set([...role.userIds, memberUserId])]
                };
            } else if (role.role === 'member') {
                return {
                    ...role,
                    userIds: role.userIds.filter(id => id !== memberUserId)
                };
            }
            return role;
        });

        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Thêm phó nhóm thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// REMOVE VICE LEADER
exports.removeViceLeader = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, memberUserId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader được xóa vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || role.role !== 'leader') {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền xóa phó nhóm.",
                data: null
            });
        }

        // Kiểm tra xem người dùng có phải vice leader không
        const viceLeaderRole = conversation.roles.find(role => role.role === 'vice_leader');
        if (!viceLeaderRole || !viceLeaderRole.userIds.includes(memberUserId)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không phải là phó nhóm.",
                data: null
            });
        }

        // Cập nhật vai trò
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'vice_leader') {
                return {
                    ...role,
                    userIds: role.userIds.filter(id => id !== memberUserId)
                };
            } else if (role.role === 'member') {
                return {
                    ...role,
                    userIds: [...new Set([...role.userIds, memberUserId])]
                };
            }
            return role;
        });

        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Xóa phó nhóm thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// CHANGE LEADER
exports.changeLeader = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, newLeaderId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hiện tại được chuyển giao)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || role.role !== 'leader') {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền chuyển giao trưởng nhóm.",
                data: null
            });
        }

        // Kiểm tra xem người dùng mới có trong nhóm không
        if (!conversation.memberUserIds.includes(newLeaderId)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không phải là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        // Cập nhật vai trò
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'leader') {
                return {
                    ...role,
                    userIds: [newLeaderId]
                };
            } else if (role.role === 'member') {
                return {
                    ...role,
                    userIds: [...new Set([...role.userIds.filter(id => id !== newLeaderId), userId])]
                };
            } else if (role.role === 'vice_leader') {
                return {
                    ...role,
                    userIds: role.userIds.filter(id => id !== newLeaderId)
                };
            }
            return role;
        });

        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Chuyển giao trưởng nhóm thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// UNBLOCK MEMBER
exports.unblockMember = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, memberUserId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền chặn thành viên
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || !role.permissions?.blockMember) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền bỏ chặn thành viên.",
                data: null
            });
        }

        // Kiểm tra xem người dùng có bị chặn không
        if (!conversation.blockedUserIds.includes(memberUserId)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không bị chặn.",
                data: null
            });
        }

        // Cập nhật danh sách chặn
        const updatedBlockedUserIds = conversation.blockedUserIds.filter(id => id !== memberUserId);

        const data = await conversationService.updateBlockedUserIds(conversationId, updatedBlockedUserIds);

        return res.json({
            status: 200,
            message: "Bỏ chặn thành viên thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// BLOCK MEMBER
exports.blockMember = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, blockMember } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền chặn thành viên
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || !role.permissions?.blockMember) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền chặn thành viên.",
                data: null
            });
        }

        // Kiểm tra xem người dùng có trong nhóm không
        if (!conversation.memberUserIds.includes(blockMember)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng không phải là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        // Kiểm tra xem người dùng đã bị chặn chưa
        if (conversation.blockedUserIds.includes(blockMember)) {
            return res.status(400).json({
                status: 400,
                message: "Người dùng đã bị chặn trước đó.",
                data: null
            });
        }

        // Cập nhật danh sách chặn
        const updatedBlockedUserIds = [...new Set([...conversation.blockedUserIds, blockMember])];

        const data = await conversationService.updateBlockedUserIds(conversationId, updatedBlockedUserIds);

        return res.json({
            status: 200,
            message: "Chặn thành viên thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// UPDATE ALLOW UPDATE GROUP INFO FOR MEMBER
exports.updateAllowUpdateGroupInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, } = req.params;
        const { allow } = req.body;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader' && role.role !== 'vice_leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thay đổi quyền cập nhật thông tin nhóm.",
                data: null
            });
        }

        // Cập nhật quyền
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'member') {
                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        changeGroupInfo: allow
                    }
                };
            }
            return role;
        });

        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Cập nhật quyền cập nhật thông tin nhóm thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// UPDATE ALLOW PIN MESSAGE FOR MEMBER FOR MEMBER
exports.updateAllowPinMessage = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, } = req.params;
        const { allow } = req.body;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader' && role.role !== 'vice_leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thay đổi quyền ghim tin nhắn.",
                data: null
            });
        }

        // Cập nhật quyền
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'member') {
                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        pinMessages: allow
                    }
                };
            }
            return role;
        });

        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Cập nhật quyền ghim tin nhắn thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// UPDATE ALLOW SEND MESSAGE FOR MEMBER
exports.updateAllowSendMessage = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, } = req.params;
        const { allow } = req.body;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader' && role.role !== 'vice_leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thay đổi quyền gửi tin nhắn.",
                data: null
            });
        }

        // Cập nhật quyền
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'member') {
                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        sendMessage: allow
                    }
                };
            }
            return role;
        });

        console.log(
            "conversation.roles: ", conversation.roles,
            "allow: ", allow
        )
        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Cập nhật quyền gửi tin nhắn thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// UPDATE ALLOW JOIN GROUP BY LINK FOR MEMBER
exports.updateAllowJoinGroupByLink = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId, } = req.params;
        const { allow } = req.body;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader' && role.role !== 'vice_leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thay đổi quyền gửi tin nhắn.",
                data: null
            });
        }

        // Cập nhật quyền
        conversation.roles = conversation.roles.map(role => {
            if (role.role === 'member') {
                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        joinGroupByLink: allow
                    }
                };
            }
            return role;
        });

        console.log(
            "conversation.roles: ", conversation.roles,
            "allow: ", allow
        )
        const data = await conversationService.updateRoles(conversationId, conversation.roles);

        return res.json({
            status: 200,
            message: "Cập nhật quyền gửi tin nhắn thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// REMOVE ALL HISTORY MESSAGES
exports.removeAllHistoryMessages = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền xóa lịch sử trò chuyện.",
                data: null
            });
        }

        // Xóa tất cả tin nhắn trong cuộc trò chuyện
        const data = await conversationService.updateAllMessagesStatusByConversationId(conversationId);

        return res.json({
            status: 200,
            message: "Xóa lịch sử trò chuyện thành công.",
            data: data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
// LEAVE GROUP
exports.leaveGroup = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId } = req.params;
        console.log("conversationId: ", conversationId);


        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }
        if (!conversation.memberUserIds || !conversation.memberUserIds.includes(userId)) {
            return res.status(400).json({
                status: 400,
                message: "Bạn không phải là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        const roleLeader = conversation.roles.find(role => role.role === 'leader').userIds;

        if (roleLeader && roleLeader.includes(userId)) {
            return res.status(400).json({
                status: 400,
                message: "Bạn không thể rời nhóm khi đang là trưởng nhóm.",
                data: null
            });
        }

        const updatedConversation = await conversationService.leaveGroup(conversationId, userId);

        return res.json({
            status: 200,
            message: "Rời nhóm thành công.",
            data: updatedConversation
        });

    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: err.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

// DISBAND GROUP CONVERSATION
exports.disbandGroup = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        const { conversationId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                status: 400,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        if (!conversation.isGroup) {
            return res.status(400).json({
                status: 400,
                message: "Chỉ có thể giải tán các cuộc trò chuyện nhóm.",
                data: null
            });
        }

        const leaderRole = conversation.roles.find(role => role.role === 'leader');
        if (!leaderRole || !leaderRole.userIds.includes(userId)) {
            return res.status(403).json({
                status: 400,
                message: "Bạn không có quyền giải tán nhóm. Chỉ trưởng nhóm có thể thực hiện hành động này.",
                data: null
            });
        }

        const updatedData = {
            memberUserIds: [],
            roles: conversation.roles.map(role => ({
                ...role,
                userIds: []
            }))
        };

        const updatedConversation = await conversationService.disbandGroup(conversationId, updatedData);

        return res.json({
            status: 200,
            message: "Giải tán nhóm thành công.",
            data: updatedConversation
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

// JOIN GROUP BY Link: join-by-link/:conversationId
exports.joinGroupByLink = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const { conversationId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Check if the user is allowed to join via link
        let memberRole = conversation.roles.find(role => role.role === 'member');
        if (memberRole && !memberRole.permissions?.joinGroupByLink) {
            return res.status(404).json({
                status: 404,
                message: "Hiện tại cuộc trò chuyện không cho phép tham gia bằng link nhóm.",
                data: null
            });
        }

        const memberUserIds = [userId];
        const newMemberUserIds = memberUserIds.filter(memberUserId => !conversation.memberUserIds.includes(memberUserId));

        if (newMemberUserIds.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Bạn đã là thành viên của cuộc trò chuyện.",
                data: null
            });
        }

        // Add the user to the member role
        memberRole = conversation.roles.find(role => role.role === "member");
        if (memberRole) {
            memberRole.userIds.push(...newMemberUserIds);
        }

        // Update roles to ensure unique user IDs
        conversation.roles = conversation.roles.map(role => {
            if (role.role === "member") {
                return {
                    ...role,
                    userIds: [...new Set(role.userIds)]
                };
            }
            return role;
        });

        // Reuse the service to update the conversation
        const data = await conversationService.addNewMember(conversationId, {
            memberUserIds: newMemberUserIds,
            roles: conversation.roles
        });

        const userCache = new Map();
        const members = [];

        for (const memberUserId of data.memberUserIds) {
            let memberUser;
            if (userCache.has(memberUserId)) {
                memberUser = userCache.get(memberUserId);
            } else {
                memberUser = await userService.getUserById(memberUserId);
                userCache.set(memberUserId, memberUser);
            }
            members.push(memberUser);
        }

        // Lấy message cuối cùng
        const lastMessage = await messageService.getLastMessageByConversationId(conversation.id);

        return res.json({
            status: 200,
            message: "Bạn đã tham gia vào cuộc trò chuyện thành công.",
            data: {
                ...data,
                members: members,
                lastMessage: lastMessage,
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};

exports.changeToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const { conversationId } = req.params;

        const conversation = await conversationService.getConversationById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc vice leader)
        const role = conversation.roles.find(role => role.userIds.includes(userId));
        if (!role || (role.role !== 'leader' && role.role !== 'vice_leader')) {
            return res.status(404).json({
                status: 404,
                message: "Bạn không có quyền thay đổi quyền cập nhật thông tin nhóm.",
                data: null
            });
        }

        let code = null;
        // Kiểm tra code tồn tại
        do {
            code = generateRandomCode(9);
            const existingConversation = await conversationService.getConversationByToken(code);
            if (!existingConversation) {
                break;
            }
        } while (true);

        const updatedConversation = await conversationService.updateTokenGroup(conversationId, code);

        return res.json({
            status: 200,
            message: "Cập nhật token thành công.",
            data: updatedConversation
        });
    } catch (err) {
        console.error(err);
    }
}

exports.getTokenGroup = async (req, res) => {
    return res.json({
        status: 200,
        message: "Token.",
        data: process.env.VIDEOSDK_TOKEN
    });
}
exports.createMeeting = async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.VIDEO_SDK_API_BASE_URL}/rooms`,
            {},
            {
                headers: {
                    Authorization: req.body.token,
                    "Content-Type": "application/json",
                },
            }
        );
        const { roomId } = response.data;
        return res.json({
            status: 200,
            message: "Room ID.",
            data: roomId
        });
    } catch (error) {
        console.log("Error creating meeting:", error);
        res.status(500).json({ error: "Failed to create meeting" });
    }
}