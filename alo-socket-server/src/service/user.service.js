const { client } = require("../config/DynamoDB");

const getUserById = async (userId) => {
    const params = {
        TableName: "Users",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": userId
        }
    };


    try {
        const data = await client.query(params).promise();
        const paramsAccount = {
            TableName: 'Accounts',
            Key: {
                accountId: data.Items[0].accountId
            }
        };

        const dataAccount = await client.get(paramsAccount).promise();

        return {
            ...data.Items[0],
            phoneNumber: dataAccount.Item.phoneNumber,
        }
    } catch (err) {
        console.log(err);
        return null;
    }

}

const updateLastLogout = async (userId) => {
    const userExist = await getUserById(userId);
    if (!userExist) {
        return null;
    }

    const params = {
        TableName: 'Users',
        Key: {
            id: userId
        },
        UpdateExpression: 'set lastLogout = :lastLogout',
        ExpressionAttributeValues: {
            ':lastLogout': new Date().getTime()
        },
        ReturnValues: 'UPDATED_NEW'
    };
    console.log(params)

    try {
        const data = await client.update(params).promise();
        // Trả về thông tin user sau khi cập nhật
        console.log(data)
        return getUserById(userId);
    } catch (err) {
        console.log(err);
        return null;
    }

}
module.exports = {
    updateLastLogout,
}