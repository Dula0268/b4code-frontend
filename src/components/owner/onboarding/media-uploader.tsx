"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Star, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { formatApiError } from "@/lib/error-formatter";
import api from "@/lib/axios";

const formSchema = z.object({
  coverPhoto: z.string().min(1, "Cover photo is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

// Track both the local blob preview URL and the original File object
interface ImageEntry {
  preview: string; // blob: URL or existing cloud URL for display
  file?: File;      // original File for upload (optional if already uploaded)
  cloudUrl?: string; // set after upload
}

export default function MediaUploader() {
  const { formData, updateFormData, prevStep, resetOnboarding } = useOnboardingStore();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>(() => {
    return formData.images.map(url => ({ preview: url }));
  });
  const [coverIndex, setCoverIndex] = useState<number>(() => {
    if (formData.coverPhoto && formData.images.length > 0) {
      const idx = formData.images.indexOf(formData.coverPhoto);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      coverPhoto: formData.coverPhoto || "",
      images: formData.images,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newEntries: ImageEntry[] = acceptedFiles.map(file => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImageEntries(prev => {
      const updated = [...prev, ...newEntries];
      // Update form values with previews for validation
      const previews = updated.map(e => e.preview);
      form.setValue("images", previews, { shouldValidate: true });
      if (!form.getValues("coverPhoto") && updated.length > 0) {
        form.setValue("coverPhoto", updated[0].preview, { shouldValidate: true });
        setCoverIndex(0);
      }
      return updated;
    });
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
  });

  const removeImage = (index: number) => {
    setImageEntries(prev => {
      const updated = prev.filter((_, i) => i !== index);
      const previews = updated.map(e => e.preview);
      form.setValue("images", previews, { shouldValidate: true });
      // Adjust cover index
      if (coverIndex >= updated.length) {
        const newCoverIdx = updated.length > 0 ? 0 : -1;
        setCoverIndex(newCoverIdx);
        form.setValue("coverPhoto", updated[0]?.preview || "", { shouldValidate: true });
      }
      return updated;
    });
  };

  const selectCover = (index: number) => {
    setCoverIndex(index);
    form.setValue("coverPhoto", imageEntries[index].preview, { shouldValidate: true });
  };

  /** Upload a single File to backend → Cloudinary, returns the secure URL */
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "properties");
    const res = await api.post<{ url: string }>("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const onSubmit = async () => {
    if (imageEntries.length === 0) {
      toast.error("Please add at least one photo.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload all images to Cloudinary
      const uploaded: string[] = [];
      for (let i = 0; i < imageEntries.length; i++) {
        if (imageEntries[i].file) {
          const url = await uploadFile(imageEntries[i].file!);
          uploaded.push(url);
        } else {
          uploaded.push(imageEntries[i].preview); // Already a cloud URL
        }
        setUploadProgress(Math.round(((i + 1) / imageEntries.length) * 100));
      }

      const coverUrl = uploaded[coverIndex] ?? uploaded[0];
      const values = { coverPhoto: coverUrl, images: uploaded };
      updateFormData(values);

      const finalData = { ...formData, ...values };
      
      if (formData.id) {
        await ownerPropertyApi.updateProperty(formData.id, finalData);
        
        if (formData.originalStatus === 'REJECTED') {
          // We are editing an existing rejected property
          await ownerPropertyApi.resubmitProperty(formData.id);
          toast.success("Property resubmitted for review! Admin will verify the changes.");
        } else {
          toast.success("Property updated successfully!");
        }
      } else {
        // Creating a new property
        await ownerPropertyApi.createProperty(finalData);
        toast.success("Property submitted for review! You will be notified once approved.");
      }
      
      resetOnboarding();
      router.push("/owner/properties");
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Upload Property Photos</h3>
          <p className="text-sm text-slate-500 mt-1">High-quality photos increase your booking potential. First image will be your cover.</p>
        </div>

        <div>
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormControl>
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                      isDragActive 
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 scale-[1.02]" 
                        : "border-slate-200 hover:border-[var(--brand-primary)]/50 hover:bg-slate-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${
                      isDragActive ? "bg-[var(--brand-primary)] text-white" : "bg-white shadow-sm border border-slate-100 text-[var(--brand-primary)] group-hover:scale-110 group-hover:shadow-md"
                    }`}>
                      <ImagePlus className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-semibold text-slate-800 mb-2">
                      {isDragActive ? "Drop your photos here!" : "Drag & drop photos here"}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      or click to browse your files
                    </p>
                    <p className="text-xs text-slate-400 mt-4">
                      Supports JPG, PNG, WEBP up to 5MB
                    </p>
                  </div>
                </FormControl>
                <FormMessage className="mt-2" />
              </FormItem>
            )}
          />
        </div>

        {imageEntries.length > 0 && (
          <div className="mt-10 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Uploaded Photos ({imageEntries.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {imageEntries.map((entry, index) => {
                const isCover = coverIndex === index;
                return (
                  <div key={index} className={`relative group rounded-2xl overflow-hidden aspect-square transition-all duration-300 ${
                    isCover ? 'ring-4 ring-[var(--brand-primary)] ring-offset-2' : 'border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'
                  }`}>
                    <Image 
                      src={entry.preview} 
                      alt={`Upload ${index + 1}`} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                      
                      {/* Top bar */}
                      <div className="flex justify-between items-start w-full">
                        {isCover ? (
                          <div className="bg-[var(--brand-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                            <Star size={12} className="fill-white" /> Cover
                          </div>
                        ) : (
                          <div /> // spacer
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                          className="bg-black/40 hover:bg-red-500 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Bottom action */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); selectCover(index); }}
                          className="w-full bg-white/90 hover:bg-white text-slate-900 text-sm font-semibold py-2.5 rounded-xl transition-colors backdrop-blur-sm shadow-sm"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>

                    {/* Permanent Cover Badge */}
                    {isCover && (
                      <div className="absolute top-3 left-3 bg-[var(--brand-primary)] text-white p-2 rounded-full shadow-md group-hover:opacity-0 transition-opacity duration-300">
                        <Star size={14} className="fill-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upload progress bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={16} className="animate-spin text-[var(--brand-primary)]" />
              <span className="text-sm font-medium text-slate-600">Uploading photos... {uploadProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-10 border-t border-slate-100">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg"
            className="text-slate-500 hover:text-slate-900 font-medium rounded-xl px-6 transition-all"
            onClick={() => {
              updateFormData(form.getValues());
              prevStep();
            }}
            disabled={isUploading}
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            size="lg"
            disabled={isUploading || imageEntries.length === 0}
            className="bg-[var(--brand-primary)] hover:opacity-90 text-white font-medium rounded-xl px-8 shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-200 hover:-translate-y-0.5 text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </span>
            ) : "Complete Setup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
