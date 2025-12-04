const auth = require('./AuthModel');
const dummy = require('./DataDummy');
const path = require('path');

class AkademikModel {
    // 1. Perpanjangan Masa Studi [cite: 61]
    perpanjanganStudi(surat, berkas) {
        if (!surat || !berkas || !surat.name || !berkas.name) {
            return { success: false, message: "Lengkapi semua field unggahan" };
        }
        // Validasi PDF < 2MB
        for (let file of [surat, berkas]) {
            const ext = path.extname(file.name).toLowerCase();
            if (ext !== ".pdf" || file.size > 2 * 1024 * 1024) {
                return { success: false, message: "File harus PDF < 2MB" };
            }
        }
        return { success: true, status: "Menunggu Verifikasi", message: "Berkas berhasil diunggah" };
    }

    perpanjanganAdminUpload(file) {
         if (!file || !file.name || path.extname(file.name).toLowerCase() !== ".pdf") {
            return { success: false, message: "File surat pengantar wajib diisi dan PDF" };
         }
         return { success: true, message: "Surat pengantar berhasil diunggah" };
    }

    perpanjanganUnduh(status) {
        if (status !== "Disetujui") return { success: false, message: "Belum bisa diunduh" };
        return { success: true, file: "Surat_Pengantar.pdf" };
    }

    // 2. Penundaan Pembayaran UKT [cite: 70]
    penundaanUKT(surat, alasan) {
        if (!surat || !surat.name || !alasan) return { success: false, message: "Lengkapi berkas dan alasan" };
        if (path.extname(surat.name).toLowerCase() !== ".pdf") return { success: false, message: "File harus format PDF" };
        return { success: true, status: "Menunggu Persetujuan" };
    }

    // 3. Cuti / Selang Studi [cite: 78]
    ajuanCuti(surat, alasan) {
        if (!surat || !surat.name || !alasan) return { success: false, message: "Lengkapi surat & alasan cuti" };
        if (path.extname(surat.name).toLowerCase() !== ".pdf") return { success: false, message: "File harus PDF" };
        return { success: true, status: "Menunggu Verifikasi" };
    }

    adminCutiApproval(status) {
        return status === "Disetujui" ? { success: true, message: "Cuti disetujui" } : { success: false, message: "Cuti ditolak" };
    }

    // 4. Undur Diri [cite: 86]
    undurDiriValidate(data) {
        if (!data.filePDF) return { status: 'Gagal', message: 'File PDF wajib diisi.' };
        if (data.filePDF.size > 10 * 1024 * 1024) return { status: 'Gagal', message: 'Ukuran file maksimal 10 MB.' };
        if (!data.tahunAkademik || !data.semesterAkademik) return { status: 'Gagal', message: 'Tahun dan semester wajib diisi.' };
        return { status: 'Sukses', message: 'Pengajuan berhasil diajukan.' };
    }
    
    undurDiriGetTampilan() {
        return { judul: 'Pengajuan Undur Diri', persyaratan: ['Surat Pernyataan', 'Kuitansi', 'Transkrip'], showForm: true };
    }

    undurDiriGetForm() {
        return { fields: [{ name: 'tahun', required: true }, { name: 'semester', required: true }, { name: 'file', required: true }] };
    }

    // 5. Pembayaran UKT di Luar Jadwal [cite: 104]
    uktLuarJadwalValidate(data, today = new Date()) {
        if (!data.alasan || !data.alasan.trim()) return { status: 'Gagal', message: 'Alasan wajib diisi.' };
        if (!data.tanggalBayar) return { status: 'Gagal', message: 'Tanggal bayar wajib diisi.' };
        if (new Date(data.tanggalBayar) < today) return { status: 'Gagal', message: 'Tanggal tidak boleh masa lampau.' };
        if (data.dokumenPendukung && data.dokumenPendukung.size > 10 * 1024 * 1024) return { status: 'Gagal', message: 'Ukuran file maksimal 10 MB.' };
        return { status: 'Sukses', message: 'Pengajuan berhasil diajukan.' };
    }

    uktLuarJadwalGetInfo() { return { judul: 'Pembayaran UKT di Luar Jadwal' }; }

    // 6. Keringanan UKT [cite: 122]
    keringananStatus(dateString) {
        const start = new Date('2025-11-01');
        const end = new Date('2025-11-30');
        const today = new Date(dateString);
        const isOpen = today >= start && today <= end;
        return { isOpen: isOpen, showFormButton: isOpen };
    }
    
    keringananGetPersyaratan() {
        return { persyaratan: ['Mahasiswa aktif'], dokumenWajib: ['Surat', 'KTM', 'KTP', 'KK', 'Slip Gaji', 'SKTM'] };
    }

    // 7. Lembar Pengesahan TA [cite: 155]
    taAksesMenu(username) {
        const user = auth.getUser(username);
        if (!user || user.role !== "mahasiswa") return { success: false, message: "Anda tidak memiliki hak akses" };
        return { success: true };
    }

    taSubmit(username, data) {
        if (!data.nama || !data.nim) return { success: false, message: "Field wajib harus diisi" };
        return { success: true, status: "Menunggu Verifikasi" };
    }

    taAdminVerif(id) {
        const item = dummy.FilePengesahanTA.find(d => d.id === id);
        if (!item) return null;
        item.status = "Disetujui";
        return item;
    }

    taUnduh(username) {
        const item = dummy.FilePengesahanTA.find(d => d.username === username);
        if (!item || !item.filePath) return null;
        return item.filePath;
    }

    // 8. Surat Keterangan Lulus (SKL) [cite: 182]
    sklSubmit(username, data) {
        const user = auth.getUser(username);
        if (!user.lulus) return { success: false, message: "Belum memenuhi syarat SKL" };
        if (!data.nama || !data.nim) return { success: false, message: "Field wajib harus diisi" };
        return { success: true, status: "Menunggu Verifikasi" };
    }

    sklAdminVerif(id, approve) {
        const item = dummy.FileSKL.find(d => d.id === id);
        if (!item) return null;
        item.status = approve ? "Disetujui" : "Ditolak";
        return item;
    }

    sklUnduh(username) {
        const item = dummy.FileSKL.find(d => d.username === username);
        if (!item || !item.filePath) return null;
        return item.filePath;
    }

    // 9. Verifikasi Wisuda [cite: 209]
    wisudaUpload(username, file) {
        if (!file.endsWith(".pdf")) return { success: false, message: "Format file tidak valid" };
        return { success: true, status: "Menunggu Verifikasi Admin" };
    }

    wisudaAdminVerif(id, approve) {
        const item = dummy.FileVerifikasiWisuda.find(d => d.id === id);
        if (!item) return null;
        item.status = approve ? "Disetujui" : "Ditolak";
        return item;
    }
    
    wisudaCekStatus(username) {
        const item = dummy.FileVerifikasiWisuda.find(d => d.username === username);
        return item ? item.status : null;
    }

    // 10. Transkrip Nilai [cite: 215]
    transkripCek(username) {
        const user = auth.getUser(username);
        const fileEntry = dummy.FileTranskripNilai.find(e => e.username === username);
        if (fileEntry && fileEntry.filePath) return { lulus: user.lulus, file: true };
        return { lulus: user.lulus, file: false };
    }

    transkripUnduh(username) {
        const fileEntry = dummy.FileTranskripNilai.find(e => e.username === username);
        return (fileEntry && fileEntry.filePath) ? fileEntry.filePath : null;
    }
}

module.exports = new AkademikModel();