 const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../../services/user.service');
const redis = require('../../config/RedisClient');
const smsService = require('../../services/sms.service');
const crypto = require('crypto');

function handlerGenerateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

};

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });


    const redisKey = `user:${user.userId}:refreshTokens`;
    await redis.sadd(redisKey, refreshToken);
    await redis.expire(redisKey, 7 * 24 * 60 * 60); // TTL 7 ngày

    return refreshToken;
};

exports.login = async (req, res) => {
    console.log(`Start login for: ${req.body.phoneNumber}`);
    const { phoneNumber, password } = req.body;
    const account = await userService.findByPhoneNumber(phoneNumber);

    if (!account) {
        return res.status(401).json({ message: 'Số điện thoại chưa được đăng ký.' });
    }
    if (bcrypt.compareSync(password, account.password)) {
        const roles = account.roles.map(role => role);
        const payload = { sub: account.phoneNumber, userId: account.user.id, roles };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        console.log(`End login for: ${req.body.phoneNumber}`);

        return res.json({
            status: 200,
            data: { accessToken, refreshToken },
            message: "Đăng nhập thành công."
        });
    } else {
        console.log(`Error login for: ${req.body.phoneNumber}`);
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }
};

exports.verifyToken = (req, res) => {
    return res.json({
        status: 200,
        data: "ok",
        message: "Token hợp lệ."
    });
};

exports.logout = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];

    if (!refreshToken) return res.sendStatus(400);

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const redisKey = `user:${decoded.userId}:refreshTokens`;

        await redis.srem(redisKey, refreshToken); // Xóa token cụ thể ra khỏi Redis
        await userService.updateLastLogout(decoded.userId);

        return res.json({
            status: 200,
            data: null,
            message: "Đăng xuất thành công."
        });
    } catch (err) {
        return res.status(403).json({ message: 'Token không hợp lệ.' });
    }
};


exports.refreshToken = async (req, res) => {

    const { token } = req.body;
    console.log(`Refresh token: ${token}`);
    if (!token) return res.sendStatus(403);

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        console.log(`Decoded refresh token: ${JSON.stringify(decoded)}`);
        const redisKey = `user:${decoded.userId}:refreshTokens`;

        const exists = await redis.sismember(redisKey, token);
        console.log(`Token exists in Redis: ${exists}`);
        if (!exists) return res.sendStatus(403);

        const newAccessToken = generateAccessToken({
            sub: decoded.sub,
            userId: decoded.userId,
            roles: decoded.roles
        });

        return res.json({
            status: 200,
            data: newAccessToken,
            message: "Access token mới."
        });
    } catch (err) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};


exports.register = async (req, res) => {
    console.log(`Start register for username: ${req.body.phoneNumber}`);
    const userRegister = req.body;

    const existingUser = await userService.findByPhoneNumber(userRegister.phoneNumber);
    if (existingUser) {
        return res.status(400).json({
            status: 400,
            message: "Số điện thoại đã được đăng ký.",
            data: null
        });
    }

    if (userRegister.password !== userRegister.rePassword) {
        return res.status(400).json({
            status: 400,
            message: "Mật khẩu không khớp.",
            data: null
        });
    }

    const newUser = await userService.register(userRegister);

    return res.json({
        status: 200,
        data: newUser,
        message: "Đăng ký thành công."
    })
};


exports.generateOtp = async (req, res) => {
    let { phoneNumber } = req.query;

    // Kiểm tra số điện thoại đã có otp trong Redis chưa
    const existingOtp = await redis.get(phoneNumber);
    if (existingOtp) {
        return res.status(400).json({
            status: 400,
            message: "Đã có OTP được gửi đến số điện thoại này.",
            data: null
        });
    }

    // Tạo OTP ngẫu nhiên
    const otp = handlerGenerateOTP();
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    // Lưu OTP vào Redis với thời gian sống là 1 phút
    await redis.set(phoneNumber, otp, 'EX', 60);
    // Nếu bắt đầu  là 0 thì -> +84

    if (phoneNumber.startsWith('0')) {
        phoneNumber = '+84' + phoneNumber.substring(1);
    }

    // Gửi OTP qua SMS (giả sử bạn đã có hàm gửi SMS)
    const smsSent = await smsService.sendOtp(phoneNumber, otp);
    // const smsSent = true; // Giả lập gửi SMS thành công
    if (!smsSent) {
        return res.status(500).json({
            status: 500,
            message: "Gửi OTP thất bại.",
            data: null
        });
    }

    return res.json({
        status: 200,
        message: "Gửi OTP thành công.",
        data: null
    })
}

exports.verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.query;

    // Kiểm tra OTP trong Redis
    const storedOtp = await redis.get(phoneNumber);
    if (!storedOtp) {
        return res.status(400).json({
            status: 400,
            message: "OTP không hợp lệ hoặc đã hết hạn.",
            data: null
        });
    }

    if (storedOtp !== otp) {
        return res.status(400).json({
            status: 400,
            message: "OTP không chính xác.",
            data: null
        });
    }

    // Xóa OTP khỏi Redis sau khi xác thực thành công
    await redis.del(phoneNumber);

    return res.json({
        status: 200,
        message: "Xác thực OTP thành công.",
        data: null
    })
}

exports.changePassword = async (req, res) => {
    const { phoneNumber, oldPassword, newPassword } = req.body;

    const account = await userService.findByPhoneNumber(phoneNumber);
    // Kiểm tra tài khoản có tồn tại không
    if (!account) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    // Kiểm tra mật khẩu cũ
    if (!bcrypt.compareSync(oldPassword, account.password)) {
        return res.status(401).json({ message: 'Mật khẩu cũ không đúng.' });
    }

    // Kiểm tra mật khẩu trùng
    if (bcrypt.compareSync(newPassword, account.password)) {
        return res.status(401).json({ message: 'Mật khẩu mới trùng với mật khẩu cũ.' });
    }

    const hashedPassword = await bcrypt.hashSync(newPassword, 10);
    await userService.updatePassword(account.id, hashedPassword);

    return res.json({
        status: 200,
        data: null,
        message: "Đổi mật khẩu thành công."
    })
}

exports.checkPassword = async (req, res) => {
    const { phoneNumber, password } = req.body;

    const account = await userService.findByPhoneNumber(phoneNumber);
    console.log('phoneNumber: ', phoneNumber);
    console.log('password: ', password);

    
    // Kiểm tra tài khoản có tồn tại không
    if (!account) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    // Kiểm tra mật khẩu cũ
    if (!bcrypt.compareSync(password, account.password)) {
        return res.status(401).json({ message: 'Mật khẩu cũ không đúng.' });
    }

    return res.json({
        status: 200,
        data: null,
        message: "Mật khẩu chính xác."
    })
}


exports.forgotPassword = async (req, res) => {
    const { phoneNumber, passwordNew } = req.body;

    // Kiểm tra tài khoản có tồn tại không
    const account = await userService.findByPhoneNumber(phoneNumber);
    if (!account) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }

    // Tạo mật khẩu mới
    const hashedPassword = await bcrypt.hashSync(passwordNew, 10);
    await userService.updatePassword(account.id, hashedPassword);

    return res.json({
        status: 200,
        data: null,
        message: "Cập nhật mật khẩu thành công."
    })
}