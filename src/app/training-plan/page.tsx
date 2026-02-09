"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import type TrainingPlan from "../../models/training-plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import api from "@/lib/axios";
import { TrainingDataSchema } from "@/types/training-plan-schema";

export default function TrainingPlan() {
  const form = useForm<TrainingPlan>({
    resolver: zodResolver(TrainingDataSchema),
    defaultValues: {
      trainingCode: "",
      trainingType: "",
      trainingCoverageScope: "",
      trainingDetails: "",
      trainersDetails: [],
      trainingDate: new Date().toISOString().split("T")[0],
      trainingTime: new Date().toISOString().split("T")[1].substring(0, 5), // "HH:MM"
    },
  });
  const onSubmit: SubmitHandler<TrainingPlan> = (data) => {
    console.log(data);
    api
      .post("trainingPlans", data)
      .then((response) => {
        console.log("Form submission response:", response.data);
        alert("Training plan saved successfully!");
        form.reset();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        alert("Failed to save training plan. Please try again.");
      });
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="flex">
            <CardHeader>
              <CardTitle>Training Plan</CardTitle>
              <CardDescription>
                Create and manage your training plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-col md:grid-cols-2 items-center gap-4">
                <FormField
                  control={form.control}
                  name="trainingCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Code</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter training code"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="trainingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}                      
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a training type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Internal">Internal</SelectItem>
                          <SelectItem value="External">External</SelectItem>
                        </SelectContent>
                        <FormMessage />
                      </Select>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="trainingCoverageScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Scope</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter training scope"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="trainingDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Details</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter training details"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="trainingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              new Date(field.value).toISOString().split("T")[0]
                                ? new Date(field.value)
                                : undefined
                            }
                            onSelect={(date) => {
                              field.onChange(date?.toISOString().split("T")[0]);
                            }}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="trainingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          id="time-picker"
                          step="1"
                          defaultValue="10:30:00"
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-end">
                <Button type="submit">Save Plan</Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
