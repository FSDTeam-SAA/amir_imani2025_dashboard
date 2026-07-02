import { useQuery } from "@tanstack/react-query";
import { productService } from "../api/product-service";
import { queryKeys } from "../query-keys";

export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: productService.getAll,
  });
};
