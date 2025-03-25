const { client } = require("../config/DynamoDB");
const { v4: uuidv4 } = require('uuid');

const createMessageText = async (data) => {
    try {
        const params = {
            TableName: 'Messages',
            Item: {
                id: uuidv4(),
                senderId: data.senderId,
                conversationId: data.conversationId,
                content: data.content,
                messageType: data.messageType,
                timestamp: Date.now(),
                seen: []
            }
        };
        console.log(params);
        await client.put(params).promise();
        return params.Item;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    createMessageText,
};