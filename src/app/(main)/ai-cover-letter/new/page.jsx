import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          <Link href="/ai-cover-letter">
            <Button variant="outline" className="gap-2 font-bold h-11">
              <ArrowLeft className="h-5 w-5" />
              Back to Cover Letters
            </Button>
          </Link>

          <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
            <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium mb-2">
              CREATE COVER LETTER
            </h1>
            <p className="text-base md:text-lg text-charcoal/70 font-medium">
              Generate a tailored cover letter for your job application
            </p>
          </div>
        </div>

        <div className="mt-8">
          <CoverLetterGenerator />
        </div>
      </div>
    </div>
  );
}
