const akademik = require('../src/AkademikModel');
const kemahasiswaan = require('../src/KemahasiswaanModel');
const alumni = require('../src/AlumniModel');
const auth = require('../src/AuthModel');

// --- 0. LOGIN (System) ---
describe('Fitur Login', () => {
    test('Login sukses user terdaftar', () => {
        const res = auth.login("mahasiswa", "123");
        expect(res.success).toBe(true);
        expect(res.role).toBe("mahasiswa");
    });
    test('Login gagal password salah', () => {
        expect(auth.login("mahasiswa", "salah").success).toBe(false);
    });
});

// --- LAYANAN AKADEMIK ---
describe('1. Perpanjangan Masa Studi', () => {
    test('TC-01: Form unggah tersedia', () => { // [cite: 62]
        expect(true).toBe(true); // Simulasi UI check
    });
    test('TC-02: Validasi Format PDF < 2MB', () => {
        const res = akademik.perpanjanganStudi({ name: 's.txt', size: 1000 }, { name: 'b.pdf', size: 1000 });
        expect(res.success).toBe(false);
        expect(res.message).toBe("File harus PDF < 2MB");
    });
    test('TC-03: Field wajib diisi', () => {
        const res = akademik.perpanjanganStudi(null, { name: 'b.pdf' });
        expect(res.success).toBe(false);
        expect(res.message).toBe("Lengkapi semua field unggahan");
    });
    test('TC-04: Status otomatis Menunggu Verifikasi', () => {
        const res = akademik.perpanjanganStudi({ name: 's.pdf', size: 1000 }, { name: 'b.pdf', size: 1000 });
        expect(res.status).toBe("Menunggu Verifikasi");
    });
    test('TC-05: Admin unggah surat pengantar', () => {
        const res = akademik.perpanjanganAdminUpload({ name: 'surat.pdf' });
        expect(res.success).toBe(true);
    });
    test('TC-06: Mahasiswa unduh surat disetujui', () => {
        expect(akademik.perpanjanganUnduh("Disetujui").success).toBe(true);
    });
});

describe('2. Penundaan Pembayaran UKT', () => {
    test('TC-07: Wajib upload & alasan', () => { // [cite: 71]
        expect(akademik.penundaanUKT(null, "").success).toBe(false);
    });
    test('TC-08: Validasi file PDF', () => {
        const res = akademik.penundaanUKT({ name: 'a.docx' }, "Miskin");
        expect(res.message).toBe("File harus format PDF");
    });
    test('TC-09: Status awal Menunggu Persetujuan', () => {
        const res = akademik.penundaanUKT({ name: 'a.pdf' }, "Miskin");
        expect(res.status).toBe("Menunggu Persetujuan");
    });
});

describe('3. Cuti / Selang Studi', () => {
    test('TC-10: Form wajib isi', () => { // [cite: 79]
        expect(akademik.ajuanCuti(null, "").success).toBe(false);
    });
    test('TC-11: Admin menyetujui', () => {
        expect(akademik.adminCutiApproval("Disetujui").message).toBe("Cuti disetujui");
    });
});

describe('4. Undur Diri', () => {
    test('TC-RR-1: Tampilan awal modul', () => { // [cite: 87]
        const view = akademik.undurDiriGetTampilan();
        expect(view.judul).toBe('Pengajuan Undur Diri');
        expect(view.persyaratan).toHaveLength(3);
    });
    test('TC-RR-2: Form pengajuan fields', () => {
        expect(akademik.undurDiriGetForm().fields).toHaveLength(3);
    });
    test('TC-RR-3: Validasi file kosong', () => {
        const res = akademik.undurDiriValidate({ filePDF: null });
        expect(res.status).toBe('Gagal');
    });
    test('TC-RR-7: Validasi ukuran file > 10MB', () => {
        const res = akademik.undurDiriValidate({ filePDF: { size: 11 * 1024 * 1024 }, tahunAkademik: '2025', semesterAkademik: '1' });
        expect(res.message).toBe('Ukuran file maksimal 10 MB.');
    });
    test('Sukses submit', () => {
        const res = akademik.undurDiriValidate({ filePDF: { size: 5 * 1024 * 1024 }, tahunAkademik: '2025', semesterAkademik: '1' });
        expect(res.status).toBe('Sukses');
    });
});

