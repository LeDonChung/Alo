class Conversation {
    constructor(id, name, avatar, createdBy, members, deputies, isGroup, isCalling, lastMessage, memberUserIds, createdAt) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.createdBy = createdBy;
        this.members = members;
        this.memberUserIds = memberUserIds;
        this.deputies = deputies;
        this.isGroup = isGroup;
        this.createdAt = createdAt;
        this.isCalling = isCalling;
        this.lastMessage = lastMessage;
        this.blockedUserIds = [];
        this.pins = [];
    }
}

module.exports = Conversation;