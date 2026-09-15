import api from "@/lib/axios";

export interface BankAccountDto {
  id: number;
  ownerId: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface BankAccountRequest {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  isPrimary: boolean;
}

export const ownerSettingsApi = {
  getBankAccounts: async (): Promise<BankAccountDto[]> => {
    const res = await api.get<BankAccountDto[]>("/owner/settings/billing");
    return res.data;
  },

  addBankAccount: async (request: BankAccountRequest): Promise<BankAccountDto> => {
    const res = await api.post<BankAccountDto>("/owner/settings/billing/bank-account", request);
    return res.data;
  },
};
