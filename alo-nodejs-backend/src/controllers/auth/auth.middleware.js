
/**
 * Định nghĩa các middleware xác thực và phân quyền
 * 
 */
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

exports.authorizeRoles = (roles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles;
        const hasRole = roles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};