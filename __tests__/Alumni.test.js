const alumni = require('../src/AlumniModel');

describe('Modul: Layanan Alumni', () => {
    // 17. Legalisir [cite: 521-558]
    describe('17. Legalisir', () => {
        test('TC-AL-19: Nomor antrian muncul otomatis', () => {
            const res = alumni.legalisirBuatAntrian({nama: "Aldifa", nim: "123"});
            expect(res.status).toBe("Sukses");
            expect(res.nomorAntrian).toBeDefined();
        });
        
        test('TC-AL-20: Cek status legalisir', () => {
            const res = alumni.legalisirCekStatus("LG123");
            expect(res.statusLegalisir).toBe("Diproses");
        });

        test('TC-AL-21: Update status legalisir', () => {
            expect(alumni.legalisirUpdateStatus("Selesai").statusLegalisir).toBe("Selesai");
        });
        
        test('Validasi data kosong', () => {
            const res = alumni.legalisirBuatAntrian({});
            expect(res.status).toBe("Gagal");
        });
    });
});