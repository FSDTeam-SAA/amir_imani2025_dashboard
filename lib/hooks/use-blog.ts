import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/lib/api/blog-service";
import { queryKeys } from "@/lib/query-keys";

export function useBlog(idOrSlug: string) {
  const queryResult = useQuery({
    queryKey: queryKeys.blogs.detail(idOrSlug),
    queryFn: () => blogService.getByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    blog: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}
