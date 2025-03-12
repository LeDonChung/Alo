class Account {
    constructor(id, phoneNumber, password, roles, user) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.roles = roles;
        this.user = user;
    }
    setUser(user) {
        this.user = user;
    }
}

module.exports = Account;