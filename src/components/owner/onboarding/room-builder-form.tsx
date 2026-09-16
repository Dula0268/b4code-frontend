"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, BedDouble, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const roomSchema = z.object({
  id: z.string(),
  roomType: z.string().min(1, "Room type is required"),
  price: z.number().min(0, "Price must be positive"),
  baseCapacity: z.number().min(1, "Minimum 1 person"),
  maxCapacity: z.number().min(1, "Minimum 1 person"),
  bedConfiguration: z.string().min(1, "Bed configuration is required"),
  inventory: z.number().min(1, "Minimum 1 room"),
});

const formSchema = z.object({
  rooms: z.array(roomSchema).min(1, "At least one room is required"),
});

export default function RoomBuilderForm() {
  const { formData, updateFormData, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      rooms: formData.rooms.length > 0 ? formData.rooms.map((r: any) => ({
        ...r,
        roomType: r.roomType || "",
        price: r.price || 100,
        inventory: r.inventory || 1,
      })) : [
        {
          id: uuidv4(),
          roomType: "",
          price: 100,
          baseCapacity: 2,
          maxCapacity: 2,
          bedConfiguration: "1 Double Bed",
          inventory: 1
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "rooms",
    control: form.control,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateFormData(values);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                    <BedDouble className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">Room Type {index + 1}</h3>
                </div>
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg px-3"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                )}
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name={`rooms.${index}.roomType`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-slate-700 font-medium">Room Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl">
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="STANDARD_ROOM" className="rounded-lg cursor-pointer">Standard Room</SelectItem>
                          <SelectItem value="DELUXE_ROOM" className="rounded-lg cursor-pointer">Deluxe Room</SelectItem>
                          <SelectItem value="SUPERIOR_ROOM" className="rounded-lg cursor-pointer">Superior Room</SelectItem>
                          <SelectItem value="EXECUTIVE_ROOM" className="rounded-lg cursor-pointer">Executive Room</SelectItem>
                          <SelectItem value="TWIN_ROOM" className="rounded-lg cursor-pointer">Twin Room</SelectItem>
                          <SelectItem value="FAMILY_ROOM" className="rounded-lg cursor-pointer">Family Room</SelectItem>
                          <SelectItem value="STUDIO_ROOM" className="rounded-lg cursor-pointer">Studio Room</SelectItem>
                          <SelectItem value="SUITE" className="rounded-lg cursor-pointer">Suite</SelectItem>
                          <SelectItem value="PRESIDENTIAL_SUITE" className="rounded-lg cursor-pointer">Presidential Suite</SelectItem>
                          <SelectItem value="VILLA" className="rounded-lg cursor-pointer">Villa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-slate-700 font-medium">Price per Night (LKR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          step={0.01}
                          placeholder="0.00" 
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.inventory`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-medium">Number of Rooms (How many do you have?)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                          {...field} 
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" as unknown as number : parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.baseCapacity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        Base Capacity
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.maxCapacity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        Max Capacity
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`rooms.${index}.bedConfiguration`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-medium">Bed Configuration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl">
                            <SelectValue placeholder="Select bed configuration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="1 Double Bed" className="rounded-lg cursor-pointer">1 Double Bed</SelectItem>
                          <SelectItem value="2 Single Beds" className="rounded-lg cursor-pointer">2 Single Beds</SelectItem>
                          <SelectItem value="1 King Bed" className="rounded-lg cursor-pointer">1 King Bed</SelectItem>
                          <SelectItem value="1 King, 1 Sofa Bed" className="rounded-lg cursor-pointer">1 King, 1 Sofa Bed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 border-slate-200 h-20 rounded-2xl text-slate-500 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all duration-300 flex items-center justify-center font-medium text-lg group"
          onClick={() => append({ id: uuidv4(), roomType: "", price: 100, baseCapacity: 2, maxCapacity: 2, bedConfiguration: "1 Double Bed", inventory: 1 })}
        >
          <div className="bg-slate-100 p-2 rounded-full mr-3 group-hover:bg-[var(--brand-primary)]/10 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          Add Another Room Type
        </Button>

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
            Continue to Policies
          </Button>
        </div>
      </form>
    </Form>
  );
}
