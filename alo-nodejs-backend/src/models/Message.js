class Message {
    constructor(id, senderId, conversationId, messageType, content, timestamp, deleteBy, seen, fileLink) {
        this.id = id;
        this.senderId = senderId;
        this.conversationId = conversationId;
        this.messageType = messageType;
        this.content = content;
        this.timestamp = timestamp;
        this.deleteBy = deleteBy;
        this.seen = seen;
        this.fileLink = fileLink;
    }
}

module.exports = Message;