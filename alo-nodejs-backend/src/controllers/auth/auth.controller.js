const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../../services/user.service');
const redis = require('../../config/RedisClient');
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async(user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    
    await redis.set(refreshToken, user.sub);
    return refreshToken;
};

exports.login = async (req, res) => {
    console.log(`Start login for: ${req.body.phoneNumber}`);

    const { phoneNumber, password } = req.body;
    const user = await userService.findByPhoneNumber(phoneNumber);
    
    if (user && bcrypt.compareSync(password, user.password)) {
        const roles = user.roles.map(role => role);
        const payload = { sub: user.phoneNumber, roles: roles };

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

exports.refreshToken = async(req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);

    // Kiểm tra xem refresh token có tồn tại trong Redis không
    const user = await redis.get(token);

    if (!user) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, token) => {
        if (err) return res.sendStatus(403);

        const refreshToken = generateAccessToken({ sub: token.sub, roles: token.roles });
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

    const existingUser = await userService.existingUser(userRegister.phoneNumber);
    console.log("Existing user:", existingUser);
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
