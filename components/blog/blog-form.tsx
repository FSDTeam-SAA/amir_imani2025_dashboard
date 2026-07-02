"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "./rich-text-editor";
import { Loader2, UploadCloud, X } from "lucide-react";
import type { Blog, CreateBlogInput, UpdateBlogInput } from "@/lib/types/blog";

// Wrapper for both Create and Update inputs
// We only validate what we strictly need.
const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // img can be a File or a string (URL) or undefined/null
  img: z
    .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
    .optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  blog?: Blog | null;
  onSubmit: (data: any) => Promise<void>; // Relaxed type to handle internal transform
  isLoading: boolean;
  onCancel: () => void;
}

export function BlogForm({
  blog,
  onSubmit,
  isLoading,
  onCancel,
}: BlogFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      description: "",
      img: undefined,
    },
  });

  // Reset form when blog changes (for edit mode)
  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title || "",
        description: blog.description || "",
        img: blog.img, // Store the URL as the initial value
      });
      setPreviewUrl(blog.img || null);
    } else {
      form.reset({
        title: "",
        description: "",
        img: undefined,
      });
      setPreviewUrl(null);
    }
  }, [blog, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("img", file, { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearImage = () => {
    form.setValue("img", undefined);
    setPreviewUrl(null);
  };

  const handleSubmit = async (values: BlogFormValues) => {
    // Pass values directly, service will handle FormData conversion if img is File
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-4xl mx-auto space-y-8 pb-20"
      >
        {/* Header / Actions */}
        <div className="flex items-center justify-between top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b">
          <div className="">
            <h2 className="text-lg font-semibold font-heading">
              {blog ? "Edit Post" : "New Post"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {blog
                ? "Refine your story"
                : "Share your thoughts with the world"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-foreground text-background hover:bg-foreground/90 px-8"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {blog ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <Input
                    placeholder="Enter post title..."
                    className="text-4xl md:text-5xl font-bold border-none px-0 focus-visible:ring-0 placeholder:opacity-30 h-auto py-4"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                  <FormMessage />
                  <span>{field.value.length} characters</span>
                </div>
              </FormItem>
            )}
          />

          {/* Cover Image Section */}
          <FormField
            control={form.control}
            name="img"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border bg-muted/30 transition-all hover:bg-muted/50 border-dashed">
                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt="Cover preview"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white/90 hover:bg-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                          Change Cover
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            {...field}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            clearImage();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center p-10">
                      <div className="mb-4 rounded-full bg-background p-4 shadow-sm transition-transform group-hover:scale-110">
                        <UploadCloud className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">
                          Add a cover photo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Recommended: 16:9 ratio, high resolution (PNG/JPG)
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                    </label>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Editor Section */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your story..."
                    className="border-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
