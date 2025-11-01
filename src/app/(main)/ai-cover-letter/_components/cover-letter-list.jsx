"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/actions/cover-letter";

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
    }
  };

  if (!coverLetters?.length) {
    return (
      <Card className="bg-cream">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-charcoal">No Cover Letters Yet</CardTitle>
          <CardDescription className="text-base font-medium text-charcoal/70">
            Create your first cover letter to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="group relative bg-cream hover:bg-white transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl font-black text-charcoal mb-2">
                  {letter.jobTitle} at {letter.companyName}
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-charcoal/70">
                  Created {format(new Date(letter.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                    className="h-10 w-10"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black text-charcoal">Delete Cover Letter?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base font-medium text-charcoal/70">
                        This action cannot be undone. This will permanently
                        delete your cover letter for {letter.jobTitle} at{" "}
                        {letter.companyName}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-bold">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(letter.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-charcoal/80 text-sm md:text-base font-medium line-clamp-3">
              {letter.jobDescription}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
