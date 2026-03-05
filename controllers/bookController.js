import { sequelize, Book, QuickIdea, MoodBoard, Research, Outline, Chapter, Character, Setting, Timeline, Plot,ReviewComment,ChapterVersion,DailyWordCount } from "../models/index.js";
import { Op } from "sequelize";

export const getWeeklyStats = async (req, res) => {
  try {
    const { bookId } = req.params;
    // Mengambil data 7 hari terakhir
    const stats = await DailyWordCount.findAll({
      where: { 
        bookId,
        date: { [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) } 
      },
      order: [['date', 'ASC']]
    });
    res.status(200).json({ data: stats });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil statistik", error: error.message });
  }
};
export const createBook = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari middleware verifyToken [cite: 578]
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Judul buku wajib diisi" });
    }

    // Membuat data buku baru 
    const newBook = await Book.create({
      title,
      userId
    });

    res.status(201).json({
      message: "Buku berhasil dibuat",
      data: {
        bookId: newBook.id,
        title: newBook.title
      }
    });
  } catch (error) {
    console.error("Create Book Error:", error);
    res.status(500).json({ 
      message: "Gagal membuat buku", 
      error: error.message 
    });
  }
};

export const getChapterVersions = async (req, res) => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      return res.status(400).json({ message: "chapterId wajib disertakan" });
    }

    // Mengambil semua versi yang terkait dengan chapterId tersebut
    const versions = await ChapterVersion.findAll({
      where: { chapterId },
      order: [['createdAt', 'DESC']] // Versi terbaru muncul di atas
    });

    return res.status(200).json({
      message: "Riwayat versi berhasil diambil",
      data: versions
    });
  } catch (error) {
    console.error("Get Chapter Versions Error:", error);
    res.status(500).json({ 
      message: "Gagal mengambil riwayat versi", 
      error: error.message 
    });
  }
};

export const saveChapterVersion = async (req, res) => {
  try {
    const { chapterId } = req.body;

    if (!chapterId) {
      return res.status(400).json({ message: "chapterId wajib disertakan" });
    }

    // 1. Ambil data bab saat ini (beserta judul bukunya agar namanya dinamis)
    const chapter = await Chapter.findOne({
      where: { id: chapterId },
      include: [{ model: Book }]
    });

    if (!chapter) {
      return res.status(404).json({ message: "Draf bab tidak ditemukan" });
    }

    // 2. Hitung jumlah versi yang sudah ada untuk bab ini
    const existingVersionsCount = await ChapterVersion.count({
      where: { chapterId: chapterId }
    });

    // 3. Tentukan nama versi selanjutnya (Misal: buku_v1, buku_v2, dst.)
    // Kita bisa ambil dari nama bukunya, atau gunakan fallback string "buku"
    const safeBookTitle = chapter.Book && chapter.Book.title 
      ? chapter.Book.title.replace(/\s+/g, '_').toLowerCase() 
      : 'buku';
    
    const nextVersionNumber = existingVersionsCount + 1;
    const versionName = `${safeBookTitle}_v${nextVersionNumber}`;

    // 4. Buat duplikat dari draf saat ini dan simpan ke tabel versi
    const newVersion = await ChapterVersion.create({
      chapterId: chapter.id,
      version_name: versionName,
      content: chapter.content,
      word_count: chapter.word_count || 0
    });

    return res.status(201).json({
      message: `Berhasil menyimpan versi ${versionName}`,
      data: newVersion
    });

  } catch (error) {
    console.error("Save Chapter Version Error:", error);
    res.status(500).json({ message: "Gagal menyimpan versi", error: error.message });
  }
};

