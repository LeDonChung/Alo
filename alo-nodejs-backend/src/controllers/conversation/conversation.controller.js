const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const conversationService = require('../../services/conversation.service');
const messageService = require('../../services/message.service');
const fileService = require('../../services/file.service');
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
                const lastMessage = await messageService.getLastMessageByConversationId(conversation.id);
                console.log("lastMessage: ", lastMessage)
                return {
                    ...conversation,
                    members,
                    pineds: pinedMessages,
                    lastMessage
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


exports.createGroupConversation = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        let { name, memberUserIds, avatar } = req.body;
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

        const data = {
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
                        blockMember: true
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
                        blockMember: true
                    }
                },
                {
                    userIds: [],
                    role: "member",
                    permissions: {
                        changeGroupInfo: true,
                        pinMessages: true,
                        sendMessage: true,
                        removeMember: false,
                        blockMember: false
                    }
                }
            ]
        };

        if (req.file) {
            const file = req.file;
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
