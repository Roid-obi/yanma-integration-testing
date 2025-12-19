const mongoose = require('mongoose');
const { User, TugasAkhir, SKL, Legalisir, StatusTracking, AuditLog, Notification } = require('./schemas');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yanma_integration');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clear existing data
        await User.deleteMany({});
        await TugasAkhir.deleteMany({});
        await SKL.deleteMany({});
        await Legalisir.deleteMany({});
        await StatusTracking.deleteMany({});
        await AuditLog.deleteMany({});
        await Notification.deleteMany({});
        console.log('Existing data cleared.');

        // Create Users
        const users = [
            { username: "mahasiswa", password: "123", role: "mahasiswa", nama: "Budi", lulus: false },
            { username: "mahasiswa2", password: "123", role: "mahasiswa", nama: "Siti", lulus: false },
            { username: "alumni", password: "123", role: "alumni", nama: "Andi", lulus: true },
            { username: "alumni2", password: "123", role: "alumni", nama: "Joko", lulus: true },
            { username: "admin", password: "admin", role: "admin", nama: "Admin01" },
            { username: "Farhan", password: "123", role: "mahasiswa", nama: "Farhan", nim: "123", lulus: false }
        ];
        await User.insertMany(users);
        console.log('Users seeded.');

        // Create Tugas Akhir
        const taData = [
            { username: "Farhan", nama: "Farhan", nim: "123", status: "Menunggu Verifikasi" },
            { username: "mahasiswa2", nama: "Siti", nim: "456", status: "Disetujui", filePath: "public/pengesahan/pengesahan_mahasiswa.pdf" }
        ];
        await TugasAkhir.insertMany(taData);
        console.log('Tugas Akhir seeded.');

        // Create SKL
        const sklData = [
            { username: "Farhan", nama: "Farhan", nim: "123", status: "Menunggu Verifikasi" },
            { username: "alumni", nama: "Andi", nim: "789", status: "Disetujui", filePath: "public/skl/skl_alumni.pdf" }
        ];
        await SKL.insertMany(sklData);
        console.log('SKL seeded.');

        // Create Legalisir
        const legalisirData = [
            { username: "alumni", nama: "Andi", nim: "789", nomorAntrian: 101, kode: "LG101", status: "Diproses" }
        ];
        await Legalisir.insertMany(legalisirData);
        console.log('Legalisir seeded.');

        // Create Status Tracking
        const trackingData = [
            {
                username: "Farhan",
                tipeAjuan: "Pengesahan TA",
                status: "Menunggu Verifikasi",
                progress: 20,
                timeline: [{ status: "Menunggu Verifikasi", progress: 20 }]
            }
        ];
        await StatusTracking.insertMany(trackingData);
        console.log('Status Tracking seeded.');

        // Create Notifications
        const notifData = [
            { username: "Farhan", type: "status_update", title: "Status Update", message: "Pengajuan TA Anda sedang diproses." }
        ];
        await Notification.insertMany(notifData);
        console.log('Notifications seeded.');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();

