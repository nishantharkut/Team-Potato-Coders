"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  if (generatingQuiz) {
    return (
      <div className="flex justify-center py-12">
        <BarLoader width={"100%"} color="#1a4d2e" />
      </div>
    );
  }

  // Show results if quiz is completed
  if (resultData) {
    return <QuizResult result={resultData} onStartNew={startNewQuiz} />;
  }

  if (!quizData) {
    return (
      <Card className="bg-cream">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-charcoal">
            Ready to test your knowledge?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base font-medium text-charcoal/70">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full h-12 font-bold text-base">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="bg-cream">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl font-black text-charcoal">
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white border-3 border-black rounded-lg p-6">
          <p className="text-lg md:text-xl font-bold text-charcoal leading-relaxed">
            {question.question}
          </p>
        </div>

        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-3 bg-white border-3 border-black rounded-lg p-4 hover:bg-tanjiro-green/5 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
              <Label 
                htmlFor={`option-${index}`} 
                className="text-base font-medium text-charcoal cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="bg-tanjiro-green/10 border-3 border-tanjiro-green rounded-lg p-6 space-y-2">
            <p className="font-black text-charcoal text-lg">Explanation:</p>
            <p className="text-base font-medium text-charcoal/80 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
            className="h-12 px-6 font-bold"
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto h-12 px-8 font-bold text-base"
        >
          {savingResult ? (
            <BarLoader width={"60px"} color="#f5f5dc" />
          ) : (
            <>
              {currentQuestion < quizData.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
