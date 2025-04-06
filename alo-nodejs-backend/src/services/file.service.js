const {S3} = require('../config/S3');
require('dotenv').config();
const randomString = (numChar) => {
    return `${Math.random().toString(36).substring(2, numChar + 2)}`
}

const FILE_TYPE_MATCH = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/jfif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "text/plain",
    "video/mp4"
]

const uploadFile = async(file) => {
    console.log(file)
    const filePath = `${randomString(4)} - ${new Date().getTime()} - ${file?.originalname}`

    if(FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
        throw new Error("File not invalid")
    }



    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: file?.buffer,
        Key: filePath,
        ContentType: file.mimetype,
        ACL: 'public-read'
    }

    try {
        const data = await S3.upload(uploadParams).promise();
        return data.Location
    } catch(e) {
        console.log(e)
        throw new Error("Upload fail")
    }
}

module.exports = {
    uploadFile
}