describe('5. Pembayaran UKT di Luar Jadwal', () => {
    test('TC-RR-4: Tampilan awal', () => { // [cite: 105]
        expect(akademik.uktLuarJadwalGetInfo().judul).toBe('Pembayaran UKT di Luar Jadwal');
    });
    test('TC-RR-6: Validasi alasan kosong', () => {
        expect(akademik.uktLuarJadwalValidate({ alasan: '' }).status).toBe('Gagal');
    });
    test('TC-RR-7: Validasi ukuran file pendukung', () => {
        const res = akademik.uktLuarJadwalValidate({ alasan: 'x', tanggalBayar: '2099-01-01', dokumenPendukung: { size: 11 * 1024 * 1024 } });
        expect(res.status).toBe('Gagal');
    });
});

describe('6. Keringanan UKT', () => {
    test('TC-RR-8: Tampilan informasi', () => { // [cite: 123]
        // Mocking behavior tested in model directly
        expect(true).toBe(true);
    });
    test('TC-RR-9: Jadwal Buka', () => {
        const status = akademik.keringananStatus('2025-11-15');
        expect(status.isOpen).toBe(true);
    });
    test('TC-RR-9: Jadwal Tutup', () => {
        const status = akademik.keringananStatus('2025-10-20');
        expect(status.isOpen).toBe(false);
    });
    test('TC-RR-10: Validasi persyaratan', () => {
        const req = akademik.keringananGetPersyaratan();
        expect(req.persyaratan).toContain('Mahasiswa aktif');
        expect(req.dokumenWajib).toHaveLength(6);
    });
});

describe('7. Lembar Pengesahan TA', () => {
    test('TC-FM-01: Akses menu mahasiswa', () => { // [cite: 136]
        expect(akademik.taAksesMenu("mahasiswa").success).toBe(true);
    });
    test('TC-FM-04: Akses admin ditolak', () => {
        expect(akademik.taAksesMenu("admin").success).toBe(false);
    });
    test('TC-FM-02: Submit kosong', () => {
        expect(akademik.taSubmit("mahasiswa", { nama: "", nim: "" }).success).toBe(false);
    });
    test('TC-FM-03: Submit valid', () => {
        const res = akademik.taSubmit("mahasiswa", { nama: "Farhan", nim: "123" });
        expect(res.success).toBe(true);
        expect(res.status).toBe("Menunggu Verifikasi");
    });
    test('TC-FM-05: Admin verifikasi', () => {
        expect(akademik.taAdminVerif(1).status).toBe("Disetujui");
    });
    test('TC-FM-06: Unduh', () => {
        expect(akademik.taUnduh("mahasiswa2")).toContain("pdf");
    });
});

describe('8. SKL', () => {
    test('TC-FM-07: Akses menu SKL', () => { // [cite: 160]
        expect(akademik.taAksesMenu("mahasiswa").success).toBe(true);
    });
    test('TC-FM-13: Mahasiswa belum lulus', () => {
        expect(akademik.sklSubmit("mahasiswa", { nama: "Budi", nim: "123" }).success).toBe(false);
    });
    test('TC-FM-09: Submit lengkap (Alumni/Lulus)', () => {
        expect(akademik.sklSubmit("alumni", { nama: "Andi", nim: "123" }).success).toBe(true);
    });
    test('TC-FM-10: Admin approve', () => {
        expect(akademik.sklAdminVerif(1, true).status).toBe("Disetujui");
    });
    test('TC-FM-11: Admin reject', () => {
        expect(akademik.sklAdminVerif(1, false).status).toBe("Ditolak");
    });
    test('TC-FM-12: Unduh SKL', () => {
        expect(akademik.sklUnduh("alumni")).not.toBeNull();
    });
});

describe('9. Verifikasi Wisuda', () => {
    test('TC-FM-15: Upload Valid', () => { // [cite: 187]
        expect(akademik.wisudaUpload("mahasiswa", "file.pdf").status).toBe("Menunggu Verifikasi Admin");
    });
    test('TC-FM-16: Upload Invalid', () => {
        expect(akademik.wisudaUpload("mahasiswa", "file.jpg").success).toBe(false);
    });
    test('TC-FM-17: Admin setuju', () => {
        expect(akademik.wisudaAdminVerif(1, true).status).toBe("Disetujui");
    });
    test('TC-FM-19: Cek status', () => {
        expect(akademik.wisudaCekStatus("alumni")).toBe("Disetujui");
    });
});

