class Privacy {
    constructor(userId, privacySetting, isProfilePrivate, canReceiveFriendRequest) {
        this.userId = userId;
        this.privacySetting = privacySetting;
        this.isProfilePrivate = isProfilePrivate;
        this.canReceiveFriendRequest = canReceiveFriendRequest;
    }
}

module.exports = Privacy;