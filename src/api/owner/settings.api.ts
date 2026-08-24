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

  updateNotifications: (ownerId: number, data: object) =>
    api.put(withOwnerId(`/owner/settings/notifications`, ownerId), data).then((r) => r.data),

  updatePropertySettings: (ownerId: number, data: object) =>
    api.put(withOwnerId(`/owner/settings/property`, ownerId), data).then((r) => r.data),

  requestPayout: (ownerId?: number, propertyId?: number) => {
    const base = withOwnerId(`/owner/settings/billing/payout-request`, ownerId);
    const suffix = propertyId ? `${base.includes('?') ? '&' : '?'}propertyId=${propertyId}` : '';
    return api.post(`${base}${suffix}`).then((r) => r.data);
  },

  getRestrictions: (propertyId: number) =>
    api.get(`/owner/settings/restrictions?propertyId=${propertyId}`).then((r) => r.data),

  createRestriction: (data: object) =>
    api.post(`/owner/settings/restrictions`, data).then((r) => r.data),

  updateRestriction: (id: number, data: object) =>
    api.put(`/owner/settings/restrictions/${id}`, data).then((r) => r.data),

  deleteRestriction: (id: number) =>
    api.delete(`/owner/settings/restrictions/${id}`).then((r) => r.data),
};
