const akademik = require('../src/AkademikModel');

describe('Modul: Layanan Akademik', () => {

    // 1. Perpanjangan Masa Studi [cite: 60-68]
    describe('1. Perpanjangan Masa Studi', () => {
        test('TC-02: Validasi Format PDF < 2MB', () => {
            const res = akademik.perpanjanganStudi({name:'s.txt', size:1000}, {name:'b.pdf', size:1000});
            expect(res.success).toBe(false);
            expect(res.message).toBe("File harus PDF < 2MB");
        });
        test('TC-03: Field wajib diisi', () => {
            const res = akademik.perpanjanganStudi(null, {name:'b.pdf'});
            expect(res.success).toBe(false);
        });
        test('TC-04: Status otomatis Menunggu Verifikasi', () => {
            const res = akademik.perpanjanganStudi({name:'s.pdf', size:1000}, {name:'b.pdf', size:1000});
            expect(res.status).toBe("Menunggu Verifikasi");
        });
        test('TC-05: Admin unggah surat pengantar', () => {
            const res = akademik.perpanjanganAdminUpload({name: 'surat.pdf'});
            expect(res.success).toBe(true);
        });
        test('TC-06: Mahasiswa unduh surat disetujui', () => {
            expect(akademik.perpanjanganUnduh("Disetujui").success).toBe(true);
        });
    });

    // 2. Penundaan Pembayaran UKT [cite: 69-76]
    describe('2. Penundaan Pembayaran UKT', () => {
        test('TC-07: Wajib upload & alasan', () => {
            expect(akademik.penundaanUKT(null, "").success).toBe(false);
        });
        test('TC-08: Validasi file PDF', () => {
            const res = akademik.penundaanUKT({name:'a.docx'}, "Ekonomi");
            expect(res.message).toBe("File harus format PDF");
        });
        test('TC-09: Status awal Menunggu Persetujuan', () => {
            const res = akademik.penundaanUKT({name:'a.pdf'}, "Ekonomi");
            expect(res.status).toBe("Menunggu Persetujuan");
        });
    });

    // 3. Cuti / Selang Studi [cite: 77-84]
    describe('3. Cuti / Selang Studi', () => {
        test('TC-10: Form wajib isi', () => {
            expect(akademik.ajuanCuti(null, "").success).toBe(false);
        });
        test('TC-11: Admin menyetujui', () => {
            expect(akademik.adminCutiApproval("Disetujui").message).toBe("Cuti disetujui");
        });
    });

    // 4. Undur Diri [cite: 85-102]
    describe('4. Undur Diri', () => {
        test('TC-RR-1: Tampilan awal modul', () => {
            const view = akademik.undurDiriGetTampilan();
            expect(view.judul).toBe('Pengajuan Undur Diri');
        });
        test('TC-RR-3: Validasi file kosong', () => {
            const res = akademik.undurDiriValidate({ filePDF: null });
            expect(res.status).toBe('Gagal');
        });
        test('TC-RR-7: Validasi ukuran file > 10MB', () => {
            const res = akademik.undurDiriValidate({ filePDF: { size: 11*1024*1024 }, tahunAkademik: '2025', semesterAkademik: '1' });
            expect(res.message).toBe('Ukuran file maksimal 10 MB.');
        });
    });

    // 5. Pembayaran UKT di Luar Jadwal [cite: 103-120]
    describe('5. Pembayaran UKT di Luar Jadwal', () => {
        test('TC-RR-4: Tampilan awal', () => {
            expect(akademik.uktLuarJadwalGetInfo().judul).toBe('Pembayaran UKT di Luar Jadwal');
        });
        test('TC-RR-6: Validasi alasan kosong', () => {
            expect(akademik.uktLuarJadwalValidate({ alasan: '' }).status).toBe('Gagal');
        });
        test('TC-RR-7: Validasi ukuran file pendukung', () => {
            const res = akademik.uktLuarJadwalValidate({ alasan: 'x', tanggalBayar: '2099-01-01', dokumenPendukung: { size: 11*1024*1024 } });
            expect(res.status).toBe('Gagal');
        });
    });

    // 6. Keringanan UKT [cite: 121-135]
    describe('6. Keringanan UKT', () => {
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
        });
    });

    // 7. Lembar Pengesahan TA [cite: 136-159]
    describe('7. Lembar Pengesahan TA', () => {
        test('TC-FM-01: Akses menu mahasiswa', () => {
            expect(akademik.taAksesMenu("mahasiswa").success).toBe(true);
        });
        test('TC-FM-04: Akses admin ditolak', () => {
            expect(akademik.taAksesMenu("admin").success).toBe(false);
        });
        test('TC-FM-03: Submit valid', () => {
            const res = akademik.taSubmit("mahasiswa", {nama:"Farhan", nim:"123"});
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

    // 8. Surat Keterangan Lulus (SKL) [cite: 160-186]
    describe('8. SKL', () => {
        test('TC-FM-13: Mahasiswa belum lulus', () => {
            expect(akademik.sklSubmit("mahasiswa", {nama:"Budi", nim:"123"}).success).toBe(false);
        });
        test('TC-FM-09: Submit lengkap (Alumni/Lulus)', () => {
            expect(akademik.sklSubmit("alumni", {nama:"Andi", nim:"123"}).success).toBe(true);
        });
        test('TC-FM-10: Admin approve', () => {
            expect(akademik.sklAdminVerif(1, true).status).toBe("Disetujui");
        });
    });

    // 9. Verifikasi Wisuda [cite: 187-213]
    describe('9. Verifikasi Wisuda', () => {
        test('TC-FM-15: Upload Valid', () => {
            expect(akademik.wisudaUpload("mahasiswa", "file.pdf").status).toBe("Menunggu Verifikasi Admin");
        });
        test('TC-FM-16: Upload Invalid', () => {
            expect(akademik.wisudaUpload("mahasiswa", "file.jpg").success).toBe(false);
        });
        test('TC-FM-19: Cek status', () => {
            expect(akademik.wisudaCekStatus("alumni")).toBe("Disetujui");
        });
    });

    // 10. Transkrip Nilai [cite: 214-232]
    describe('10. Transkrip Nilai', () => {
        test('TC-NSK-1: Mahasiswa belum lulus cek transkrip', () => {
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
});