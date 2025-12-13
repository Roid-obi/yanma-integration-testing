/**
 * StatusTrackingModel.js
 * Modul untuk melacak status pengajuan dan progress
 * INTEGRATION: Digunakan oleh semua modul untuk tracking pengajuan
 */

class StatusTrackingModel {
    constructor() {
        // Simulasi database status tracking
        this.statusList = [];
    }

    /**
     * Create status tracking untuk pengajuan baru
     * @param {string} username - Username user yang mengajukan
     * @param {string} tipeAjuan - Tipe pengajuan (Perpanjangan Studi, SKL, TA, etc)
     * @returns {Object} - {success: boolean, trackingId: number}
     */
    createTracking(username, tipeAjuan) {
        if (!username || !tipeAjuan) {
            return { success: false, message: "Username dan tipe ajuan wajib diisi" };
        }

        const tracking = {
            id: this.statusList.length + 1,
            username: username,
            tipeAjuan: tipeAjuan,
            status: "Menunggu Verifikasi",
            submissionDate: new Date().toISOString().split('T')[0],
            lastUpdate: new Date().toISOString().split('T')[0],
            progress: 0,
            timeline: [
                {
                    status: "Menunggu Verifikasi",
                    timestamp: new Date().toISOString(),
                    progress: 0
                }
            ]
        };

        this.statusList.push(tracking);

        return {
            success: true,
            trackingId: tracking.id,
            message: "Tracking status berhasil dibuat"
        };
    }

    /**
     * Update status pengajuan
     * @param {number} trackingId - ID tracking
     * @param {string} newStatus - Status baru
     * @param {number} progress - Progress percentage (0-100)
     * @returns {Object} - {success: boolean, message: string}
     */
    updateStatus(trackingId, newStatus, progress = null) {
        const tracking = this.statusList.find(t => t.id === trackingId);

        if (!tracking) {
            return { success: false, message: "Tracking ID tidak ditemukan" };
        }

        const validStatuses = [
            "Menunggu Verifikasi",
            "Diverifikasi",
            "Direvisi",
            "Disetujui",
            "Ditolak",
            "Diproses",
            "Selesai Diproses"
        ];

        if (!validStatuses.includes(newStatus)) {
            return { success: false, message: "Status tidak valid" };
        }

        // Update tracking
        tracking.status = newStatus;
        tracking.lastUpdate = new Date().toISOString().split('T')[0];

        if (progress !== null && progress >= 0 && progress <= 100) {
            tracking.progress = progress;
        }

        tracking.timeline.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            progress: progress
        });

        return {
            success: true,
            message: "Status berhasil diperbarui",
            currentStatus: newStatus,
            progress: tracking.progress
        };
    }

    /**
     * Get status pengajuan
     * @param {string} username - Username user
     * @param {string} tipeAjuan - Tipe ajuan (optional, jika kosong ambil semua)
     * @returns {Array} - List status pengajuan
     */
    getStatus(username, tipeAjuan = null) {
        if (!username) return [];

        let results = this.statusList.filter(t => t.username === username);

        if (tipeAjuan) {
            results = results.filter(t => t.tipeAjuan === tipeAjuan);
        }

        return results;
    }

    /**
     * Get tracking by ID
     * @param {number} trackingId - ID tracking
     * @returns {Object|null} - Tracking object atau null
     */
    getTrackingById(trackingId) {
        return this.statusList.find(t => t.id === trackingId) || null;
    }

    /**
     * Get all active pengajuan (untuk admin)
     * @returns {Array} - List semua pengajuan aktif
     */
    getAllActive() {
        return this.statusList.filter(t =>
            t.status !== "Disetujui" && t.status !== "Ditolak"
        );
    }
}

module.exports = new StatusTrackingModel();
