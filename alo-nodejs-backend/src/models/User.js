class User {
    constructor(id, fullName, gender, email, birthDay, status, avatarLink, backgroundLink, accountId, createdAt, lastLogin) {
        this.id = id;
        this.fullName = fullName;
        this.gender = gender;
        this.email = email;
        this.birthDay = birthDay;
        this.status = status;
        this.avatarLink = avatarLink;
        this.backgroundLink = backgroundLink;
        this.accountId = accountId;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
    }
}

module.exports = User;