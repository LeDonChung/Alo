
const userService = require('../../services/user.service');
exports.sendFriendRequest = async (req, res) => {


}

exports.getHello = async (req, res) => {
    return res.json({
        status: 200,
        data: "Hello",
        message: "Hello"
    })
}


exports.uploadData = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const imageUrl = await userService.uploadImage(file);

    if (!imageUrl) {
        return res.status(500).json({ error: 'Upload image failed.' });
    }

    return res.json({
        status: 200,
        data: imageUrl,
        message: "Upload image successfully"
    })
}


exports.uploadAvatar = async (req, res) => {
    // Lấy Authorization từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // Lấy userId từ token
    const userId = userService.getUserIdFromToken(token);

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const imageUrl = await userService.uploadAvatar(userId, file);

    if (!imageUrl) {
        return res.status(500).json({ error: 'Upload image failed.' });
    }

    return res.json({
        status: 200,
        data: imageUrl,
        message: "Upload image successfully"
    })
}

exports.uploadBackground = async (req, res) => {
    // Lấy Authorization từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // Lấy userId từ token
    const userId = userService.getUserIdFromToken(token);

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const imageUrl = await userService.uploadBackground(userId, file);

    if (!imageUrl) {
        return res.status(500).json({ error: 'Upload image failed.' });
    }

    return res.json({
        status: 200,
        data: imageUrl,
        message: "Upload image successfully"
    })
}


