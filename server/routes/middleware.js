const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // 1) Get token and check if it exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // 2) Verification token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload'
            });
        }

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Invalid token or session expired'
        });
    }
};
