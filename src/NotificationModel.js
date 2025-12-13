/**
 * NotificationModel.js
 * Modul untuk mengelola notifikasi pengguna
 * INTEGRATION: Digunakan oleh semua modul untuk push notification
 */

class NotificationModel {
    constructor() {
        this.notifications = [];
    }

    /**
     * Send notification ke user
     * @param {string} username - Username penerima
     * @param {string} type - Tipe notifikasi (status_update, approval, rejection, reminder)
     * @param {string} title - Judul notifikasi
     * @param {string} message - Isi pesan
     * @returns {Object} - {success: boolean, notificationId: number}
     */
    sendNotification(username, type, title, message) {
        if (!username || !type || !title || !message) {
            return { success: false, message: "Semua field wajib diisi" };
        }

        const validTypes = ["status_update", "approval", "rejection", "reminder"];
        if (!validTypes.includes(type)) {
            return { success: false, message: "Tipe notifikasi tidak valid" };
        }

        const notification = {
            id: this.notifications.length + 1,
            username: username,
            type: type,
            title: title,
            message: message,
            createdDate: new Date().toISOString(),
            readDate: null,
            isRead: false
        };

        this.notifications.push(notification);

        return {
            success: true,
            notificationId: notification.id,
            message: "Notifikasi berhasil dikirim"
        };
    }

    /**
     * Get notifikasi untuk user
     * @param {string} username - Username user
     * @param {boolean} unreadOnly - Hanya ambil notifikasi yang belum dibaca
     * @returns {Array} - List notifikasi
     */
    getNotifications(username, unreadOnly = false) {
        if (!username) return [];

        let results = this.notifications.filter(n => n.username === username);

        if (unreadOnly) {
            results = results.filter(n => !n.isRead);
        }

        return results.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    /**
     * Mark notifikasi sebagai dibaca
     * @param {number} notificationId - ID notifikasi
     * @returns {Object} - {success: boolean}
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);

        if (!notification) {
            return { success: false, message: "Notifikasi tidak ditemukan" };
        }

        notification.isRead = true;
        notification.readDate = new Date().toISOString();

        return { success: true, message: "Notifikasi ditandai sebagai dibaca" };
    }

    /**
     * Get unread count untuk user
     * @param {string} username - Username user
     * @returns {number} - Jumlah notifikasi yang belum dibaca
     */
    getUnreadCount(username) {
        if (!username) return 0;
        return this.notifications.filter(n => n.username === username && !n.isRead).length;
    }

    /**
     * Delete notifikasi
     * @param {number} notificationId - ID notifikasi
     * @returns {Object} - {success: boolean}
     */
    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);

        if (index === -1) {
            return { success: false, message: "Notifikasi tidak ditemukan" };
        }

        this.notifications.splice(index, 1);
        return { success: true, message: "Notifikasi berhasil dihapus" };
    }
}

module.exports = new NotificationModel();
