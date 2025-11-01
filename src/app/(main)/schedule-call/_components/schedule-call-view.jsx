"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, Calendar, Clock, User, Loader2 } from "lucide-react";

export default function ScheduleCallView() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      phoneNumber: "",
      recipientName: "",
      scheduledDate: "",
      scheduledTime: "",
    },
  });

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/calls/logs");
      if (!response.ok) throw new Error("Failed to fetch call logs");
      const data = await response.json();
      setCallLogs(data);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      toast.error("Failed to load call logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const onSubmit = async (data) => {
    try {
      setScheduling(true);
      
      // Combine date and time into ISO string
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      
      if (scheduledDateTime < new Date()) {
        toast.error("Scheduled time must be in the future");
        setScheduling(false);
        return;
      }

      const response = await fetch("/api/calls/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          recipientName: data.recipientName || null,
          scheduledTime: scheduledDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule call");
      }

      toast.success("Call scheduled successfully!");
      reset();
      fetchCallLogs(); // Refresh call logs
    } catch (error) {
      console.error("Error scheduling call:", error);
      toast.error(error.message || "Failed to schedule call");
    } finally {
      setScheduling(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      scheduled: "secondary",
      processing: "secondary",
      no_answer: "secondary",
      busy: "secondary",
      cancelled: "secondary",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
      </Badge>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold gradient-title mb-2">Schedule Outbound Call</h1>
        <p className="text-muted-foreground">
          Schedule calls using ElevenLabs AI agent
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Call Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Schedule New Call
            </CardTitle>
            <CardDescription>
              Enter call details and select date/time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="phoneNumber"
                    placeholder="+1234567890"
                    className="pl-11"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="recipientName"
                    placeholder="John Doe"
                    className="pl-11"
                    {...register("recipientName")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      id="scheduledDate"
                      type="date"
                      className="pl-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit-fields-wrapper]:pl-0"
                      {...register("scheduledDate", {
                        required: "Date is required",
                      })}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {errors.scheduledDate && (
                    <p className="text-sm text-red-500">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      id="scheduledTime"
                      type="time"
                      className="pl-11 [&::-webkit-calendar-picker-indicator]:opacity-0"
                      {...register("scheduledTime", {
                        required: "Time is required",
                      })}
                    />
                  </div>
                  {errors.scheduledTime && (
                    <p className="text-sm text-red-500">{errors.scheduledTime.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={scheduling}>
                {scheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Call
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Call Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Call Logs</CardTitle>
            <CardDescription>
              History of scheduled and completed calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : callLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No call logs yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.recipientName || (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.phoneNumber}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{formatDuration(log.duration)}</TableCell>
                        <TableCell>
                          {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
