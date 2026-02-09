"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
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

import api from "@/lib/axios";
import Trainer from "@/models/trainer";
import { TrainerDetailsSchema } from "@/types/trainer-schema";

export default function TrainerPage() {
  const form = useForm<Trainer>({
    resolver: zodResolver(TrainerDetailsSchema),
    defaultValues: {
      name: "",
      expertise: "",
      email: "",
      mobileNumber: "",
    },
  });
  const onSubmit: SubmitHandler<Trainer> = (data) => {
    console.log(data);
    api
      .post("/trainer", data)
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
    <div className="p-4 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="flex">
            <CardHeader>
              <CardTitle>Trainer</CardTitle>
              <CardDescription>Create and manage trainers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-col md:grid-cols-2 items-center gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer Name</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter trainer name"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer Expertise</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter trainer expertise"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer email</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter trainer email"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer mobile number</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          placeholder="Enter trainer email"
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
