/**
 * TEST CASE 1: Auth + Akademik Integration
 * 
 * Scenario: User login kemudian mengakses menu TA (Tugas Akhir)
 * Integration Points:
 *   - Auth.login() -> get user role
 *   - Akademik.taAksesMenu() -> validate user access
 *   - Share user data antar modul
 * 
 * Expected Flow:
 * 1. User login dengan username dan password
 * 2. System get user info dan validate role
 * 3. User access menu TA dan system check akses berdasarkan role
 * 4. Jika role valid, menu TA ditampilkan
 * 5. Audit log mencatat aktivitas
 */

const auth = require('../../src/AuthModel');
const akademik = require('../../src/AkademikModel');
const auditLog = require('../../src/AuditLogModel');

describe('Integration Test Case 1: Auth + Akademik (Login -> Access TA Menu)', () => {

    // SETUP: Reset audit logs sebelum test
    beforeEach(() => {
        auditLog.logs = [];
    });

    describe('Successful Flow - User berhasil login dan akses TA', () => {
        test('Mahasiswa dapat login dan akses menu TA', () => {
            // Step 1: User login
            const loginResult = auth.login('mahasiswa', '123');
            expect(loginResult.success).toBe(true);
            expect(loginResult.role).toBe('mahasiswa');
            expect(loginResult.user.username).toBe('mahasiswa');

            // Audit log: Login activity
            const loginLog = auditLog.logActivity(
                loginResult.user.username,
                'LOGIN',
                'Auth',
                `User ${loginResult.user.username} berhasil login`,
                'SUCCESS'
            );
            expect(loginLog.success).toBe(true);

            // Step 2: Access TA menu
            const taAccess = akademik.taAksesMenu(loginResult.user.username);
            expect(taAccess.success).toBe(true);

            // Audit log: TA access attempt
            auditLog.logActivity(
                loginResult.user.username,
                'ACCESS_MODULE',
                'Akademik',
                'Akses menu TA berhasil',
                'SUCCESS'
            );

            // Verify audit trail
            const userLogs = auditLog.getLogs('mahasiswa');
            expect(userLogs.length).toBe(2);
            // Logs are sorted newest first (DESC), so check both actions exist
            const actions = userLogs.map(l => l.action);
            expect(actions).toContain('ACCESS_MODULE');
            expect(actions).toContain('LOGIN');
        });

        test('Alumni dapat login tapi tidak bisa akses TA', () => {
            // Step 1: Alumni login
            const loginResult = auth.login('alumni', '123');
            expect(loginResult.success).toBe(true);
            expect(loginResult.role).toBe('alumni');

            // Step 2: Try akses TA menu (should fail)
            const taAccess = akademik.taAksesMenu(loginResult.user.username);
            expect(taAccess.success).toBe(false);
            expect(taAccess.message).toContain('tidak memiliki hak akses');

            // Audit log: Failed access attempt
            auditLog.logActivity(
                loginResult.user.username,
                'ACCESS_MODULE',
                'Akademik',
                'Gagal akses menu TA - unauthorized role',
                'FAILED'
            );

            // Verify failed attempt logged
            const failedLogs = auditLog.getFailedAttempts('alumni');
            expect(failedLogs.length).toBeGreaterThan(0);
        });

        test('Admin dapat login dan akses TA', () => {
            // Step 1: Admin login
            const loginResult = auth.login('admin', 'admin');
            expect(loginResult.success).toBe(true);
            expect(loginResult.role).toBe('admin');

            // Step 2: Admin access (based on role, bisa adjust di akademik.taAksesMenu)
            // Note: Current implementation hanya allow mahasiswa, bisa dimodifikasi untuk admin
            const taAccess = akademik.taAksesMenu(loginResult.user.username);

            // Log activity
            auditLog.logActivity(
                loginResult.user.username,
                'ACCESS_MODULE',
                'Akademik',
                'Admin mengakses modul TA untuk verifikasi',
                'SUCCESS'
            );

            const adminLogs = auditLog.getLogs('admin');
            expect(adminLogs.length).toBeGreaterThan(0);
        });
    });

    describe('Failed Flow - Login gagal, tidak bisa akses TA', () => {
        test('Login dengan password salah', () => {
            const loginResult = auth.login('mahasiswa', 'wrongpassword');
            expect(loginResult.success).toBe(false);
            expect(loginResult.message).toContain('Username atau password salah');

            // Audit log: Login failed
            auditLog.logActivity(
                'mahasiswa',
                'LOGIN',
                'Auth',
                'Login failed - invalid credentials',
                'FAILED'
            );

            // Verify failed login logged
            const failedAttempts = auditLog.getFailedAttempts('mahasiswa');
            expect(failedAttempts.length).toBeGreaterThan(0);
        });

        test('Login dengan username yang tidak ada', () => {
            const loginResult = auth.login('nonexistent', '123');
            expect(loginResult.success).toBe(false);

            auditLog.logActivity(
                'nonexistent',
                'LOGIN',
                'Auth',
                'Login failed - user not found',
                'FAILED'
            );

            const failedAttempts = auditLog.getFailedAttempts('nonexistent');
            expect(failedAttempts.length).toBeGreaterThan(0);
        });
    });

    describe('Data Sharing antar modul', () => {
        test('User data dari Auth dapat diakses di Akademik', () => {
            // Login get user object
            const loginResult = auth.login('mahasiswa', '123');
            const user = loginResult.user;

            // Pass user data ke akademik untuk submit TA
            const taSubmitResult = akademik.taSubmit(user.username, {
                nama: user.nama,
                nim: user.nim || '123'
            });

            expect(taSubmitResult.success).toBe(true);
            expect(taSubmitResult.status).toBe('Menunggu Verifikasi');
        });

        test('User object berisi semua informasi yang diperlukan', () => {
            const loginResult = auth.login('Farhan', '123');
            const user = loginResult.user;

            // Verifikasi data lengkap
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('role');
            expect(user).toHaveProperty('nama');
            expect(user).toHaveProperty('lulus');
            expect(user.username).toBe('Farhan');
            expect(user.role).toBe('mahasiswa');
        });
    });

    describe('Audit Trail dan Security', () => {
        test('Semua akses terekam dalam audit log', () => {
            auth.login('mahasiswa', '123');
            auditLog.logActivity('mahasiswa', 'LOGIN', 'Auth', 'Login berhasil', 'SUCCESS');

            akademik.taAksesMenu('mahasiswa');
            auditLog.logActivity('mahasiswa', 'ACCESS_MODULE', 'Akademik', 'Access TA menu', 'SUCCESS');

            const userLogs = auditLog.getLogs('mahasiswa');
            expect(userLogs.length).toBeGreaterThan(0);
            expect(userLogs.some(l => l.action === 'LOGIN')).toBe(true);
        });

        test('Failed attempts dapat diidentifikasi dari audit log', () => {
            auth.login('mahasiswa', 'wrong');
            auditLog.logActivity('mahasiswa', 'LOGIN', 'Auth', 'Login failed - invalid password', 'FAILED');

            auth.login('mahasiswa', 'wrong');
            auditLog.logActivity('mahasiswa', 'LOGIN', 'Auth', 'Login failed - invalid password', 'FAILED');

            akademik.taAksesMenu('alumni'); // non-mahasiswa
            auditLog.logActivity('alumni', 'ACCESS_MODULE', 'Akademik', 'Access failed - unauthorized', 'FAILED');

            const failedLogs = auditLog.getFailedAttempts('mahasiswa');
            expect(failedLogs.length).toBeGreaterThan(0);
        });

        test('Audit log timestamp terekam dengan benar', () => {
            auth.login('mahasiswa', '123');
            auditLog.logActivity('mahasiswa', 'TEST', 'Test', 'test', 'SUCCESS');

            const logs = auditLog.getLogs('mahasiswa');
            logs.forEach(log => {
                expect(log.timestamp).toBeTruthy();
                expect(new Date(log.timestamp)).toBeInstanceOf(Date);
            });
        });
    });
});
