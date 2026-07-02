import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/lib/api/blog-service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { CreateBlogInput, Blog, BlogResponse } from "@/lib/types/blog";

export function useCreateBlog() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateBlogInput) => blogService.create(data),
    // Optimistic update: add placeholder to cache immediately
    onMutate: async (newBlogData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });

      // Snapshot the previous value for rollback
      const previousBlogsQueries = queryClient.getQueriesData<BlogResponse>({
        queryKey: queryKeys.blogs.lists(),
      });

      // Create an optimistic blog entry with a temporary ID
      const optimisticBlog: Blog = {
        _id: `temp-${Date.now()}`,
        title: newBlogData.title,
        description: newBlogData.description,
        img: undefined, // Will be set by server after file upload
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update list queries - add to beginning
      queryClient.setQueriesData<BlogResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: [optimisticBlog, ...old.items],
            total: old.total + 1,
          };
        }
      );

      return { previousBlogsQueries, optimisticBlog };
    },
    onSuccess: (data, _variables, context) => {
      toast.success("Blog created successfully!");
      // Replace the optimistic entry with the real data from server
      queryClient.setQueriesData<BlogResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((blog) =>
              blog._id === context?.optimisticBlog._id ? data : blog
            ),
          };
        }
      );
    },
    onError: (error: any, _variables, context) => {
      console.error("Failed to create blog:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create blog. Please try again."
      );

      // Rollback to previous values on error
      if (context?.previousBlogsQueries) {
        context.previousBlogsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogs.lists(),
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
