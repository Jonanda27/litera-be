import { createTransactionToken, snap } from '../services/midtransService.js';
import { User, Transaction, sequelize } from '../models/index.js';

/**
 * 1. Checkout dengan Nominal Terkontrol (Rekomendasi)
 */
export const checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        // Nominal ditentukan di Backend agar aman
        const amount = 150000;
        const orderId = `LITERA-${Date.now()}-${userId}`;

        // [TAMBAHAN] Simpan ke tabel Transactions
        await Transaction.create({
            order_id: orderId,
            user_id: userId,
            amount: amount,
            status: 'pending'
        }, { transaction: t });

        const token = await createTransactionToken(orderId, amount, user);

        await t.commit();
        res.status(200).json({
            success: true,
            token: token,
            orderId: orderId
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. Webhook Midtrans (Notifikasi Otomatis)
 */
export const midtransWebhook = async (req, res) => {
    // Gunakan transaksi agar update User & Transaction sinkron
    const t = await sequelize.transaction();
    try {
        const notification = req.body;

        // Verifikasi notifikasi asli dari Midtrans
        const statusResponse = await snap.transaction.notification(notification);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type;

        console.log(`Webhook Received: Order ${orderId} Status: ${transactionStatus}`);

        // Cari data transaksi di database kita
        const myTransaction = await Transaction.findOne({ where: { order_id: orderId } });
        if (!myTransaction) {
            return res.status(404).json({ message: "Transaction record not found in DB" });
        }

        let newStatus = 'pending';
        let shouldActivateUser = false;

        // Logika Status Midtrans
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                newStatus = 'pending'; // Butuh review manual
            } else {
                newStatus = 'settlement';
                shouldActivateUser = true; // Pembayaran BERHASIL
            }
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            newStatus = transactionStatus; // Pembayaran GAGAL/EXPIRED
            shouldActivateUser = false;
        }

        // 1. Update Tabel Transaksi
        await Transaction.update({
            status: newStatus,
            payment_type: paymentType
        }, {
            where: { order_id: orderId },
            transaction: t
        });

        // 2. Update Tabel User (Jika Berhasil)
        if (shouldActivateUser) {
            await User.update(
                { status: 'Aktif' }, // Sesuai kolom di model User Anda
                { where: { id: myTransaction.userId }, transaction: t }
            );
            console.log(`User ${myTransaction.userId} has been ACTIVATED.`);
        }

        await t.commit();
        return res.status(200).send('OK');

    } catch (error) {
        if (t) await t.rollback();
        console.error("Webhook Error:", error);
        return res.status(500).send(error.message);
    }
};

/**
 * 3. Versi Custom (Gunakan dengan hati-hati)
 * Pastikan nominal divalidasi dengan database (Misal: ambil harga dari tabel Level/Paket)
 */
export const createPaymentToken = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const { orderId, amount, itemDetails, customerDetails } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: "Order ID dan nominal wajib diisi" });
        }

        await Transaction.create({
            order_id: orderId,
            user_id: userId,
            amount: amount,
            status: 'pending'
        }, { transaction: t });

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": amount
            },
            "item_details": itemDetails,
            "customer_details": {
                "first_name": customerDetails.nama,
                "email": customerDetails.email,
                "phone": customerDetails.no_hp
            },
            "credit_card": {
                "secure": true
            }
        };

        const transaction = await snap.createTransaction(parameter);

        await t.commit();
        res.status(200).json({
            status: "success",
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error("Midtrans Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};
