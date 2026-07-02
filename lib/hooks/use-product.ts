import { useQuery } from "@tanstack/react-query";
import { productService } from "../api/product-service";
import { queryKeys } from "../query-keys";

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
};
