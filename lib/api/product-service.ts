import axiosInstance from "./axios-instance";
import type {
  Product,
  ProductResponse,
  CreateProductInput,
} from "../types/product";

export const productService = {
  // Fetch all products
  getAll: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<ProductResponse>("/products");

    // Based on the example, response.data has { success: true, data: [...] }
    // But sometimes axios wraps it.
    // If axiosInstance returns generic T, then response.data is ProductResponse.
    return response.data.data;
  },

  // Get single product
  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: Product;
    }>(`/products/${id}`);
    return response.data.data;
  },

  // Create product
  create: async (input: CreateProductInput): Promise<Product> => {
    const formData = new FormData();
    formData.append("productName", input.productName);
    formData.append("price", input.price.toString());
    formData.append("productType", input.productType);
    if (input.feature) formData.append("feature", input.feature);
    if (input.description) formData.append("description", input.description);
    if (input.videoLink) formData.append("videoLink", input.videoLink);
    if (input.color && input.color.length > 0) {
      input.color.forEach((c) => formData.append("color", c));
    }
    if (input.size && input.size.length > 0) {
      input.size.forEach((s) => formData.append("size", s));
    }
    if (input.quantity !== undefined)
      formData.append("quantity", input.quantity.toString());

    // Only append imgs if array has items
    if (input.imgs && Array.isArray(input.imgs) && input.imgs.length > 0) {
      input.imgs.forEach((file) => {
        formData.append("imgs", file);
      });
    }

    const response = await axiosInstance.post<{
      success: boolean;
      data: Product;
    }>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Update product
  update: async (
    id: string,
    input: Partial<CreateProductInput>
  ): Promise<Product> => {
    // If there are no new images to upload, send as JSON to avoid FormData string conversion issues
    if (!input.imgs || input.imgs.length === 0) {
      const payload = {
        productName: input.productName,
        price: input.price !== undefined ? Number(input.price) : undefined,
        productType: input.productType,
        feature: input.feature,
        description: input.description,
        videoLink: input.videoLink,
        color: input.color,
        size: input.size,
        quantity:
          input.quantity !== undefined ? Number(input.quantity) : undefined,
        imgs:
          Array.isArray(input.existingImgs) && input.existingImgs.length > 0
            ? input.existingImgs
            : [], // Ensure imgs is always an array
      };

      const response = await axiosInstance.put<{
        success: boolean;
        data: Product;
      }>(`/products/${id}`, payload);
      return response.data.data;
    }

    // Otherwise use FormData for file uploads
    const formData = new FormData();
    if (input.productName) formData.append("productName", input.productName);
    if (input.price !== undefined) {
      const val = Number(input.price);
      if (!isNaN(val)) {
        formData.append("price", val.toString());
      }
    }
    if (input.productType) formData.append("productType", input.productType);
    if (input.feature) formData.append("feature", input.feature);
    if (input.description) formData.append("description", input.description);
    if (input.videoLink) formData.append("videoLink", input.videoLink);

    // Color and size as arrays
    if (input.color && input.color.length > 0) {
      input.color.forEach((c) => formData.append("color", c));
    }
    if (input.size && input.size.length > 0) {
      input.size.forEach((s) => formData.append("size", s));
    }

    if (input.quantity !== undefined) {
      const val = Number(input.quantity);
      if (!isNaN(val)) {
        formData.append("quantity", val.toString());
      }
    }

    // CONSISTENCY: Send both existing URLs and new files under the 'imgs' field.
    // The backend FilesInterceptor will pull the files, and the body will contain the strings.
    if (input.existingImgs && input.existingImgs.length > 0) {
      input.existingImgs.forEach((url) => formData.append("imgs[]", url));
    }

    if (input.imgs && input.imgs.length > 0) {
      input.imgs.forEach((file) => {
        formData.append("imgs", file); // Multer looks for 'imgs' for files
      });
    }

    const response = await axiosInstance.put<{
      success: boolean;
      data: Product;
    }>(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Delete product
  delete: async (id: string): Promise<boolean> => {
    const response = await axiosInstance.delete<{ success: boolean }>(
      `/products/${id}`
    );
    return response.data.success;
  },
};
