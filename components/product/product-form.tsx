"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Loader2, Plus, Upload, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { TagInput } from "@/components/ui/tag-input";
import {
  CreateProductInput,
  Product,
  ProductPassAndPlayItem,
  ProductRule,
} from "@/lib/types/product";

const merchandiseCategories = [
  "APPAREL",
  "ACCESSORIES",
  "PRINTS & POSTERS",
  "STATIONERY",
  "HOME & DECOR",
  "COLLECTIBLES",
] as const;

const ruleSchema = z.object({
  num: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

const passAndPlaySchema = z.object({
  message: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

const formSchema = z
  .object({
    productName: z
      .string()
      .min(2, "Product name must be at least 2 characters."),
    price: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Price must be positive."),
    ),
    productType: z.string().min(1, "Please select a product type."),
    category: z.string().optional(),
    feature: z.string().optional(),
    description: z.string().optional(),
    videoLink: z.string().optional().or(z.literal("")),
    imgs: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    size: z.array(z.string()).optional(),
    quantity: z.preprocess((val) => Number(val), z.number().min(0).optional()),
    ruleTitle: z.string().optional(),
    rulls: z.array(ruleSchema).optional(),
    boardanatomyTitle: z.string().optional(),
    boardAnatomyDiscription: z.string().optional(),
    passandplayTittle: z.string().optional(),
    passandplay: z.array(passAndPlaySchema).optional(),
    garmentTitle: z.string().optional(),
    garmentsMATERIAL: z.string().optional(),
    garmentWEIGHT: z.string().optional(),
    garmentFit: z.string().optional(),
    garmentPRINT: z.string().optional(),
    garmentMADeIN: z.string().optional(),
    garmentCARE: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.productType === "marchandice" && !values.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "Please select a merchandise category.",
      });
    }
  });

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: CreateProductInput) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const normalizeRules = (rules?: ProductRule[]) =>
  Array.isArray(rules) && rules.length > 0
    ? rules.map((rule) => ({
        num: rule?.num || "",
        title: rule?.title || "",
        description: rule?.description || "",
      }))
    : [{ num: "01", title: "", description: "" }];

