"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Mail,
  FileText,
  Zap,
  Briefcase,
  GraduationCap,
  Rocket,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { reviewResume, getResumeReview } from "@/actions/resume-reviewer";
import { EntryForm } from "./entry-form";
import ResumeReviewTab from "./resume-review-tab";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import html2pdf from "html2pdf.js/dist/html2pdf"

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [reviewData, setReviewData] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`✉ ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`☎ ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`[LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`[Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-8">
      {/* Header Section */}
      <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green mb-2 text-shadow-medium">
              RESUME BUILDER
            </h1>
            <p className="text-base md:text-lg text-charcoal/70 font-medium">
              Create a professional resume with AI-powered assistance
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="h-12 px-6 font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Resume
                </>
              )}
            </Button>
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="h-12 px-6 font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white border-4 border-black rounded-xl shadow-neu p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 h-14">
            <TabsTrigger value="edit" className="text-base font-bold data-[state=active]:shadow-neu-sm">
              <Edit className="h-5 w-5 mr-2" />
              Edit Form
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-base font-bold data-[state=active]:shadow-neu-sm">
              <Monitor className="h-5 w-5 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="review" className="text-base font-bold data-[state=active]:shadow-neu-sm">
              <Sparkles className="h-5 w-5 mr-2" />
              Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-0 mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Contact Information
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      How employers can reach you
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                  <label className="text-sm font-bold text-charcoal">Email Address</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-demon-red font-semibold">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                  <label className="text-sm font-bold text-charcoal">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-demon-red font-semibold">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                  <label className="text-sm font-bold text-charcoal">LinkedIn Profile</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-demon-red font-semibold">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                  <label className="text-sm font-bold text-charcoal">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-demon-red font-semibold">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Professional Summary
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      Brief overview of your career and goals
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                <label className="text-sm font-bold text-charcoal">Summary</label>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="min-h-[140px]"
                      placeholder="Write a compelling professional summary that highlights your experience and achievements..."
                      error={errors.summary}
                    />
                  )}
                />
                {errors.summary && (
                  <p className="text-sm text-demon-red font-semibold">{errors.summary.message}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-earthy-orange border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Skills
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      Your technical and soft skills
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 bg-white border-3 border-black rounded-lg">
                <label className="text-sm font-bold text-charcoal">Your Skills</label>
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="min-h-[140px]"
                      placeholder="List your key skills (e.g., JavaScript, React, Node.js, Project Management, etc.)..."
                      error={errors.skills}
                    />
                  )}
                />
                {errors.skills && (
                  <p className="text-sm text-demon-red font-semibold">{errors.skills.message}</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Work Experience
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      Your professional work history
                    </p>
                  </div>
                </div>
              </div>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Education
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      Your academic background
                    </p>
                  </div>
                </div>
              </div>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-nezuko-pink border-3 border-black flex items-center justify-center shadow-neu-sm">
                    <Rocket className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-charcoal">
                      Projects
                    </h3>
                    <p className="text-sm font-medium text-charcoal/60 mt-1">
                      Notable projects you've worked on
                    </p>
                  </div>
                </div>
              </div>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.projects.message}
                </p>
              )}
            </div>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-0 mt-6">
            <div className="bg-cream border-4 border-black rounded-xl shadow-neu-lg p-6">
            {activeTab === "preview" && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-charcoal">Resume Preview</h3>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() =>
                    setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                  }
                  className="font-bold"
                >
                  {resumeMode === "preview" ? (
                    <>
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Markdown
                    </>
                  ) : (
                    <>
                      <Monitor className="h-5 w-5 mr-2" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === "preview" && resumeMode !== "preview" && (
              <div className="flex p-4 gap-3 items-start bg-zenitsu-yellow/20 border-3 border-zenitsu-yellow rounded-lg mb-4">
                <AlertTriangle className="h-6 w-6 text-charcoal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-charcoal mb-1">Warning</p>
                  <p className="text-sm font-medium text-charcoal/80">
                    You will lose edited markdown if you update the form data.
                  </p>
                </div>
              </div>
            )}
            
            <div className="border-4 border-black rounded-lg overflow-hidden bg-white">
              <MDEditor
                value={previewContent}
                onChange={setPreviewContent}
                height={800}
                preview={resumeMode}
              />
            </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-0 mt-6">
            <ResumeReviewTab
              previewContent={previewContent || initialContent}
              reviewData={reviewData}
              isReviewing={isReviewing}
              onReview={async () => {
                setIsReviewing(true);
                try {
                  // First save the current resume if it's been modified
                  if (previewContent && previewContent !== initialContent) {
                    await saveResumeFn(previewContent);
                  }
                  // Then review it
                  const review = await reviewResume();
                  setReviewData(review);
                  toast.success("Resume reviewed successfully!");
                } catch (error) {
                  console.error("Review error:", error);
                  toast.error(error.message || "Failed to review resume");
                } finally {
                  setIsReviewing(false);
                }
              }}
              onLoadPrevious={async () => {
                try {
                  const previous = await getResumeReview();
                  if (previous) {
                    setReviewData(previous);
                    toast.success("Previous review loaded!");
                  } else {
                    toast.info("No previous review found. Please run a new review.");
                  }
                } catch (error) {
                  console.error("Load error:", error);
                  toast.error("Failed to load previous review");
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden">
        <div id="resume-pdf">
          <MDEditor.Markdown
            source={previewContent}
            style={{
              background: "white",
              color: "black",
            }}
          />
        </div>
      </div>
    </div>
  );
}
