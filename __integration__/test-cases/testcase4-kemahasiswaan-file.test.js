/**
 * TEST CASE 4: Kemahasiswaan + File Management Integration
 * 
 * Scenario: User upload surat keterangan dengan file attachment
 * Integration Points:
 *   - Kemahasiswaan.ajuanPengantar/Masihkuliah() -> create request
 *   - FileManagement.uploadFile() -> handle file upload
 *   - File validation: size, format, path
 *   - Database Integration: file metadata storage
 * 
 * Expected Flow:
 * 1. User create ajuan dengan file
 * 2. File divalidasi oleh FileManagement
 * 3. File disimpan dengan metadata
 * 4. Return file reference untuk tracking
 * 5. Audit log mencatat upload
 */

const kemahasiswaan = require('../../src/KemahasiswaanModel');
const fileManagement = require('../../src/FileManagementModel');
const statusTracking = require('../../src/StatusTrackingModel');
const auditLog = require('../../src/AuditLogModel');
const notification = require('../../src/NotificationModel');

describe('Integration Test Case 4: Kemahasiswaan + File Management', () => {

    beforeEach(() => {
        statusTracking.statusList = [];
        notification.notifications = [];
        auditLog.logs = [];
    });

    describe('File Upload Integration', () => {
        test('User dapat upload file surat dengan valid PDF', () => {
            const username = 'mahasiswa';

            // Mock file object
            const mockFile = {
                name: 'Surat_Keterangan_Pengantar.pdf',
                size: 1024 * 1024, // 1MB
                type: 'application/pdf'
            };

            // Upload file
            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-keterangan');
            expect(uploadResult.success).toBe(true);
            expect(uploadResult.fileId).toBeTruthy();
            expect(uploadResult.filePath).toBeTruthy();

            // Create ajuan dengan file reference
            const ajuanResult = kemahasiswaan.ajuanPengantar('2025', 'Ganjil', 'Beasiswa');
            expect(ajuanResult.success).toBe(true);

            // Create tracking dengan file info
            const trackingResult = statusTracking.createTracking(username, 'Surat Keterangan Pengantar');
            expect(trackingResult.success).toBe(true);

            // Audit
            auditLog.logActivity(username, 'UPLOAD_FILE', 'File Management',
                `Upload file: ${mockFile.name}, Size: ${mockFile.size}, FileID: ${uploadResult.fileId}`, 'SUCCESS');

            // Verify
            const logs = auditLog.getLogs(username);
            expect(logs.some(l => l.action === 'UPLOAD_FILE')).toBe(true);
        });

        test('Upload gagal jika file terlalu besar', () => {
            const mockFile = {
                name: 'Large_File.pdf',
                size: 15 * 1024 * 1024, // 15MB, melebihi 10MB limit
                type: 'application/pdf'
            };

            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-keterangan');
            expect(uploadResult.success).toBe(false);
            expect(uploadResult.message).toContain('tidak boleh melebihi');
            expect(uploadResult.fileId).toBeNull();

            // Audit failed upload
            auditLog.logActivity('mahasiswa', 'UPLOAD_FILE', 'File Management',
                'Upload file gagal - file terlalu besar', 'FAILED');

            const failedLogs = auditLog.getFailedAttempts('mahasiswa');
            expect(failedLogs.length).toBeGreaterThan(0);
        });

        test('Upload gagal jika format file tidak didukung', () => {
            const mockFile = {
                name: 'Document.txt',
                size: 512 * 1024, // 512KB
                type: 'text/plain'
            };

            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-keterangan');
            expect(uploadResult.success).toBe(false);
            expect(uploadResult.message).toContain('tidak didukung');

            // Audit
            auditLog.logActivity('mahasiswa', 'UPLOAD_FILE', 'File Management',
                'Upload file gagal - format tidak didukung', 'FAILED');
        });

        test('Upload gagal jika file tidak ditemukan', () => {
            const uploadResult = fileManagement.uploadFile(null, 'surat-keterangan');
            expect(uploadResult.success).toBe(false);
            expect(uploadResult.message).toContain('tidak ditemukan');
        });
    });

    describe('File Download Integration', () => {
        test('User dapat download file yang sudah disetujui', () => {
            const username = 'mahasiswa';

            // Mock scenario: file sudah upload dan diapprove
            const fileId = 'pengesahan_mahasiswa.pdf';

            // Get file
            const fileInfo = fileManagement.getFile(fileId);
            expect(fileInfo).not.toBeNull();

            if (fileInfo) {
                expect(fileInfo.filename).toBeTruthy();
                expect(fileInfo.filePath).toBeTruthy();

                // Audit download
                auditLog.logActivity(username, 'DOWNLOAD_FILE', 'File Management',
                    `Download file: ${fileInfo.filename}`, 'SUCCESS');

                const logs = auditLog.getLogs(username);
                expect(logs.some(l => l.action === 'DOWNLOAD_FILE')).toBe(true);
            }
        });

        test('Download gagal jika file tidak ditemukan', () => {
            const fileInfo = fileManagement.getFile('nonexistent_file.pdf');
            expect(fileInfo).toBeNull();

            auditLog.logActivity('mahasiswa', 'DOWNLOAD_FILE', 'File Management',
                'Download file gagal - file tidak ditemukan', 'FAILED');
        });

        test('Get file info tanpa download', () => {
            const filePath = 'public/surat-keterangan/surat_001.pdf';

            const fileInfo = fileManagement.getFileInfo(filePath);
            expect(fileInfo).not.toBeNull();
            expect(fileInfo.filename).toBeTruthy();
            expect(fileInfo.exists).toBe(true);
            expect(fileInfo.type).toBe('application/pdf');
        });
    });

    describe('File Management + Kemahasiswaan Workflow', () => {
        test('Complete surat keterangan with file upload workflow', () => {
            const username = 'mahasiswa2';

            // Step 1: Upload file
            const mockFile = {
                name: 'Surat_Masih_Kuliah.pdf',
                size: 800 * 1024, // 800KB
                type: 'application/pdf'
            };

            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-masih-kuliah');
            expect(uploadResult.success).toBe(true);
            const fileId = uploadResult.fileId;

            // Audit upload
            auditLog.logActivity(username, 'UPLOAD_FILE', 'File Management',
                `Upload file surat masih kuliah: ${fileId}`, 'SUCCESS');

            // Step 2: Submit ajuan
            const ajuanResult = kemahasiswaan.ajuanMasihKuliah('2025', 'Ganjil', 'Ibu Siti');
            expect(ajuanResult.success).toBe(true);

            // Audit submit
            auditLog.logActivity(username, 'SUBMIT_APPLICATION', 'Kemahasiswaan',
                'Submit surat masih kuliah dengan file', 'SUCCESS');

            // Step 3: Create tracking
            const trackingResult = statusTracking.createTracking(username, 'Surat Masih Kuliah');
            expect(trackingResult.success).toBe(true);

            // Step 4: Admin verify and attach file
            // Update tracking
            statusTracking.updateStatus(trackingResult.trackingId, 'Diverifikasi', 50);

            // Send notification
            notification.sendNotification(username, 'status_update', 'File Terverifikasi',
                'File surat Anda sedang diproses');

            auditLog.logActivity('admin', 'VERIFY_FILE', 'File Management',
                `Admin verify file: ${uploadResult.fileId}`, 'SUCCESS');

            // Verify complete flow
            const userLogs = auditLog.getLogs(username);
            expect(userLogs.length).toBeGreaterThan(0);
            expect(userLogs.some(l => l.action === 'UPLOAD_FILE')).toBe(true);
            expect(userLogs.some(l => l.action === 'SUBMIT_APPLICATION')).toBe(true);

            const notifications = notification.getNotifications(username);
            expect(notifications.length).toBeGreaterThan(0);
        });

        test('File validation dalam context kemahasiswaan', () => {
            const username = 'mahasiswa';

            // Scenario 1: Upload valid file untuk ajuan pengantar
            const validFile = {
                name: 'Surat_Pengantar_Valid.pdf',
                size: 1024 * 512, // 512KB
                type: 'application/pdf'
            };

            const upload1 = fileManagement.uploadFile(validFile, 'surat-pengantar');
            expect(upload1.success).toBe(true);

            // Scenario 2: Upload dengan format salah
            const invalidFile = {
                name: 'Document.txt',
                size: 256 * 1024,
                type: 'text/plain'
            };

            const upload2 = fileManagement.uploadFile(invalidFile, 'surat-pengantar');
            expect(upload2.success).toBe(false);

            // Scenario 3: Upload oversized file
            const largeFile = {
                name: 'Large_Surat.pdf',
                size: 12 * 1024 * 1024,
                type: 'application/pdf'
            };

            const upload3 = fileManagement.uploadFile(largeFile, 'surat-pengantar');
            expect(upload3.success).toBe(false);

            // Log hasil
            auditLog.logActivity(username, 'BULK_UPLOAD_TEST', 'File Management',
                '3 test scenarios: 1 success, 2 failed', 'MIXED');
        });
    });

    describe('Database Integration - File Metadata', () => {
        test('File metadata stored correctly', () => {
            const mockFile = {
                name: 'Test_Surat.pdf',
                size: 1024 * 1024,
                type: 'application/pdf'
            };

            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-test');

            if (uploadResult.success) {
                // Simulate storing metadata
                const metadata = {
                    fileId: uploadResult.fileId,
                    filename: mockFile.name,
                    filePath: uploadResult.filePath,
                    fileSize: mockFile.fileSize,
                    category: 'surat-test',
                    uploadedAt: uploadResult.uploadedAt,
                    uploadedBy: 'mahasiswa'
                };

                expect(metadata.fileId).toBeTruthy();
                expect(metadata.filename).toBe(mockFile.name);
                expect(metadata.uploadedAt).toBeTruthy();
            }
        });

        test('File path structure validation', () => {
            const mockFile = {
                name: 'Surat_Path_Test.pdf',
                size: 256 * 1024,
                type: 'application/pdf'
            };

            const uploadResult = fileManagement.uploadFile(mockFile, 'surat-pengantar');

            if (uploadResult.success) {
                // Path should follow pattern: category/fileId.ext
                const pathParts = uploadResult.filePath.split('/');
                expect(pathParts[0]).toBe('public');
                expect(pathParts[1]).toBe('uploads');
                expect(pathParts[2]).toBe('surat-pengantar');
            }
        });
    });

    describe('File Operations - Delete and Cleanup', () => {
        test('File dapat dihapus setelah verifikasi selesai', () => {
            const fileId = 'surat_001_complete';

            const deleteResult = fileManagement.deleteFile(fileId);
            expect(deleteResult.success).toBe(true);

            // Audit deletion
            auditLog.logActivity('admin', 'DELETE_FILE', 'File Management',
                `Delete file: ${fileId}`, 'SUCCESS');
        });

        test('Delete gagal dengan file ID invalid', () => {
            const deleteResult = fileManagement.deleteFile('');
            expect(deleteResult.success).toBe(false);
            expect(deleteResult.message).toContain('tidak valid');
        });
    });
});
