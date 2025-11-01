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
  Download,
  Save,
  Trash2,
  ChevronDown,
  FolderOpen,
  Calendar,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { reviewUploadedResume, getAllResumeReviews, getReviewById, deleteReview } from "@/actions/resume-reviewer";
import { getAllResumes } from "@/actions/resume";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ResumeReviewTab({
  previewContent,
  reviewData: externalReviewData,
  isReviewing: externalIsReviewing,
  onReview,
  onLoadPrevious,
}) {
  const [hasContent, setHasContent] = useState(false);
  const [reviewMode, setReviewMode] = useState("saved"); // "saved" or "upload"
  
  // Separate state for saved and uploaded reviews
  const [savedReviewData, setSavedReviewData] = useState(null);
  const [uploadedReviewData, setUploadedReviewData] = useState(null);
  const [currentReviewType, setCurrentReviewType] = useState(null); // "saved" or "uploaded"
  
  // Saved resumes management
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  
  // Saved reviews management
  const [savedReviews, setSavedReviews] = useState([]);
  const [uploadedReviews, setUploadedReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const isReviewing = externalIsReviewing || isUploading;
  
  // Determine which review data to show
  const reviewData = currentReviewType === "saved" ? savedReviewData : uploadedReviewData;

  useEffect(() => {
    setHasContent(!!previewContent && previewContent.trim().length > 0);
  }, [previewContent]);

  useEffect(() => {
    // Sync external review data (from saved resume review)
    if (externalReviewData) {
      setSavedReviewData(externalReviewData);
      setCurrentReviewType("saved");
    }
  }, [externalReviewData]);

  // Load saved resumes
  useEffect(() => {
    loadSavedResumes();
    loadSavedReviews();
  }, []);

  const loadSavedResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const resumes = await getAllResumes();
      setSavedResumes(resumes);
      if (resumes.length > 0 && !selectedResumeId) {
        setSelectedResumeId(resumes[0].id);
      }
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load saved resumes");
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const loadSavedReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const [saved, uploaded] = await Promise.all([
        getAllResumeReviews("saved"),
        getAllResumeReviews("uploaded"),
      ]);
      setSavedReviews(saved || []);
      setUploadedReviews(uploaded || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const validExtensions = [".pdf", ".txt", ".doc", ".docx"];
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

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

      // Review the extracted content
      const review = await reviewUploadedResume(content, uploadedFileName);
      setUploadedReviewData(review);
      setCurrentReviewType("uploaded");
      toast.success("Resume reviewed successfully!");
      
      // Reload reviews list
      await loadSavedReviews();
    } catch (error) {
      console.error("Upload and review error:", error);
      toast.error(error.message || "Failed to upload and review resume");
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const handleLoadReview = async (reviewId, type) => {
    try {
      const reviewRecord = await getReviewById(reviewId);
      if (reviewRecord) {
        const data = reviewRecord.reviewData;
        if (type === "saved") {
          setSavedReviewData(data);
          setCurrentReviewType("saved");
        } else {
          setUploadedReviewData(data);
          setCurrentReviewType("uploaded");
        }
        toast.success("Review loaded successfully!");
      }
    } catch (error) {
      console.error("Error loading review:", error);
      toast.error("Failed to load review");
    }
  };

  const handleDeleteReview = async (reviewId, type) => {
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted successfully");
      
      // Reload reviews
      await loadSavedReviews();
      
      // Clear if this was the current review
      if (type === "saved" && savedReviewData) {
        setSavedReviewData(null);
      } else if (type === "uploaded" && uploadedReviewData) {
        setUploadedReviewData(null);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleDownloadReview = (review, fileName) => {
    const dataStr = JSON.stringify(review, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "resume-review"}_${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Review downloaded successfully!");
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
          {/* Saved Resumes Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Select Resume to Review
              </CardTitle>
              <CardDescription>
                Choose from your saved resumes or review the current one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={selectedResumeId || ""}
                  onValueChange={setSelectedResumeId}
                  disabled={isLoadingResumes || isReviewing}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title} ({format(new Date(resume.updatedAt), "MMM d, yyyy")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={async () => {
                    if (selectedResumeId && onReview) {
                      // Trigger review for selected resume
                      await onReview(selectedResumeId);
                    }
                  }}
                  disabled={!selectedResumeId || isReviewing || isLoadingResumes}
                >
                  {isReviewing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Review Selected
                    </>
                  )}
                </Button>
              </div>
              
              {hasContent && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onReview}
                    disabled={isReviewing}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Review Current Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Saved Reviews */}
          {savedReviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Previous Saved Reviews
                </CardTitle>
                <CardDescription>
                  View and manage your previous resume reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {review.resume?.title || "Resume Review"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy 'at' h:mm a")} • Overall: {(review.reviewData && typeof review.reviewData === 'object' ? review.reviewData.overallScore : null) || "N/A"}/100
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadReview(review.id, "saved")}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReview(review.reviewData, review.resume?.title || "review")}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id, "saved")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

          {/* Previous Uploaded Reviews */}
          {uploadedReviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Previous Uploaded Reviews
                </CardTitle>
                <CardDescription>
                  View and manage your previous uploaded resume reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {review.fileName || "Uploaded Resume"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy 'at' h:mm a")} • Overall: {(review.reviewData && typeof review.reviewData === 'object' ? review.reviewData.overallScore : null) || "N/A"}/100
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadReview(review.id, "uploaded")}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReview(review.reviewData, review.fileName || "uploaded-review")}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id, "uploaded")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Results - shown for both modes */}
      {reviewData && (
        <div className="space-y-6">
          {/* Action Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {currentReviewType === "saved" ? "Saved Resume Review" : "Uploaded Resume Review"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadReview(reviewData, currentReviewType === "saved" ? "saved-review" : uploadedFileName || "uploaded-review")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
      )}
    </div>
  );
}
