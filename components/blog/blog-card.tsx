import { Blog } from "@/lib/types/blog";
import Image from "next/image";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HtmlContent } from "@/components/ui/html-content";

interface BlogCardProps {
  blog: Blog;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function BlogCard({ blog, onEdit, onDelete, onView }: BlogCardProps) {
  // Use img field directly as per new type definition
  const thumbnail = blog.img;

  return (
    <div
      className="group relative bg-background rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={() => onView(blog._id)}
    >
      {/* Full Width Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-purple-100 to-indigo-100">
            <div className="opacity-50 text-indigo-300 font-bold text-4xl select-none">
              Aa
            </div>
          </div>
        )}

        {/* Floating Action Menu */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(blog._id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDelete(blog._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            {/* Static category for now since it was removed from type, or default to Blog */}
            Blog
          </span>
          <span className="text-muted-foreground text-[10px]">•</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(blog.createdAt), "MMMM d, yyyy")}
          </span>
        </div>

        <h3 className="font-heading text-lg font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
          {blog.title}
        </h3>

        <HtmlContent
          html={blog.description || "No description available"}
          asPlainText
          className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed"
        />
      </div>
    </div>
  );
}
