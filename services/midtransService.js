import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
dotenv.config();

// 1. Inisialisasi Snap Client
export const snap = new midtransClient.Snap({
    isProduction: false, // Set ke false untuk Sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// 2. Export fungsi createTransactionToken yang dicari oleh Controller
export const createTransactionToken = async (orderId, amount, userDetails) => {
    try {
        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": amount
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": userDetails?.nama || "User",
                "email": userDetails?.email || "",
                "phone": userDetails?.no_hp || ""
            }
        };

        const transaction = await snap.createTransaction(parameter);
        return transaction.token;
    } catch (error) {
        console.error("Midtrans Service Error:", error);
        throw error;
    }
};