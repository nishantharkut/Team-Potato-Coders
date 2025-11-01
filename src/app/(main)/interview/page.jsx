import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { Swords } from "lucide-react";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-xl bg-demon-red border-4 border-black flex items-center justify-center shadow-neu-sm">
            <Swords className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
              Interview Preparation
            </h1>
            <p className="text-base md:text-lg text-charcoal/70 font-medium mt-1">
              Master your skills with AI-powered mock interviews
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
