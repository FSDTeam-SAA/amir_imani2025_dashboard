export interface Blog {
  _id: string;
  title: string;
  description: string;
  img?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  author?: {
    name: string;
    email: string;
  };
  // Optional/Legacy fields might still exist on older objects if schema changed recently
  status?: "draft" | "published";
}

export interface CreateBlogInput {
  title: string;
  description: string;
  img?: File | null; // Changed to File for FormData
}

export interface UpdateBlogInput {
  title?: string;
  description?: string;
  img?: File | null | string; // Can be a new file or keep existing URL (though API usually sends file or nothing)
}

export interface BlogResponse {
  items: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
