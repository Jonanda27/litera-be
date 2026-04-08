import { User, Level, Module, Lesson, UserProgress, Certificate } from "../models/index.js";

export const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Ambil data Level dan Modul
    const levels = await Level.findAll({
      include: [{
        model: Module,
        attributes: ['id', 'nama_modul'],
      }],
      order: [['id', 'ASC']]
    });

    const formattedData = [];

    // 2. Loop melalui setiap Level
    for (const level of levels) {
      const modulesInLevel = [];
      let totalCompletedInLevel = 0;

      // 3. Loop melalui setiap Modul dalam Level tersebut
      for (const mod of level.Modules) {
        // Hitung total materi dalam modul
        const totalLessons = await Lesson.count({ where: { module_id: mod.id } });
        
        // Hitung materi yang sudah diselesaikan user
        const completedLessons = await UserProgress.count({
          where: { 
            user_id: userId, 
            module_id: mod.id, 
            status_selesai: true 
          }
        });

        // Hitung persentase progres modul
        const progressPercent = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;

        // Ambil data sertifikat jika sudah ada
        const cert = await Certificate.findOne({
          where: { user_id: userId, module_id: mod.id }
        });

        if (progressPercent === 100) {
          totalCompletedInLevel++;
        }

        modulesInLevel.push({
          id: mod.id,
          title: mod.nama_modul,
          progress: progressPercent,
          isLocked: progressPercent < 100,
          certificateUrl: progressPercent === 100 ? (cert?.url_file || "#") : null
        });
      }

      // 4. Hitung persentase progres Level (asumsi 1 level = 5 modul sesuai logika dashboard Anda)
      const totalModulDiLevel = level.Modules.length || 5; 
      const levelProgress = Math.round((totalCompletedInLevel / totalModulDiLevel) * 100);

      formattedData.push({
        id: level.id,
        levelName: level.nama_level,
        totalProgress: levelProgress > 100 ? 100 : levelProgress,
        modules: modulesInLevel
      });
    }

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Certificate API Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};