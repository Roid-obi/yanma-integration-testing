const express = require('express')
const router = express.Router()

// Controllers
const authController = require('../controllers/authController');
const akademikController = require('../controllers/akademikController');
const alumniController = require('../controllers/alumniController');
const trackingController = require('../controllers/trackingController');
const notificationController = require('../controllers/notificationController');
const auditLogController = require('../controllers/auditLogController');

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.get('/auth/user/:username', authController.getUserByUsername);

// --- Akademik Routes (TA & SKL) ---
router.post('/akademik/ta/submit', akademikController.submitTugasAkhir);
router.post('/akademik/skl/submit', akademikController.submitSKL);

// --- Alumni Routes (Legalisir) ---
router.post('/alumni/legalisir/create', alumniController.createLegalisir);
router.get('/alumni/legalisir/status/:kode', alumniController.getLegalisirStatus);

// --- Status Tracking Routes ---
router.post('/tracking/create', trackingController.createTracking);
router.put('/tracking/update', trackingController.updateTracking);
router.get('/tracking/:username', trackingController.getTrackingByUsername);

// --- Notification Routes ---
router.post('/notification/send', notificationController.sendNotification);
router.get('/notification/:username', notificationController.getNotificationByUsername);

// --- Audit Log Routes ---
router.post('/audit/log', auditLogController.logActivity);
router.get('/audit/logs/:actor', auditLogController.getLogsByActor);
router.get('/audit/failed/:actor', auditLogController.getFailedLogsByActor);

module.exports = router