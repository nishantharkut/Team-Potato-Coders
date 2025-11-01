"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Lightbulb,
  Target,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviewUploadedResume } from "@/actions/resume-reviewer";
import { toast } from "sonner";

export default function ResumeReviewTab({
  previewContent,
  reviewData: externalReviewData,
  isReviewing: externalIsReviewing,
  onReview,
  onLoadPrevious,
}) {
  const [hasContent, setHasContent] = useState(false);
  const [reviewMode, setReviewMode] = useState("saved"); // "saved" or "upload"
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [internalReviewData, setInternalReviewData] = useState(externalReviewData);
  const [internalIsReviewing, setInternalIsReviewing] = useState(false);

  // Use external data when available, otherwise use internal state
  const reviewData = externalReviewData || internalReviewData;
  const isReviewing = externalIsReviewing || internalIsReviewing || isUploading;

  useEffect(() => {
    setHasContent(!!previewContent && previewContent.trim().length > 0);
  }, [previewContent]);

  useEffect(() => {
    // Sync external review data with internal state
    if (externalReviewData) {
      setInternalReviewData(externalReviewData);
    }
  }, [externalReviewData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const validExtensions = [".pdf", ".txt", ".doc", ".docx"];
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    setUploadedFileName(file.name);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileName("");
  };

  const handleUploadAndReview = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setIsExtracting(true);

    try {
      // Upload file and extract text
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const { content } = await uploadResponse.json();

      if (!content || content.trim().length === 0) {
        throw new Error("Could not extract text from file");
      }

      setIsExtracting(false);
      setInternalIsReviewing(true);

      // Review the extracted content
      const review = await reviewUploadedResume(content);
      setInternalReviewData(review);
      toast.success("Resume reviewed successfully!");
    } catch (error) {
      console.error("Upload and review error:", error);
      toast.error(error.message || "Failed to upload and review resume");
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
      setInternalIsReviewing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPriorityColor = (priority) => {
    if (priority === "high") return "text-red-500";
    if (priority === "medium") return "text-yellow-500";
    return "text-blue-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Resume Review</h2>
        <p className="text-muted-foreground">
          Get comprehensive feedback and suggestions to improve your resume
        </p>
      </div>

      <Tabs value={reviewMode} onValueChange={setReviewMode}>
        <TabsList>
          <TabsTrigger value="saved">Review Saved Resume</TabsTrigger>
          <TabsTrigger value="upload">Upload & Review</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          {!hasContent ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Resume Content</h3>
                  <p className="text-muted-foreground mb-4">
                    Please create and save your resume first before reviewing it, or use the
                    "Upload & Review" tab to review an existing resume file.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="text-sm text-muted-foreground">
                  Review your saved resume on UpRoot
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onLoadPrevious}
                    disabled={isReviewing || isUploading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Previous
                  </Button>
                  <Button onClick={onReview} disabled={isReviewing || isUploading}>
                    {isReviewing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reviewing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Review Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload a PDF, DOC, DOCX, or TXT file to get it reviewed by UpRoot AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedFileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile.size > 1024 * 1024
                            ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : `${(uploadedFile.size / 1024).toFixed(2)} KB`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isUploading || isReviewing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRemoveFile}
                      disabled={isUploading || isReviewing}
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={handleUploadAndReview}
                      disabled={isUploading || isReviewing || isExtracting}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting Text...
                        </>
                      ) : isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Reviewing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upload & Review
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Results - shown for both modes */}

      {/* Review Results */}
      {reviewData ? (
        <div className="space-y-6">
          {/* Scores Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Score
                </CardTitle>
                <CardDescription>Overall resume quality assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <span className={`text-5xl font-bold ${getScoreColor(reviewData.overallScore)}`}>
                      {reviewData.overallScore}
                    </span>
                    <Badge variant={getScoreBadgeVariant(reviewData.overallScore)}>
                      / 100
                    </Badge>
                  </div>
                  <Progress value={reviewData.overallScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ATS Score
                </CardTitle>
                <CardDescription>Applicant Tracking System compatibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <span className={`text-5xl font-bold ${getScoreColor(reviewData.atsScore)}`}>
                      {reviewData.atsScore}
                    </span>
                    <Badge variant={getScoreBadgeVariant(reviewData.atsScore)}>
                      / 100
                    </Badge>
                  </div>
                  <Progress value={reviewData.atsScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{reviewData.summary}</p>
            </CardContent>
          </Card>

          {/* Strengths */}
          {reviewData.strengths && reviewData.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reviewData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {reviewData.improvements && reviewData.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Suggested Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {reviewData.improvements.map((improvement, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              improvement.priority === "high"
                                ? "destructive"
                                : improvement.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="mr-2"
                          >
                            {improvement.priority}
                          </Badge>
                          <span className="font-medium">{improvement.category}</span>
                          <span className="text-muted-foreground">
                            - {improvement.issue}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground pl-8">
                          {improvement.suggestion}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Sections */}
          {(reviewData.enhancedSections?.summary || reviewData.enhancedSections?.skills) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  Enhanced Sections
                </CardTitle>
                <CardDescription>
                  AI-improved versions of your resume sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviewData.enhancedSections.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Professional Summary</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {reviewData.enhancedSections.summary}
                      </p>
                    </div>
                  </div>
                )}
                {reviewData.enhancedSections.skills && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {reviewData.enhancedSections.skills}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ATS Optimization Tips */}
          {reviewData.atsOptimization && reviewData.atsOptimization.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ATS Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reviewData.atsOptimization.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Industry-Specific Tips */}
          {reviewData.industrySpecificTips && reviewData.industrySpecificTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Industry-Specific Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reviewData.industrySpecificTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Suggested Keywords */}
          {reviewData.suggestedKeywords && reviewData.suggestedKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Suggested Keywords</CardTitle>
                <CardDescription>
                  Keywords to improve ATS compatibility and relevance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {reviewData.suggestedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ready to Review</h3>
              <p className="text-muted-foreground mb-6">
                Click the "Review Resume" button to get AI-powered feedback and suggestions
                for improving your resume.
              </p>
              <Button onClick={onReview} disabled={isReviewing}>
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

