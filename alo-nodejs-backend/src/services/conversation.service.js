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

const createGroupConversation = async (data) => {
    try {
        const params = {
            TableName: 'Conversations',
            Item: {
                id: uuidv4(),
                name: data.name,
                avatar: data.avatar,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
                isGroup: true,
                blockedUserIds: data.blockedUserIds,
                roles: data.roles,
                memberUserIds: data.memberUserIds
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
            FilterExpression: '#createdBy IN (:memberA, :memberB) AND contains(#memberUserIds, :memberA) AND contains(#memberUserIds, :memberB)',
            ExpressionAttributeNames: {
                '#createdBy': 'createdBy',
                '#memberUserIds': 'memberUserIds'
            },
            ExpressionAttributeValues: {
                ':memberA': memberUserIds[0],
                ':memberB': memberUserIds[1]
            }
        };
        const data = await client.scan(params).promise();
        const result = data.Items?.find(item => item.memberUserIds.length === 2);
        return result;
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

const updateProfileGroup = async (conversationId, data) => {
    try {
        const params = {
            TableName: 'Conversations',
            Key: {
                id: conversationId
            },
            UpdateExpression: 'set #name = :name, avatar = :avatar',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': data.name,
                ':avatar': data.avatar
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
};

const addNewMember = async (conversationId, data) => {
    try {
        const params = {
            TableName: 'Conversations',
            Key: {
                id: conversationId
            },
            UpdateExpression: 'set memberUserIds = list_append(if_not_exists(memberUserIds, :emptyList), :newMemberUserIds), #roles = :roles',
            ExpressionAttributeNames: {
                '#roles': 'roles'
            },
            ExpressionAttributeValues: {
                ':newMemberUserIds': data.memberUserIds,
                ':roles': data.roles,
                ':emptyList': []
            },
            ReturnValues: 'ALL_NEW'
        };
        const res = await client.update(params).promise();
        return res.Attributes;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

const removeMember = async (conversationId, data) => {
    const params = {
        TableName: 'Conversations',
        Key: { id: conversationId },
        UpdateExpression: 'SET memberUserIds = :memberUserIds, #roles = :roles',
        ExpressionAttributeNames: {
            '#roles': 'roles'
        },
        ExpressionAttributeValues: {
            ':memberUserIds': data.memberUserIds,
            ':roles': data.roles
        },
        ReturnValues: 'ALL_NEW'
    };

    const result = await client.update(params).promise();
    return result.Attributes;
}
const leaveGroup = async (conversationId, userId) => {
    try {
        const conversation = await getConversationById(conversationId);
        
        if (!conversation) {
            throw new Error('Cuộc trò chuyện không tồn tại.');
        }

        if (!conversation.memberUserIds) {
            throw new Error('Dữ liệu cuộc trò chuyện không hợp lệ.');
        }

        if (!conversation.memberUserIds.includes(userId)) {
            throw new Error('Bạn không phải là thành viên của cuộc trò chuyện này.');
        }

        const leaderRole = conversation.roles && conversation.roles.find(role => role.role === 'leader');
        if (leaderRole && leaderRole.userIds && leaderRole.userIds.includes(userId)) {
            throw new Error('Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho người khác trước khi rời nhóm.');
        }

        const updatedMemberUserIds = conversation.memberUserIds.filter(id => id !== userId);
        
        let updatedRoles = [];
        if (conversation.roles && Array.isArray(conversation.roles)) {
            updatedRoles = conversation.roles.map(role => ({
                ...role,
                userIds: role.userIds ? role.userIds.filter(id => id !== userId) : []
            }));
        }

        const params = {
            TableName: 'Conversations',
            Key: { id: conversationId },
            UpdateExpression: 'SET memberUserIds = :memberUserIds, #roles = :roles',
            ExpressionAttributeNames: {
                '#roles': 'roles'
            },
            ExpressionAttributeValues: {
                ':memberUserIds': updatedMemberUserIds,
                ':roles': updatedRoles
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await client.update(params).promise();
        
        return result.Attributes;
    } catch (error) {
        console.error('Lỗi khi rời nhóm:', error);
        throw error;
    }
};


const updateRoles = async (conversationId, data) => {
    const params = {
        TableName: 'Conversations',
        Key: { id: conversationId },
        UpdateExpression: 'SET #roles = :roles',
        ExpressionAttributeNames: {
            '#roles': 'roles'
        },
        ExpressionAttributeValues: {
            ':roles': data
        },
        ReturnValues: 'ALL_NEW'
    };

    const result = await client.update(params).promise();
    return result.Attributes;
}

const updateBlockedUserIds = async (conversationId, blockedUserIds) => {
    const params = {
        TableName: 'Conversations',
        Key: { id: conversationId },
        UpdateExpression: 'SET blockedUserIds = :blockedUserIds',
        ExpressionAttributeValues: {
            ':blockedUserIds': blockedUserIds
        },
        ReturnValues: 'ALL_NEW'
    };

    const result = await client.update(params).promise();
    return result.Attributes;
}
const updateAllMessagesStatusByConversationId = async (conversationId) => {
    try {
        let messages = [];
        let lastEvaluatedKey = null;

        do {
            const params = {
                TableName: 'Messages',
                IndexName: 'conversationId-timestamp-index',
                FilterExpression: 'conversationId = :conversationId',
                ExpressionAttributeValues: {
                    ':conversationId': conversationId
                },
                ScanIndexForward: true,
            };

            const queryResult = await client.scan(params).promise();
            messages = messages.concat(queryResult.Items);
            lastEvaluatedKey = queryResult.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        if (!messages || messages.length === 0) {
            return { updatedCount: 0, message: 'Không có message nào thuộc conversation này.' };
        }

        const batchSize = 25;
        const batches = [];
        for (let i = 0; i < messages.length; i += batchSize) {
            batches.push(messages.slice(i, i + batchSize));
        }

        const batchPromises = batches.map(async (batch) => {
            const requestItems = batch.map(message => ({
                PutRequest: {
                    Item: {
                        ...message,
                        status: 2 // Xóa cả 2
                    }
                }
            }));

            const batchParams = {
                RequestItems: {
                    Messages: requestItems
                }
            };

            return client.batchWrite(batchParams).promise();
        });

        await Promise.all(batchPromises);

        return {
            updatedCount: messages.length,
            message: `Đã cập nhật trạng thái thành 0 cho ${messages.length} message.`
        };

    } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái message:', err);
        throw err;
    }
};


const disbandGroup = async (conversationId, updateData) => {
    try {

        const params = {
            TableName: 'Conversations',
            Key: { id: conversationId },
            UpdateExpression: 'SET memberUserIds = :emptyList, #roles = :roles, pineds = :emptyPineds, blockedUserIds = :emptyBlockedUserIds',
            ExpressionAttributeNames: {
                '#roles': 'roles'
            },
            ExpressionAttributeValues: {
                ':emptyList': updateData.memberUserIds,
                ':roles': updateData.roles,
                ':emptyPineds': [],
                ':emptyBlockedUserIds': []
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await client.update(params).promise();
        return result.Attributes;
    } catch (err) {
        console.error('Lỗi khi giải tán nhóm:', err);
        throw err;
    }
}
module.exports = {
    createConversation,
    getConversationsByUserId,
    getConversationByMembers,
    getConversationById,
    updateLastMessage,
    updatePineds,
    createGroupConversation,
    updateProfileGroup,
    addNewMember,
    removeMember,
    updateRoles,
    updateBlockedUserIds,
    updateAllMessagesStatusByConversationId,
    leaveGroup,
    disbandGroup
};