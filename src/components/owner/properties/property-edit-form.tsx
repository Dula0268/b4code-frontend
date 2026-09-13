"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OwnerProperty, OwnerPropertyUpdateRequest } from "@/models/owner";
import CriticalChangeDialog from "./critical-change-dialog";
import { detectCriticalChanges } from "@/lib/propertyChanges";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  houseRules: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  propertyType: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PropertyEditFormProps {
  property: OwnerProperty;
  onSave: (data: OwnerPropertyUpdateRequest) => Promise<boolean>;
  isSubmitting: boolean;
  isCriticalChangeAllowed: boolean;
}

export default function PropertyEditForm({ property, onSave, isSubmitting, isCriticalChangeAllowed }: PropertyEditFormProps) {
  const [pendingData, setPendingData] = useState<OwnerPropertyUpdateRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogFields, setDialogFields] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: property.name ?? "",
      description: property.description ?? "",
      address: property.address ?? "",
      city: property.city ?? "",
      country: property.country ?? "",
      contactPhone: property.contactPhone ?? "",
      contactEmail: property.contactEmail ?? "",
      checkIn: property.checkIn ?? "",
      checkOut: property.checkOut ?? "",
      houseRules: property.houseRules ?? "",
      cancellationPolicy: property.cancellationPolicy ?? "",
      propertyType: property.propertyType ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const data: OwnerPropertyUpdateRequest = { ...values };
    if (isCriticalChangeAllowed) {
      const changes = detectCriticalChanges(property, data);
      if (changes.requiresReview) {
        setPendingData(data);
        setDialogFields(changes.changedFields);
        setDialogOpen(true);
        return;
      }
    }
    onSave(data);
  };

  const handleConfirmCritical = async () => {
    if (!pendingData) return;
    const ok = await onSave(pendingData);
    if (ok) { setDialogOpen(false); setPendingData(null); }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <section>
            <h3 className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Property Name</FormLabel>
                  <FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="propertyType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type <span className="text-[#D97706] text-[10px] font-bold">REQUIRES RE-REVIEW</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["hotel","villa","apartment","resort"].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} className="h-28 resize-none rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          {/* Address */}
          <section className="border-t border-[#F0EBE7] pt-6">
            <h3 className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Address <span className="text-[#D97706] text-[10px] font-bold">REQUIRES RE-REVIEW IF CHANGED</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              {[{name:"address" as const,label:"Street Address",span:"md:col-span-3"},{name:"city" as const,label:"City",span:""},{name:"country" as const,label:"Country",span:""}].map(({name,label,span})=>(
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className={span}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-[#F0EBE7] pt-6">
            <h3 className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-4">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[{name:"contactPhone" as const,label:"Phone"},{name:"contactEmail" as const,label:"Email"}].map(({name,label})=>(
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
              ))}
            </div>
          </section>

          {/* Policies */}
          <section className="border-t border-[#F0EBE7] pt-6">
            <h3 className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-4">Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[{name:"checkIn" as const,label:"Check-in Time",type:"time"},{name:"checkOut" as const,label:"Check-out Time",type:"time"}].map(({name,label,type})=>(
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem><FormLabel>{label}</FormLabel><FormControl><Input type={type} {...field} className="h-11 rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
              ))}
              <FormField control={form.control} name="houseRules" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>House Rules</FormLabel><FormControl><Textarea {...field} className="h-24 resize-none rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cancellationPolicy" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Cancellation Policy</FormLabel><FormControl><Textarea {...field} className="h-24 resize-none rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-[#F0EBE7]">
            <Button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-[#953002] text-white font-bold hover:opacity-90 shadow-sm transition-all">
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      <CriticalChangeDialog
        isOpen={dialogOpen}
        changedFields={dialogFields}
        onConfirm={handleConfirmCritical}
        onCancel={() => { setDialogOpen(false); setPendingData(null); }}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
