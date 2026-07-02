import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api/product-service";
import { queryKeys } from "../query-keys";
import { toast } from "sonner";
import type { Product } from "../types/product";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.delete,
    // Optimistic update: remove from cache immediately
    onMutate: async (deletedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Snapshot the previous value for rollback
      const previousProducts = queryClient.getQueryData<Product[]>(
        queryKeys.products.list()
      );

      // Optimistically remove the product from the list
      queryClient.setQueryData<Product[]>(
        queryKeys.products.list(),
        (old) => old?.filter((product) => product._id !== deletedId) ?? []
      );

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
    },
    onError: (error, _variables, context) => {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");

      // Rollback to previous value on error
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
