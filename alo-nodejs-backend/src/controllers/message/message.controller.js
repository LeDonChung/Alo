const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const messageService = require('../../services/message.service');
const conversationService = require('../../services/conversation.service');
const { v4: uuidv4 } = require('uuid');


exports.createMessage = async (req, res) => {
    try {
        // Kiểm tra conversationId có tồn tại không
        const conversation = await conversationService.getConversationById(req.body.conversationId);
        if (!conversation) {
            return res.status(400).json({
                status: 400,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        if (req.body.messageType === 'text') {
            const request = {
                id: uuidv4(),
                senderId: req.body.senderId,
                conversationId: req.body.conversationId,
                content: req.body.content,
                messageType: req.body.messageType,
                timestamp: Date.now(),
                seen: []
            }

            // Tạo tin nhắn
            const message = await messageService.createMessage(request);

            if (!message) {
                return res.status(400).json({
                    status: 400,
                    message: "Tạo tin nhắn không thành công.",
                    data: null
                });
            }

            // Lưu tin nhắn cuối cùng vào conversation
            await conversationService.updateLastMessage(conversation.id, message);

            return res.json({
                status: 200,
                data: message,
                message: "Tạo tin nhắn thành công."
            });
        } else if (req.body.messageType === 'sticker') {
            const request = {
                id: uuidv4(),
                senderId: req.body.senderId,
                conversationId: req.body.conversationId,
                content: req.body.content,
                messageType: req.body.messageType,
                fileLink: req.body.fileLink,
                timestamp: Date.now(),
                seen: []
            }

            // Tạo tin nhắn
            const message = await messageService.createMessage(request);

            if (!message) {
                return res.status(400).json({
                    status: 400, 
                    message: "Tạo tin nhắn không thành công.",
                    data: null
                });
            }

            // Lưu tin nhắn cuối cùng vào conversation
            await conversationService.updateLastMessage(conversation.id, message);

            return res.json({
                status: 200,
                data: message,
                message: "Tạo tin nhắn thành công."
            });
        } else {
            return res.json({
                status: 200,
                data: null,
                message: "Tạo tin nhắn thành công."
            });
        }



    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
exports.getMessagesByConversationId = async (req, res) => {
    try {

        const conversationId = req.params.conversationId;

        const messages = await messageService.getMessagesByConversationId(conversationId);

        let senders = {};
        for (let i = 0; i < messages.length; i++) {
            const senderId = messages[i].senderId;

            if (!senders[senderId]) {
                const sender = await userService.getUserById(senderId);
                senders[senderId] = sender;
            }

            messages[i].sender = senders[senderId];
        }
        return res.json({
            status: 200,
            data: messages,
            message: "Lấy tin nhắn thành công."
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
