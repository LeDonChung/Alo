const { DynamoDBClient, DescribeTableCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Cấu hình DynamoDBClient
const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Hàm kiểm tra sự tồn tại của bảng và tạo bảng nếu chưa có
const createTableIfNotExists = async (params, createParams) => {
  try {
    // Kiểm tra xem bảng đã tồn tại chưa
    await dynamoDB.send(new DescribeTableCommand(params));
    console.log(`Table '${params.TableName}' already exists.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      // Nếu bảng không tồn tại, tạo bảng
      try {
        await dynamoDB.send(new CreateTableCommand(createParams));
        console.log(`Created table '${createParams.TableName}'.`);
      } catch (createError) {
        console.error(`Error creating table '${createParams.TableName}':`, JSON.stringify(createError, null, 2));
      }
    } else {
      console.error("Error describing table. Error:", JSON.stringify(err, null, 2));
    }
  }
};


// Tạo bảng Roles
const createRolesTable = async () => {
  const params = {
    TableName: 'Roles',
  };

  const createParams = {
    TableName: 'Roles',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' } 
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Users
const createUsersTable = async () => {
  const params = {
    TableName: 'Users',
  };

  const createParams = {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }  // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }, // String type for userId
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Friends
const createFriendsTable = async () => {
  const params = {
    TableName: 'Friends',
  };

  const createParams = {
    TableName: 'Friends',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },  // Partition key
      { AttributeName: 'friendId', KeyType: 'RANGE' } // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'friendId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Accounts
const createAccountsTable = async () => {
  const params = {
    TableName: 'Accounts',
  };

  const createParams = {
    TableName: 'Accounts',
    KeySchema: [
      { AttributeName: 'accountId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'accountId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Conversations
const createConversationsTable = async () => {
  const params = {
    TableName: 'Conversations',
  };

  const createParams = {
    TableName: 'Conversations',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Messages
const createMessagesTable = async () => {
  const params = {
    TableName: 'Messages',
  };

  const createParams = {
    TableName: 'Messages',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng VideoCalls
const createVideoCallsTable = async () => {
  const params = {
    TableName: 'VideoCalls',
  };

  const createParams = {
    TableName: 'VideoCalls',
    KeySchema: [
      { AttributeName: 'callId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'callId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Tạo bảng Privacy
const createPrivacyTable = async () => {
  const params = {
    TableName: 'Privacy',
  };

  const createParams = {
    TableName: 'Privacy',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    }
  };

  await createTableIfNotExists(params, createParams);
};

// Gọi tất cả các hàm tạo bảng
exports.createAllTables = async () => {
  await createUsersTable();
  await createFriendsTable();
  await createAccountsTable();
  await createConversationsTable();
  await createMessagesTable();
  await createVideoCallsTable();
  await createPrivacyTable();
  await createRolesTable();
};
