const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    nama: { type: String, required: true },
    nim: { type: String },
    lulus: { type: Boolean, default: false }
});

const TugasAkhirSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nama: { type: String, required: true },
    nim: { type: String, required: true },
    status: { type: String, default: 'Menunggu Verifikasi' },
    filePath: { type: String }
});

const SKLSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nama: { type: String, required: true },
    nim: { type: String, required: true },
    status: { type: String, default: 'Menunggu Verifikasi' },
    filePath: { type: String }
});

const LegalisirSchema = new mongoose.Schema({
    username: { type: String, required: true },
    nama: { type: String, required: true },
    nim: { type: String, required: true },
    nomorAntrian: { type: Number, required: true },
    kode: { type: String, required: true, unique: true },
    status: { type: String, default: 'Diproses' }
});

const StatusTrackingSchema = new mongoose.Schema({
    username: { type: String, required: true },
    tipeAjuan: { type: String, required: true },
    status: { type: String, default: 'Menunggu Verifikasi' },
    submissionDate: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        progress: Number
    }]
});

const AuditLogSchema = new mongoose.Schema({
    actor: { type: String, required: true },
    action: { type: String, required: true },
    targetModule: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    status: { type: String, default: 'SUCCESS' }
});

const NotificationSchema = new mongoose.Schema({
    username: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    readDate: { type: Date },
    isRead: { type: Boolean, default: false }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    TugasAkhir: mongoose.model('TugasAkhir', TugasAkhirSchema),
    SKL: mongoose.model('SKL', SKLSchema),
    Legalisir: mongoose.model('Legalisir', LegalisirSchema),
    StatusTracking: mongoose.model('StatusTracking', StatusTrackingSchema),
    AuditLog: mongoose.model('AuditLog', AuditLogSchema),
    Notification: mongoose.model('Notification', NotificationSchema)
};

