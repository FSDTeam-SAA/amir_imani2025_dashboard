import { useIsMutating, useIsFetching } from "@tanstack/react-query";

/**
 * Hook to check if any queries or mutations are currently loading
 * Useful for showing global loading indicators
 */
export function useGlobalLoading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  return {
    isLoading: isFetching > 0 || isMutating > 0,
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
    fetchingCount: isFetching,
    mutatingCount: isMutating,
  };
}

/**
 * Hook to check if specific queries are loading
 * @param queryKey - The query key to check
 */
export function useQueryLoading(queryKey: unknown[]) {
  const isFetching = useIsFetching({ queryKey });

  return {
    isLoading: isFetching > 0,
    count: isFetching,
  };
}

/**
 * Hook to check if specific mutations are loading
 * @param mutationKey - The mutation key to check
 */
export function useMutationLoading(mutationKey?: unknown[]) {
  const isMutating = useIsMutating({ mutationKey });

  return {
    isLoading: isMutating > 0,
    count: isMutating,
  };
}
