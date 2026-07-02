/**
 * Centralized query key factory for TanStack Query
 * This ensures consistent cache management and invalidation
 */

export const queryKeys = {
  // QR Code queries
  qrCodes: {
    all: ["qr-codes"] as const,
    lists: () => [...queryKeys.qrCodes.all, "list"] as const,
    list: (filters: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => [...queryKeys.qrCodes.lists(), filters] as const,
    details: () => [...queryKeys.qrCodes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.qrCodes.details(), id] as const,
  },

  // Auth queries
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "current-user"] as const,
    users: () => [...queryKeys.auth.all, "users"] as const,
  },

  // Blog queries
  blogs: {
    all: ["blogs"] as const,
    lists: () => [...queryKeys.blogs.all, "list"] as const,
    list: (filters: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      status?: string;
    }) => [...queryKeys.blogs.lists(), filters] as const,
    details: () => [...queryKeys.blogs.all, "detail"] as const,
    detail: (idOrSlug: string) =>
      [...queryKeys.blogs.details(), idOrSlug] as const,
  },

  // Product queries
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: () => [...queryKeys.products.lists()] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
} as const;
