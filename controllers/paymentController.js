import { createTransactionToken, snap } from '../services/midtransService.js';
import { User } from '../models/index.js';

// Fungsi Checkout (Versi Awal Anda)
export const checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        const amount = 150000;
        const orderId = `LITERA-${Date.now()}-${userId}`;

        const token = await createTransactionToken(orderId, amount, user);

        res.status(200).json({
            success: true,
            token: token,
            orderId: orderId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [TAMBAHAN] Fungsi createPaymentToken (Untuk integrasi dengan Frontend Premium Page)
export const createPaymentToken = async (req, res) => {
    try {
        const { orderId, amount, itemDetails, customerDetails } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: "Order ID dan nominal wajib diisi" });
        }

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

        res.status(200).json({
            status: "success",
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });
    } catch (error) {
        console.error("Midtrans Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Fungsi Webhook (Notification)
export const midtransWebhook = async (req, res) => {

    try {
        const notification = req.body;

        const statusResponse = await snap.transaction.notification(notification);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type;
        const grossAmount = statusResponse.gross_amount;

        console.log(`📩 Notifikasi: ${orderId} | ${transactionStatus}`);

        // Cari transaksi di DB
        const transactionData = await db.Transaction.findOne({
            where: { order_id: orderId }
        });

        if (!transactionData) {
            console.warn(`⚠️ Transaksi tidak ditemukan: ${orderId}`);
            await t.commit();
            return res.status(200).send('OK');
        }

        // Default status
        let newStatus = 'pending';

        // ✅ HANDLE STATUS MIDTRANS
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                newStatus = 'settlement';
            }
        } else if (transactionStatus === 'settlement') {
            newStatus = 'settlement';
        } else if (transactionStatus === 'pending') {
            newStatus = 'pending';
        } else if (transactionStatus === 'deny') {
            newStatus = 'deny';
        } else if (transactionStatus === 'expire') {
            newStatus = 'expire';
        } else if (transactionStatus === 'cancel') {
            newStatus = 'cancel';
        }

        // ✅ UPDATE TRANSACTION
        await transactionData.update({
            status: newStatus,
            payment_type: paymentType,
            amount: grossAmount
        });

        // ✅ AKTIFKAN USER JIKA BERHASIL
        if (newStatus === 'settlement') {
            await db.User.update(
                { status: 'Aktif' },
                {
                    where: { id: transactionData.user_id },
                }
            );

            console.log(`✅ User ${transactionData.user_id} AKTIF`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send(error.message);
    }
};