const kemahasiswaan = require('../src/KemahasiswaanModel');

describe('Modul: Layanan Kemahasiswaan', () => {

    // 11. Surat Keterangan Pengantar [cite: 233-251]
    describe('11. Surat Keterangan Pengantar', () => {
        test('TC-NSK-5: Ajuan Gagal (Field Kosong)', () => {
            expect(kemahasiswaan.ajuanPengantar("", "Ganjil", "Beasiswa").success).toBe(false);
        });
        test('TC-NSK-6: Ajuan Berhasil', () => {
            expect(kemahasiswaan.ajuanPengantar("2023", "Ganjil", "Beasiswa").success).toBe(true);
        });
        test('TC-NSK-8: Unduh Ada', () => {
            expect(kemahasiswaan.unduhPengantar("mahasiswa")).not.toBeNull();
        });
    });

    // 12. Surat Keterangan Masih Kuliah [cite: 252-270]
    describe('12. Surat Keterangan Masih Kuliah', () => {
        test('TC-NSK-9: Gagal', () => {
            expect(kemahasiswaan.ajuanMasihKuliah("2023", "", "Adi").success).toBe(false);
        });
        test('TC-NSK-10: Berhasil', () => {
            expect(kemahasiswaan.ajuanMasihKuliah("2023", "Genap", "Budi").success).toBe(true);
        });
    });

    // 13. Ajuan Legalitas [cite: 271-352]
    describe('13. Ajuan Legalitas', () => {
        test('TC-AL-01: Tampilan awal', () => {
            const t = kemahasiswaan.legalitasGetTampilan();
            expect(t.judul).toBe("Ajuan Legalitas Kegiatan");
        });
        test('TC-AL-03: Validasi file kosong', () => {
            const res = kemahasiswaan.legalitasValidate({ fileProposal: null });
            expect(res.status).toBe("Gagal");
        });
        test('TC-AL-05: Ajuan Sukses', () => {
            const res = kemahasiswaan.legalitasValidate({
                fileProposal: { size: 500 }, namaKegiatan: "Seminar", tanggalPelaksanaan: "2025"
            });
            expect(res.status).toBe("Sukses");
        });
    });

    // 14. Surat Tugas Delegasi [cite: 353-395]
    describe('14. Surat Tugas Delegasi', () => {
        test('TC-RZ-15: Generate berhasil', () => {
            const res = kemahasiswaan.delegasiGenerate({nama: "Riza", kegiatan: "Lomba"});
            expect(res.status).toBe("Sukses");
            expect(res.file).toContain("Riza");
        });
        test('Validasi data kosong', () => {
            expect(kemahasiswaan.delegasiGenerate({}).status).toBe("Gagal");
        });
    });

    // 15. Surat Izin Kegiatan [cite: 396-451]
    describe('15. Surat Izin Kegiatan', () => {
        test('Form valid', () => {
            const res = kemahasiswaan.izinKegiatanValidate({
                namaKegiatan: "A", tanggalKegiatan: "B", fileSurat: {size: 1}
            });
            expect(res.status).toBe("Sukses");
        });
        test('Form kosong', () => {
            expect(kemahasiswaan.izinKegiatanValidate({}).status).toBe("Gagal");
        });
    });

    // 16. Laporan Pertanggungjawaban (LPJ) [cite: 452-501]
    describe('16. Laporan Pertanggungjawaban (LPJ)', () => {
        test('TC-AL-17: Format salah', () => {
            expect(kemahasiswaan.lpjUpload({fileLPJ: {type: 'jpg'}}).status).toBe("Gagal");
        });
        test('TC-AL-18: Status selesai', () => {
            expect(kemahasiswaan.lpjUpdateStatus("Diterima").status).toBe("Selesai");
        });
    });
});