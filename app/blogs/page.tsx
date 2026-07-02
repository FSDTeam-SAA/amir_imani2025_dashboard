"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { SearchBar } from "@/components/qr-code/search-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LayoutGrid, List } from "lucide-react";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogTable } from "@/components/blog/blog-table";
import { DeleteConfirmModal } from "@/components/qr-code/delete-confirm-modal";
import { useBlogs } from "@/lib/hooks/use-blogs";
import { useBlogState } from "@/lib/hooks/use-blog-state";
import { useDeleteBlog } from "@/lib/hooks/use-delete-blog";
import { signOut } from "next-auth/react";

export default function BlogsPage() {
  const router = useRouter();
  const state = useBlogState();

  const { blogs, pagination, isLoading, refetch } = useBlogs({
    page: state.page,
    limit: state.limit,
    search: state.debouncedSearch,
    category: state.category,
    status: state.status,
  });

  const { delete: deleteBlog, isLoading: isDeleting } = useDeleteBlog();

  const handleEdit = (id: string) => {
    router.push(`/blogs/${id}`);
  };

  const handleCreate = () => {
    router.push("/blogs/new");
  };

  const handleDeleteTrigger = (id: string) => {
    state.setSelectedBlogId(id);
    state.setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (state.selectedBlogId) {
      await deleteBlog(state.selectedBlogId);
      state.setIsDeleteModalOpen(false);
      state.setSelectedBlogId(null);
      refetch();
    }
  };

  return (
    <>
      <header className="bg-[#eeeeee] p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <MobileSidebar
              onLogout={() => {
                localStorage.removeItem("authToken");
                signOut({ callbackUrl: "/login" });
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold bg-[#F04D2A] bg-clip-text text-transparent font-heading truncate">
                Blog Management
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
                Manage your blog posts and articles
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="bg-foreground text-[#eeeeee] hover:bg-foreground/80 hover:text-white border-none cursor-pointer duration-300 font-heading whitespace-nowrap text-sm md:text-base px-3 md:px-4"
          >
            Add New Blog
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto md:p-6 pt-2">
        <BlogGrid
          blogs={blogs}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteTrigger}
          onView={handleEdit}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      state.setPage(Math.max(1, pagination.page - 1))
                    }
                    className={
                      pagination.page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => state.setPage(pageNum)}
                      isActive={pagination.page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      state.setPage(
                        Math.min(pagination.totalPages, pagination.page + 1)
                      )
                    }
                    className={
                      pagination.page === pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={state.isDeleteModalOpen}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        title="Delete Blog"
        description="Are you sure you want to delete this blog? This action cannot be undone."
        onCancel={() => {
          state.setIsDeleteModalOpen(false);
          state.setSelectedBlogId(null);
        }}
      />
    </>
  );
}
