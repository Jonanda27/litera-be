import { User, Mentor, UserProgress } from "../models/index.js";

export const getDashboardSummary = async (req, res) => {
    try {
        // Mengeksekusi seluruh query agregasi secara paralel untuk efisiensi I/O
        const [
            totalPeserta,
            totalMentor,
            totalAktivitasModulSelesai,
            rataRataProgres
        ] = await Promise.all([
            // 1. Menghitung total entitas User (Peserta)
            User.count(),

            // 2. Menghitung total entitas Mentor
            Mentor.count(),

            // 3. Menghitung total modul yang sudah berstatus selesai di seluruh sistem
            UserProgress.count({
                where: { status_selesai: true }
            }),

            // 4. (Opsional/Bonus Analitis) Mengambil rata-rata progres seluruh user
            User.aggregate('persentase_progres', 'avg')
        ]);

        // Menyusun respons dengan format JSON standar (JSend Format)
        res.status(200).json({
            status: "success",
            message: "Data agregasi dashboard berhasil diambil",
            data: {
                totalPeserta,
                totalMentor,
                totalAktivitasModulSelesai,
                rataRataProgresSistem: rataRataProgres ? Math.round(rataRataProgres) : 0
            }
        });

    } catch (error) {
        console.error("❌ Error Dashboard Summary Aggregation:", error.message);
        res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan internal saat menghitung data metrik sistem."
        });
    }
};