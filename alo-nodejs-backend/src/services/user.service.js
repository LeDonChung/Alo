const { QueryCommand, PutItemCommand, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
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
    const data = await client.send(new ScanCommand(params));
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
      'accountId': { S: uuidv4() },
      'phoneNumber': { S: userRegister.phoneNumber },
      'password': { S: hashedPassword },
      'roles': { SS: ['USER'] }
    }
  };


  try {
    await client.send(new PutItemCommand(paramsAccount));

    const paramsUser = {
      TableName: 'Users',
      Item: {
        'id': { S: uuidv4() },
        'fullName': { S: userRegister.fullName },
        'accountId': { S: paramsAccount.Item.accountId.S },
        'createdAt': { S: new Date().toISOString() }
      }
    };

    const result = await client.send(new PutItemCommand(paramsUser));

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
  const paramsAccount = {
    TableName: 'Accounts',
    FilterExpression: 'phoneNumber = :phoneNumber',
    ExpressionAttributeValues: {
      ':phoneNumber': { S: phoneNumber }
    }
  }

  try {
    const data = await client.send(new ScanCommand(paramsAccount));
    if (data.Items && data.Items.length > 0) {
      const account = data.Items[0];

      // Trả về thông tin User
      const paramsUser = {
        TableName: 'Users',
        Key: {
          'accountId': { S: account.accountId.S }
        }
      }

      const dataUser = await client.send(new ScanCommand(paramsUser));

      return new Account(
        account.accountId.S,
        account.phoneNumber.S,
        account.password.S,
        account.roles.SS,
        {
          id: dataUser.Items[0].id.S,
          fullName: dataUser.Items[0].fullName.S,
          accountId: account.accountId.S,
          createdAt: dataUser.Items[0].createdAt.S
        }
      );
    } else {
      return null;
    }
  } catch (err) {
    console.log(err)
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
        id: { S: userId },
      },
      UpdateExpression: 'set avatarLink = :avatarLink',
      ExpressionAttributeValues: {
        ':avatarLink': { S: result.Location },
      },
      ReturnValues: 'UPDATED_NEW',
    };
    console.log(paramsUpdate)

    await client.send(new UpdateItemCommand(paramsUpdate));

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
        id: { S: userId },
      },
      UpdateExpression: 'set backgroundLink = :backgroundLink',
      ExpressionAttributeValues: {
        ':backgroundLink': { S: result.Location },
      },
      ReturnValues: 'UPDATED_NEW',
    };
    console.log(paramsUpdate)

    await client.send(new UpdateItemCommand(paramsUpdate));

    return result.Location;
  } catch (err) {
    console.error("Error uploading image. Error:", err);
    return null;
  }
}
module.exports = {
  existingUser,
  register,
  findByPhoneNumber,
  uploadImage,
  getUserIdFromToken,
  uploadAvatar,
  uploadBackground
}