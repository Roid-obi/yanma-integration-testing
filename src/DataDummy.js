const users = [
    { username: "mahasiswa", password: "123", role: "mahasiswa", nama: "Budi", lulus: false },
    { username: "mahasiswa2", password: "123", role: "mahasiswa", nama: "Siti", lulus: false },
    { username: "alumni", password: "123", role: "alumni", nama: "Andi", lulus: true },
    { username: "alumni2", password: "123", role: "alumni", nama: "Joko", lulus: true },
    { username: "admin", password: "admin", role: "admin", nama: "Admin01" },
    { username: "Farhan", password: "123", role: "mahasiswa", nama: "Farhan", nim: "123", lulus: false }
];

const FilePengesahanTA = [
    { id: 1, username: "Farhan", status: "Menunggu Verifikasi", filePath: null },
    { id: 2, username: "mahasiswa2", status: "Disetujui", filePath: "public/pengesahan/pengesahan_mahasiswa.pdf" }
];

const FileSKL = [
    { id: 1, username: "Farhan", status: "Menunggu Verifikasi", filePath: null },
    { id: 2, username: "alumni", status: "Disetujui", filePath: "public/skl/skl_alumni.pdf" }
];

const FileVerifikasiWisuda = [
    { id: 1, username: "mahasiswa", status: "Menunggu Verifikasi Admin" },
    { id: 2, username: "alumni", status: "Disetujui" }
];

const FileTranskripNilai = [
    { username: "alumni", filePath: "public/transkripNilai/transkrip_alumni.pdf" }
];

const FileSuratKeteranganPengantar = [
    { username: "mahasiswa", filePath: "public/suratKeteranganPengantar/keterangan_pengantar_mahasiswa.pdf" }
];

const FileSuratKeteranganMasihKuliah = [
    { username: "mahasiswa", filePath: "public/suratKeteranganMasihKuliah/keterangan_masih_kuliah_mahasiswa.pdf" }
];

const LegalisirDB = [
    { kode: "LG123", status: "Diproses" }
];

module.exports = { 
    users, 
    FilePengesahanTA, 
    FileSKL, 
    FileVerifikasiWisuda, 
    FileTranskripNilai, 
    FileSuratKeteranganPengantar, 
    FileSuratKeteranganMasihKuliah,
    LegalisirDB
};