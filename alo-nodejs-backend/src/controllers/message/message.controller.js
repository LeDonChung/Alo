const friendService = require('../../services/friend.service');
const userService = require('../../services/user.service');
const messageService = require('../../services/message.service');
const conversationService = require('../../services/conversation.service');
const { v4: uuidv4 } = require('uuid');
const fileService = require('../../services/file.service');


exports.createMessage = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { senderId, conversationId, content, messageType, fileLink, requestId } = req.body;

        // Kiểm tra conversation có tồn tại
        const conversation = await conversationService.getConversationById(conversationId);
        if (!conversation) {
            return res.status(400).json({
                status: 400,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        // Khởi tạo request
        const request = {
            id: uuidv4(),
            senderId,
            conversationId,
            content,
            messageType,
            timestamp: Date.now(),
            seen: [{
                userId: senderId,
                timestamp: Date.now()
            }],
            status: 0
        };

        if ((messageType === 'image' && fileLink) || messageType === 'sticker') {
            request.fileLink = fileLink;
        }

        if ((!fileLink || fileLink === '') && ['image', 'file'].includes(messageType)) {
            request.fileLink = await fileService.uploadFile(req.file);
        }

        const allowedTypes = ['text', 'sticker', 'image', 'file'];
        if (!allowedTypes.includes(messageType)) {
            return res.status(400).json({
                status: 400,
                message: "Loại tin nhắn không hợp lệ.",
                data: null
            });
        }

        if (req.body.messageParent) {
            // Kiểm tra messageParent có tồn tại
            const messageParentExists = await messageService.getMessageById(req.body.messageParent);
            if (!messageParentExists) {
                return res.status(400).json({
                    status: 400,
                    message: "Tin nhắn rep không tồn tại.",
                    data: null
                });
            }

            const sender = await userService.getUserById(messageParentExists.senderId);
            if (!sender) {
                return res.status(400).json({
                    status: 400,
                    message: "Người gửi không tồn tại.",
                    data: null
                });
            }
            messageParentExists.sender = sender;
            request.messageParent = messageParentExists;
        }
        console.log('Request:', request);
        // Tạo tin nhắn
        const message = await messageService.createMessage(request);
        if (!message) {
            return res.status(400).json({
                status: 400,
                message: "Tạo tin nhắn không thành công.",
                data: null
            });
        }

        // Tìm người gửi
        const sender = await userService.getUserById(senderId);
        message.sender = sender;
        // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
        await conversationService.updateLastMessage(conversation.id, message);

        message.requestId = requestId;
        console.log('Tin nhắn đã được tạo:', message);
        return res.status(200).json({
            status: 200,
            data: message,
            message: "Tạo tin nhắn thành công."
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

exports.getMessagesByConversationId = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await messageService.getMessagesByConversationId(conversationId);
        let senders = {};

        const senderPromises = messages.map(async (message) => {
            const senderId = message.senderId;

            if (!senders[senderId]) {
                try {
                    const sender = await userService.getUserById(senderId);
                    if (!sender) {
                        senders[senderId] = {};
                    } else {
                        senders[senderId] = sender;
                    }
                } catch (err) {
                    senders[senderId] = {}
                }
            }

            message.sender = senders[senderId];
        });

        await Promise.all(senderPromises);

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


// cập nhật trạng thái tin nhắn
exports.updateMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.query;


        // Tìm tin nhắn theo id
        const message = await messageService.getMessageById(messageId);

        // Cập nhật trạng thái tin nhắn
        await messageService.updateMessageStatus(messageId, message.timestamp, Number(status));
        message.status = Number(status);


        // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
        const conversation = await conversationService.getConversationById(message.conversationId);
        if (!conversation) {
            return res.status(404).json({
                status: 404,
                message: "Cuộc trò chuyện không tồn tại.",
                data: null
            });
        }

        console.log('Message:', message);

        await conversationService.updateLastMessage(conversation.id, message);
        return res.status(200).json({
            status: 200,
            data: message,
            message: "Cập nhật trạng thái tin nhắn thành công."
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
// cập nhật reaction
exports.updateMessageReaction = async (req, res) => {
    try {
        const { type } = req.body;
        const { messageId } = req.params;

        // Lấy Authorization từ header
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                status: 401,
                message: "Thiếu token xác thực.",
                data: null
            });
        }

        const token = authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({
                status: 401,
                message: "Token không hợp lệ.",
                data: null
            });
        }

        const message = await messageService.getMessageById(messageId);
        if (!message) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy tin nhắn.",
                data: null
            });
        }

        const reaction = message.reaction || {};

        if (reaction[type]) {
            const index = reaction[type].users.indexOf(userId);
            if (index > -1) {
                // Nếu đã có reaction thì xóa
                reaction[type].users.splice(index, 1);
                reaction[type].quantity--;
                // Nếu hết người dùng thì xóa luôn reaction type
                if (reaction[type].quantity === 0) {
                    delete reaction[type];
                }
            } else {
                // Nếu chưa có reaction thì thêm
                reaction[type].users.push(userId);
                reaction[type].quantity++;
            }
        } else {
            // Nếu chưa có reaction thì thêm mới
            reaction[type] = {
                quantity: 1,
                users: [userId]
            };
        }

        console.log('Reaction cập nhật:', reaction);

        // Cập nhật reaction trong DB
        await messageService.updateMessageReaction(messageId, message.timestamp, reaction);

        // Trả về kết quả
        message.reaction = reaction;
        return res.status(200).json({
            status: 200,
            data: message,
            message: "Cập nhật reaction tin nhắn thành công."
        });

    } catch (err) {
        console.error('Lỗi cập nhật reaction:', err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
};
exports.removeAllReaction = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Lấy Authorization từ header
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                status: 401,
                message: "Thiếu token xác thực.",
                data: null
            });
        }

        const token = authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({
                status: 401,
                message: "Token không hợp lệ.",
                data: null
            });
        }

        const message = await messageService.getMessageById(messageId);
        if (!message) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy tin nhắn.",
                data: null
            });
        }

        const reaction = message.reaction || {};

        // Xóa tất cả reaction của người dùng
        for (const type in reaction) {
            const index = reaction[type].users.indexOf(userId);
            if (index > -1) {
                reaction[type].users.splice(index, 1);
                reaction[type].quantity--;
                // Nếu hết người dùng thì xóa luôn reaction type
                if (reaction[type].quantity === 0) {
                    delete reaction[type];
                }
            }
        }

        console.log('Reaction cập nhật:', reaction);

        // Cập nhật reaction trong DB
        await messageService.updateMessageReaction(messageId, message.timestamp, reaction);

        // Trả về kết quả
        message.reaction = reaction;
        return res.status(200).json({
            status: 200,
            data: message,
            message: "Xóa tất cả reaction tin nhắn thành công."
        });

    } catch (err) {
        console.error('Lỗi cập nhật reaction:', err);
        return res.status(500).json({
            status: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
            data: null
        });
    }
}

