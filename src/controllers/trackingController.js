const sendResponse = require('../helpers/responseFormat');
const { StatusTracking } = require('../db/schemas');

// POST /tracking/create
exports.createTracking = async (req, res) => {
    try {
        const { username, tipeAjuan } = req.body;
        const newTracking = new StatusTracking({ username, tipeAjuan });
        await newTracking.save();
        sendResponse(res, true, "Tracking status berhasil dibuat", { trackingId: newTracking._id }, 201);
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// PUT /tracking/update
exports.updateTracking = async (req, res) => {
    try {
        const { trackingId, newStatus, progress } = req.body;
        const tracking = await StatusTracking.findById(trackingId);
        if (!tracking) return sendResponse(res, false, "Tracking ID tidak ditemukan");

        tracking.status = newStatus;
        tracking.lastUpdate = Date.now();
        if (progress !== undefined) tracking.progress = progress;
        tracking.timeline.push({ status: newStatus, progress });

        await tracking.save();
        sendResponse(res, true, "Status berhasil diperbarui", { currentStatus: newStatus, progress: tracking.progress });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /tracking/:username
exports.getTrackingByUsername = async (req, res) => {
    try {
        const tracking = await StatusTracking.find({ username: req.params.username });
        sendResponse(res, true, "Tracking status berhasil diambil", { tracking });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
