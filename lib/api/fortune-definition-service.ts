import axiosInstance from "./axios-instance";
import type {
  FortuneDefinition,
  FortuneDefinitionsResponse,
  UpdateFortuneDefinitionPayload,
} from "../types/fortune";

export const fortuneDefinitionService = {
  getAll: async (): Promise<FortuneDefinition[]> => {
    const response = await axiosInstance.get<FortuneDefinitionsResponse>(
      "/fortune-telling/admin/definitions",
    );

    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateFortuneDefinitionPayload,
  ): Promise<FortuneDefinition> => {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
      data: FortuneDefinition;
    }>(`/fortune-telling/admin/definitions/${id}`, payload);

    return response.data.data;
  },
};

