import { Blog } from "@/lib/types/blog";
import { BlogCard } from "./blog-card";
import { BlogGridSkeleton } from "@/components/skeletons";

interface BlogGridProps {
  blogs: Blog[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function BlogGrid({
  blogs,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: BlogGridProps) {
  if (isLoading) {
    return <BlogGridSkeleton count={6} />;
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center p-20 border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground">No blogs found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {blogs.map((blog) => (
        <BlogCard
          key={blog._id}
          blog={blog}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
