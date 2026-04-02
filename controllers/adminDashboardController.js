import * as adminDashboardService from "../services/adminDashboardService.js";

/**
 * Controller: Mendapatkan ringkasan data untuk dashboard admin
 */
export const getDashboardSummary = async (req, res) => {
    try {
        const dashboardData = await adminDashboardService.getDashboardSummaryData();

        res.status(200).json({
            status: "success",
            message: "Data agregasi dashboard berhasil diambil",
            data: dashboardData
        });

    } catch (error) {
        console.error("❌ Error Dashboard Summary Aggregation:", error.message);
        res.status(500).json({
            status: "error",
            message: error.message || "Terjadi kesalahan internal saat menghitung data metrik sistem."
        });
    }
};

/**
 * Controller: Mendapatkan data visualisasi grafik untuk dashboard admin
 * (Ditambahkan untuk memenuhi kebutuhan rute /charts)
 */
export const getDashboardCharts = async (req, res) => {
    try {
        const chartsData = await adminDashboardService.getDashboardChartsData();

        return res.status(200).json({
            status: "success",
            message: "Data grafik dashboard berhasil diambil",
            data: chartsData
        });

    } catch (error) {
        console.error("❌ Error Dashboard Charts:", error.message);
        return res.status(500).json({
            status: "error",
            message: error.message || "Terjadi kesalahan internal saat menghitung data grafik."
        });
    }
};

/**
 * Controller: Mendapatkan log aktivitas seluruh mentor (untuk Admin)
 * Diperbarui dengan dukungan tangkapan Query String untuk Pagination
 */
export const getAllMentorLogs = async (req, res) => {
    try {
        // Mengambil parameter pagination dari query string klien, atau gunakan nilai default
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;

        const logsData = await adminDashboardService.getAllMentorLogsData(page, limit);

        return res.status(200).json({
            status: "success",
            message: "Log aktivitas mentor berhasil diambil",
            // logsData.rows berisi array datanya, logsData.count berisi total keseluruhan data di DB
            data: logsData.rows,
            meta: {
                totalItems: logsData.count,
                currentPage: page,
                itemsPerPage: limit,
                totalPages: Math.ceil(logsData.count / limit)
            }
        });

    } catch (error) {
        console.error("❌ Error Get All Mentor Logs:", error.message);
        return res.status(500).json({
            status: "error",
            message: error.message || "Terjadi kesalahan saat mengambil data log aktivitas."
        });
    }
};

/**
 * Controller: Mengirim notifikasi / menyimpan log aksi mentor
 */
export const sendMentorNotification = async (req, res) => {
    try {
        const { mentorId, action, description } = req.body;

        const newLog = await adminDashboardService.createMentorNotificationData(
            mentorId,
            action,
            description
        );

        res.status(201).json({
            status: "success",
            message: "Notifikasi berhasil dikirim ke mentor.",
            data: newLog
        });

    } catch (error) {
        console.error("❌ Error Send Notification:", error.message);

        // Membedakan HTTP Status Code antara kesalahan validasi (400) dan kesalahan server (500)
        const statusCode = error.message.includes("wajib diisi") ? 400 : 500;

        res.status(statusCode).json({
            status: "error",
            message: error.message || "Gagal mengirim notifikasi."
        });
    }
};