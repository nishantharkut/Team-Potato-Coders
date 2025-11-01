import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-cream hover:bg-white transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">Average Score</CardTitle>
          <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Trophy className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-charcoal mb-2">{getAverageScore()}%</div>
          <p className="text-sm font-medium text-charcoal/60">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-cream hover:bg-white transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">
            Questions Practiced
          </CardTitle>
          <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-charcoal mb-2">{getTotalQuestions()}</div>
          <p className="text-sm font-medium text-charcoal/60">Total questions</p>
        </CardContent>
      </Card>

      <Card className="bg-cream hover:bg-white transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">Latest Score</CardTitle>
          <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Target className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-charcoal mb-2">
            {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
          </div>
          <p className="text-sm font-medium text-charcoal/60">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
