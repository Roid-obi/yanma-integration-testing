const dummy = require('./DataDummy');

class AlumniModel {
    // 17. Legalisir
    legalisirBuatAntrian(data) {
        if (!data.nama || !data.nim) return { status: "Gagal", message: "Data mahasiswa wajib diisi." };
        return { status: "Sukses", nomorAntrian: Math.floor(Math.random() * 1000) };
    }

    legalisirCekStatus(kode) {
        if (!kode) return { status: "Gagal", message: "Kode wajib diisi." };
        const item = dummy.LegalisirDB.find(l => l.kode === kode);
        return { status: "Sukses", statusLegalisir: item ? item.status : "Tidak Ditemukan" };
    }

    legalisirUpdateStatus(statusBaru) {
        return { status: "Sukses", statusLegalisir: statusBaru };
    }
}

module.exports = new AlumniModel();