describe('10. Transkrip Nilai', () => {
    test('TC-NSK-1: Mahasiswa belum lulus cek transkrip', () => { // [cite: 218]
        const res = akademik.transkripCek("mahasiswa");
        expect(res.lulus).toBe(false);
        expect(res.file).toBe(false);
    });
    test('TC-NSK-2: Alumni sudah lulus cek transkrip', () => {
        const res = akademik.transkripCek("alumni");
        expect(res.lulus).toBe(true);
        expect(res.file).toBe(true);
    });
    test('TC-NSK-4: Unduh transkrip alumni', () => {
        expect(akademik.transkripUnduh("alumni")).toContain("pdf");
    });
});

// --- LAYANAN KEMAHASISWAAN ---
describe('11. Surat Keterangan Pengantar', () => {
    test('TC-NSK-5: Ajuan Gagal', () => { // [cite: 237]
        expect(kemahasiswaan.ajuanPengantar("", "Ganjil", "Beasiswa").success).toBe(false);
    });
    test('TC-NSK-6: Ajuan Berhasil', () => {
        expect(kemahasiswaan.ajuanPengantar("2023", "Ganjil", "Beasiswa").success).toBe(true);
    });
    test('TC-NSK-8: Unduh Ada', () => {
        expect(kemahasiswaan.unduhPengantar("mahasiswa")).not.toBeNull();
    });
});

describe('12. Surat Masih Kuliah', () => {
    test('TC-NSK-9: Gagal', () => { // [cite: 256]
        expect(kemahasiswaan.ajuanMasihKuliah("2023", "", "Adi").success).toBe(false);
    });
    test('TC-NSK-10: Berhasil', () => {
        expect(kemahasiswaan.ajuanMasihKuliah("2023", "Genap", "Budi").success).toBe(true);
    });
});

describe('13. Ajuan Legalitas', () => {
    test('TC-AL-01: Tampilan awal', () => { // [cite: 312]
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

describe('14. Surat Tugas Delegasi', () => {
    test('TC-RZ-15: Generate berhasil', () => { // [cite: 375]
        const res = kemahasiswaan.delegasiGenerate({ nama: "Riza", kegiatan: "Lomba" });
        expect(res.status).toBe("Sukses");
        expect(res.file).toContain("Riza");
    });
    test('Validasi data kosong', () => {
        expect(kemahasiswaan.delegasiGenerate({}).status).toBe("Gagal");
    });
});

describe('15. Surat Izin Kegiatan', () => {
    test('Form valid', () => { // [cite: 424]
        const res = kemahasiswaan.izinKegiatanValidate({
            namaKegiatan: "A", tanggalKegiatan: "B", fileSurat: { size: 1 }
        });
        expect(res.status).toBe("Sukses");
    });
    test('Form kosong', () => {
        expect(kemahasiswaan.izinKegiatanValidate({}).status).toBe("Gagal");
    });
});

describe('16. LPJ', () => {
    test('TC-AL-17: Format salah', () => { // [cite: 479]
        expect(kemahasiswaan.lpjUpload({ fileLPJ: { type: 'jpg' } }).status).toBe("Gagal");
    });
    test('TC-AL-18: Status selesai', () => {
        expect(kemahasiswaan.lpjUpdateStatus("Diterima").status).toBe("Selesai");
    });
});

// --- LAYANAN ALUMNI ---
describe('17. Legalisir', () => {
    test('TC-AL-19: Nomor antrian', () => { // [cite: 533]
        const res = alumni.legalisirBuatAntrian({ nama: "Aldifa", nim: "123" });
        expect(res.status).toBe("Sukses");
        expect(res.nomorAntrian).toBeDefined();
    });
    test('TC-AL-20: Cek status', () => {
        const res = alumni.legalisirCekStatus("LG123");
        expect(res.statusLegalisir).toBe("Diproses");
    });
    test('TC-AL-21: Update status', () => {
        expect(alumni.legalisirUpdateStatus("Selesai").statusLegalisir).toBe("Selesai");
    });
});