import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/lib/api/blog-service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { Blog, BlogResponse } from "@/lib/types/blog";

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    // Optimistic update: remove from cache immediately
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });

      // Snapshot the previous value for rollback
      const previousBlogsQueries = queryClient.getQueriesData<BlogResponse>({
        queryKey: queryKeys.blogs.lists(),
      });

      // Optimistically update all blog list queries
      queryClient.setQueriesData<BlogResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((blog) => blog._id !== deletedId),
            total: old.total - 1,
          };
        }
      );

      // Return context with the previous blogs for rollback
      return { previousBlogsQueries };
    },
    onSuccess: () => {
      toast.success("Blog deleted successfully!");
    },
    onError: (error: any, _variables, context) => {
      console.error("Failed to delete blog:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete blog. Please try again."
      );

      // Rollback to the previous value on error
      if (context?.previousBlogsQueries) {
        context.previousBlogsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Always refetch after error or success to ensure cache consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogs.lists(),
      });
    },
  });

  return {
    delete: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
