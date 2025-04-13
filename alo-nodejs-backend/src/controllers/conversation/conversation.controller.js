const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const conversationService = require('../../services/conversation.service');


exports.getConversationsByUserId = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const conversations = await conversationService.getConversationsByUserId(userId);

        const userCache = new Map();

        const updatedConversations = await Promise.all(
            conversations.map(async (conversation) => {
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

                return {
                    ...conversation,
                    members
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