// Cập nhật người đã xem tin nhắn
exports.updateSeenMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Lấy Authorization từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // Lấy userId từ token
        const userId = userService.getUserIdFromToken(token);


        // Kiểm tra xem người dùng đã xem tin nhắn chưa
        const message = await messageService.getMessageById(messageId);
        if (!message) {
            return res.status(400).json({
                status: 400,
                message: "Tin nhắn không tồn tại.",
                data: null
            });
        }

        const seen = message.seen || [];

        // Kiểm tra xem userId đã có trong danh sách đã xem chưa
        const index = seen.findIndex((seen) => seen.userId === userId);
        if (index !== -1) {
            return res.status(200).json({
                status: 200,
                message: "Người dùng đã xem tin nhắn.",
                data: message
            });
        }

        // Nếu chưa xem thì thêm vào danh sách đã xem
        seen.push({
            userId: userId,
            timestamp: Date.now()
        });

        // Cập nhật người đã xem tin nhắn
        await messageService.updateSeenMessage(messageId, message.timestamp, seen);


        // Cập nhật lại tin nhắn
        message.seen = seen;

        return res.status(200).json({
            status: 200,
            data: message,
            message: "Cập nhật người đã xem tin nhắn thành công."
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

// Chuyển tiếp tin nhắn
exports.forwardMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { conversationIds } = req.body; // Lấy danh sách các conversationId từ body
        if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Danh sách cuộc trò chuyện không hợp lệ.",
                data: null
            });
        }

        // Lấy Authorization từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // Lấy userId từ token
        const userId = userService.getUserIdFromToken(token);

        // Lấy thông tin tin nhắn gốc
        const originalMessage = await messageService.getMessageById(messageId);
        if (!originalMessage) {
            return res.status(400).json({
                status: 400,
                message: "Tin nhắn không tồn tại.",
                data: null
            });
        }

        // Lặp qua các cuộc trò chuyện và chuyển tiếp tin nhắn
        const newMessages = [];
        for (const conversationId of conversationIds) {
            // Kiểm tra xem cuộc trò chuyện có tồn tại không
            const conversation = await conversationService.getConversationById(conversationId);
            if (!conversation) {
                continue; // Nếu cuộc trò chuyện không tồn tại, bỏ qua
            }

            // Tạo một tin nhắn mới với thông tin của tin nhắn gốc
            const forwardedMessage = {
                id: uuidv4(),
                senderId: userId,
                conversationId: conversationId,
                content: originalMessage.content,
                messageType: originalMessage.messageType,
                fileLink: originalMessage.fileLink,
                timestamp: Date.now(),
                seen: [userId],
                status: 0
            };

            if (['image', 'file', 'sticker'].includes(originalMessage.messageType)) {
                forwardedMessage.fileLink = originalMessage.fileLink;
            }

            // Tạo tin nhắn mới trong cuộc trò chuyện này
            const newMessage = await messageService.createMessage(forwardedMessage);
            if (!newMessage) {
                continue; // Nếu tạo tin nhắn thất bại, bỏ qua và chuyển tiếp qua cuộc trò chuyện khác
            }

            // Tìm người gửi
            const sender = await userService.getUserById(userId);
            newMessage.sender = sender;
            newMessages.push(newMessage);

            // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
            await conversationService.updateLastMessage(conversationId, newMessage);
        }

        if (newMessages.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Không có cuộc trò chuyện nào để chuyển tiếp.",
                data: null
            });
        }

        return res.status(200).json({
            status: 200,
            data: newMessages,
            message: "Chuyển tiếp tin nhắn thành công."
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

// Seen ALL message
exports.seenAll = async (req, res) => {
    try {
        // Lấy userId từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const userId = userService.getUserIdFromToken(token);

        // Lấy danh sách messageId
        const { messageIds } = req.body;

        // Lấy ra danh sách messages dựa vào messageIds
        let messages = [];
        for (const messageId of messageIds) {
            const message = await messageService.getMessageById(messageId);
            if (message) {
                messages.push(message);
            }
        }

        // Kiểm tra userId có tồn tại trong seen của message chưa, nếu chưa thì thêm vào
        let messagesSeen = [];
        for (const message of messages) {
            let seens = message.seen;

            const index = seens.findIndex((seen) => seen.userId === userId);
            if (index === -1) {
                seens.push({
                    userId: userId,
                    timestamp: Date.now()
                });
            }
            // Cập nhật lại message
            const messageNew = await messageService.updateSeenMessage(message.id, message.timestamp, seens);
            messagesSeen.push(messageNew);
        }

        return res.json({
            status: 200,
            message: "Đánh dấu đã đọc tất cả tin nhắn thành công.",
            data: messagesSeen
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