const { request } = require("express");
const { client } = require("../config/DynamoDB");

const friendRequest = async (data) => {
    try {
        //check exists friend
        const friendParams = {
            userId: data.userId,
            friendId: data.friendId
        }
        const friend = await getFriend(friendParams);

        let friendResp = {};
        if (friend) {
            // update friend
            const updateParams = {
                TableName: 'Friends',
                Key: {
                    userId: friend.userId,
                    friendId: friend.friendId
                },
                UpdateExpression: 'set #status = :status, #contentRequest = :contentRequest, #requestDate = :requestDate, #senderId = :senderId',
                ExpressionAttributeNames: {
                    '#status': 'status',
                    '#contentRequest': 'contentRequest',
                    '#requestDate': 'requestDate',
                    '#senderId': 'senderId'
                },
                ExpressionAttributeValues: {
                    ':status': 0,
                    ':contentRequest': data.contentRequest,
                    ':requestDate': Date.now(),
                    ':senderId': data.userId
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await client.update(updateParams).promise();
            friendResp = result.Attributes;
        } else {
            // new friend request
            const params = {
                TableName: 'Friends',
                Item: {
                    userId: data.userId,
                    friendId: data.friendId,
                    status: data.status,
                    requestDate: Date.now(),
                    contentRequest: data.contentRequest,
                    senderId: data.userId,
                    blockId: ''
                }
            };
            await client.put(params).promise();
            friendResp = params.Item;
        }

        //get info user send request
        const params = {
            TableName: 'Users',
            Key: {
                id: data.userId
            }
        };

        // thong tin nguoi gui loi moi ket ban
        const userResult = await client.get(params).promise();
        const userSendRequest = userResult.Item;

        const resp = {
            userId: userSendRequest.id,
            fullName: userSendRequest.fullName,
            avatarLink: userSendRequest.avatarLink,
            friendId: friendResp.friendId === friendResp.senderId ? friendResp.userId : friendResp.friendId,
            status: friendResp.status,
            requestDate: friendResp.requestDate,
            contentRequest: friendResp.contentRequest,
            senderId: friendResp.senderId,
        }    

        console.log("Response: ", resp);
        

        return resp;

    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}
const acceptFriendRequest = async (data) => {
    try {
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
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
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'SET #status = :status, #requestDate = :requestDate',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#requestDate': 'requestDate'
            },
            ExpressionAttributeValues: {
                ':status': 4,
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
};

const blockFriendRequest = async (data) => {
    try {
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'SET #status = :status, #blockId = :blockId',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#blockId': 'blockId',
            },
            ExpressionAttributeValues: {
                ':status': 3,
                ':blockId': data.userId,
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
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'SET #status = :status, #blockId = :blockId',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#blockId': 'blockId',
            },
            ExpressionAttributeValues: {
                ':status': 1,
                ':blockId': null,
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
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }
        //update friend status to 2 (reject)
        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'set #status = :status, #contentRequest = :contentRequest, #requestDate = :requestDate',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#contentRequest': 'contentRequest',
                '#requestDate': 'requestDate'
            },
            ExpressionAttributeValues: {
                ':status': 2,
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

const cancelFriendRequest = async (data) => {
    try {
        const friend = await getFriend(data);

        if (friend === undefined) {
            return { message: "Không tìm thấy thông tin người dùng" };
        }

        const params = {
            TableName: 'Friends',
            Key: {
                userId: friend.userId,
                friendId: friend.friendId
            },
            UpdateExpression: 'set #status = :status, #contentRequest = :contentRequest, #requestDate = :requestDate',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#contentRequest': 'contentRequest',
                '#requestDate': 'requestDate'
            },
            ExpressionAttributeValues: {
                ':status': -1,
                ':contentRequest': "",
                ':requestDate': Date.now()
            },
            ReturnValues: 'ALL_NEW'
        };
        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (error) {
        console.error(err);
        throw new Error(err);
    }
}

const getFriendRequests = async (friendId) => {
    try {
        //find friend with status = 0
        const params = {
            TableName: 'Friends',
            FilterExpression: '#status = :status and (#friendId = :friendId or #userId = :friendId) and #senderId <> :friendId',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#friendId': 'friendId',
                '#userId': 'userId',
                '#senderId': 'senderId'
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
                    id: friendRequest.senderId
                }
            };

            // thong tin nguoi gui loi moi ket ban
            const userResult = await client.get(params).promise();
            const userSendRequest = userResult.Item;

            // thong tin ket ban tra ve cho client
            const friendRequestResult = {
                userId: userSendRequest.id,
                fullName: userSendRequest.fullName,
                avatarLink: userSendRequest.avatarLink,
                friendId: friendRequest.friendId === friendRequest.senderId ? friendRequest.userId : friendRequest.friendId,
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
        const result = await client.scan(params).promise();
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
                    requestDate: friend.requestDate,
                    avatarLink: user.avatarLink,
                    id: user.id
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

        // find friend by friendId

        const friendParams = {
            userId: data.userId,
            friendId: friendId
        };
        const friendResult = await getFriend(friendParams);
        const statusFriend = friendResult ? friendResult.status : -1;

        const result = {
            fullName: userResult.Items[0].fullName,
            phoneNumber: accountResult.Items[0].phoneNumber,
            avatarLink: userResult.Items[0].avatarLink ? userResult.Items[0].avatarLink : null,
            status: statusFriend,
            message: "Tìm thấy thông tin người dùng",
            friendId: friendId,
            senderId: friendResult ? friendResult.senderId : null,
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
    unblockFriendRequest,
    cancelFriendRequest
};