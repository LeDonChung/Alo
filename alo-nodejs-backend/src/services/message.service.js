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
        return messages.Items

    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const updateMessageStatus = async (messageId, timestamp, status) => {
    try {
        const params = {
            TableName: 'Messages',
            Key: {
                id: messageId,
                timestamp: timestamp
            },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log(params);
        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const updateMessageReaction = async (messageId, timestamp, reaction) => {
    try {
        const params = {
            TableName: 'Messages',
            Key: {
                id: messageId,
                timestamp: timestamp
            },
            UpdateExpression: 'set reaction = :reaction',
            ExpressionAttributeValues: {
                ':reaction': reaction
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log(params)

        const result = await client.update(params).promise();
        console.log(result)
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getMessageById = async (messageId) => {
    try {
        const params = {
            TableName: 'Messages',
            KeyConditionExpression: 'id = :messageId',
            ExpressionAttributeValues: {
                ':messageId': messageId
            },
        };

        console.log(params);
        const result = await client.query(params).promise();
        return result.Items[0];
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const updateSeenMessage = async (messageId, timestamp, seen) => {
    try {
        const params = {
            TableName: 'Messages',
            Key: {
                id: messageId,
                timestamp: timestamp
            },
            UpdateExpression: 'set #seen = :seen',
            ExpressionAttributeNames: {
                '#seen': 'seen'
            },
            ExpressionAttributeValues: {
                ':seen': seen
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const deleteMessage = async (messageId, timestamp, removeOfme) => {
    try {
        const params = {
            TableName: 'Messages',
            Key: {
                id: messageId,
                timestamp: timestamp
            },
            UpdateExpression: 'set #removeOfme = :removeOfme',
            ExpressionAttributeNames: {
                '#removeOfme': 'removeOfme'
            },
            ExpressionAttributeValues: {
                ':removeOfme': removeOfme
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getLastMessageByConversationId = async (conversationId) => {
    try {
        const params = {
            TableName: 'Messages',
            IndexName: 'conversationId-timestamp-index',
            KeyConditionExpression: 'conversationId = :conversationId',
            ExpressionAttributeValues: {
                ':conversationId': conversationId
            },
            ScanIndexForward: false,
            Limit: 1
        };

        const result = await client.query(params).promise();
        return result.Items[0];
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}
module.exports = {
    createMessage,
    getMessagesByConversationId,
    updateMessageStatus,
    getMessageById,
    updateMessageReaction,
    updateSeenMessage,
    deleteMessage,
    getLastMessageByConversationId
};