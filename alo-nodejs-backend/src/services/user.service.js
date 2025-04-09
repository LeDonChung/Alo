const jwt = require('jsonwebtoken');
const { client } = require("../config/DynamoDB")
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Account = require("../models/Account");

const { S3 } = require('../config/S3');
const existingUser = async (phoneNumber) => {
  const params = {
    TableName: 'Accounts',
    FilterExpression: 'phoneNumber = :phoneNumber',
    ExpressionAttributeValues: {
      ':phoneNumber': { S: phoneNumber }
    }
  }

  try {
    const data = await client.scan(params).promise();
    console.log("Data", data)
    // Kiểm tra nếu có người dùng tồn tại
    if (data.Items && data.Items.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error querying table. Error:", JSON.stringify(err, null, 2));
    return false;
  }
}
// Hàm register
const register = async (userRegister) => {
  const hashedPassword = await bcrypt.hash(userRegister.password, 10);

  const paramsAccount = {
    TableName: 'Accounts',
    Item: {
      'accountId': uuidv4(),
      'phoneNumber': userRegister.phoneNumber,
      'password': hashedPassword,
      'roles': ['USER']
    }
  };


  try {
    await client.put(paramsAccount).promise();

    const paramsUser = {
      TableName: 'Users',
      Item: {
        'id': uuidv4(),
        'fullName': userRegister.fullName,
        'accountId': paramsAccount.Item.accountId,
        'createdAt': new Date().toISOString()
      }
    };

    const result = await client.put(paramsUser).promise();

    return new Account(
      paramsAccount.Item.accountId.S,
      userRegister.phoneNumber,
      hashedPassword,
      paramsAccount.Item.roles.SS,
      {
        id: paramsUser.Item.id.S,
        fullName: userRegister.fullName,
        accountId: paramsAccount.Item.accountId.S,
        createdAt: new Date().toISOString()
      }
    );
  } catch (err) {
    console.error("Error querying table. Error:", err);
    return false;
  }
};

const findByPhoneNumber = async (phoneNumber) => {
  // Chuẩn hóa số điện thoại
  const normalizedPhone = phoneNumber.startsWith('0') ? `+84${phoneNumber.slice(1)}` : phoneNumber;
  const paramsAccount = {
      TableName: 'Accounts',
      FilterExpression: 'phoneNumber = :phoneNumber',
      ExpressionAttributeValues: {
          ':phoneNumber': normalizedPhone // Thử với số đã chuẩn hóa trước
      }
  };

  try {
      let data = await client.scan(paramsAccount).promise();
      console.log("DAA (normalized)", data);

      // Nếu không tìm thấy với số chuẩn hóa, thử lại với số gốc
      if (!data.Items || data.Items.length === 0) {
          paramsAccount.ExpressionAttributeValues[':phoneNumber'] = phoneNumber;
          data = await client.scan(paramsAccount).promise();
          console.log("DAA (original)", data);
      }

      if (data.Items && data.Items.length > 0) {
          const account = data.Items[0];
          const paramsUser = {
              TableName: 'Users',
              FilterExpression: 'accountId = :accountId',
              ExpressionAttributeValues: {
                  ':accountId': account.accountId
              }
          };
          const dataUser = await client.scan(paramsUser).promise();
          console.log("DATAUSER", dataUser);

          const userInfo = dataUser.Items && dataUser.Items.length > 0 ? {
              id: dataUser.Items[0].id,
              fullName: dataUser.Items[0].fullName,
              accountId: dataUser.Items[0].accountId,
              createdAt: dataUser.Items[0].createdAt
          } : null;

          return new Account(
              account.accountId,
              account.phoneNumber,
              account.password,
              account.roles,
              userInfo
          );
      } else {
          return null;
      }
  } catch (err) {
      console.error("Error querying table. Error:", JSON.stringify(err, null, 2));
      return null;
  }
}

const getUserIdFromToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded.userId;
}

const uploadImage = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const result = await S3.upload(params).promise();
    return result.Location;
  } catch (err) {
    console.error("Error uploading image. Error:", err);
    return null;
  }
}

const uploadAvatar = async (userId, file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const result = await S3.upload(params).promise();

    const paramsUpdate = {
      TableName: 'Users',
      Key: {
        id: userId,
      },
      UpdateExpression: 'set avatarLink = :avatarLink',
      ExpressionAttributeValues: {
        ':avatarLink': result.Location,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await client.update(paramsUpdate).promise();

    return result.Location;
  } catch (err) {
    console.error("Error uploading image. Error:", err);
    return null;
  }
}

const uploadBackground = async (userId, file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const result = await S3.upload(params).promise();

    const paramsUpdate = {
      TableName: 'Users',
      Key: {
        id: userId,
      },
      UpdateExpression: 'set backgroundLink = :backgroundLink',
      ExpressionAttributeValues: {
        ':backgroundLink': result.Location,
      },
      ReturnValues: 'UPDATED_NEW',
    };
    console.log(paramsUpdate);

    await client.update(paramsUpdate).promise();

    return result.Location;
  } catch (err) {
    console.error("Error uploading image. Error:", err);
    return null;
  }
}

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
const updateProfile = async (userId, user) => {
  const userExist = await getUserById(userId);
  if (!userExist) {
    return null;
  }

  const params = {
    TableName: 'Users',
    Key: {
      id: userId
    },
    UpdateExpression: 'set fullName = :fullName , gender = :gender, birthDay = :birthDay', // Cập nhật thông tin
    ExpressionAttributeValues: {
      ':fullName': user.fullName,
      ':gender': user.gender,
      ':birthDay': user.birthDay
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const data = await client.update(params).promise();
    return getUserById(userId);
  } catch (err) {
    console.log(err);
    return null;
  }
}

const getUsersByIds = async (userIds) => {
  try {
    const params = {
      RequestItems: {
        'Users': {
          Keys: userIds.map(userId => ({ id: userId }))
        }
      }
    };
    console.log(params)
    const result = await client.batchGet(params).promise();
    return result.Responses.Users;
  } catch (err) {
    console.error(err);
    throw new Error(err);
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

const updatePassword = async (accountId, hashedPassword) => {

  const params = {
    TableName: 'Accounts',
    Key: {
      accountId: accountId
    },
    UpdateExpression: 'set password = :password',
    ExpressionAttributeValues: {
      ':password': hashedPassword
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await client.update(params).promise();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports = {
  existingUser,
  register,
  findByPhoneNumber,
  uploadImage,
  getUserIdFromToken,
  uploadAvatar,
  uploadBackground,
  updateProfile,
  getUserById,
  getUsersByIds,
  updateLastLogout,
  updatePassword
}