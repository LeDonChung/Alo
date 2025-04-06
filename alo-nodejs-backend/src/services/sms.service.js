const crypto = require('crypto');

const { SNS } = require('../config/SNS');

const sendOtp = async (phoneNumber, otp) => {
    const params = {
        PhoneNumber: phoneNumber,
        Message: `Ma xac thuc OTP cua ban la: ${otp}. Ma co hieu luc trong 1 phut.`,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'Alo' 
            },
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            }
        }
    };

    try {
        const data = await SNS.publish(params).promise();
        console.log("SMS sent successfully:", data);
        return true;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return false;
    }
}
module.exports = {
    sendOtp
}
