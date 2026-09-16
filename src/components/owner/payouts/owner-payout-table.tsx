"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { PayoutDto } from "@/api/owner/payouts.api";

interface OwnerPayoutTableProps {
  payouts: PayoutDto[];
}

export function OwnerPayoutTable({ payouts }: OwnerPayoutTableProps) {
  if (payouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-1">No Payout History</h3>
        <p className="text-slate-500 max-w-md">
          You haven&apos;t requested any payouts yet.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Processed</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-none">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="font-semibold text-slate-900">Property</TableHead>
            <TableHead className="font-semibold text-slate-900">Amount</TableHead>
            <TableHead className="font-semibold text-slate-900">Requested</TableHead>
            <TableHead className="font-semibold text-slate-900">Status</TableHead>
            <TableHead className="font-semibold text-slate-900">Bank Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((p) => (
            <TableRow key={p.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium text-slate-900">
                {p.propertyName || "Unknown Property"}
              </TableCell>
              <TableCell>
                <div className="font-medium text-slate-900">
                  {p.currency} {(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                {p.requestedAt ? format(new Date(p.requestedAt), "MMM d, yyyy") : "—"}
              </TableCell>
              <TableCell>
                {getStatusBadge(p.status)}
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-900">{p.bankName}</div>
                <div className="text-xs text-slate-500">Acc: ****{p.accountNumber?.slice(-4)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
