"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { DollarSign, Building, AlertCircle, CheckCircle, RefreshCcw, HandCoins, Building2, MapPin } from "lucide-react";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { ownerPayoutsApi, PayoutDto } from "@/api/owner/payouts.api";
import { OwnerProperty } from "@/models/owner";
import { ownerSettingsApi, BankAccountDto } from "@/api/owner/settings.api";
import { OwnerPayoutTable } from "@/components/owner/payouts/owner-payout-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function PayoutsPage() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
  const [payouts, setPayouts] = useState<PayoutDto[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState<Record<number, boolean>>({});

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, accounts, payoutRes] = await Promise.all([
        ownerPropertyApi.listProperties({ page: 0, size: 50 }),
        ownerSettingsApi.getBankAccounts(),
        ownerPayoutsApi.getPayouts()
      ]);
      setProperties(res.properties.filter((p) => p.status === "ACTIVE" || p.status === "APPROVED" || p.statusOn));
      setBankAccounts(accounts);
      setPayouts(payoutRes);
      
      if (accounts.length > 0) {
        const primary = accounts.find(a => a.isPrimary) || accounts[0];
        const initialSelected: Record<number, string> = {};
        res.properties.forEach(p => {
          initialSelected[p.id] = primary.id.toString();
        });
        setSelectedAccounts(initialSelected);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load payout data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRequestPayout = async (property: OwnerProperty) => {
    const bankAccountId = selectedAccounts[property.id];
    if (!bankAccountId) {
      toast.error("Please select a bank account first.");
      return;
    }

    setIsRequesting((prev) => ({ ...prev, [property.id]: true }));
    try {
      const result = await ownerPayoutsApi.requestPayout(property.id, parseInt(bankAccountId));
      toast.success(`Successfully requested payout of ${result.currency} ${result.amount.toLocaleString()} for ${property.name}.`);
      fetchInitialData(); // Refresh list to show new payout in history and clear balance
    } catch (error) {
      let message = "An error occurred while requesting the payout.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(`Payout Request Failed: ${message}`);
    } finally {
      setIsRequesting((prev) => ({ ...prev, [property.id]: false }));
    }
  };

  return (
    <div className="p-6 lg:p-8 flex-1 w-full flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight">Financial Payouts</h1>
        <p className="text-[15px] text-[#6b7280] mt-1.5 max-w-3xl">
          Manage your revenue and request payouts directly to your registered bank accounts. 
          Payouts are processed by administrators within 3-5 business days.
        </p>
      </div>

      <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-lg p-4 flex gap-3 items-start">
        <CheckCircle className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-[15px]">Bank Account Required</h5>
          <p className="text-[14px] mt-1 text-[#166534]/90">
            You must have a primary bank account set up in your Settings &gt; Billing section before you can request a payout. 
          </p>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-[#1A1A1A] flex items-center gap-2">
          <Building size={20} className="text-[var(--brand-primary)]" />
          Active Properties
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm">
            <RefreshCcw className="text-[var(--brand-primary)] animate-spin h-8 w-8" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No Active Properties</h3>
            <p className="text-slate-500 max-w-md">
              You don&apos;t have any active properties generating revenue yet. 
              Once your properties are approved and active, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((property) => (
              <div key={property.id} className="group bg-white rounded-3xl border border-[#E8DDD8] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Image & Badge */}
                <div className="relative h-44 bg-[#F3F4F6] overflow-hidden">
                  {property.image ? (
                    <Image src={property.image} alt={property.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 size={40} className="text-[#D1D5DB]" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] px-2 py-0.5 shadow-sm">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Info & Payout Form */}
                <div className="p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <p className="font-bold text-[#1A1A1A] text-[17px] leading-snug line-clamp-1 mb-1">{property.name}</p>
                    <p className="flex items-center gap-1.5 text-[13px] text-[#9E7B6A]">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{property.city || property.address || "Location not set"}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 py-4 border-y border-[#F0EBE7]">
                    <span className="text-[12px] font-bold text-[#9E7B6A] uppercase tracking-wider">Available Balance</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">LKR {(property.availableBalance || 0).toLocaleString()}</span>
                      <span className="text-[14px] text-[#6B7280] font-medium">.00</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <span className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2">Deposit To</span>
                      <Select 
                        value={selectedAccounts[property.id]} 
                        onValueChange={(val) => setSelectedAccounts(prev => ({...prev, [property.id]: val}))}
                        disabled={bankAccounts.length === 0}
                      >
                        <SelectTrigger className="w-full text-[13px] rounded-xl border-[#E8DDD8] h-11">
                          <SelectValue placeholder="Select a bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.bankName} - {account.accountNumber.slice(-4)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="w-full h-11 rounded-xl bg-[#953002] hover:bg-[#C05621] text-white text-[14px] font-bold shadow-sm transition-all disabled:opacity-50"
                      onClick={() => handleRequestPayout(property)}
                      disabled={isRequesting[property.id] || bankAccounts.length === 0 || !selectedAccounts[property.id] || !property.availableBalance || property.availableBalance <= 0}
                    >
                      {isRequesting[property.id] ? (
                        <>
                          <RefreshCcw size={16} className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <HandCoins size={18} className="mr-2" />
                          Request Payout
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout History Section */}
      <div className="mt-8 flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Payout History</h2>
        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm">
            <RefreshCcw className="text-[var(--brand-primary)] animate-spin h-8 w-8" />
          </div>
        ) : (
          <OwnerPayoutTable payouts={payouts} />
        )}
      </div>
    </div>
  );
}
