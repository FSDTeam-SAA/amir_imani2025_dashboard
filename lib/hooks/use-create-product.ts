import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api/product-service";
import { queryKeys } from "../query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CreateProductInput, Product } from "../types/product";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: productService.create,
    // Optimistic update: add placeholder to cache immediately
    onMutate: async (newProductData: CreateProductInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Snapshot the previous value for rollback
      const previousProducts = queryClient.getQueryData<Product[]>(
        queryKeys.products.list()
      );

      // Create an optimistic product entry with a temporary ID
      const optimisticProduct: Product = {
        _id: `temp-${Date.now()}`,
        productName: newProductData.productName,
        price: newProductData.price,
        productType: newProductData.productType,
        feature: newProductData.feature,
        description: newProductData.description,
        videoLink: newProductData.videoLink,
        quantity: newProductData.quantity,
        color: newProductData.color,
        size: newProductData.size,
        imgs: newProductData.existingImgs, // Use existing images as placeholder
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add to the list
      queryClient.setQueryData<Product[]>(queryKeys.products.list(), (old) => [
        optimisticProduct,
        ...(old ?? []),
      ]);

      return { previousProducts, optimisticProduct };
    },
    onSuccess: (data, _variables, context) => {
      toast.success("Product created successfully");

      // Replace the optimistic entry with the real data from server
      if (context?.optimisticProduct) {
        queryClient.setQueryData<Product[]>(
          queryKeys.products.list(),
          (old) =>
            old?.map((product) =>
              product._id === context.optimisticProduct._id ? data : product
            ) ?? []
        );
      }

      router.push("/products");
    },
    onError: (error, _variables, context) => {
      console.error("Create product error:", error);
      toast.error("Failed to create product");

      // Rollback to previous values on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.products.list(),
          context.previousProducts
        );
      }
    },
    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};
