const sendResponse = require('../helpers/responseFormat');
const { AuditLog } = require('../db/schemas');


// POST /audit/log
exports.logActivity = async (req, res) => {
    try {
        const { actor, action, targetModule, details, status } = req.body;
        const newLog = new AuditLog({ actor, action, targetModule, details, status });
        await newLog.save();
        sendResponse(res, true, "Aktivitas berhasil dicatat", { logId: newLog._id }, 201);
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /audit/logs/:actor
exports.getLogsByActor = async (req, res) => {
    try {
        const logs = await AuditLog.find({ actor: req.params.actor }).sort({ timestamp: -1 });
        sendResponse(res, true, "Logs berhasil diambil", { logs });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /audit/failed/:actor
exports.getFailedLogsByActor = async (req, res) => {
    try {
        const logs = await AuditLog.find({ actor: req.params.actor, status: 'FAILED' });
        sendResponse(res, true, "Logs gagal diambil", { logs });
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
