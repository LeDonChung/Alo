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

const unfriendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Key: {
                userId: data.userId,
                friendId: data.friendId
            },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': 4,
            },
            ReturnValues: 'ALL_NEW'
        };
        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

const blockFriendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Key: {
                userId: data.userId,
                friendId: data.friendId
            },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': 3,
            },
            ReturnValues: 'ALL_NEW'
        };
        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

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
            FilterExpression: '(#status in (:status1, :status2)) and (userId = :userId or friendId = :userId)',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':userId': userId,
                ':status1': 1,
                ':status2': 3
            }
        };
        const result = await client.scan(params).promise();
        return result.Items;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getFriendByPhoneNumber = async (phoneNumber) => {
    try {

        console.log("phoneNumber: ", phoneNumber);
        
        // find account by phoneNumber
        const accountParams = {
            TableName: "Accounts",
            FilterExpression: "#phoneNumber = :phoneNumber",
            ExpressionAttributeNames: {
                "#phoneNumber": 'phoneNumber'
            },
            ExpressionAttributeValues: {
                ":phoneNumber": phoneNumber
            }
        };

        const accountResult = await client.scan(accountParams).promise();
        console.log("Account: ", accountResult.Items[0]);

        if (accountResult.Items.length === 0) {
            return { message: "Số điện thoại chưa được đăng ký tài khoản." };
        }

        const accountId = accountResult.Items[0].accountId;

        // find friend by accountId
        const userParams = {
            TableName: "Users",
            FilterExpression: "#accountId = :accountId",
            ExpressionAttributeNames: {
                "#accountId": 'accountId'
            },
            ExpressionAttributeValues: {
                ":accountId": accountId
            }
        };

        const userResult = await client.scan(userParams).promise();
        console.log("User: ", userResult.Items[0]);

        if (userResult.Items.length === 0) {
            return { message: "Người dùng ngăn chặn tìm kiếm bằng số điện thoại" };
        }

        const friendId = userResult.Items[0].id;
        console.log("FriendId: ", friendId);
        

        // find friend by friendId
        const friendParams = {
            TableName: 'Friends',
            FilterExpression: '#friendId = :friendId',
            ExpressionAttributeNames: {
                '#friendId': 'friendId'
            },
            ExpressionAttributeValues: {
                ':friendId': friendId
            }
        };

        const friendResult = await client.scan(friendParams).promise();
        console.log("Friend: ", friendResult.Items[0]);

        const statusFriend = friendResult.Items[0] ? friendResult.Items[0].status : -1;

        const result = {
            fullName: userResult.Items[0].fullName,
            phoneNumber: accountResult.Items[0].phoneNumber,
            status: statusFriend,
            message: "Tìm thấy thông tin người dùng"
        }
        console.log("Result: ", result);


        return result;

    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}

module.exports = {
    friendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriend,
    getFriends,
    unfriendRequest,
    blockFriendRequest,
    getFriendByPhoneNumber
};