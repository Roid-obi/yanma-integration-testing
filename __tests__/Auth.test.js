const auth = require('../src/AuthModel');

describe('Fitur Autentikasi (Login)', () => {
    test('Login sukses user terdaftar', () => {
        const res = auth.login("mahasiswa", "123");
        expect(res.success).toBe(true);
        expect(res.role).toBe("mahasiswa");
    });

    test('Login gagal password salah', () => {
        expect(auth.login("mahasiswa", "salah").success).toBe(false);
    });

    test('Login gagal username tidak ditemukan', () => {
        expect(auth.login("hantu", "123").success).toBe(false);
    });
});