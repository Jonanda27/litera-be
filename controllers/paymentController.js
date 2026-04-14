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

        console.log("WEBHOOK MASUK:", notification);

        const {
            order_id,
            transaction_status,
            fraud_status
        } = notification;

        // Ambil userId dari order_id
        const splitOrder = order_id.split("-");
        const userId = splitOrder[splitOrder.length - 1];

        console.log(`Order ID: ${order_id}`);
        console.log(`User ID: ${userId}`);
        console.log(`Status: ${transaction_status}`);

        // HANDLE STATUS
        if (transaction_status === "capture") {
            if (fraud_status === "accept") {
                await User.update(
                    { status: "aktif" }, // sesuaikan field
                    { where: { id: userId } }
                );

                console.log(`User ${userId} AKTIF (capture)`);
            }
        } else if (transaction_status === "settlement") {
            await User.update(
                { status: "Aktif" },
                { where: { id: userId } }
            );

            console.log(`User ${userId} AKTIF (settlement)`);
        } else if (transaction_status === "pending") {
            console.log(`Transaksi ${order_id} pending`);
        } else if (
            transaction_status === "deny" ||
            transaction_status === "expire" ||
            transaction_status === "cancel"
        ) {
            console.log(`Transaksi ${order_id} gagal`);
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send(error.message);
    }
};