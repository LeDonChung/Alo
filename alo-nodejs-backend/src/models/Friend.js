class Friend {
    constructor(userId, friendId, status, requestDate, acceptedDate) {
      this.userId = userId;
      this.friendId = friendId;
      this.status = status; // 0: pending, 1: accepted, 2: reject, 3: blocked, 4: unfriend
      this.requestDate = requestDate;
      this.acceptedDate = acceptedDate;
    }
  }
  