"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Card className="bg-cream hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl font-black text-charcoal">
              Performance Trend
            </CardTitle>
            <CardDescription className="text-base font-medium text-charcoal/70 mt-1">
              Your quiz scores over time
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border-3 border-black rounded-lg p-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b1b1b" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#1b1b1b', fontWeight: 600 }}
                  stroke="#1b1b1b"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#1b1b1b', fontWeight: 600 }}
                  stroke="#1b1b1b"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-white border-3 border-black rounded-lg p-3 shadow-neu">
                          <p className="text-sm font-bold text-charcoal">
                            Score: {payload[0].value}%
                          </p>
                          <p className="text-xs font-medium text-charcoal/70">
                            {payload[0].payload.date}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1a4d2e"
                  strokeWidth={3}
                  dot={{ fill: '#1a4d2e', strokeWidth: 2, r: 5, stroke: '#000000' }}
                  activeDot={{ r: 7, stroke: '#000000', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
