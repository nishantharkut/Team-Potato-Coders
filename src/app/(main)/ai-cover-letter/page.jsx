import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
                MY COVER LETTERS
              </h1>
              <p className="text-base md:text-lg text-charcoal/70 font-medium mt-2">
                Manage your AI-generated cover letters
              </p>
            </div>
            <Link href="/ai-cover-letter/new">
              <Button className="h-12 px-6 font-bold whitespace-nowrap">
                <Plus className="h-5 w-5 mr-2" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        <CoverLetterList coverLetters={coverLetters} />
      </div>
    </div>
  );
}
