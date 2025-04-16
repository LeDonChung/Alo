class Message {
    constructor(id, senderId, conversationId, messageType, content, timestamp, deleteBy, seen, fileLink, reaction, status, messageParent) {
        this.id = id;
        this.senderId = senderId;
        this.conversationId = conversationId;
        this.messageType = messageType; // text, image, file
        this.content = content;
        this.timestamp = timestamp;
        this.deleteBy = deleteBy;
        this.seen = seen;
        this.fileLink = fileLink;
        this.reaction = reaction;
        this.status = status; // 0: đã gửi - hiện, 1: đã thu hồi, 2: đã xóa
        this.messageParent = messageParent;
        this.removeOfme = []
    }
}

module.exports = Message;