import api from "@/lib/axios";

export const paymentApi = {
  initiatePayment: (paymentData: {
    amount: number;
    currency?: string;
    paymentMethod: string;
    cardHolderName?: string;
    cardNumber?: string;
    cardExpiry?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bookingId?: number;
    foodOrderId?: number;
    returnParams?: string;
  }) =>
    api.post("/payments", paymentData).then((r) => r.data),

  getMyPayments: () =>
    api.get("/payments/my").then((r) => r.data),

  getAllPayments: () =>
    api.get("/payments").then((r) => r.data),
};
