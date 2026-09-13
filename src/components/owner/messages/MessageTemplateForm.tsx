"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Bot } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  trigger: z.string().min(1, "Please select a trigger."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  body: z.string().min(10, "Body must be at least 10 characters."),
});

export default function MessageTemplateForm() {
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      trigger: "",
      subject: "",
      body: "",
    },
  });

  function onSubmit(values: z.infer<typeof templateSchema>) {
    console.log(values);
    toast.success("Message template saved successfully!");
    form.reset();
  }

  return (
    <div className="max-w-2xl bg-white p-6 md:p-8 rounded-xl border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Create Automation Template</h2>
          <p className="text-sm text-slate-500">Set up automated messages to save time.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Welcome Message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger Event</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select when to send" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BOOKING_CONFIRMED">On Booking Confirmed</SelectItem>
                    <SelectItem value="BEFORE_ARRIVAL_3_DAYS">3 Days Before Arrival</SelectItem>
                    <SelectItem value="CHECK_IN">On Check-in Day</SelectItem>
                    <SelectItem value="CHECK_OUT">On Check-out</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Your upcoming stay at {{property_name}}" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Body</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Hi {{guest_name}}, we look forward to hosting you..." 
                    className="min-h-[150px] resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Available variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{"{{guest_name}}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{"{{check_in_date}}"}</code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Automation
          </Button>
        </form>
      </Form>
    </div>
  );
}
