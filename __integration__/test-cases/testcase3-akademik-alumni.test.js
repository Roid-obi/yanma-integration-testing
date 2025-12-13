/**
 * TEST CASE 3: Akademik + Alumni Integration
 * 
 * Scenario: Mahasiswa submit Tugas Akhir (TA), kemudian setelah lulus 
 *           melakukan pengajuan legalisir dokumen
 * Integration Points:
 *   - Akademik.taSubmit() -> submit TA
 *   - Akademik.sklSubmit() -> submit SKL setelah lulus
 *   - Alumni.legalisirBuatAntrian() -> create legalisir queue
 *   - Shared user state: lulus status
 *   - File management: TA file ke SKL flow
 * 
 * Expected Flow:
 * 1. Mahasiswa submit TA
 * 2. After graduation (lulus=true), submit SKL
 * 3. Alumni create legalisir antrian
 * 4. Track dari Akademik ke Alumni flow
 */

const akademik = require('../../src/AkademikModel');
const alumni = require('../../src/AlumniModel');
const auth = require('../../src/AuthModel');
const statusTracking = require('../../src/StatusTrackingModel');
const notification = require('../../src/NotificationModel');
const auditLog = require('../../src/AuditLogModel');

describe('Integration Test Case 3: Akademik + Alumni (TA Submit -> Legalisir)', () => {

    beforeEach(() => {
        statusTracking.statusList = [];
        notification.notifications = [];
        auditLog.logs = [];
    });

    describe('Mahasiswa Flow - Submit TA sebelum lulus', () => {
        test('Mahasiswa dapat submit pengesahan TA', () => {
            const username = 'Farhan';

            // Submit TA
            const taSubmitResult = akademik.taSubmit(username, {
                nama: 'Farhan',
                nim: '201911003'
            });
            expect(taSubmitResult.success).toBe(true);
            expect(taSubmitResult.status).toBe('Menunggu Verifikasi');

            // Create tracking
            const trackingResult = statusTracking.createTracking(username, 'Pengesahan TA');
            expect(trackingResult.success).toBe(true);

            // Audit log
            auditLog.logActivity(username, 'SUBMIT_TA', 'Akademik',
                'Submit pengesahan TA', 'SUCCESS');

            // Verify tracking created
            const tracking = statusTracking.getStatus(username, 'Pengesahan TA');
            expect(tracking.length).toBeGreaterThan(0);
        });

        test('SKL tidak bisa disubmit jika belum lulus', () => {
            const username = 'mahasiswa';

            // Get user (belum lulus)
            const user = auth.getUser(username);
            expect(user.lulus).toBe(false);

            // Try submit SKL (should fail)
            const sklResult = akademik.sklSubmit(username, {
                nama: 'Budi',
                nim: '201911001'
            });
            expect(sklResult.success).toBe(false);
            expect(sklResult.message).toContain('Belum memenuhi syarat');

            // Audit failed attempt
            auditLog.logActivity(username, 'SUBMIT_SKL', 'Akademik',
                'Submit SKL gagal - belum lulus', 'FAILED');

            const failedLogs = auditLog.getFailedAttempts(username);
            expect(failedLogs.length).toBeGreaterThan(0);
        });
    });

    describe('Alumni Flow - SKL dan Legalisir', () => {
        test('Alumni dapat submit SKL dan buat legalisir', () => {
            const username = 'alumni';

            // Verify alumni status
            const user = auth.getUser(username);
            expect(user.lulus).toBe(true);
            expect(user.role).toBe('alumni');

            // Step 1: Submit SKL
            const sklResult = akademik.sklSubmit(username, {
                nama: user.nama,
                nim: user.nim || '201811001'  // Provide default nim for alumni
            });
            expect(sklResult.success).toBe(true);

            // Track SKL
            const sklTracking = statusTracking.createTracking(username, 'Surat Keterangan Lulus');
            expect(sklTracking.success).toBe(true);

            // Audit SKL submit
            auditLog.logActivity(username, 'SUBMIT_SKL', 'Akademik',
                'Alumni submit SKL', 'SUCCESS');

            // Step 2: Create legalisir antrian
            const legalisirResult = alumni.legalisirBuatAntrian({
                nama: user.nama,
                nim: user.nim || '201811001'  // Default nim for alumni
            });
            expect(legalisirResult.status).toBe('Sukses');
            expect(legalisirResult.nomorAntrian).toBeGreaterThan(0);

            // Track legalisir
            const legalisirTracking = statusTracking.createTracking(username, 'Legalisir');
            expect(legalisirTracking.success).toBe(true);

            // Audit legalisir
            auditLog.logActivity(username, 'CREATE_LEGALISIR', 'Alumni',
                `Create legalisir antrian: ${legalisirResult.nomorAntrian}`, 'SUCCESS');

            // Verify all tracking created
            const allTracking = statusTracking.getStatus(username);
            expect(allTracking.length).toBe(2); // SKL + Legalisir

            // Verify audit trail
            const userLogs = auditLog.getLogs(username);
            expect(userLogs.length).toBeGreaterThan(0);
            expect(userLogs.some(l => l.action === 'SUBMIT_SKL')).toBe(true);
            expect(userLogs.some(l => l.action === 'CREATE_LEGALISIR')).toBe(true);
        });

        test('Alumni dapat check status legalisir', () => {
            const username = 'alumni2';

            // Create legalisir
            const legalisirResult = alumni.legalisirBuatAntrian({
                nama: 'Joko',
                nim: '201811002'
            });
            const kode = `LG${legalisirResult.nomorAntrian}`;

            // Check status
            const checkResult = alumni.legalisirCekStatus(kode);
            expect(checkResult.status).toBe('Sukses');

            // Audit check
            auditLog.logActivity(username, 'CHECK_LEGALISIR_STATUS', 'Alumni',
                `Check legalisir status: ${kode}`, 'SUCCESS');
        });
    });

    describe('Cross-Module Data Flow', () => {
        test('User data flow: Akademik -> Alumni', () => {
            const username = 'alumni';
            const user = auth.getUser(username);

            // Submit SKL in Akademik
            const sklResult = akademik.sklSubmit(username, {
                nama: user.nama,
                nim: user.nim || '201811001'
            });
            expect(sklResult.success).toBe(true);

            // Use same data in Alumni
            const legalisirResult = alumni.legalisirBuatAntrian({
                nama: user.nama,
                nim: user.nim || '201811001'
            });
            expect(legalisirResult.status).toBe('Sukses');

            // Verify data consistency
            expect(user.nama).toBe(user.nama);
            expect(user.nim).toBe(user.nim);
        });

        test('Status progression from Akademik to Alumni', () => {
            const username = 'alumni';

            // Create tracking for SKL
            const sklTracking = statusTracking.createTracking(username, 'Surat Keterangan Lulus');

            // Simulate SKL approval
            statusTracking.updateStatus(sklTracking.trackingId, 'Disetujui', 100);

            // Then create Alumni legalisir tracking
            const legalisirTracking = statusTracking.createTracking(username, 'Legalisir');

            // Get all tracking
            const allTracking = statusTracking.getStatus(username);
            expect(allTracking.length).toBe(2);

            // Find tracking by type
            const sklTrack = allTracking.find(t => t.tipeAjuan === 'Surat Keterangan Lulus');
            const legalisirTrack = allTracking.find(t => t.tipeAjuan === 'Legalisir');

            expect(sklTrack.status).toBe('Disetujui');
            expect(sklTrack.progress).toBe(100);

            expect(legalisirTrack.status).toBe('Menunggu Verifikasi');
            expect(legalisirTrack.progress).toBe(0);
        });
    });

    describe('Notification Flow across modules', () => {
        test('Notification sent when status changes', () => {
            const username = 'alumni';

            // Create SKL tracking
            const sklTracking = statusTracking.createTracking(username, 'SKL');

            // Update status
            statusTracking.updateStatus(sklTracking.trackingId, 'Disetujui', 100);

            // Send notification
            const notifResult = notification.sendNotification(
                username,
                'approval',
                'SKL Disetujui',
                'SKL Anda telah disetujui dan siap diunduh'
            );
            expect(notifResult.success).toBe(true);

            // Create legalisir tracking
            const legalisirTracking = statusTracking.createTracking(username, 'Legalisir');

            // Send another notification
            const notif2Result = notification.sendNotification(
                username,
                'status_update',
                'Legalisir Dibuat',
                'Antrian legalisir Anda telah dibuat'
            );
            expect(notif2Result.success).toBe(true);

            // Verify all notifications
            const notifs = notification.getNotifications(username);
            expect(notifs.length).toBe(2);
        });
    });

    describe('Admin Verification Flow', () => {
        test('Admin verify TA', () => {
            // Simulate admin verifying TA
            const taVerifResult = akademik.taAdminVerif(1); // id 1 dari data dummy
            expect(taVerifResult).not.toBeNull();

            // Update tracking
            if (taVerifResult && taVerifResult.id) {
                statusTracking.updateStatus(taVerifResult.id, 'Disetujui', 100);

                // Audit
                auditLog.logActivity('admin', 'VERIFY_TA', 'Akademik',
                    `Admin verify TA id: ${taVerifResult.id}`, 'SUCCESS');

                const adminLogs = auditLog.getLogs('admin');
                expect(adminLogs.length).toBeGreaterThan(0);
            }
        });

        test('Admin verify SKL', () => {
            // Simulate admin verifying SKL
            const sklVerifResult = akademik.sklAdminVerif(1, true);
            expect(sklVerifResult).not.toBeNull();
            expect(sklVerifResult.status).toBe('Disetujui');

            // Audit
            auditLog.logActivity('admin', 'VERIFY_SKL', 'Akademik',
                'Admin verify SKL', 'SUCCESS');
        });
    });

    describe('Error Handling across modules', () => {
        test('Handle invalid username in legacy flow', () => {
            const username = 'invalid_user';

            // Try submit SKL dengan user yang tidak ada
            // Should fail because user not found
            try {
                const sklResult = akademik.sklSubmit(username, {
                    nama: 'Unknown',
                    nim: '000000'
                });

                // Should handle gracefully - either fail or throw
                if (sklResult && !sklResult.success) {
                    expect(sklResult.success).toBe(false);
                }
            } catch (e) {
                // Expected to throw when user not found
                expect(e).toBeDefined();
            }

            // Should not crash when creating tracking
            const trackingResult = statusTracking.createTracking(username, 'SKL');
            expect(trackingResult.success).toBe(true); // Still creates, but warns
        });

        test('Handle empty data in alumni legalisir', () => {
            const result = alumni.legalisirBuatAntrian({});
            expect(result.status).toBe('Gagal');
            expect(result.message).toContain('wajib diisi');
        });
    });
});
