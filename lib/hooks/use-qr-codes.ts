import { useQuery } from "@tanstack/react-query";
import { qrCodeService } from "@/lib/api/qr-code-service";
import { queryKeys } from "@/lib/query-keys";
import type { PaginatedQRCodeResponse } from "@/lib/types/qr-code";

interface UseQRCodesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useQRCodes({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: UseQRCodesOptions = {}) {
  const queryResult = useQuery({
    queryKey: queryKeys.qrCodes.list({
      page,
      pageSize,
      search,
      status,
      sortBy,
      sortOrder,
    }),
    queryFn: () =>
      qrCodeService.list(page, pageSize, search, status, sortBy, sortOrder),
    // Keep previous data while fetching new data for better UX
    placeholderData: (previousData) => previousData,
    // Refetch when filters change
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    qrCodes: queryResult.data?.data || [],
    pagination: queryResult.data?.pagination,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
