import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api/product-service";
import { queryKeys } from "../query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateProductInput, Product } from "../types/product";

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductInput>;
    }) => productService.update(id, data),
    // Optimistic update: update cache immediately
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
      await queryClient.cancelQueries({
        queryKey: queryKeys.products.detail(id),
      });

      // Snapshot the previous values for rollback
      const previousProducts = queryClient.getQueryData<Product[]>(
        queryKeys.products.list()
      );
      const previousProduct = queryClient.getQueryData<Product>(
        queryKeys.products.detail(id)
      );

      // Optimistically update the product in the list
      queryClient.setQueryData<Product[]>(
        queryKeys.products.list(),
        (old) =>
          old?.map((product) =>
            product._id === id
              ? {
                  ...product,
                  productName: data.productName ?? product.productName,
                  price: data.price ?? product.price,
                  productType: data.productType ?? product.productType,
                  description: data.description ?? product.description,
                  feature: data.feature ?? product.feature,
                  quantity: data.quantity ?? product.quantity,
                  color: data.color ?? product.color,
                  size: data.size ?? product.size,
                }
              : product
          ) ?? []
      );

      // Optimistically update detail query
      if (previousProduct) {
        queryClient.setQueryData<Product>(queryKeys.products.detail(id), {
          ...previousProduct,
          productName: data.productName ?? previousProduct.productName,
          price: data.price ?? previousProduct.price,
          productType: data.productType ?? previousProduct.productType,
          description: data.description ?? previousProduct.description,
          feature: data.feature ?? previousProduct.feature,
          quantity: data.quantity ?? previousProduct.quantity,
          color: data.color ?? previousProduct.color,
          size: data.size ?? previousProduct.size,
        });
      }

      return { previousProducts, previousProduct, id };
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      router.push("/products");
    },
    onError: (error, _variables, context) => {
      console.error("Update product error:", error);
      toast.error("Failed to update product");

      // Rollback to previous values on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.products.list(),
          context.previousProducts
        );
      }
      if (context?.previousProduct && context?.id) {
        queryClient.setQueryData(
          queryKeys.products.detail(context.id),
          context.previousProduct
        );
      }
    },
    // Always refetch to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
    },
  });
};
