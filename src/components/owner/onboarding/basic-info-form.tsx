"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, AlignLeft, Home } from "lucide-react";

// Assuming a MapPicker component exists or will be created. We'll use a placeholder/simplified version for now.

const formSchema = z.object({
  propertyName: z.string().min(3, "Property name is required"),
  propertyType: z.string().min(1, "Property type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Full address is required"),
  latitude: z.number(),
  longitude: z.number(),
});

export default function BasicInfoForm() {
  const { formData, updateFormData, nextStep } = useOnboardingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyName: formData.propertyName,
      propertyType: formData.propertyType,
      description: formData.description,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateFormData(values);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="propertyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Property Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Sunset Villa" 
                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                  <Home className="w-4 h-4 text-slate-400" />
                  Property Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl">
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="hotel" className="rounded-lg cursor-pointer">Hotel</SelectItem>
                    <SelectItem value="villa" className="rounded-lg cursor-pointer">Villa</SelectItem>
                    <SelectItem value="apartment" className="rounded-lg cursor-pointer">Apartment</SelectItem>
                    <SelectItem value="resort" className="rounded-lg cursor-pointer">Resort</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                <AlignLeft className="w-4 h-4 text-slate-400" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your property. What makes it unique?" 
                  className="h-36 resize-none bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl p-4" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                Full Address
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main St, City, Country" 
                  className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-6 mt-8 border-t border-slate-100">
          <Button 
            type="submit" 
            size="lg"
            className="bg-[var(--brand-primary)] hover:opacity-90 text-white font-medium rounded-xl px-8 shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            Continue to Rooms
          </Button>
        </div>
      </form>
    </Form>
  );
}
