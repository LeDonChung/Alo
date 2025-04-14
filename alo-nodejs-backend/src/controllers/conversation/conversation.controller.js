const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const conversationService = require('../../services/conversation.service');


exports.getConversationsByUserId = async (req, res) => {
    try {
        // Lấy Authorization từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // Lấy userId từ token
        const userId = userService.getUserIdFromToken(token);

        const conversations = await conversationService.getConversationsByUserId(userId);

        return res.json({
            status: 200,
            data: conversations,
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

exports.createConversation = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        const { name, members, memberUserIds, createdBy, isGroup, isCalling } = req.body;

        if (!name || !members || !memberUserIds || !createdBy || typeof isGroup === 'undefined') {
            return res.status(400).json({
                status: 400,
                message: "Thông tin nhóm không hợp lệ.",
                data: null
            });
        }

        if (userId !== createdBy) {
            return res.status(403).json({
                status: 403,
                message: "Bạn không có quyền tạo nhóm này.",
                data: null
            });
        }

        const conversationData = {
            name,
            members,
            memberUserIds,
            createdBy,
            isGroup,
            isCalling
        };

        const conversation = await conversationService.createConversation(conversationData);

        return res.json({
            status: 200,
            data: conversation,
            message: "Tạo nhóm thành công."
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


