/**
 * AuditLogModel.js
 * Modul untuk mencatat semua aktivitas user dalam sistem
 * INTEGRATION: Digunakan oleh semua modul untuk audit trail
 */

class AuditLogModel {
    constructor() {
        this.logs = [];
    }

    /**
     * Log aktivitas user
     * @param {string} actor - Username yang melakukan aksi
     * @param {string} action - Tipe aksi (LOGIN, LOGOUT, SUBMIT, APPROVE, etc)
     * @param {string} targetModule - Modul yang diakses
     * @param {string} details - Detail aksi
     * @param {string} status - Status aksi (SUCCESS, FAILED)
     * @returns {Object} - {success: boolean, logId: number}
     */
    logActivity(actor, action, targetModule, details, status = "SUCCESS") {
        if (!actor || !action || !targetModule) {
            return { success: false, message: "Actor, action, dan targetModule wajib diisi" };
        }

        const log = {
            id: this.logs.length + 1,
            actor: actor,
            action: action,
            targetModule: targetModule,
            details: details,
            timestamp: new Date().toISOString(),
            ipAddress: "0.0.0.0", // Simulasi IP
            status: status
        };

        this.logs.push(log);

        return {
            success: true,
            logId: log.id,
            message: "Aktivitas berhasil dicatat"
        };
    }

    /**
     * Get audit logs untuk user tertentu
     * @param {string} actor - Username (optional)
     * @param {string} action - Tipe action (optional)
     * @returns {Array} - List logs
     */
    getLogs(actor = null, action = null) {
        let results = this.logs;

        if (actor) {
            results = results.filter(l => l.actor === actor);
        }

        if (action) {
            results = results.filter(l => l.action === action);
        }

        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get logs by module
     * @param {string} module - Nama module
     * @returns {Array} - List logs
     */
    getLogsByModule(module) {
        if (!module) return [];
        return this.logs.filter(l => l.targetModule === module)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get logs by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Array} - List logs dalam range
     */
    getLogsByDateRange(startDate, endDate) {
        if (!startDate || !endDate) return [];

        return this.logs.filter(l => {
            const logDate = new Date(l.timestamp);
            return logDate >= startDate && logDate <= endDate;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get failed attempts untuk user
     * @param {string} actor - Username
     * @returns {Array} - List failed attempts
     */
    getFailedAttempts(actor) {
        if (!actor) return [];
        return this.logs.filter(l => l.actor === actor && l.status === "FAILED");
    }

    /**
     * Get summary stats
     * @returns {Object} - Summary statistics
     */
    getStats() {
        return {
            totalLogs: this.logs.length,
            totalSuccess: this.logs.filter(l => l.status === "SUCCESS").length,
            totalFailed: this.logs.filter(l => l.status === "FAILED").length,
            uniqueActors: new Set(this.logs.map(l => l.actor)).size,
            modulesCovered: new Set(this.logs.map(l => l.targetModule)).size
        };
    }
}

module.exports = new AuditLogModel();
