const sendResponse = require('../helpers/responseFormat');
const { User } = require('../db/schemas');

// POST /auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            sendResponse(res, true, "Login Berhasil", { role: user.role, user });
        } else {
            sendResponse(res, false, "Username atau password salah");
        }
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /auth/user/:username
exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -__v -_id');
        if (!user) {
            return sendResponse(res, false, "User tidak ditemukan");
        }
        sendResponse(res, true, "User ditemukan", { user });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