const normalizePassAndPlay = (items?: ProductPassAndPlayItem[]) =>
  Array.isArray(items) && items.length > 0
    ? items.map((item) => ({
        message: item?.message || "",
        name: item?.name || "",
        type: item?.type || "",
      }))
    : [{ message: "", name: "", type: "" }];

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: ProductFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: initialData?.productName || "",
      price: initialData?.price || 0,
      productType: initialData?.productType || "card",
      category: initialData?.category || "",
      feature: initialData?.feature || "",
      description: initialData?.description || "",
      videoLink: initialData?.videoLink || "",
      color: initialData?.color || [],
      size: initialData?.size || [],
      quantity: initialData?.quantity || 0,
      ruleTitle: initialData?.ruleTitle || "",
      rulls: normalizeRules(initialData?.rulls),
      boardanatomyTitle: initialData?.boardanatomyTitle || "",
      boardAnatomyDiscription: initialData?.boardAnatomyDiscription || "",
      passandplayTittle: initialData?.passandplayTittle || "",
      passandplay: normalizePassAndPlay(initialData?.passandplay),
      garmentTitle: initialData?.garmentTitle || "",
      garmentsMATERIAL: initialData?.garmentsMATERIAL || "",
      garmentWEIGHT: initialData?.garmentWEIGHT || "",
      garmentFit: initialData?.garmentFit || "",
      garmentPRINT: initialData?.garmentPRINT || "",
      garmentMADeIN: initialData?.garmentMADeIN || "",
      garmentCARE: initialData?.garmentCARE || "",
    },
  });

  const productType = form.watch("productType");

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control: form.control,
    name: "rulls",
  });

  const {
    fields: passAndPlayFields,
    append: appendPassAndPlay,
    remove: removePassAndPlay,
  } = useFieldArray({
    control: form.control,
    name: "passandplay",
  });

  useEffect(() => {
    if (productType !== "marchandice") {
      form.setValue("category", "");
      form.clearErrors("category");
    }
  }, [form, productType]);

  useEffect(() => {
    if (initialData) {
      if (initialData.imgs && initialData.imgs.length > 0) {
        setExistingImages(initialData.imgs);
      } else if (initialData.img) {
        setExistingImages([initialData.img]);
      }
    }
  }, [initialData]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
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

  const handleSubmit = (values: ProductFormValues) => {
    const input: CreateProductInput = {
      productName: values.productName,
      price: Number(values.price),
      productType: values.productType,
      category:
        values.productType === "marchandice" ? values.category : undefined,
      feature: values.feature,
      description: values.description,
      videoLink: values.videoLink,
      color: Array.isArray(values.color) ? values.color : [],
      size: Array.isArray(values.size) ? values.size : [],
      quantity:
        values.quantity !== undefined ? Number(values.quantity) : undefined,
      imgs: images.length > 0 ? images : [],
      existingImgs: existingImages.filter(Boolean),
      ruleTitle: values.ruleTitle,
      rulls:
        values.rulls?.filter(
          (rule) => rule.num || rule.title || rule.description,
        ) || [],
      boardanatomyTitle: values.boardanatomyTitle,
      boardAnatomyDiscription: values.boardAnatomyDiscription,
      passandplayTittle: values.passandplayTittle,
      passandplay:
        values.passandplay?.filter(
          (item) => item.message || item.name || item.type,
        ) || [],
      garmentTitle: values.garmentTitle,
      garmentsMATERIAL: values.garmentsMATERIAL,
      garmentWEIGHT: values.garmentWEIGHT,
      garmentFit: values.garmentFit,
      garmentPRINT: values.garmentPRINT,
      garmentMADeIN: values.garmentMADeIN,
      garmentCARE: values.garmentCARE,
    };

    onSubmit(input);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
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

              {productType === "marchandice" && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select merchandise category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {merchandiseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Used by the website merchandise category filter.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                      Short summary shown near the product title.
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {productType === "card" && (
              <>
                <div className="rounded-lg border p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold text-lg">Game Rules</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendRule({ num: "", title: "", description: "" })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="ruleTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rules Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="How to Play" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {ruleFields.map((rule, index) => (
                    <div
                      key={rule.id}
                      className="rounded-md border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Rule {index + 1}</p>
                        {ruleFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`rulls.${index}.num`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step No.</FormLabel>
                              <FormControl>
                                <Input placeholder="01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`rulls.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Setup" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`rulls.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Describe this rule..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border p-4 shadow-sm space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Board Anatomy
                  </h3>

                  <FormField
                    control={form.control}
                    name="boardanatomyTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sixteen spaces. Three layers..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="boardAnatomyDiscription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Explain the board anatomy..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg border p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold text-lg">Pass &amp; Play</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendPassAndPlay({ message: "", name: "", type: "" })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="passandplayTittle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Pass & Play" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {passAndPlayFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-md border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Card {index + 1}</p>
                        {passAndPlayFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePassAndPlay(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`passandplay.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`passandplay.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta / Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Editors pick" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`passandplay.${index}.message`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Write the message..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {productType === "marchandice" && (
              <div className="rounded-lg border p-4 shadow-sm space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Garment Details
                </h3>

                <FormField
                  control={form.control}
                  name="garmentTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Materials and care" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="garmentsMATERIAL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="100% Cotton" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garmentWEIGHT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="220 GSM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garmentFit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fit</FormLabel>
                        <FormControl>
                          <Input placeholder="Relaxed fit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garmentPRINT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Print</FormLabel>
                        <FormControl>
                          <Input placeholder="Screen print" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garmentMADeIN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Made In</FormLabel>
                        <FormControl>
                          <Input placeholder="Bangladesh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garmentCARE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Care</FormLabel>
                        <FormControl>
                          <Input placeholder="Machine wash cold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8 md:sticky md:top-6 md:self-start">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Images</FormLabel>
                <div className="flex flex-wrap gap-4">
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
