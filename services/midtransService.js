import midtransClient from 'midtrans-client';

// 1. Inisialisasi Snap Client
export const snap = new midtransClient.Snap({
    isProduction: false, // Set ke false untuk Sandbox
    serverKey: 'Mid-server-kH6h0sAR5eI3uo9ohE_gQIbw',
    clientKey: 'Mid-client-6tlrMY13kNoFhcCt'
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