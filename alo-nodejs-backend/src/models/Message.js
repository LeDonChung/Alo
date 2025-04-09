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
        this.status = status;
        this.messageParent = messageParent;
    }
}

module.exports = Message;