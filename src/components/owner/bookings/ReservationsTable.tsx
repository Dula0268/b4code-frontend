"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Reservation, useOwnerBookingStore } from "@/store/owner/booking.store";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CheckCircle, XCircle } from "lucide-react";
import ModifyBookingModal from "./ModifyBookingModal";
import ReservationDetailsSheet from "./ReservationDetailsSheet";

export default function ReservationsTable() {
  const { reservations, updateReservationStatus } = useOwnerBookingStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedResForEdit, setSelectedResForEdit] = useState<Reservation | null>(null);
  const [selectedResForDetails, setSelectedResForDetails] = useState<string | null>(null);

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm text-slate-500">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "guestName",
      header: "Guest",
      cell: ({ row }) => <span className="font-medium text-slate-900">{row.getValue("guestName")}</span>,
    },
    {
      accessorKey: "checkIn",
      header: "Check-in",
      cell: ({ row }) => <span>{format(new Date(row.getValue("checkIn")), "MMM dd, yyyy")}</span>,
    },
    {
      accessorKey: "checkOut",
      header: "Check-out",
      cell: ({ row }) => <span>{format(new Date(row.getValue("checkOut")), "MMM dd, yyyy")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (status === "PENDING") variant = "secondary";
        if (status === "CANCELED" || status === "NO_SHOW") variant = "destructive";
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "payout",
      header: () => <div className="text-right">Payout</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("payout"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedResForDetails(reservation.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedResForEdit(reservation)}>
                <Edit className="mr-2 h-4 w-4" />
                Modify Dates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateReservationStatus(reservation.id, "CHECKED_IN")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Checked-in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateReservationStatus(reservation.id, "NO_SHOW")} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Mark as No-Show
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reservations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/80 cursor-pointer"
                  onClick={(e) => {
                    // Prevent row click if clicking action menu
                    if ((e.target as HTMLElement).closest('.h-8')) return;
                    setSelectedResForDetails(row.original.id);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No reservations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <ModifyBookingModal 
        isOpen={!!selectedResForEdit} 
        onClose={() => setSelectedResForEdit(null)} 
        reservation={selectedResForEdit} 
      />
      <ReservationDetailsSheet 
        isOpen={!!selectedResForDetails}
        onClose={() => setSelectedResForDetails(null)}
        reservationId={selectedResForDetails}
      />
    </div>
  );
}
