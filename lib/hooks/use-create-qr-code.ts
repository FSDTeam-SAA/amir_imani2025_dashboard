import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qrCodeService } from "@/lib/api/qr-code-service";
import { queryKeys } from "@/lib/query-keys";
import type { CreateQRCodeInput, QRCode } from "@/lib/types/qr-code";
import { toast } from "sonner";

export function useCreateQRCode() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateQRCodeInput) => qrCodeService.create(input),
    onMutate: async () => {
      // Show loading toast
      toast.loading("Creating QR code...", { id: "create-qr" });
    },
    onSuccess: (response) => {
      // Invalidate and refetch all QR code list queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.qrCodes.lists(),
      });

      // Optionally add the new QR code to the cache
      queryClient.setQueryData(
        queryKeys.qrCodes.detail(response.data._id),
        response
      );

      // Dismiss loading toast and show success
      toast.success("QR code created successfully!", { id: "create-qr" });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || "Failed to create QR code";
      toast.error(errorMessage, { id: "create-qr" });
    },
  });

  return {
    create: mutation.mutateAsync,
    createSync: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
