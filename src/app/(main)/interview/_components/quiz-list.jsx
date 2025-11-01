"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card className="bg-cream">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="logo-font text-3xl md:text-4xl text-tanjiro-green text-shadow-medium">
                RECENT QUIZZES
              </CardTitle>
              <CardDescription className="text-base font-medium text-charcoal/70 mt-2">
                Review your past quiz performance
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/interview/mock")} className="h-12 px-6 font-bold">
              Start New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments?.map((assessment, i) => (
              <Card
                key={assessment.id}
                className="cursor-pointer bg-white hover:bg-cream transition-colors border-3 shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px]"
                onClick={() => setSelectedQuiz(assessment)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-charcoal">
                    Quiz {i + 1}
                  </CardTitle>
                  <CardDescription className="flex justify-between w-full text-base font-semibold text-charcoal/70">
                    <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                    <div>
                      {format(
                        new Date(assessment.createdAt),
                        "MMMM dd, yyyy HH:mm"
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                {assessment.improvementTip && (
                  <CardContent>
                    <p className="text-sm font-medium text-charcoal">
                      {assessment.improvementTip}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
