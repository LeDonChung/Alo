// config.js
const AWS = require("aws-sdk");
require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_REGION,
  apiVersion: 'latest',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})
const client = new AWS.DynamoDB.DocumentClient();
module.exports = { client };
