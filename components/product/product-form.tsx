"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, X, Upload } from "lucide-react";
import Image from "next/image";
import { CreateProductInput, Product } from "@/lib/types/product";

import RichTextEditor from "@/components/ui/rich-text-editor";
import { TagInput } from "@/components/ui/tag-input";

const formSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters."),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price must be positive.")
  ),
  productType: z.string().min(1, "Please select a product type."),
  feature: z.string().optional(),
  description: z.string().optional(),
  videoLink: z.string().optional().or(z.literal("")),
  imgs: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
  quantity: z.preprocess((val) => Number(val), z.number().min(0).optional()),
});

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: CreateProductInput) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: ProductFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: initialData?.productName || "",
      price: initialData?.price || 0,
      productType: initialData?.productType || "card",
      feature: initialData?.feature || "",
      description: initialData?.description || "",
      videoLink: initialData?.videoLink || "",
      color: initialData?.color || [],
      size: initialData?.size || [],
      quantity: initialData?.quantity || 0,
    },
  });

  const productType = form.watch("productType");

  useEffect(() => {
    if (initialData) {
      if (initialData.imgs && initialData.imgs.length > 0) {
        setExistingImages(initialData.imgs);
      } else if (initialData.img) {
        setExistingImages([initialData.img]);
      }
      // Ensure arrays for color/size if they come as strings from legacy data
      // Note: We updated types, but runtime data might vary if migration wasn't done.
      // But we'll trust defaultValues logic above combined with Zod coercion if needed.
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Filter out any undefined or empty strings from existingImages just in case
    const cleanedExistingImages = existingImages.filter(
      (url) => typeof url === "string" && url.trim() !== ""
    );

    const input: CreateProductInput = {
      productName: values.productName,
      price: Number(values.price),
      productType: values.productType,
      feature: values.feature,
      description: values.description,
      videoLink: values.videoLink,
      color: Array.isArray(values.color) ? values.color : [],
      size: Array.isArray(values.size) ? values.size : [],
      quantity:
        values.quantity !== undefined ? Number(values.quantity) : undefined,
      // Always send imgs as an array, even if empty
      imgs: images.length > 0 ? images : [],
      // Always send existingImgs as an array, even if empty
      existingImgs:
        cleanedExistingImages.length > 0 ? cleanedExistingImages : [],
    };
    onSubmit(input);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Basic Details Section */}
            <div className="rounded-lg border p-4 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Basic Details
              </h3>

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sample Product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="marchandice">Merchandise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div className="rounded-lg border p-4 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Attributes
              </h3>

              <FormField
                control={form.control}
                name="feature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="High quality material..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Key feature of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {productType === "marchandice" && (
                <>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colors</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Type hex code (e.g. #FF0000) and press Enter"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter hex codes and press Enter to add.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sizes</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Type size (e.g. XL) and press Enter"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter sizes and press Enter to add.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Content Section */}
            <div className="rounded-lg border p-4 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Content</h3>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Detailed description..."
                        className="min-h-[150px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media Section */}
            <div className="rounded-lg border p-4 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Media</h3>

              <FormField
                control={form.control}
                name="videoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {productType === "marchandice"
                        ? "Embedded Link"
                        : "YouTube Link"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      {productType === "marchandice"
                        ? "Provide the embeddable link URL."
                        : "Provide the full YouTube video URL."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Images</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {/* Existing Images */}
                  {existingImages.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative w-24 h-24 border rounded-md overflow-hidden bg-muted"
                    >
                      <Image
                        src={url}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* New Previews */}
                  {previewUrls.map((url, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative w-24 h-24 border rounded-md overflow-hidden bg-muted"
                    >
                      <Image
                        src={url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
