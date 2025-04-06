const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../../services/user.service');
const redis = require('../../config/RedisClient');
const smsService = require('../../services/sms.service');
const crypto = require('crypto');

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = async(user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    
    await redis.set(refreshToken, user.sub);
    return refreshToken;
};

exports.login = async (req, res) => {
    console.log(`Start login for: ${req.body.phoneNumber}`);

    const { phoneNumber, password } = req.body;
    const account = await userService.findByPhoneNumber(phoneNumber);
    if (account && bcrypt.compareSync(password, account.password)) {
        const roles = account.roles.map(role => role);
        const payload = { sub: account.phoneNumber, userId: account.user.id, roles: roles };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        
        console.log(`End login for: ${req.body.phoneNumber}`);

        return res.json({
            status: 200,
            data: { accessToken, refreshToken },
            message: "Đăng nhập thành công."
        })

    } else {
        console.log(`Error login for: ${req.body.phoneNumber}`);
        return res.status(401).json({ message: 'Yêu cầu không hợp lệ.' });
    }
};

exports.logout = async(req, res) => {
    // Lấy Authorization từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // Lấy userId từ token
    const userId = userService.getUserIdFromToken(token);

    // Xóa refresh token trong Redis
    await redis.del(token);

    // cập nhật lastLogout cho user
    await userService.updateLastLogout(userId);

    return res.json({
        status: 200,
        data: null,
        message: "Đăng xuất thành công."
    })

};

exports.refreshToken = async(req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);

    // Kiểm tra xem refresh token có tồn tại trong Redis không
    const user = await redis.get(token);

    if (!user) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, token) => {
        if (err) return res.sendStatus(403);

        const refreshToken = generateAccessToken({ sub: token.sub, userId: user.id, roles: token.roles });
        return res.json({
            status: 200,
            data: refreshToken ,
            message: "Access token mới."
        })
    });
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

    if(userRegister.password !== userRegister.rePassword) {
        return res.status(400).json({
            status: 400,
            message: "Mật khẩu không khớp.",
            data: null
        });
    }

    const newUser = await userService.register(userRegister);

    return res.json({
        status: 200,
        data: newUser ,
        message: "Đăng ký thành công."
    })
};


exports.generateOtp = async (req, res) => {
    const { phoneNumber } = req.query;

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
    const otp = generateOTP();
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    // Lưu OTP vào Redis với thời gian sống là 1 phút
    await redis.set(phoneNumber, otp, 'EX', 60);

    // Gửi OTP qua SMS (giả sử bạn đã có hàm gửi SMS)
    const smsSent = await smsService.sendOtp(phoneNumber, otp);
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

    const hashedPassword = await bcrypt.hashSync(newPassword, 10);
    await userService.updatePassword(account.id, hashedPassword);

    return res.json({
        status: 200,
        data: null,
        message: "Đổi mật khẩu thành công."
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