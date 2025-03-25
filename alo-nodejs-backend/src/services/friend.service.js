const { client } = require("../config/DynamoDB");

const friendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Item: {
                userId: data.userId,
                friendId: data.friendId,
                status: data.status,
                requestDate: Date.now()
            }
        };
        await client.put(params).promise();
        return params.Item;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}
const acceptFriendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Key: {
                userId: data.userId,
                friendId: data.friendId
            },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 1
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

const rejectFriendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Key: {
                userId: data.userId,
                friendId: data.friendId
            },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 2
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

const getFriendRequests = async (friendId) => {
    try {
        const params = {
            TableName: 'Friends',
            FilterExpression: '#status = :status and friendId = :friendId',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':friendId': friendId,
                ':status': 0
            }
        };

        const result = await client.scan(params).promise();
        return result.Items;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}
const getFriend = async (data) => {
    try {
        // userId is partition key, friendId is sort key
        const params = {
            TableName: 'Friends',
            KeyConditionExpression: 'userId = :userId and friendId = :friendId',
            ExpressionAttributeValues: {
                ':userId': data.userId,
                ':friendId': data.friendId
            }
        };
        console.log(params)

        const result = await client.query(params).promise();
        return result.Items[0];
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getFriends = async (userId) => {
    try {
        const params = {
            TableName: 'Friends',
            FilterExpression: '#status = :status and (userId = :userId or friendId = :userId)',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':userId': userId,
                ':status': 1
            }
        };
        const result = await client.scan(params).promise();
        return result.Items;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}


module.exports = {
    friendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriend,
    getFriends
};