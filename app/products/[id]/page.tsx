"use client";

import { ProductForm } from "@/components/product/product-form";
import { useProduct } from "@/lib/hooks/use-product";
import { useUpdateProduct } from "@/lib/hooks/use-update-product";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const router = useRouter();

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <h2 className="text-red-500">Product not found</h2>
        <Button onClick={() => router.push("/products")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Edit Product</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <ProductForm
          initialData={product}
          onSubmit={(data) => updateProduct({ id, data })}
          isLoading={isUpdating}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
