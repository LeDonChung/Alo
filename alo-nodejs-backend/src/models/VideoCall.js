class VideoCall {
  constructor(callId, callerId, receiverId, startTime, endTime, callStatus) {
    this.callId = callId;
    this.callerId = callerId;
    this.receiverId = receiverId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.callStatus = callStatus;
  }
}

module.exports = VideoCall;