const { request } = require("express");
const { client } = require("../config/DynamoDB");

const friendRequest = async (data) => {
    try {
        const params = {
            TableName: 'Friends',
            Item: {
                userId: data.userId,
                friendId: data.friendId,
                status: data.status,
                requestDate: Date.now(),
                contentRequest: data.contentRequest
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
            UpdateExpression: 'set #status = :status, #contentRequest = :contentRequest, #requestDate = :requestDate',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#contentRequest': 'contentRequest',
                '#requestDate': 'requestDate'
            },
            ExpressionAttributeValues: {
                ':status': 1,
                ':contentRequest': "",
                ':requestDate': Date.now()
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
        const friendParams = {
            TableName: 'Friends',
            FilterExpression: '(#userId = :userId and #friendId = :friendId) or (#userId = :friendId and #friendId = :userId)',
            ExpressionAttributeNames: {
                '#userId': 'userId',
                '#friendId': 'friendId'
            },
            ExpressionAttributeValues: {
                ':userId': data.userId,
                ':friendId': data.friendId
            }
        };

        const friendResult = await client.scan(friendParams).promise();

        const friend = friendResult.Items[0];
        

        if (friendResult.Items[0] === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
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
        const friendParams = {
            TableName: 'Friends',
            FilterExpression: '(#userId = :userId and #friendId = :friendId) or (#userId = :friendId and #friendId = :userId)',
            ExpressionAttributeNames: {
                '#userId': 'userId',
                '#friendId': 'friendId'
            },
            ExpressionAttributeValues: {
                ':userId': data.userId,
                ':friendId': data.friendId
            }
        };

        const friendResult = await client.scan(friendParams).promise();

        const friend = friendResult.Items[0];
        console.log("Friend: ", friend);
        

        if (friendResult.Items[0] === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
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

const unblockFriendRequest = async (data) => {
    try {
        const friendParams = {
            TableName: 'Friends',
            FilterExpression: '(#userId = :userId and #friendId = :friendId) or (#userId = :friendId and #friendId = :userId)',
            ExpressionAttributeNames: {
                '#userId': 'userId',
                '#friendId': 'friendId'
            },
            ExpressionAttributeValues: {
                ':userId': data.userId,
                ':friendId': data.friendId
            }
        };
        const friendResult = await client.scan(friendParams).promise();

        const friend = friendResult.Items[0];
        console.log("Friend: ", friend);
        

        if (friendResult.Items[0] === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': 1,
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
            UpdateExpression: 'set #status = :status, #contentRequest = :contentRequest',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#contentRequest': 'contentRequest'
            },
            ExpressionAttributeValues: {
                ':status': 2,
                ':contentRequest': ""
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
        const friendRequests = [];

        for (let i = 0; i < result.Items.length; i++) {
            // thong tin ket ban
            const friendRequest = result.Items[i];

            const params = {
                TableName: 'Users',
                Key: {
                    id: friendRequest.userId
                }
            };

            // thong tin nguoi gui loi moi ket ban
            const userResult = await client.get(params).promise();
            const userSendRequest = userResult.Item;

            // thong tin ket ban tra ve cho client
            const friendRequestResult = {
                userId: friendRequest.userId,
                fullName: userSendRequest.fullName,
                friendId: friendRequest.friendId,
                status: friendRequest.status,
                requestDate: friendRequest.requestDate,
                contentRequest: friendRequest.contentRequest
            };
            friendRequests.push(friendRequestResult);

        }

        return friendRequests;
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
        //get all friends of userId
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

        const listResult = [];

        //get info friend of userId
        for (let i = 0; i < result.Items.length; i++) {
            const friend = result.Items[i];
            const friendId = friend.userId === userId ? friend.friendId : friend.userId;
            const params = {
                TableName: 'Users',
                Key: {
                    id: friendId
                }
            };
            const userResult = await client.get(params).promise();
            const user = userResult?.Item;
            if (!user) {
                console.log("User not found: ", friendId);
                continue;
            }
            const response = {
                userId: userId,
                friendId: friendId,
                friendInfo: {
                    fullName: user.fullName,
                    status: friend.status,
                    accountId: user.accountId,
                    requestDate: friend.requestDate
                }
            }
            listResult.push(response);
        }

        return listResult;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

const getFriendByPhoneNumber = async (data) => {
    try {
        // find account by phoneNumber
        const accountParams = {
            TableName: "Accounts",
            FilterExpression: "#phoneNumber = :phoneNumber",
            ExpressionAttributeNames: {
                "#phoneNumber": 'phoneNumber'
            },
            ExpressionAttributeValues: {
                ":phoneNumber": data.phoneNumber
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
            FilterExpression: '(#userId = :userId and #friendId = :friendId) or (#userId = :friendId and #friendId = :userId)',
            ExpressionAttributeNames: {
                '#userId': 'userId',
                '#friendId': 'friendId'
            },
            ExpressionAttributeValues: {
                ':userId': data.userId,
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
            message: "Tìm thấy thông tin người dùng",
            friendId: friendId,
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
    getFriendByPhoneNumber,
    unblockFriendRequest
};