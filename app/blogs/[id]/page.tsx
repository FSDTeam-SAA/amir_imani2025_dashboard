"use client";

import { useRouter, useParams } from "next/navigation";
import { BlogForm } from "@/components/blog/blog-form";
import { useBlog } from "@/lib/hooks/use-blog";
import { useUpdateBlog } from "@/lib/hooks/use-update-blog";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { signOut } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { blog, isLoading: isFetching } = useBlog(id);
  const { update, isLoading: isUpdating } = useUpdateBlog();

  const handleUpdate = async (data: any) => {
    try {
      await update({ id, data });
      router.push("/blogs");
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground mb-4">Blog not found</p>
        <Button onClick={() => router.push("/blogs")}>Go Back</Button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-[#eeeeee] p-4 md:p-6 border-b">
        <div className="flex items-center gap-3">
          <MobileSidebar
            onLogout={() => {
              localStorage.removeItem("authToken");
              signOut({ callbackUrl: "/login" });
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold font-heading">
            Edit Blog: {blog.title}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
        <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-sm border">
          <BlogForm
            blog={blog}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </>
  );
}