export const savePengembanganCerita = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { bookId, karakter, worldBuilding, timeline, plotItems, plotColumns } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID wajib disertakan" });
    }

    // Validasi Keamanan: Pastikan buku ada dan milik user
    const existingBook = await Book.findOne({ where: { id: bookId, userId } });
    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan atau akses ditolak" });
    }

    // 1. Simpan Karakter (Hapus data lama lalu masukkan yang baru)
    await Character.destroy({ where: { bookId }, transaction: t });
    if (karakter && karakter.length > 0) {
      const characterData = karakter.map(char => ({
        bookId,
        name: char.nama,
        age: char.umur,
        physical_desc: char.fisik,
        personality_backstory: `${char.kepribadian || ''}\n${char.latarBelakang || ''}`.trim(),
        image_url: char.image // Base64 string dari FE
      }));
      await Character.bulkCreate(characterData, { transaction: t });
    }

    // 2. Simpan Worldbuilding (Setting)
    await Setting.destroy({ where: { bookId }, transaction: t });
    if (worldBuilding) {
      await Setting.create({
        bookId,
        location_name: worldBuilding.lokasi,
        description_ambiance: worldBuilding.deskripsi,
        history_relation: worldBuilding.sejarah,
        resident_characters: worldBuilding.karakterPenghuni
      }, { transaction: t });
    }

    // 3. Simpan Timeline
    await Timeline.destroy({ where: { bookId }, transaction: t });
    if (timeline && timeline.length > 0) {
      const timelineData = timeline.map(tm => ({
        bookId,
        time_date: tm.waktu,
        event: tm.kejadian,
        involved_characters: tm.karakter
      }));
      await Timeline.bulkCreate(timelineData, { transaction: t });
    }

    // 4. Simpan Papan Plot (Plots)
    await Plot.destroy({ where: { bookId }, transaction: t });
    if (plotItems && plotItems.length > 0) {
      const plotData = plotItems.map((item, index) => {
        // Cari judul babak dari plotColumns berdasarkan ID
        const column = plotColumns.find(col => col.id === item.babak);
        return {
          bookId,
          act: column ? column.title : "Babak Tidak Diketahui",
          tag: item.type,
          title: item.label,
          description: item.desc,
          order_index: index
        };
      });
      await Plot.bulkCreate(plotData, { transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: "Data Pengembangan berhasil disimpan/diperbarui!" });

  } catch (error) {
    await t.rollback();
    console.error("Error saving Pengembangan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const getPengembangan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const book = await Book.findOne({
      where: { 
        id: bookId,
        userId: userId 
      },
      include: [
        { model: Character },
        { model: Setting },
        { model: Timeline },
        { 
          model: Plot,
          order: [['order_index', 'ASC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    // Ubah ke Plain JSON
    const plainBook = book.toJSON();

    // 1. Mapping Karakter
    // Jaga-jaga penamaan plural/singular dari Sequelize
    const charactersData = plainBook.Characters || plainBook.Character || [];
    const karakter = charactersData.map(c => {
      // Pecah kembali kepribadian & latar belakang
      const parts = c.personality_backstory ? c.personality_backstory.split('\n') : ['', ''];
      return {
        nama: c.name || "",
        umur: c.age || "",
        fisik: c.physical_desc || "",
        kepribadian: parts[0] || "",
        latarBelakang: parts[1] || "",
        image: c.image_url || null
      };
    });

    // 2. Mapping World Building (Setting)
    const settingsData = plainBook.Settings?.[0] || plainBook.Setting || {};
    const worldBuilding = {
      lokasi: settingsData.location_name || "",
      deskripsi: settingsData.description_ambiance || "",
      sejarah: settingsData.history_relation || "",
      karakterPenghuni: settingsData.resident_characters || ""
    };

    // 3. Mapping Timeline
    const timelinesData = plainBook.Timelines || plainBook.Timeline || [];
    const timeline = timelinesData.map(t => ({
      waktu: t.time_date || "",
      kejadian: t.event || "",
      karakter: t.involved_characters || ""
    }));

    // 4. Mapping Plot Items & Columns
    const plotsData = plainBook.Plots || plainBook.Plot || [];
    
    // Karena di database kita hanya simpan "act" (string judul babak), 
    // kita perlu generate kembali plotColumns untuk Frontend
    const uniqueActs = [...new Set(plotsData.map(p => p.act))];
    let plotColumns = uniqueActs.map((actName, index) => ({
      id: `babak-${index + 1}`,
      title: actName || `Babak ${index + 1}`
    }));

    // Beri default column jika plot kosong
    if (plotColumns.length === 0) {
      plotColumns = [{ id: "babak-1", title: "Perkenalan" }];
    }

    const plotItems = plotsData.map(p => {
      // Cocokkan judul act dari DB dengan column ID untuk FE
      const col = plotColumns.find(c => c.title === p.act) || plotColumns[0];
      return {
        id: p.id.toString(),
        babak: col.id,
        label: p.title || "",
        desc: p.description || "",
        type: p.tag || ""
      };
    });

    res.status(200).json({
      message: "Data Pengembangan berhasil diambil",
      data: {
        bookId: plainBook.id,
        karakter,
        worldBuilding,
        timeline,
        plotColumns,
        plotItems
      }
    });

  } catch (error) {
    console.error("Error fetching Pengembangan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const getCharacters = async (req, res) => {
  try {
    const { bookId } = req.query; // Mengambil bookId dari query parameter (?bookId=1)

    if (!bookId) {
      return res.status(400).json({ message: "Book ID wajib disertakan" });
    }

    const characters = await Character.findAll({
      where: { bookId },
      order: [['id', 'ASC']] // Mengurutkan berdasarkan ID atau urutan pembuatan
    });

    // Opsional: Jika Anda ingin memetakan kembali formatnya agar sesuai dengan FE
    const formattedCharacters = characters.map(char => ({
      id: char.id,
      nama: char.name,
      umur: char.age,
      fisik: char.physical_desc,
      // Karena sebelumnya di-merge dengan \n, kita kirimkan apa adanya 
      // atau FE bisa melakukan .split('\n') jika ingin dipisahkan lagi
      deskripsiLengkap: char.personality_backstory, 
      image: char.image_url
    }));

    res.status(200).json({
      message: "Data karakter berhasil diambil",
      data: formattedCharacters
    });

  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server saat mengambil data karakter", 
      error: error.message 
    });
  }
};

export const saveChapterContent = async (req, res) => {
  try {
    const { bookId, chapterId, title, content, wordCount, dailyTarget } = req.body;

    // 1. Logika Simpan atau Update Bab Utama [cite: 147, 148, 149]
    let currentChapterId = chapterId;

    if (chapterId) {
      await Chapter.update({
        title,
        content, 
        word_count: wordCount,
        daily_target: dailyTarget,
        updatedAt: new Date()
      }, {
        where: { id: chapterId }
      });
    } else {
      const newChapter = await Chapter.create({
        bookId,
        title: title || "Bab Tanpa Judul",
        content,
        word_count: wordCount,
        daily_target: dailyTarget || 1000,
        is_safe: true
      });
      currentChapterId = newChapter.id;
    }

    // 2. Logika Auto-Update Statistik Harian (Grafik)
    // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    /**
     * Menggunakan findOrCreate untuk memastikan baris data tersedia,
     * kemudian melakukan update. Ini lebih aman daripada upsert murni 
     * pada beberapa dialek database untuk memastikan data 'date' tidak duplikat.
     */
    const [record, created] = await DailyWordCount.findOrCreate({
      where: { 
        bookId: bookId, 
        date: today 
      },
      defaults: {
        word_count: wordCount
      }
    });

    // Jika record sudah ada (tidak baru dibuat), maka kita update jumlah katanya [cite: 166]
    if (!created) {
      await record.update({
        word_count: wordCount,
        updatedAt: new Date()
      });
    }

    return res.status(200).json({ 
      message: "Progres bab dan statistik harian berhasil diperbarui!", 
      chapterId: currentChapterId 
    });

  } catch (error) {
    console.error("Save Chapter Error:", error);
    res.status(500).json({ 
      message: "Gagal menyimpan teks", 
      error: error.message 
    });
  }
};

export const getChapterContent = async (req, res) => {
  try {
    const { bookId, chapterId } = req.query;

    let chapter;

    // 1. Jika ada chapterId, cari spesifik berdasarkan ID tersebut
    if (chapterId && chapterId !== "null") {
      chapter = await Chapter.findOne({
        where: { id: chapterId }
      });
    } 
    // 2. Jika hanya ada bookId, cari draf terakhir/utama untuk buku tersebut
    else if (bookId) {
      chapter = await Chapter.findOne({
        where: { bookId: bookId },
        order: [['updatedAt', 'DESC']] // Ambil yang paling baru diupdate
      });
    }

    if (!chapter) {
      return res.status(200).json({ 
        message: "Belum ada draf untuk bab ini",
        data: null 
      });
    }

    return res.status(200).json({
      message: "Data berhasil diambil",
      data: {
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.word_count,
        dailyTarget: chapter.daily_target
      }
    });

  } catch (error) {
    console.error("Get Chapter Error:", error);
    res.status(500).json({ message: "Gagal mengambil data", error: error.message });
  }
};

export const savePramenulis = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { 
      bookId,       // TAMBAHAN: Terima bookId dari frontend
      title, 
      ideCepat, 
      moodBoards, 
      researches, 
      outlines 
    } = req.body;

    let targetBookId = bookId;

    // ==============================================
    // 1. HANDLE BOOK (UPSERT: Update atau Create)
    // ==============================================
    if (targetBookId) {
      // MODE UPDATE: Pastikan buku ada dan milik user
      const existingBook = await Book.findOne({ where: { id: targetBookId, userId } });
      if (!existingBook) {
        await t.rollback();
        return res.status(404).json({ message: "Buku tidak ditemukan atau Anda tidak memiliki akses." });
      }
      // Update judul buku jika berubah
      await existingBook.update({ title: title || "Buku Tanpa Judul" }, { transaction: t });
    } else {
      // MODE CREATE: Buat buku baru
      const newBook = await Book.create({
        title: title || "Buku Tanpa Judul",
        userId: userId
      }, { transaction: t });
      targetBookId = newBook.id;
    }

    // ==============================================
    // 2. HANDLE QUICK IDEA (UPSERT)
    // ==============================================
    if (ideCepat && ideCepat.title) {
      const existingIdea = await QuickIdea.findOne({ where: { bookId: targetBookId } });
      if (existingIdea) {
        await existingIdea.update({
          title: ideCepat.title,
          description: ideCepat.description,
          category_tag: ideCepat.tag,
          date: ideCepat.date || new Date()
        }, { transaction: t });
      } else {
        await QuickIdea.create({
          bookId: targetBookId,
          title: ideCepat.title,
          description: ideCepat.description,
          category_tag: ideCepat.tag,
          date: ideCepat.date || new Date()
        }, { transaction: t });
      }
    }

    // ==============================================
    // PENDEKATAN "DELETE & RECREATE" UNTUK DATA ARRAY (BULK)
    // Ini lebih aman dan bersih daripada mencocokkan ID satu per satu
    // ==============================================

    if (targetBookId) {
       // Hapus data lama sebelum memasukkan yang baru (hanya jika ada data yang dikirim dari FE)
       if (moodBoards) await MoodBoard.destroy({ where: { bookId: targetBookId }, transaction: t });
       if (researches) await Research.destroy({ where: { bookId: targetBookId }, transaction: t });
       if (outlines) await Outline.destroy({ where: { bookId: targetBookId }, transaction: t });
    }

    // 3. Simpan Mood Boards Baru (Bulk)
    if (moodBoards && moodBoards.length > 0) {
      const moodBoardData = moodBoards.map(mb => ({
        bookId: targetBookId,
        image_url: mb.image_url,
        category: mb.category
      }));
      await MoodBoard.bulkCreate(moodBoardData, { transaction: t });
    }

    // 4. Simpan Riset Baru (Bulk)
    if (researches && researches.length > 0) {
      const researchData = researches.map(rs => ({
        bookId: targetBookId,
        source_title: rs.source_title,
        link_url: rs.link_url,
        notes: rs.notes
      }));
      await Research.bulkCreate(researchData, { transaction: t });
    }

    // 5. Simpan Outline Baru (Bulk)
    if (outlines && outlines.length > 0) {
      const outlineData = outlines.map((ot, index) => ({
        bookId: targetBookId,
        chapter_number: index + 1,
        title: ot.title || `Bab ${index + 1}`,
        summary: `${ot.sub1 || ''}\n${ot.sub2 || ''}`.trim(), 
        order_index: index
      }));
      await Outline.bulkCreate(outlineData, { transaction: t });
    }

    // ==============================================
    // SELESAI
    // ==============================================
    await t.commit();
    
    res.status(bookId ? 200 : 201).json({ 
      message: bookId ? "Proyek berhasil diperbarui!" : "Proyek baru berhasil disimpan!", 
      bookId: targetBookId 
    });

  } catch (error) {
    await t.rollback();
    console.error("Error saving/updating Pramenulis:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const getPramenulis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const book = await Book.findOne({
      where: { 
        id: bookId,
        userId: userId 
      },
      include: [
        { model: QuickIdea },
        { model: MoodBoard },
        { model: Research },
        { 
          model: Outline,
          order: [['order_index', 'ASC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ message: "Proyek tidak ditemukan" });
    }

    // 1. UBAH KE BENTUK PLAIN JSON DULU
    const plainBook = book.toJSON();

    // 2. MAPPING DARI OBJECT YANG SUDAH PLAIN
    const formattedData = {
      bookId: plainBook.id,
      title: plainBook.title,
      ideCepat: plainBook.QuickIdea ? {
        title: plainBook.QuickIdea.title,
        description: plainBook.QuickIdea.description,
        tag: plainBook.QuickIdea.category_tag,
        date: plainBook.QuickIdea.date
      } : null,
      
      // Ambil bawaan relasi, jaga-jaga kalau Sequelize pakai singular atau format lain
      moodBoards: plainBook.MoodBoards || plainBook.MoodBoard || [],
      researches: plainBook.Researches || plainBook.Research || plainBook.Researchs || [],
      
      outlines: (plainBook.Outlines || plainBook.Outline || []).map(ot => {
        const parts = ot.summary ? ot.summary.split('\n') : ['', ''];
        return {
          id: ot.id,
          title: ot.title,
          sub1: parts[0] || '',
          sub2: parts[1] || ''
        };
      })
    };

    res.status(200).json({
      message: "Data Pramenulis berhasil diambil",
      data: formattedData
    });

  } catch (error) {
    console.error("Error fetching Pramenulis:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
};


export const getAllBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await Book.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      // Jika asosiasi belum benar, hapus dulu bagian 'include' ini untuk test
      include: [
        { 
          model: QuickIdea, 
          required: false // Menggunakan Left Join agar buku tetap tampil meski ide kosong
        }
      ]
    });

    res.status(200).json({
      message: "Daftar buku berhasil diambil",
      data: books
    });
  } catch (error) {
    console.error("Get All Books Error:", error);
    res.status(500).json({ 
      message: "Gagal mengambil daftar buku", 
      error: error.message // Ini yang memunculkan pesan error tadi
    });
  }
};

// 2. Get Single Book Detail (Untuk memuat seluruh data proyek ke State FE)
export const getBookDetail = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID dari URL /api/books/:id
    const userId = req.user.id;

    const book = await Book.findOne({
      where: { id, userId },
      include: [
        { model: QuickIdea },
        { model: MoodBoard },
        { model: Research },
        { model: Outline },
        { model: Character },
        { model: Setting },
        { model: Timeline },
        { model: Plot }
      ]
    });

    if (!book) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data detail buku berhasil diambil",
      data: book
    });
  } catch (error) {
    console.error("Get Book Detail Error:", error);
    res.status(500).json({ message: "Gagal mengambil detail buku", error: error.message });
  }
};

