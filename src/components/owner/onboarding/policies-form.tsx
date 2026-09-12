"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Wifi, LifeBuoy, Utensils, Car, Wind, Dumbbell, Tv, Shirt, FileText, CheckCircle2 } from "lucide-react";
import React from "react";

const AMENITIES_LIST = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "pool", label: "Swimming Pool", icon: LifeBuoy },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "parking", label: "Free Parking", icon: Car },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "gym", label: "Fitness Center", icon: Dumbbell },
  { id: "tv", label: "TV", icon: Tv },
  { id: "washer", label: "Washer", icon: Shirt },
];

const formSchema = z.object({
  amenities: z.array(z.string()),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().min(1, "Check-out time is required"),
  customRules: z.string(),
});

export default function PoliciesForm() {
  const { formData, updateFormData, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amenities: formData.amenities,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      customRules: formData.customRules,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateFormData(values);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Amenities Section */}
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Amenities</h3>
            <p className="text-sm text-slate-500 mt-1">Select the amenities available at your property.</p>
          </div>
          <FormField
            control={form.control}
            name="amenities"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {AMENITIES_LIST.map((amenity) => (
                    <FormField
                      key={amenity.id}
                      control={form.control}
                      name="amenities"
                      render={({ field }) => {
                        const isChecked = field.value?.includes(amenity.id);
                        const Icon = amenity.icon;
                        return (
                          <FormItem
                            key={amenity.id}
                            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                              isChecked 
                                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-sm' 
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <FormControl>
                              <Checkbox
                                className="sr-only"
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, amenity.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== amenity.id)
                                      )
                                }}
                              />
                            </FormControl>
                            <Icon className={`w-8 h-8 mb-3 transition-colors duration-200 ${isChecked ? 'text-[var(--brand-primary)]' : 'text-slate-400'}`} />
                            <FormLabel className={`font-medium text-sm text-center cursor-pointer transition-colors duration-200 ${isChecked ? 'text-[var(--brand-primary)]' : 'text-slate-600'}`}>
                              {amenity.label}
                            </FormLabel>
                            {isChecked && (
                              <div className="absolute top-2 right-2 text-[var(--brand-primary)] animate-in zoom-in duration-200">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="mt-4" />
              </FormItem>
            )}
          />
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* Timings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="checkInTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Check-in Time (From)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
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
            name="checkOutTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Check-out Time (Until)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Custom Rules Section */}
        <FormField
          control={form.control}
          name="customRules"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                <FileText className="w-4 h-4 text-slate-400" />
                Custom House Rules
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="E.g. No smoking indoors, quiet hours after 10 PM, no pets allowed..." 
                  className="h-32 resize-none bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl p-4" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg"
            className="text-slate-500 hover:text-slate-900 font-medium rounded-xl px-6 transition-all"
            onClick={() => {
              updateFormData(form.getValues());
              prevStep();
            }}
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            size="lg"
            className="bg-[var(--brand-primary)] hover:opacity-90 text-white font-medium rounded-xl px-8 shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            Continue to Media
          </Button>
        </div>
      </form>
    </Form>
  );
}
