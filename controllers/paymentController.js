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

        // Verifikasi notifikasi menggunakan snap instance
        const statusResponse = await snap.transaction.notification(notification);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Notifikasi diterima: Order ID ${orderId}, Status: ${transactionStatus}`);

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || (transactionStatus === 'settlement')) {
                // TODO: Update status user menjadi Premium di database
                // Contoh:
                // const userId = orderId.split('-').pop(); // Jika format orderId mengandung userId
                // await User.update({ is_premium: true }, { where: { id: userId } });
                console.log(`Transaksi ${orderId} BERHASIL.`);
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            console.log(`Transaksi ${orderId} GAGAL.`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send(error.message);
    }
};