export const saveComment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { chapterId, highlight_id, selected_text, comment_text, label, currentContent } = req.body;

    if (!chapterId || !highlight_id) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // 1. Simpan data komentar ke tabel Review_Comments
    const newComment = await ReviewComment.create({
      chapterId,
      highlight_id,
      selected_text,
      comment_text,
      label,
      status: 'open'
    }, { transaction: t });

    // 2. Update konten di tabel Chapters agar menyimpan tag span highlight
    // Ini penting agar saat halaman dimuat ulang, highlight tetap muncul
    await Chapter.update(
      { content: currentContent },
      { where: { id: chapterId }, transaction: t }
    );

    await t.commit();
    res.status(201).json({ 
      message: "Komentar berhasil disimpan", 
      data: newComment 
    });
  } catch (error) {
    await t.rollback();
    console.error("Save Comment Error:", error);
    res.status(500).json({ message: "Gagal menyimpan komentar", error: error.message });
  }
};

// --- API UNTUK AMBIL DAFTAR KOMENTAR PER BAB ---
export const getCommentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.query;
    const comments = await ReviewComment.findAll({
      where: { chapterId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil komentar", error: error.message });
  }
};

// --- API UNTUK MENGHAPUS KOMENTAR ---
export const deleteComment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { commentId, chapterId, highlight_id, currentContent } = req.body;

    if (!commentId || !chapterId || !highlight_id) {
      return res.status(400).json({ message: "Data penghapusan tidak lengkap" });
    }

    // 1. Hapus data dari tabel Review_Comments
    await ReviewComment.destroy({
      where: { id: commentId, chapterId: chapterId },
      transaction: t
    });

    /**
     * 2. Bersihkan tag span highlight dari konten naskah.
     * Kita melakukan ini di Backend sebagai validasi akhir, 
     * namun sangat disarankan FE mengirimkan 'currentContent' yang sudah bersih.
     */
    let cleanedContent = currentContent;
    
    // Regex untuk mencari tag span dengan ID tertentu dan menghapusnya tapi menyisakan teks di dalamnya
    // Contoh: <span id="highlight-123">teks</span> menjadi teks
    const highlightRegex = new RegExp(`<span id="${highlight_id}"[^>]*>(.*?)<\/span>`, 'g');
    cleanedContent = cleanedContent.replace(highlightRegex, '$1');

    await Chapter.update(
      { content: cleanedContent },
      { where: { id: chapterId }, transaction: t }
    );

    await t.commit();
    res.status(200).json({ 
      message: "Komentar berhasil dihapus dan highlight dibersihkan",
      cleanedContent: cleanedContent 
    });
  } catch (error) {
    await t.rollback();
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Gagal menghapus komentar", error: error.message });
  }
};