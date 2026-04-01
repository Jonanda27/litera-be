// litera-be/controllers/discussionController.js
import { Discussion,User, DiscussionMember, PrivateChatMessage } from "../models/index.js";

// Ambil semua daftar grup diskusi
export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      // Mengambil data dari tabel User tanpa profile_url
      include: [
        {
          model: User,
          as: 'owner', // Sesuai dengan alias yang didefinisikan di index.js
          attributes: ['id', 'nama', 'email'], // Hanya mengambil id, nama, dan email
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Ambil semua grup yang SUDAH DIIKUTI oleh user (Data Lengkap) 
export const getMyJoinedDiscussions = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari middleware verifyToken [cite: 1664]

    // Mencari user beserta asosiasi grup yang diikuti melalui tabel junction
    const userWithGroups = await User.findByPk(userId, {
      include: [{
        model: Discussion,
        as: 'joinedDiscussions', // Pastikan alias ini sesuai di models/index.js [cite: 1845]
        through: { attributes: [] } // Sembunyikan kolom dari tabel junction
      }]
    });

    if (!userWithGroups) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: userWithGroups.joinedDiscussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // Diambil dari middleware auth

    if (!name) return res.status(400).json({ message: "Nama ruangan wajib diisi" });

    // --- PENGECEKAN BATASAN 1 USER 1 GRUP ---
    const existingDiscussion = await Discussion.findOne({ 
      where: { owner_id: userId } 
    });

    if (existingDiscussion) {
      return res.status(400).json({ 
        success: false,
        message: "Anda hanya diperbolehkan membuat satu ruang diskusi." 
      });
    }
    // ----------------------------------------

    // 1. Buat record diskusi baru
    const newDiscussion = await Discussion.create({ 
      name, 
      description: description || "Ruang diskusi baru",
      owner_id: userId // Simpan ID si pembuat
    });

    // 2. OTOMATIS GABUNG: Buat record di tabel DiscussionMember
    await DiscussionMember.create({
      discussion_id: newDiscussion.id,
      user_id: userId
    });

    res.status(201).json({ 
      success: true, 
      message: "Ruang diskusi berhasil dibuat dan Anda otomatis bergabung", 
      data: newDiscussion 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.body;
    const userId = req.user.id;

    // Cek apakah sudah terdaftar
    const existing = await DiscussionMember.findOne({
      where: { discussion_id: discussionId, user_id: userId }
    });

    if (existing) return res.status(200).json({ success: true, message: "Sudah bergabung" });

    await DiscussionMember.create({ discussion_id: discussionId, user_id: userId });
    res.status(201).json({ success: true, message: "Berhasil bergabung ke grup" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDiscussionMembers = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findByPk(discussionId, {
      include: [{
        model: User,
        as: 'members', // Sesuai alias di models/index.js [cite: 1845]
        attributes: ['id', 'nama'],
        through: { attributes: [] } // Menghilangkan data tabel junction dari output
      }]
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Ruang diskusi tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: discussion.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPrivateChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const history = await PrivateChatMessage.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']],
      include: [{ 
        model: User, 
        as: 'sender', 
        attributes: ['id', 'nama'] 
      }]
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Menyimpan pesan baru ke database (Opsional jika ingin via HTTP POST)
 */
const BOT_RESPONSES = [
  // --- GREETINGS & UMUM ---
  {
    keywords: ["halo", "hallo", "hai", "hei", "selamat pagi", "pagi", "siang", "sore", "malam", "assalamualaikum", "assalamu'alaikum"],
    answer: "Halo! Selamat datang di ruang bimbingan. Ada yang bisa dibantu terkait progres menulismu hari ini? Jangan ragu untuk menceritakan idemu di sini ya!"
  },
  {
    keywords: ["terima kasih", "makasih", "thanks", "tq", "thank you", "makasih banyak", "terimakasih"],
    answer: "Sama-sama! Semangat terus ya nulisnya. Kalau nanti ada kendala lagi atau butuh feedback untuk naskahmu, langsung saja chat di sini. Saya akan dengan senang hati membantu!"
  },
  {
    keywords: ["baik kak", "oke kak", "oke", "ok", "siap", "baiklah", "sip"],
    answer: "Sip! Ditunggu kabar baik dari progres tulisanmu selanjutnya ya. Semangat!"
  },

  // --- ADMINISTRASI & PUBLIKASI ---
  {
    keywords: ["isbn", "cara daftar isbn", "buat isbn", "ngurus isbn"],
    answer: "Untuk mendapatkan ISBN, Anda bisa mendaftar melalui penerbit resmi atau mengurusnya di Perpusnas jika menerbitkan secara mandiri (Self-Publishing). Ada yang ingin didiskusikan lebih spesifik terkait hal ini?"
  },
  {
    keywords: ["plagiarisme", "cek plagiasi", "turnitin", "jiplak"],
    answer: "Untuk menghindari plagiarisme, pastikan Anda menggunakan teknik parafrase dan selalu mencantumkan sumber di menu 'Daftar Pustaka'. Sistem dapat membantu mereview orisinalitas naskah Anda nanti."
  },
  {
    keywords: ["cara nerbitin", "penerbit", "self publishing", "mayor", "terbit buku", "menerbitkan"],
    answer: "Ada 2 jalur utama menerbitkan buku: Penerbit Mayor (gratis & diseleksi ketat) atau Self-Publishing (biaya mandiri & bebas atur). Fokus selesaikan draf pertamamu dulu yuk! Nanti kita bisa tentukan strategi publikasi yang paling pas buat karyamu."
  },
  {
    keywords: ["cover", "sampul", "bikin cover", "desain cover", "ukuran cover"],
    answer: "Cover itu ibarat wajah buku kamu. Kamu bisa mengumpulkan referensi gaya visual di 'Papan Visi', lalu mengunggah desain finalmu di menu 'Cover Buku'. Jika bingung soal konsep visualnya, silakan tanyakan di sini!"
  },

  // --- TEKNIS PENULISAN & EDITOR ---
  {
    keywords: ["daftar isi", "buat daftar isi", "table of content", "list bab"],
    answer: "Daftar isi akan tersusun secara otomatis berdasarkan judul bab yang kamu buat di menu 'Outline'. Pastikan setiap bab sudah memiliki judul yang jelas agar saat proses Export, daftar isi naskahmu terlihat rapi dan profesional."
  },
  {
    keywords: ["outline", "kerangka tulisan", "cara buat outline", "struktur bab"],
    answer: "Outline sangat penting agar ceritamu tidak melebar! Mulailah dengan menuliskan ide pokok tiap bab di menu 'Experiment > Outline'."
  },
  {
    keywords: ["typo", "ejaan", "puebi", "tata bahasa", "titik koma", "grammar", "huruf kapital"],
    answer: "Jangan terlalu pusing dengan Typo saat menulis draf awal, biarkan idemu mengalir dulu! Nanti kamu bisa merapikannya secara instan menggunakan fitur 'Asisten Penulis (Cek Typo & Grammar)' di menu Tools."
  },
  {
    keywords: ["font", "ukuran huruf", "margin", "format spasi", "kertas", "ukuran buku", "format naskah"],
    answer: "Standar naskah buku umumnya menggunakan font Serif (seperti Times New Roman 12pt), spasi 1.5, dengan margin normal di kertas A4. Tapi tenang saja, saat kamu Export ke PDF melalui sistem kami, format naskahmu akan otomatis dirapikan!"
  },
  {
    keywords: ["berapa halaman", "berapa kata", "jumlah halaman", "target kata", "panjang buku"],
    answer: "Standar novel/fiksi biasanya 50.000 - 80.000 kata (sekitar 150-250 halaman). Untuk non-fiksi bisa 30.000 - 60.000 kata. Tetapkan 'Target Kata Harian' di editor penulisan agar kamu tetap konsisten. Jangan jadikan beban, tulis saja dulu!"
  },

  // --- KREATIFITAS & ALUR CERITA ---
  {
    keywords: ["ide menarik", "cari ide", "dapat ide", "ide tulisan", "bingung ide", "ide cerita", "inspirasi", "ide bagus", "ide buku"],
    answer: "Ide menarik biasanya muncul dari pertanyaan 'Bagaimana jika...?' (What if?). Kamu bisa mulai mengamati hal-hal di sekitarmu, pengalaman pribadi, atau menggabungkan dua genre yang berbeda. Coba kumpulkan inspirasi visualmu di 'Papan Visi' atau catat spontan di 'Ide Cepat'."
  },
  {
    keywords: ["stuck", "mentok", "writers block", "writer block", "bingung nulis", "hilang ide", "susah lanjut", "buntu"],
    answer: "Wajar banget kok mengalami Writer's Block! 🧘‍♂️ Coba istirahat sejenak, atau buka fitur 'Papan Visi' dan 'Ide Cepat' untuk memancing inspirasi visualmu lagi. Kalau masih mentok, ceritain di sini bagian mana yang bikin jalan ceritanya buntu."
  },
  {
    keywords: ["mulai darimana", "cara mulai", "ide pertama", "awalan buku", "cara buka cerita", "bab 1", "prolog"],
    answer: "Mulai dari yang paling gampang: tuliskan ide kasarmu di menu 'Ide Cepat'! Untuk awalan bab, coba gunakan teknik 'Hook' (kejutan/pertanyaan di kalimat pertama) agar pembaca langsung penasaran."
  },
  {
    keywords: ["bikin karakter", "tokoh utama", "penokohan", "karakteristik", "sifat tokoh", "nama tokoh", "antagonis"],
    answer: "Karakter yang kuat itu harus punya Motivasi (apa yang dia mau?) dan Kelemahan (apa ketakutannya?). Coba lengkapi profil tokohmu secara detail di menu 'Profil Karakter' agar tokohmu terasa lebih hidup."
  },
  {
    keywords: ["plot hole", "alur bolong", "konsistensi", "alur cerita", "konflik", "klimaks", "ending"],
    answer: "Plot hole sering terjadi kalau kerangka ceritanya tidak tertata. Coba petakan urutan adeganmu di fitur 'Papan Plot' (Storyboard). Kamu juga bisa pakai fitur 'Scan AI Tokoh' di editor untuk mengecek konsistensi naskahmu secara otomatis lho!"
  }
];

export const savePrivateMessage = async (req, res) => {
  try {
    const { roomId, recipientId, recipientRole, message } = req.body;
    const senderId = req.user?.id;

    if (!recipientId || !recipientRole || !message || !roomId) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap" });
    }

    // 1. Simpan Pesan Asli dari Peserta
    const newMessage = await PrivateChatMessage.create({
      senderId,
      recipientId: parseInt(recipientId),
      recipientRole, 
      roomId,
      message,
      isRead: false
    });

    // 2. LOGIKA AUTO-REPLY (Hanya berjalan jika Peserta mengirim ke Mentor)
    let autoReplyMessage = null;
    if (recipientRole === 'mentor') {
      const lowerCaseMsg = message.toLowerCase();
      
      // Cek apakah ada keyword yang cocok
      const matchedRule = BOT_RESPONSES.find(rule => 
        rule.keywords.some(kw => lowerCaseMsg.includes(kw))
      );

      if (matchedRule) {
        // Jika cocok, buat pesan balasan dari Sistem (Kita pinjam ID mentor sbg pengirim, tapi kita beri flag [SYSTEM])
        autoReplyMessage = await PrivateChatMessage.create({
          senderId: parseInt(recipientId), // Mentor (Sistem bertindak atas nama mentor)
          recipientId: senderId, // Balik ke peserta
          recipientRole: 'peserta',
          roomId,
          message: `[SYSTEM] ${matchedRule.answer}`, // Flag [SYSTEM] penting untuk parsing di Frontend
          isRead: false
        });
      }
    }

    // Kembalikan 2 data: pesan user dan pesan bot (jika ada)
    return res.status(201).json({ 
      success: true, 
      data: newMessage,
      autoReply: autoReplyMessage
    });
    
  } catch (error) {
    console.error("Error Detail:", error);
    return res.status(500).json({ success: false, message: "Gagal simpan chat privat: " + error.message });
  }
};