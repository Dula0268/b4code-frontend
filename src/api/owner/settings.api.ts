import api from "@/lib/axios";

const withOwnerId = (path: string, ownerId?: number) => {
  if (!ownerId) return path;
  return `${path}?ownerId=${ownerId}`;
};

export const ownerSettingsApi = {
  getBankAccounts: (ownerId?: number) =>
    api.get(withOwnerId(`/owner/settings/billing`, ownerId)).then((r) => r.data),

  addBankAccount: (ownerId: number | undefined, data: object) =>
    api.post(withOwnerId(`/owner/settings/billing/bank-account`, ownerId), data).then((r) => r.data),

  getOwnerBankDetails: () =>
    api.get(`/owner/settings/bank-details`).then((r) => r.data),

  saveOwnerBankDetails: (data: { bankName: string; accountHolderName: string; accountNumber: string; branchName?: string; branchCode?: string; accountType?: string }) =>
    api.put(`/owner/settings/bank-details`, data).then((r) => r.data),

  updateNotifications: (ownerId: number, data: object) =>
    api.put(withOwnerId(`/owner/settings/notifications`, ownerId), data).then((r) => r.data),

  updatePropertySettings: (ownerId: number, data: object) =>
    api.put(withOwnerId(`/owner/settings/property`, ownerId), data).then((r) => r.data),

  requestPayout: (data: { propertyId: number; amount: number }) =>
    api.post(`/owner/settings/billing/payout-request`, data).then((r) => r.data),
};
