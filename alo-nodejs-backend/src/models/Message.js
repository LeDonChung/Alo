class Message {
    constructor(id, senderId, conversationId, messageType, content, timestamp, deleteBy, seen, fileLink) {
        this.id = id;
        this.senderId = senderId;
        this.conversationId = conversationId;
        this.messageType = messageType; // 0: text, 1: image, 2: file, 4: video, 5: audio
        this.content = content;
        this.timestamp = timestamp;
        this.deleteBy = deleteBy;
        this.seen = seen;
        this.fileLink = fileLink;
    }
}

module.exports = Message;