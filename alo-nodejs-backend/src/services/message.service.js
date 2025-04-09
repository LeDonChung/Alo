const { client } = require("../config/DynamoDB");
const { v4: uuidv4 } = require('uuid');

const createMessage = async (data) => {
    try {
        const params = {
            TableName: 'Messages',
            Item: data
        };
        console.log(params);
        await client.put(params).promise();
        return params.Item;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}




const getMessagesByConversationId = async (conversationId) => {
    try {
        // Lấy tất cả tin nhắn trong conversation sắp xếp theo thời gian tăng dần
        const params = {
            TableName: 'Messages',
            IndexName: 'conversationId-timestamp-index',
            FilterExpression: 'conversationId = :conversationId',
            ExpressionAttributeValues: {
                ':conversationId': conversationId
            },
            ScanIndexForward: true,
        };


        const messages = await client.scan(params).promise();
        return {
            messages: messages.Items
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    createMessage,
    getMessagesByConversationId
};