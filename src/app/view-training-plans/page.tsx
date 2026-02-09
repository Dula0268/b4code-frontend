import React from "react";
import api from "@/lib/axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type trainingPlan from "../../models/training-plan";

export default async function ViewTrainingPlans() {
  let response = await api.get<trainingPlan[]>(`trainingPlans`);
  const transformedData = response.data.map((item) => ({
    trainingCode: item.trainingCode,
    trainingType: item.trainingType,
    trainingCoverageScope: item.trainingCoverageScope,
    trainingDetails: item.trainingDetails,
    trainingDate: new Date(item.trainingDate).toLocaleDateString(),
    trainingTime: (() => {
      const [hours, minutes] = item.trainingTime.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    })(),
  }));
  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-1">Training Plans</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Training Code</TableHead>
              <TableHead>Training Type</TableHead>
              <TableHead>Training Coverage Scope</TableHead>
              <TableHead>Training Details</TableHead>
              <TableHead>Training Date</TableHead>
              <TableHead>Training Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformedData.map((item: any) => (
              <TableRow key={item.trainingCode}>
                <TableCell>{item.trainingCode}</TableCell>
                <TableCell>{item.trainingType}</TableCell>
                <TableCell>{item.trainingCoverageScope}</TableCell>
                <TableCell>{item.trainingDetails}</TableCell>
                <TableCell>{item.trainingDate}</TableCell>
                <TableCell>{item.trainingTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
