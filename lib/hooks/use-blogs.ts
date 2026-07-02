import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/lib/api/blog-service";
import { queryKeys } from "@/lib/query-keys";

interface UseBlogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export function useBlogs({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  status = "",
}: UseBlogsOptions = {}) {
  const queryResult = useQuery({
    queryKey: queryKeys.blogs.list({
      page,
      limit,
      search,
      category,
      status,
    }),
    queryFn: () => blogService.list(page, limit, search, category, status),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Handle potentially different response structures
  const blogs = queryResult.data?.items || [];

  return {
    blogs,
    pagination: {
      page: queryResult.data?.page || 1,
      limit: queryResult.data?.limit || 10,
      total: queryResult.data?.total || blogs.length,
      totalPages: queryResult.data?.totalPages || 1,
    },
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
