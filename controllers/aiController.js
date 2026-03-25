import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * FUNGSI: Chat Riset Jurnal (Asisten Riset Referensi)
 */
export const chatWithJournalAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong." });
    }

    const systemInstruction = `Kamu adalah Asisten Riset Referensi LITERA. 
    Tugasmu HANYA membantu pengguna mencari ide referensi, merangkum, menganalisis, dan mendiskusikan 'Jurnal Ilmiah', 'Artikel Penelitian', atau 'Literatur' yang akan mereka gunakan sebagai bahan riset untuk menulis buku.
    Gunakan bahasa yang ramah, profesional namun santai, memotivasi, dan berjiwa muda.
    JIKA pengguna bertanya di luar riset buku atau literatur, kamu WAJIB menolak dengan sopan sesuai instruksi standar.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.status(200).json({ success: true, reply: responseText });
  } catch (error) {
    console.error("Gemini Journal Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server AI Riset." });
  }
};

/**
 * FUNGSI: Grammar Checker & Paraphraser (Asisten Penulis)
 */
export const processGrammarAI = async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Teks tidak boleh kosong." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    switch (mode) {
      case "check":
        prompt = `Bertindaklah sebagai editor profesional. Perbaiki kesalahan typo, ejaan, dan tata bahasa pada teks berikut tanpa mengubah gaya bahasanya. Berikan HANYA teks hasil perbaikan: "${text}"`;
        break;
      case "paraphrase":
        prompt = `Bertindaklah sebagai penulis kreatif. Lakukan parafrase pada teks berikut agar lebih mengalir dan menarik namun maknanya tetap sama. Berikan HANYA teks hasil parafrase: "${text}"`;
        break;
      case "formal":
        prompt = `Ubah teks berikut menjadi bahasa Indonesia yang formal, baku, dan profesional. Berikan HANYA teks hasil perubahan: "${text}"`;
        break;
      default:
        prompt = `Rapikan teks berikut: "${text}"`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({ success: true, mode: mode, suggestion: responseText });
  } catch (error) {
    console.error("Gemini Grammar Error:", error);
    res.status(500).json({ success: false, message: "Gagal memproses teks dengan AI." });
  }
};

/**
 * FUNGSI BARU: Cek Konsistensi Tokoh (AI Analysis)
 */
export const checkCharacterConsistency = async (req, res) => {
  try {
    const { text, characterDatabase } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Naskah tidak boleh kosong." });
    }

    // Menggunakan gemini-1.5-flash agar stabil dan kuota aman
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      Kamu adalah Editor Senior Litera yang sangat teliti. Tugasmu adalah membedah naskah penulis.
      Fokus pada dua hal utama:
      
      1. KONSISTENSI TOKOH: Bandingkan naskah dengan database tokoh. Cari perbedaan usia, ciri fisik, latar belakang, atau sifat.
      2. CEK TYPO & EJAAN: Cari kata-kata yang salah ketik, tidak baku, atau kesalahan tanda baca yang mengganggu alur cerita.

      Gunakan nada bicara editor yang ramah, suportif, dan profesional.

      OUTPUT HARUS JSON ARRAY (tanpa markdown blok):
      [{ 
         "name": "Nama Tokoh atau 'Ejaan'", 
         "type": "consistency" atau "typo",
         "issue": "Jelaskan temuanmu dengan bahasa editor yang enak dibaca", 
         "fix_suggestion": "Berikan saran perbaikannya" 
      }]
      
      Jika naskah sudah sempurna, kembalikan array kosong [].
    `;

    const userPrompt = `
      [Database Tokoh]: ${JSON.stringify(characterDatabase || [])}
      [Naskah Bab]: ${text}
    `;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const responseText = result.response.text();

    const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let reportData = [];
    try {
      reportData = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Gagal parsing respons editor:", cleanedJson);
      reportData = [];
    }

    res.status(200).json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    res.status(500).json({ success: false, message: "Editor AI sedang sibuk merapikan naskah lain. Coba lagi ya!" });
  }
};

export const suggestBookTitles = async (req, res) => {
  try {
    const { keywords, category } = req.body;

    if (!keywords) {
      return res.status(400).json({ success: false, message: "Ketik kata kunci dulu." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Kamu adalah Branding Expert untuk penerbit buku Litera. 
      Pengguna memiliki ide judul awal: "${keywords}" dengan kategori "${category}".
      Tugasmu adalah memberikan 3 saran judul buku yang sangat menarik, menjual, dan puitis (jika fiksi) atau provokatif/informatif (jika non-fiksi).
      
      ATURAN:
      1. Berikan HANYA 3 saran judul.
      2. Format output harus JSON array murni tanpa markdown: ["Judul 1", "Judul 2", "Judul 3"]
      3. Pastikan bahasa Indonesia yang digunakan sangat profesional.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let suggestions = [];
    try {
      suggestions = JSON.parse(cleanedJson);
    } catch (e) {
      // Fallback jika AI gagal kirim JSON
      suggestions = [keywords + " - Versi 1", keywords + " - Versi 2", keywords + " - Versi 3"];
    }

    res.status(200).json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error("Suggest Title Error:", error);
    res.status(500).json({ success: false, message: "AI sedang lelah." });
  }
};