// app/resume/_components/entry-form.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/app/lib/schema";
import { Sparkles, PlusCircle, X, Pencil, Save, Loader2 } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

export function EntryForm({ type, entries, onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...entries, formattedEntry]);

    reset();
    setIsAdding(false);
  });

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  // Add this effect to handle the improvement result
  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  // Replace handleImproveDescription with this
  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(), // 'experience', 'education', or 'project'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index} className="bg-cream/50 hover:bg-cream transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex-1">
                <CardTitle className="text-lg font-black text-charcoal mb-1">
                  {item.title}
                </CardTitle>
                <p className="text-base font-bold text-tanjiro-green">
                  {item.organization}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-tanjiro-green/10 border-2 border-tanjiro-green rounded-md">
                  <p className="text-sm font-bold text-tanjiro-green">
                    {item.current
                      ? `${item.startDate} - Present`
                      : `${item.startDate} - ${item.endDate}`}
                  </p>
                </div>
              </div>
              <p className="text-sm md:text-base text-charcoal font-medium whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card className="bg-cream/30">
          <CardHeader>
            <CardTitle className="text-xl font-black text-charcoal">Add New {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-charcoal">Title/Position</label>
                <Input
                  placeholder="e.g., Software Engineer"
                  {...register("title")}
                  error={errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-demon-red font-semibold">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-charcoal">Organization/Company</label>
                <Input
                  placeholder="e.g., Google Inc."
                  {...register("organization")}
                  error={errors.organization}
                />
                {errors.organization && (
                  <p className="text-sm text-demon-red font-semibold">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-charcoal">Start Date</label>
                <Input
                  type="month"
                  {...register("startDate")}
                  error={errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-demon-red font-semibold">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-charcoal">End Date</label>
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                  error={errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-demon-red font-semibold">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white border-3 border-black rounded-lg">
              <input
                type="checkbox"
                id="current"
                className="w-5 h-5 border-3 border-black rounded accent-tanjiro-green cursor-pointer"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor="current" className="text-base font-bold text-charcoal cursor-pointer">
                I currently work here
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-charcoal">Description</label>
              <Textarea
                placeholder={`Describe your ${type.toLowerCase()} responsibilities and achievements...`}
                className="min-h-[140px]"
                {...register("description")}
                error={errors.description}
              />
              {errors.description && (
                <p className="text-sm text-demon-red font-semibold">
                  {errors.description.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-tanjiro-green/10 border-2 border-tanjiro-green rounded-lg">
              <Sparkles className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal mb-1">AI-Powered Enhancement</p>
                <p className="text-xs font-medium text-charcoal/70">Let AI improve your description for better impact</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImproveDescription}
                disabled={isImproving || !watch("description")}
                className="font-bold"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  "Improve"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd} className="font-bold">
              <PlusCircle className="h-5 w-5 mr-2" />
              Add {type}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full h-14 font-bold text-base"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
}
