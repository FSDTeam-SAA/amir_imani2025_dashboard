import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qrCodeService } from "@/lib/api/qr-code-service";
import { queryKeys } from "@/lib/query-keys";
import type {
  UpdateQRCodeInput,
  QRCode,
  PaginatedQRCodeResponse,
} from "@/lib/types/qr-code";
import { toast } from "sonner";

export function useUpdateQRCode() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQRCodeInput }) =>
      qrCodeService.update(id, input),
    onMutate: async ({ id, input }) => {
      // Show loading toast
      toast.loading("Updating QR code...", { id: "update-qr" });

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.qrCodes.lists() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.qrCodes.detail(id),
      });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.qrCodes.lists(),
      });
      const previousDetail = queryClient.getQueryData(
        queryKeys.qrCodes.detail(id)
      );

      // Optimistically update the detail cache
      queryClient.setQueryData(queryKeys.qrCodes.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...input },
        };
      });

      // Optimistically update all list caches
      queryClient.setQueriesData(
        { queryKey: queryKeys.qrCodes.lists() },
        (old: any) => {
          if (!old) return [];
          // If it's an array
          if (Array.isArray(old)) {
            return old.map((qr: any) =>
              qr._id === id ? { ...qr, ...input } : qr
            );
          }
          // Fallback for paginated structure
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map((qr: any) =>
                qr._id === id ? { ...qr, ...input } : qr
              ),
            };
          }
          return old;
        }
      );

      // Return context with previous values for rollback
      return { previousLists, previousDetail };
    },
    onSuccess: (response, { id }) => {
      // Update the cache with the actual server response
      queryClient.setQueryData(queryKeys.qrCodes.detail(id), response);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.qrCodes.lists(),
      });

      toast.success("QR code updated successfully!", { id: "update-qr" });
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.qrCodes.detail(_variables.id),
          context.previousDetail
        );
      }

      const errorMessage =
        error.response?.data?.error || "Failed to update QR code";
      toast.error(errorMessage, { id: "update-qr" });
    },
  });

  return {
    update: (id: string, input: UpdateQRCodeInput) =>
      mutation.mutateAsync({ id, input }),
    updateSync: (id: string, input: UpdateQRCodeInput) =>
      mutation.mutate({ id, input }),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
