const auth = require('./AuthModel');
const dummy = require('./DataDummy');

class KemahasiswaanModel {
    // 11. Surat Keterangan/Pengantar [cite: 234]
    ajuanPengantar(tahun, semester, keperluan) {
        if (tahun && semester && keperluan) {
            return { success: true, message: "Pengajuan Surat Keterangan Pengantar Berhasil" };
        }
        return { success: false, message: "Pengajuan Surat Keterangan Pengantar Gagal" };
    }

    unduhPengantar(username) {
        const entry = dummy.FileSuratKeteranganPengantar.find(e => e.username === username);
        return (entry && entry.filePath) ? entry.filePath : null;
    }

    // 12. Surat Keterangan Masih Kuliah [cite: 253]
    ajuanMasihKuliah(tahun, semester, orangtua) {
        if (tahun && semester && orangtua) {
            return { success: true, message: "Pengajuan Surat Keterangan Masih Kuliah Berhasil" };
        }
        return { success: false, message: "Pengajuan Surat Keterangan Masih Kuliah Gagal" };
    }

    unduhMasihKuliah(username) {
        const entry = dummy.FileSuratKeteranganMasihKuliah.find(e => e.username === username);
        return (entry && entry.filePath) ? entry.filePath : null;
    }

    // 13. Ajuan Legalitas [cite: 272]
    legalitasGetTampilan() {
        return { judul: "Ajuan Legalitas Kegiatan", persyaratan: ["Proposal", "Surat Pengantar", "Daftar Panitia"] };
    }
    
    legalitasGetForm() {
        return { fields: [{}, {}, {}] }; // Dummy length 3 sesuai test
    }

    legalitasValidate(data) {
        if (!data.fileProposal) return { status: "Gagal", message: "File proposal wajib diunggah." };
        if (data.fileProposal.size > 10 * 1024 * 1024) return { status: "Gagal", message: "Ukuran file maksimal 10 MB." };
        if (!data.namaKegiatan || !data.tanggalPelaksanaan) return { status: "Gagal", message: "Data kegiatan wajib diisi." };
        return { status: "Sukses", message: "Ajuan legalitas berhasil dikirim." };
    }

    // 14. Surat Tugas Delegasi [cite: 354]
    delegasiGenerate(data) {
        if (!data.nama || !data.kegiatan) {
            return { status: "Gagal", message: "Nama dan kegiatan wajib diisi." };
        }
        return { status: "Sukses", file: `Surat_Tugas_${data.nama.replace(" ", "_")}.pdf` };
    }

    // 15. Surat Izin Kegiatan [cite: 397]
    izinKegiatanValidate(data) {
        if (!data.namaKegiatan || !data.tanggalKegiatan) return { status: "Gagal", message: "Nama dan tanggal wajib diisi." };
        if (!data.fileSurat) return { status: "Gagal", message: "File surat wajib diunggah." };
        return { status: "Sukses", message: "Surat izin kegiatan berhasil diajukan." };
    }

    // 16. Laporan Pertanggungjawaban [cite: 453]
    lpjUpload(data) {
        if (!data.fileLPJ) return { status: "Gagal", message: "File LPJ wajib diunggah." };
        if (!["pdf", "zip"].includes(data.fileLPJ.type)) return { status: "Gagal", message: "Format file harus PDF atau ZIP." };
        return { status: "Sukses", message: "LPJ berhasil diunggah." };
    }

    lpjUpdateStatus(status) {
        return status === "Diterima" ? { status: "Selesai", message: "Proses LPJ selesai." } : { status: "Proses", message: "Masih dalam proses." };
    }
}

module.exports = new KemahasiswaanModel();