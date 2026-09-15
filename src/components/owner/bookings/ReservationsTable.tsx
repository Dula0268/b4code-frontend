"use client";

import React, { useState, useMemo } from "react";
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

export default function ReservationsTable() {
  const { reservations, updateReservationStatus, activeFilter, selectedPropertyId } = useOwnerBookingStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedResForEdit, setSelectedResForEdit] = useState<Reservation | null>(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      // Filter by property
      if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
      
      if (activeFilter === 'UPCOMING') return r.status === 'PENDING' || r.status === 'CONFIRMED' || r.status === 'CHECKED_IN';
      if (activeFilter === 'COMPLETED') return r.status === 'COMPLETED';
      if (activeFilter === 'CANCELED') return r.status === 'CANCELED' || r.status === 'CANCELLED' || r.status === 'NO_SHOW';
      
      return true;
    });
  }, [reservations, activeFilter, selectedPropertyId]);

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


  ];

  const table = useReactTable({
    data: filteredReservations,
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
    </div>
  );
}
