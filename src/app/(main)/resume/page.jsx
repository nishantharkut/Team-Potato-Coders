import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <ResumeBuilder initialContent={resume?.content} />
      </div>
    </div>
  );
}
