/**
 * TEST CASE 5: Auth + Status Tracking Integration
 * 
 * Scenario: User login dan check semua status pengajuan mereka
 * Integration Points:
 *   - Auth.login() -> get user info
 *   - StatusTracking.getStatus() -> retrieve semua pengajuan user
 *   - Notification.getNotifications() -> show latest updates
 *   - AuditLog.getLogs() -> tracking history
 * 
 * Expected Flow:
 * 1. User login
 * 2. System load semua status pengajuan user
 * 3. Show pending, in-progress, dan completed applications
 * 4. Display notifications related to status changes
 * 5. Provide audit trail of all actions
 */

const auth = require('../../src/AuthModel');
const statusTracking = require('../../src/StatusTrackingModel');
const notification = require('../../src/NotificationModel');
const auditLog = require('../../src/AuditLogModel');

describe('Integration Test Case 5: Auth + Status Tracking Dashboard', () => {

    beforeEach(() => {
        statusTracking.statusList = [];
        notification.notifications = [];
        auditLog.logs = [];
    });

    describe('User Dashboard - Check Pengajuan Status', () => {
        test('User dapat login dan lihat dashboard dengan status pengajuan', () => {
            const username = 'mahasiswa';

            // Step 1: Login
            const loginResult = auth.login(username, '123');
            expect(loginResult.success).toBe(true);
            const user = loginResult.user;

            // Audit login
            auditLog.logActivity(username, 'LOGIN', 'Auth', 'Login berhasil', 'SUCCESS');

            // Step 2: Create multiple tracking untuk simulate pengajuan
            const tracking1 = statusTracking.createTracking(username, 'Perpanjangan Studi');
            const tracking2 = statusTracking.createTracking(username, 'Surat Pengantar');
            const tracking3 = statusTracking.createTracking(username, 'Pengesahan TA');

            // Step 3: Update different statuses
            statusTracking.updateStatus(tracking1.trackingId, 'Diverifikasi', 50);
            statusTracking.updateStatus(tracking2.trackingId, 'Disetujui', 100);
            statusTracking.updateStatus(tracking3.trackingId, 'Menunggu Verifikasi', 0);

            // Step 4: Send notifications
            notification.sendNotification(username, 'status_update', 'Perpanjangan Studi Sedang Diproses',
                'Pengajuan Anda sedang diverifikasi');
            notification.sendNotification(username, 'approval', 'Surat Pengantar Disetujui',
                'Surat Anda telah disetujui dan siap diunduh');

            // Step 5: Get dashboard data
            const userStatus = statusTracking.getStatus(username);
            const userNotifications = notification.getNotifications(username);
            const userLogs = auditLog.getLogs(username);

            // Verify dashboard
            expect(userStatus.length).toBe(3);
            expect(userNotifications.length).toBe(2);
            expect(userLogs.length).toBeGreaterThan(0);

            // Verify status breakdown
            const pending = userStatus.filter(s => s.status === 'Menunggu Verifikasi');
            const inProgress = userStatus.filter(s => s.status === 'Diverifikasi');
            const completed = userStatus.filter(s => s.status === 'Disetujui');

            expect(pending.length).toBe(1);
            expect(inProgress.length).toBe(1);
            expect(completed.length).toBe(1);

            // Audit dashboard access
            auditLog.logActivity(username, 'VIEW_DASHBOARD', 'StatusTracking',
                'User view dashboard dengan 3 pengajuan aktif', 'SUCCESS');
        });

        test('User dapat filter status berdasarkan tipe pengajuan', () => {
            const username = 'mahasiswa2';

            // Create multiple tracking
            const skl = statusTracking.createTracking(username, 'SKL');
            const legalisir = statusTracking.createTracking(username, 'Legalisir');
            const surat = statusTracking.createTracking(username, 'Surat Keterangan');

            // Update statuses
            statusTracking.updateStatus(skl.trackingId, 'Diproses', 75);
            statusTracking.updateStatus(legalisir.trackingId, 'Disetujui', 100);
            statusTracking.updateStatus(surat.trackingId, 'Menunggu Verifikasi', 0);

            // Get all
            const allStatus = statusTracking.getStatus(username);
            expect(allStatus.length).toBe(3);

            // Get specific type
            const sklOnly = statusTracking.getStatus(username, 'SKL');
            expect(sklOnly.length).toBe(1);
            expect(sklOnly[0].tipeAjuan).toBe('SKL');

            // Get legalisir only
            const legalisirOnly = statusTracking.getStatus(username, 'Legalisir');
            expect(legalisirOnly.length).toBe(1);
            expect(legalisirOnly[0].status).toBe('Disetujui');
        });
    });

    describe('Status Progress Tracking', () => {
        test('User dapat melihat progress percentage setiap pengajuan', () => {
            const username = 'Farhan';

            // Create tracking
            const tracking = statusTracking.createTracking(username, 'Pengesahan TA');

            // Initial progress
            let trackingData = statusTracking.getTrackingById(tracking.trackingId);
            expect(trackingData.progress).toBe(0);

            // Simulate progress updates
            statusTracking.updateStatus(tracking.trackingId, 'Diverifikasi', 25);
            trackingData = statusTracking.getTrackingById(tracking.trackingId);
            expect(trackingData.progress).toBe(25);

            statusTracking.updateStatus(tracking.trackingId, 'Diproses', 50);
            trackingData = statusTracking.getTrackingById(tracking.trackingId);
            expect(trackingData.progress).toBe(50);

            statusTracking.updateStatus(tracking.trackingId, 'Selesai Diproses', 75);
            trackingData = statusTracking.getTrackingById(tracking.trackingId);
            expect(trackingData.progress).toBe(75);

            statusTracking.updateStatus(tracking.trackingId, 'Disetujui', 100);
            trackingData = statusTracking.getTrackingById(tracking.trackingId);
            expect(trackingData.progress).toBe(100);

            // Verify timeline - includes initial state + 4 updates = 5 entries
            expect(trackingData.timeline.length).toBe(5);
        });

        test('User dapat melihat timeline updates', () => {
            const username = 'alumni';

            const tracking = statusTracking.createTracking(username, 'Legalisir');

            // Make multiple updates
            statusTracking.updateStatus(tracking.trackingId, 'Diproses', 50);
            statusTracking.updateStatus(tracking.trackingId, 'Selesai Diproses', 100);

            const trackingData = statusTracking.getTrackingById(tracking.trackingId);

            // Check timeline has all updates - includes initial state + 2 updates = 3 entries
            expect(trackingData.timeline.length).toBe(3);
            // Index 1 and 2 are the updates (index 0 is initial state)
            expect(trackingData.timeline[1].status).toBe('Diproses');
            expect(trackingData.timeline[1].progress).toBe(50);
            expect(trackingData.timeline[2].status).toBe('Selesai Diproses');
            expect(trackingData.timeline[2].progress).toBe(100);

            // Check timestamps
            trackingData.timeline.forEach(entry => {
                expect(entry.timestamp).toBeTruthy();
                expect(new Date(entry.timestamp)).toBeInstanceOf(Date);
            });
        });
    });

    describe('Notification Integration with Status', () => {
        test('Notification triggered ketika status berubah', () => {
            const username = 'mahasiswa';

            // Create tracking
            const tracking = statusTracking.createTracking(username, 'Pengajuan');

            // Initial status - no notification yet
            let notifs = notification.getNotifications(username, true);
            expect(notifs.length).toBe(0);

            // Update status - trigger notification
            statusTracking.updateStatus(tracking.trackingId, 'Diverifikasi', 50);

            notification.sendNotification(username, 'status_update', 'Pengajuan Sedang Diproses',
                'Pengajuan Anda sedang diverifikasi oleh admin');

            // Check notification
            notifs = notification.getNotifications(username, true);
            expect(notifs.length).toBe(1);
            expect(notifs[0].isRead).toBe(false);

            // Mark as read
            notification.markAsRead(notifs[0].id);

            // No more unread
            notifs = notification.getNotifications(username, true);
            expect(notifs.length).toBe(0);

            // But read notifications still exist
            const allNotifs = notification.getNotifications(username, false);
            expect(allNotifs.length).toBe(1);
        });

        test('Different notification types for different status', () => {
            const username = 'mahasiswa2';

            const tracking = statusTracking.createTracking(username, 'Berkas');

            // Status: Under review
            statusTracking.updateStatus(tracking.trackingId, 'Diverifikasi', 50);
            notification.sendNotification(username, 'status_update', 'Berkas Sedang Direviu',
                'Berkas Anda sedang dalam proses review');

            // Status: Approved
            statusTracking.updateStatus(tracking.trackingId, 'Disetujui', 100);
            notification.sendNotification(username, 'approval', 'Berkas Disetujui',
                'Berkas Anda telah disetujui!');

            // Status: Rejected
            notification.sendNotification(username, 'rejection', 'Berkas Ditolak',
                'Berkas Anda ditolak, silakan revisi dan submit kembali');

            const notifs = notification.getNotifications(username);
            expect(notifs.length).toBe(3);
            expect(notifs.some(n => n.type === 'status_update')).toBe(true);
            expect(notifs.some(n => n.type === 'approval')).toBe(true);
            expect(notifs.some(n => n.type === 'rejection')).toBe(true);
        });
    });

    describe('Audit Trail Integration', () => {
        test('Complete audit trail untuk user activity', () => {
            const username = 'mahasiswa';

            // Step 1: Login
            auth.login(username, '123');
            auditLog.logActivity(username, 'LOGIN', 'Auth', 'Login berhasil', 'SUCCESS');

            // Step 2: View dashboard
            const tracking = statusTracking.createTracking(username, 'Pengajuan');
            auditLog.logActivity(username, 'VIEW_DASHBOARD', 'StatusTracking',
                'View dashboard dengan tracking ID: ' + tracking.trackingId, 'SUCCESS');

            // Step 3: Update status
            statusTracking.updateStatus(tracking.trackingId, 'Diverifikasi', 50);
            auditLog.logActivity(username, 'CHECK_STATUS', 'StatusTracking',
                'Check status update untuk pengajuan', 'SUCCESS');

            // Step 4: View notification
            notification.sendNotification(username, 'status_update', 'Status Update',
                'Pengajuan sedang diproses');
            auditLog.logActivity(username, 'VIEW_NOTIFICATION', 'Notification',
                'View notification', 'SUCCESS');

            // Get complete audit trail
            const userLogs = auditLog.getLogs(username);

            expect(userLogs.length).toBeGreaterThan(0);
            expect(userLogs.some(l => l.action === 'LOGIN')).toBe(true);
            expect(userLogs.some(l => l.action === 'VIEW_DASHBOARD')).toBe(true);
            expect(userLogs.some(l => l.action === 'CHECK_STATUS')).toBe(true);
            expect(userLogs.some(l => l.action === 'VIEW_NOTIFICATION')).toBe(true);
        });

        test('Audit trail shows all failed attempts', () => {
            const username = 'mahasiswa';

            // Simulate failed login attempts
            auth.login(username, 'wrong-password');
            auditLog.logActivity(username, 'LOGIN', 'Auth', 'Login gagal - password salah', 'FAILED');

            // Try check status with invalid tracking ID
            const trackingData = statusTracking.getTrackingById(99999);
            if (!trackingData) {
                auditLog.logActivity(username, 'CHECK_STATUS', 'StatusTracking',
                    'Check status gagal - tracking ID tidak ditemukan', 'FAILED');
            }

            // Get failed attempts
            const failedLogs = auditLog.getFailedAttempts(username);
            expect(failedLogs.length).toBeGreaterThan(0);
        });
    });

    describe('Real-time Status Updates', () => {
        test('Multiple users dapat check status independent', () => {
            const users = ['mahasiswa', 'mahasiswa2', 'alumni'];

            users.forEach(username => {
                const loginResult = auth.login(username, '123');
                expect(loginResult.success).toBe(true);

                // Create tracking
                const tracking = statusTracking.createTracking(username, 'Pengajuan ' + username);

                // Update status
                statusTracking.updateStatus(tracking.trackingId, 'Diproses', 50);

                // Send notification
                notification.sendNotification(username, 'status_update', 'Status Update',
                    `Status pengajuan Anda telah diupdate`);

                // Verify user data is isolated
                const userStatus = statusTracking.getStatus(username);
                const userNotifs = notification.getNotifications(username);

                expect(userStatus.length).toBe(1);
                expect(userNotifs.length).toBe(1);
            });

            // Verify all users have separate data
            expect(statusTracking.statusList.length).toBe(3);
            expect(notification.notifications.length).toBe(3);
        });
    });

    describe('Error Handling in Status Check', () => {
        test('Handle invalid username gracefully', () => {
            const invalidUsername = 'invalid_user_12345';

            // Login akan gagal
            const loginResult = auth.login(invalidUsername, '123');
            expect(loginResult.success).toBe(false);

            // Tapi status tracking bisa tetap diakses (atau return empty)
            const status = statusTracking.getStatus(invalidUsername);
            expect(status).toEqual([]);

            // Notification juga empty
            const notifs = notification.getNotifications(invalidUsername);
            expect(notifs).toEqual([]);
        });

        test('Handle concurrent status updates', () => {
            const username = 'mahasiswa';

            // Create tracking
            const tracking = statusTracking.createTracking(username, 'Concurrent Test');
            const trackingId = tracking.trackingId;

            // Simulate rapid updates
            statusTracking.updateStatus(trackingId, 'Diverifikasi', 25);
            statusTracking.updateStatus(trackingId, 'Diproses', 50);
            statusTracking.updateStatus(trackingId, 'Selesai Diproses', 75);
            statusTracking.updateStatus(trackingId, 'Disetujui', 100);
            // Verify final state
            const trackingData = statusTracking.getTrackingById(trackingId);
            expect(trackingData.status).toBe('Disetujui');
            expect(trackingData.progress).toBe(100);
            // Timeline includes initial state + 4 updates = 5 entries
            expect(trackingData.timeline.length).toBe(5);
        });
    });

    describe('Dashboard Summary Statistics', () => {
        test('User dapat melihat summary pengajuan mereka', () => {
            const username = 'alumni';

            // Create various status
            const t1 = statusTracking.createTracking(username, 'Legalisir');
            const t2 = statusTracking.createTracking(username, 'SKL');
            const t3 = statusTracking.createTracking(username, 'Surat Keterangan');

            // Update with different statuses
            statusTracking.updateStatus(t1.trackingId, 'Disetujui', 100);
            statusTracking.updateStatus(t2.trackingId, 'Diproses', 50);
            statusTracking.updateStatus(t3.trackingId, 'Menunggu Verifikasi', 0);

            // Get summary
            const allStatus = statusTracking.getStatus(username);

            const summary = {
                total: allStatus.length,
                pending: allStatus.filter(s => s.status === 'Menunggu Verifikasi').length,
                inProgress: allStatus.filter(s => s.status === 'Diproses' || s.status === 'Diverifikasi').length,
                completed: allStatus.filter(s => s.status === 'Disetujui').length
            };

            expect(summary.total).toBe(3);
            expect(summary.pending).toBe(1);
            expect(summary.inProgress).toBe(1);
            expect(summary.completed).toBe(1);
        });
    });
});
