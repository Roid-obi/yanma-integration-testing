const sendResponse = require('../helpers/responseFormat');
const { Notification } = require('../db/schemas');

// POST /notification/send
exports.sendNotification = async (req, res) => {
    try {
        const { username, type, title, message } = req.body;
        const newNotif = new Notification({ username, type, title, message });
        await newNotif.save();
        sendResponse(res, true, "Notifikasi berhasil dikirim", { notificationId: newNotif._id });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /notification/:username
exports.getNotificationByUsername = async (req, res) => {
    try {
        const notifs = await Notification.find({ username: req.params.username }).sort({ createdDate: -1 });
        sendResponse(res, true, "Notifikasi berhasil diambil", { notifications: notifs });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
