import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/lib/api/blog-service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { UpdateBlogInput, Blog, BlogResponse } from "@/lib/types/blog";

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { id: string; data: UpdateBlogInput }) =>
      blogService.update(vars.id, vars.data),
    // Optimistic update: update cache immediately
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.blogs.detail(id),
      });

      // Snapshot the previous values for rollback
      const previousBlogsQueries = queryClient.getQueriesData<BlogResponse>({
        queryKey: queryKeys.blogs.lists(),
      });
      const previousBlog = queryClient.getQueryData<Blog>(
        queryKeys.blogs.detail(id)
      );

      // Optimistically update list queries
      queryClient.setQueriesData<BlogResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((blog) =>
              blog._id === id
                ? {
                    ...blog,
                    title:
                      typeof data.title === "string" ? data.title : blog.title,
                    description:
                      typeof data.description === "string"
                        ? data.description
                        : blog.description,
                    // Note: img is handled server-side for File uploads
                  }
                : blog
            ),
          };
        }
      );

      // Optimistically update detail query
      if (previousBlog) {
        queryClient.setQueryData<Blog>(queryKeys.blogs.detail(id), {
          ...previousBlog,
          title:
            typeof data.title === "string" ? data.title : previousBlog.title,
          description:
            typeof data.description === "string"
              ? data.description
              : previousBlog.description,
        });
      }

      return { previousBlogsQueries, previousBlog, id };
    },
    onSuccess: (data) => {
      toast.success("Blog updated successfully!");
      // Update detail cache with the actual server response
      queryClient.setQueryData(queryKeys.blogs.detail(data._id), data);
    },
    onError: (error: any, _variables, context) => {
      console.error("Failed to update blog:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update blog. Please try again."
      );

      // Rollback to previous values on error
      if (context?.previousBlogsQueries) {
        context.previousBlogsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousBlog && context?.id) {
        queryClient.setQueryData(
          queryKeys.blogs.detail(context.id),
          context.previousBlog
        );
      }
    },
    // Always refetch to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogs.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogs.detail(variables.id),
      });
    },
  });

  return {
    update: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
