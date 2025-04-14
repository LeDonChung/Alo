const { client } = require("../config/DynamoDB");
const { v4: uuidv4 } = require('uuid');

const createConversation = async (data) => {
    try {
        const params = {
            TableName: 'Conversations',
            Item: {
                id: uuidv4(),
                members: data.members,
                createdBy: data.createdBy,
                isGroup: data.isGroup,
                isCalling: data.isCalling,
                memberUserIds: data.memberUserIds,
            }
        };
        console.log(params);
        await client.put(params).promise();
        console.log(params.Item);
        return params.Item;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getConversationById = async (id) => {
    try {
        const params = {
            TableName: 'Conversations',
            Key: {
                id: id
            }
        };
        const data = await client.get(params).promise();
        return data.Item;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getConversationByMembers = async (memberUserIds) => {
    try {
        const params = {
            TableName: 'Conversations',
            FilterExpression: 'memberUserIds = :memberUserIds',
            ExpressionAttributeValues: {
                ':memberUserIds': memberUserIds
            }
        };
        const data = await client.scan(params).promise();
        return data.Items[0];
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getConversationsByUserId = async (userId) => {
    try {
        const params = {
            TableName: 'Conversations',
            FilterExpression: 'contains(memberUserIds, :userId)',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        const data = await client.scan(params).promise();
        return data.Items;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const updateLastMessage = async (conversationId, message) => {
    try {
        const params = {
            TableName: 'Conversations',
            Key: {
                id: conversationId
            },
            UpdateExpression: 'set lastMessage = :message',
            ExpressionAttributeValues: {
                ':message': message
            }
        };
        console.log(params);
        await client.update(params).promise();
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const updatePineds = async (conversationId, pineds) => {
    try {
        const params = {
            TableName: 'Conversations',
            Key: {
                id: conversationId
            },
            UpdateExpression: 'set pineds = :pineds',
            ExpressionAttributeValues: {
                ':pineds': pineds
            },
            ReturnValues: 'ALL_NEW'
        };
        console.log(params);
        const res = await client.update(params).promise();
        return res.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    createConversation,
    getConversationsByUserId,
    getConversationByMembers,
    getConversationById,
    updateLastMessage,
    updatePineds
};