"use client";

import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/blog/blog-form";
import { useCreateBlog } from "@/lib/hooks/use-create-blog";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { signOut } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateBlogPage() {
  const router = useRouter();
  const { create, isLoading } = useCreateBlog();

  const handleCreate = async (data: any) => {
    try {
      await create(data);
      router.push("/blogs");
    } catch (error) {
      // Error handled in hook
    }
  };

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
            Create New Blog
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
        <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-sm border">
          <BlogForm
            onSubmit={handleCreate}
            isLoading={isLoading}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </>
  );
}
