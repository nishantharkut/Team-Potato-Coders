import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

export default function MockInterviewPage() {
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/interview">
        <Button variant="outline" className="gap-2 h-11 font-bold">
          <ArrowLeft className="h-5 w-5" />
          Back to Interview Preparation
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-xl bg-demon-red border-4 border-black flex items-center justify-center shadow-neu-sm">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
              Mock Interview
            </h1>
            <p className="text-base md:text-lg text-charcoal/70 font-medium mt-1">
              Test your knowledge with industry-specific questions
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Component */}
      <Quiz />
    </div>
  );
}
