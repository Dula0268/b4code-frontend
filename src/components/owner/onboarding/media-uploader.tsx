"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/owner/onboarding.store";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Star, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ownerPropertyApi } from "@/api/owner/property.api";

const formSchema = z.object({
  coverPhoto: z.string().min(1, "Cover photo is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

export default function MediaUploader() {
  const { formData, updateFormData, prevStep } = useOnboardingStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverPhoto: formData.coverPhoto || "",
      images: formData.images,
    },
  });

  const { setValue, watch } = form;
  const images = watch("images");
  const coverPhoto = watch("coverPhoto");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
    
    const updatedImages = [...images, ...newImages];
    setValue("images", updatedImages, { shouldValidate: true });
    
    if (!coverPhoto && updatedImages.length > 0) {
      setValue("coverPhoto", updatedImages[0], { shouldValidate: true });
    }
  }, [images, coverPhoto, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
  });

  const removeImage = (index: number) => {
    const imgToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldValidate: true });
    
    if (coverPhoto === imgToRemove) {
      setValue("coverPhoto", newImages.length > 0 ? newImages[0] : "", { shouldValidate: true });
    }
  };

  const setCoverPhoto = (imgUrl: string) => {
    setValue("coverPhoto", imgUrl, { shouldValidate: true });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    updateFormData(values);
    try {
      const finalData = { ...formData, ...values };
      await ownerPropertyApi.createProperty(finalData);
      console.log("Successfully created property:", finalData);
      router.push("/owner/properties");
    } catch (error) {
      console.error("Failed to submit property:", error);
      alert("Failed to submit property. Please try again.");
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

        {images.length > 0 && (
          <div className="mt-10 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Uploaded Photos ({images.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {images.map((img, index) => {
                const isCover = coverPhoto === img;
                return (
                  <div key={index} className={`relative group rounded-2xl overflow-hidden aspect-square transition-all duration-300 ${
                    isCover ? 'ring-4 ring-[var(--brand-primary)] ring-offset-2' : 'border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'
                  }`}>
                    <Image 
                      src={img} 
                      alt={`Upload ${index + 1}`} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                          onClick={(e) => { e.stopPropagation(); setCoverPhoto(img); }}
                          className="w-full bg-white/90 hover:bg-white text-slate-900 text-sm font-semibold py-2.5 rounded-xl transition-colors backdrop-blur-sm shadow-sm"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>

                    {/* Permanent Cover Badge if not hovered (optional, but nice) */}
                    {isCover && (
                      <div className="absolute top-3 left-3 bg-[var(--brand-primary)] text-white p-2 rounded-full shadow-md group-hover:opacity-0 transition-opacity duration-300">
                        <Star size={14} className="fill-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {form.formState.errors.coverPhoto && (
              <p className="text-sm font-medium text-red-500 mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
                {form.formState.errors.coverPhoto.message}
              </p>
            )}
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
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            size="lg"
            className="bg-[var(--brand-primary)] hover:opacity-90 text-white font-medium rounded-xl px-8 shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-200 hover:-translate-y-0.5 text-lg"
          >
            Complete Setup
          </Button>
        </div>
      </form>
    </Form>
  );
}
