// file: litera-be/services/MentorActivityService.js
import db from '../models/index.js'; 

const { MentorActivityLog } = db; // Ambil model dari index db

class MentorActivityService {
    static async log(mentorId, action, description, targetUserId = null) {
        try {
            // Sekarang .create pasti dikenali sebagai fungsi
            await MentorActivityLog.create({
                mentor_id: mentorId,
                action: action,
                description: description,
                target_user_id: targetUserId
            });
        } catch (error) {
            console.error("Gagal menyimpan log mentor:", error);
        }
    }
}

export default MentorActivityService;