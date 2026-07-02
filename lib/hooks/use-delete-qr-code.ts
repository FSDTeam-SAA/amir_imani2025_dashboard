import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qrCodeService } from "@/lib/api/qr-code-service";
import { queryKeys } from "@/lib/query-keys";
import type { PaginatedQRCodeResponse } from "@/lib/types/qr-code";
import { toast } from "sonner";

export function useDeleteQRCode() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => {
      // console.log("🔧 Delete mutation function called with ID:", id);
      // console.log("🌐 Making DELETE request to:", `/qrcodes/${id}`);
      return qrCodeService.delete(id);
    },
    onMutate: async (id) => {
      // console.log("⏳ onMutate: Starting delete for ID:", id);

      // Show loading toast
      toast.loading("Deleting QR code...", { id: "delete-qr" });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.qrCodes.lists() });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.qrCodes.lists(),
      });

      // Optimistically remove from all list caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.qrCodes.lists() },
        (old: any) => {
          if (!old) return [];
          // If it's an array (which it seems to be based on the error and logs)
          if (Array.isArray(old)) {
            return old.filter((qr: any) => qr._id !== id);
          }
          // Fallback for paginated structure if it ever exists
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.filter((qr: any) => qr._id !== id),
              pagination: old.pagination
                ? {
                    ...old.pagination,
                    totalItems: old.pagination.totalItems - 1,
                  }
                : old.pagination,
            };
          }
          return old;
        }
      );

      // console.log("✨ Optimistic update applied");

      // Return context for rollback
      return { previousLists };
    },
    onSuccess: (data, id) => {
      toast.success(
        `✅ onSuccess: Delete successful for ID: ${id}, Response: ${data}`
      );

      // Remove the detail cache
      queryClient.removeQueries({ queryKey: queryKeys.qrCodes.detail(id) });

      // Invalidate lists to ensure pagination is correct
      queryClient.invalidateQueries({
        queryKey: queryKeys.qrCodes.lists(),
      });

      toast.success("QR code deleted successfully!", { id: "delete-qr" });
    },
    onError: (error: any, _id, context) => {
      console.error("❌ onError: Delete failed for ID:", _id, "Error:", error);

      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        // console.log("🔄 Rollback completed");
      }

      const errorMessage =
        error.response?.data?.error || "Failed to delete QR code";
      toast.error(errorMessage, { id: "delete-qr" });
    },
  });

  return {
    delete: mutation.mutateAsync,
    deleteSync: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
