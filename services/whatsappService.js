// litera-be/services/whatsappService.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let waClient = null;
let isReady = false;

export const initWhatsApp = () => {
    console.log("Menyiapkan WhatsApp Web Client (Puppeteer)...");
    
    waClient = new Client({
        // LocalAuth menyimpan sesi login (cookie) agar tidak perlu scan QR tiap server restart
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true, // Berjalan tersembunyi di background
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ] 
        }
    });

    // Menampilkan QR Code di terminal saat pertama kali login
    waClient.on('qr', (qr) => {
        console.log('\n=========================================');
        console.log('📱 SCAN QR CODE INI DENGAN WHATSAPP HP ANDA (AKUN MENTOR/ADMIN)');
        console.log('=========================================');
        qrcode.generate(qr, { small: true });
    });

    waClient.on('ready', () => {
        console.log('✅ WhatsApp Bot Ready & Authenticated!');
        isReady = true;
    });

    waClient.on('auth_failure', msg => {
        console.error('❌ Autentikasi WhatsApp Gagal:', msg);
    });

    waClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp Disconnected:', reason);
        isReady = false;
    });

    waClient.initialize();
};

export const sendWhatsAppMessage = async (phoneNumber, message) => {
    if (!isReady || !waClient) {
        throw new Error("Layanan WhatsApp sedang offline atau belum di-scan.");
    }

    // Normalisasi Nomor Telepon ke format WhatsApp (628xxxx@c.us)
    let formattedNumber = phoneNumber.replace(/\D/g, ''); 
    
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.slice(1);
    }
    
    if (!formattedNumber.endsWith('@c.us')) {
        formattedNumber += '@c.us';
    }

    try {
        const response = await waClient.sendMessage(formattedNumber, message);
        return response;
    } catch (error) {
        console.error('Gagal mengirim WA:', error);
        throw error;
    }
};