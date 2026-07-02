import { useState } from "react";
import { useDebounce } from "./use-debounce";

export function useBlogState() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // Selected blog for edit/delete operations
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
    category,
    setCategory,
    status,
    setStatus,
    selectedBlogId,
    setSelectedBlogId,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  };
}
