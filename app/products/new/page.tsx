"use client";

import { ProductForm } from "@/components/product/product-form";
import { useCreateProduct } from "@/lib/hooks/use-create-product";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  const { mutate: createProduct, isPending } = useCreateProduct();
  const router = useRouter();

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Add New Product</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <ProductForm
          onSubmit={createProduct}
          isLoading={isPending}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
