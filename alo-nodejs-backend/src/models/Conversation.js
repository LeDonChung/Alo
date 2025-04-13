class Conversation {
    constructor(id, name, avatar, createdBy, members, deputies, isGroup, isCalling, lastMessage) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.createdBy = createdBy;
        this.members = members;
        this.deputies = deputies;
        this.isGroup = isGroup;
        this.isCalling = isCalling;
        this.lastMessage = lastMessage;
        this.pins = [];
    }
}

module.exports = Conversation;