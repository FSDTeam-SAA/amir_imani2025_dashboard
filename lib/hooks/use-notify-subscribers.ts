import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriberService } from "../api/subscriber-service";
import { queryKeys } from "../query-keys";

export const useNotifySubscribers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriberService.notify,
    onSuccess: (result) => {
      toast.success(result.message || "Subscriber notification published successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscribers.all });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string; details?: string } } })
          ?.response?.data?.details ||
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to notify subscribers.";

      toast.error(message);
    },
  });
};
