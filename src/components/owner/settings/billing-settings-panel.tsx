"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, Building2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { ownerSettingsApi, BankAccountDto } from "@/api/owner/settings.api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BillingSettingsPanel() {
  const [accounts, setAccounts] = useState<BankAccountDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    isPrimary: true
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await ownerSettingsApi.getBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await ownerSettingsApi.addBankAccount(newAccount);
      toast.success("Bank account added successfully");
      setNewAccount({
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        branchCode: "",
        isPrimary: true
      });
      document.getElementById('close-dialog-btn')?.click();
      fetchAccounts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add bank account");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-sm ring-1 ring-zinc-200/50">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl text-zinc-900 font-semibold tracking-tight">Billing & Payouts</CardTitle>
            <CardDescription className="text-zinc-500">
              Manage your bank accounts to receive payouts directly.
            </CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#953002] hover:bg-[#7a2701] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Bank Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                  Enter your bank details to receive payouts. Make sure the information is accurate.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    placeholder="e.g. Commercial Bank" 
                    required 
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input 
                    id="accountHolder" 
                    placeholder="e.g. John Doe" 
                    required 
                    value={newAccount.accountHolder}
                    onChange={(e) => setNewAccount({...newAccount, accountHolder: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    required 
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code (Optional)</Label>
                  <Input 
                    id="branchCode" 
                    value={newAccount.branchCode}
                    onChange={(e) => setNewAccount({...newAccount, branchCode: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="isPrimary" 
                    checked={newAccount.isPrimary}
                    onCheckedChange={(checked) => setNewAccount({...newAccount, isPrimary: checked === true})}
                  />
                  <Label htmlFor="isPrimary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Set as primary payout method
                  </Label>
                </div>
                <DialogFooter className="pt-4">
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" id="close-dialog-btn">Cancel</Button>
                  </DialogTrigger>
                  <Button type="submit" disabled={isAdding} className="bg-[#953002] hover:bg-[#7a2701] text-white">
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">No bank accounts added</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              You haven&apos;t added any bank accounts yet. Add one to start receiving payouts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {accounts.map((account) => (
              <div key={account.id} className="p-6 transition-all duration-200 hover:bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white p-2.5 rounded-xl border shadow-sm shrink-0">
                    <Building2 className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-zinc-900">{account.bankName}</h4>
                      {account.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        •••• {account.accountNumber.slice(-4) || account.accountNumber}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                      <span>{account.accountHolder}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
