import { useQuery } from "@tanstack/react-query";
import { subscriberService } from "../api/subscriber-service";
import { queryKeys } from "../query-keys";

export const useSubscribers = () => {
  return useQuery({
    queryKey: queryKeys.subscribers.list(),
    queryFn: subscriberService.getAll,
  });
};
