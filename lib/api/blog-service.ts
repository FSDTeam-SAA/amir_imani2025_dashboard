import axiosInstance from "./axios-instance";
import type {
  Blog,
  CreateBlogInput,
  UpdateBlogInput,
  BlogResponse,
} from "../types/blog";

export const blogService = {
  // Fetch all blogs
  list: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string
  ): Promise<BlogResponse> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: Blog[] | BlogResponse;
    }>("/blogs", {
      params: {
        page,
        limit,
        search,
        category,
        status,
      },
    });

    const responseData = response.data.data;

    if (Array.isArray(responseData)) {
      return {
        items: responseData,
        total: responseData.length,
        page: page,
        limit: limit,
        totalPages: 1,
      };
    }

    return responseData as BlogResponse;
  },

  getByIdOrSlug: async (idOrSlug: string): Promise<Blog> => {
    const response = await axiosInstance.get<{ success: boolean; data: Blog }>(
      `/blogs/${idOrSlug}`
    );
    return response.data.data;
  },

  // Create new blog with FormData
  create: async (input: CreateBlogInput): Promise<Blog> => {
    const formData = new FormData();
    formData.append("title", input.title);
    formData.append("description", input.description);
    if (input.img) {
      formData.append("img", input.img);
    }

    const response = await axiosInstance.post<{ success: boolean; data: Blog }>(
      "/blogs",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Update existing blog with FormData
  update: async (id: string, input: UpdateBlogInput): Promise<Blog> => {
    const formData = new FormData();
    if (input.title) formData.append("title", input.title);
    if (input.description) formData.append("description", input.description);
    // Only append img if it's a File (new upload). If it's a string (existing URL), backend likely ignores it or we shouldn't send it if we want to keep existing.
    if (input.img && input.img instanceof File) {
      formData.append("img", input.img);
    }

    const response = await axiosInstance.patch<{
      success: boolean;
      data: Blog;
    }>(`/blogs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await axiosInstance.delete<{ success: boolean }>(
      `/blogs/${id}`
    );
    return response.data.success;
  },

  toggleStatus: async (
    id: string,
    status: "published" | "draft"
  ): Promise<Blog> => {
    // Checking if this endpoint also needs FormData or supports JSON.
    // Usually specific status endpoints support JSON. Assumed JSON for now.
    const response = await axiosInstance.patch<{
      success: boolean;
      data: Blog;
    }>(`/blogs/${id}/status`, { status });
    return response.data.data;
  },
};
