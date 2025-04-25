class User {
    constructor(id, fullName, gender, email, birthDay, status, avatarLink, backgroundLink, accountId, createdAt, lastLogin) {
        this.id = id;
        this.fullName = fullName;
        this.gender = gender;
        this.birthDay = birthDay;
        this.avatarLink = avatarLink;
        this.backgroundLink = backgroundLink;
        this.accountId = accountId;
        this.createdAt = createdAt;
        this.lastLogout = lastLogout;
    }
}

module.exports = User;