"use client";

import { Trophy, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-tanjiro-green";
    if (score >= 60) return "text-zenitsu-yellow";
    return "text-demon-red";
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent Work!";
    if (score >= 60) return "Good Effort!";
    return "Keep Practicing!";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-cream">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-zenitsu-yellow border-4 border-black flex items-center justify-center shadow-neu">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-charcoal mb-2">
                Quiz Results
              </h1>
              <p className={`text-5xl md:text-6xl font-black ${getScoreColor(result.quizScore)} mb-2`}>
                {result.quizScore.toFixed(1)}%
              </p>
              <p className="text-xl font-bold text-charcoal/70">
                {getScoreMessage(result.quizScore)}
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={result.quizScore} className="h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tip */}
      {result.improvementTip && (
        <Card className="bg-tanjiro-green/10 border-3 border-tanjiro-green">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg text-charcoal mb-2">Improvement Tip:</p>
                <p className="text-base font-medium text-charcoal/80 leading-relaxed">
                  {result.improvementTip}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Review */}
      <Card className="bg-cream">
        <CardContent className="pt-8 space-y-6">
          <h3 className="text-2xl font-black text-charcoal">Question Review</h3>
          <div className="space-y-4">
            {result.questions.map((q, index) => (
              <div 
                key={index} 
                className={`bg-white border-3 rounded-lg p-6 space-y-4 ${
                  q.isCorrect ? 'border-tanjiro-green' : 'border-demon-red'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 rounded-md bg-charcoal text-white font-black text-sm flex items-center justify-center border-2 border-black">
                        {index + 1}
                      </span>
                      {q.isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-tanjiro-green flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-demon-red flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-base md:text-lg font-bold text-charcoal leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-charcoal">Your answer:</span>
                    <span className={`font-medium ${q.isCorrect ? 'text-tanjiro-green' : 'text-demon-red'}`}>
                      {q.userAnswer}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="flex items-start gap-2">
                      <span className="font-black text-charcoal">Correct answer:</span>
                      <span className="font-medium text-tanjiro-green">
                        {q.answer}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-cream border-2 border-black rounded-lg p-4">
                  <p className="font-black text-charcoal mb-2">Explanation:</p>
                  <p className="text-sm md:text-base font-medium text-charcoal/80 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {!hideStartNew && (
          <CardFooter>
            <Button onClick={onStartNew} className="w-full h-12 font-bold text-base">
              Start New Quiz
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
