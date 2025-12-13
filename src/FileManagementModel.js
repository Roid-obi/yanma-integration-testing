/**
 * FileManagementModel.js
 * Modul untuk mengelola file uploads, storage, dan downloads
 * INTEGRATION: Digunakan oleh Akademik, Kemahasiswaan, Alumni
 */

const fs = require('fs');
const path = require('path');

class FileManagementModel {
    constructor() {
        this.uploadDir = 'public/uploads';
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedExtensions = ['.pdf', '.doc', '.docx', '.zip'];
    }

    /**
     * Validasi dan simpan file
     * @param {File} file - File object dengan properties: name, size
     * @param {string} category - Kategori file (pengesahan, skl, surat, dll)
     * @returns {Object} - {success: boolean, fileId: string|null, message: string}
     */
    uploadFile(file, category) {
        // Validasi file ada
        if (!file || !file.name) {
            return { success: false, message: "File tidak ditemukan", fileId: null };
        }

        // Validasi ukuran file
        if (file.size > this.maxFileSize) {
            return {
                success: false,
                message: `Ukuran file tidak boleh melebihi ${this.maxFileSize / (1024 * 1024)}MB`,
                fileId: null
            };
        }

        // Validasi format file
        const ext = path.extname(file.name).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) {
            return {
                success: false,
                message: `Format file tidak didukung. Format yang diizinkan: ${this.allowedExtensions.join(', ')}`,
                fileId: null
            };
        }

        // Generate unique file ID
        const fileId = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `${this.uploadDir}/${category}/${fileId}${ext}`;

        return {
            success: true,
            fileId: fileId,
            filePath: filePath,
            message: "File berhasil diunggah",
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
        };
    }

    /**
     * Retrieve file untuk download
     * @param {string} fileId - ID file yang akan didownload
     * @returns {Object|null} - File object atau null jika tidak ditemukan
     */
    getFile(fileId) {
        if (!fileId) return null;

        // Simulasi pengambilan file dari database
        const mockFiles = {
            'pengesahan_mahasiswa.pdf': {
                filename: 'pengesahan_mahasiswa.pdf',
                filePath: 'public/pengesahan/pengesahan_mahasiswa.pdf',
                size: 1524288
            },
            'skl_alumni.pdf': {
                filename: 'skl_alumni.pdf',
                filePath: 'public/skl/skl_alumni.pdf',
                size: 896000
            }
        };

        return mockFiles[fileId] || null;
    }

    /**
     * Hapus file dari storage
     * @param {string} fileId - ID file yang akan dihapus
     * @returns {Object} - {success: boolean, message: string}
     */
    deleteFile(fileId) {
        if (!fileId) {
            return { success: false, message: "File ID tidak valid" };
        }

        // Simulasi penghapusan file
        return { success: true, message: "File berhasil dihapus" };
    }

    /**
     * Get file info tanpa download
     * @param {string} filePath - Path file
     * @returns {Object} - File metadata
     */
    getFileInfo(filePath) {
        if (!filePath) return null;

        return {
            filename: path.basename(filePath),
            path: filePath,
            exists: true,
            size: 1024 * 1024, // Mock size
            type: 'application/pdf'
        };
    }
}

module.exports = new FileManagementModel();
