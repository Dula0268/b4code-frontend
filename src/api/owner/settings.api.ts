import api from "@/lib/axios";

export const ownerSettingsApi = {
  getBankAccounts: (ownerId: number) =>
    api.get(`/owner/settings/billing?ownerId=${ownerId}`).then((r) => r.data),

  addBankAccount: (ownerId: number, data: object) =>
    api.post(`/owner/settings/billing/bank-account?ownerId=${ownerId}`, data).then((r) => r.data),

  getOwnerBankDetails: () =>
    api.get(`/owner/settings/bank-details`).then((r) => r.data),

  saveOwnerBankDetails: (data: { bankName: string; accountHolderName: string; accountNumber: string; branchName: string }) =>
    api.put(`/owner/settings/bank-details`, data).then((r) => r.data),

  updateNotifications: (ownerId: number, data: object) =>
    api.put(`/owner/settings/notifications?ownerId=${ownerId}`, data).then((r) => r.data),

  updatePropertySettings: (ownerId: number, data: object) =>
    api.put(`/owner/settings/property?ownerId=${ownerId}`, data).then((r) => r.data),
};
