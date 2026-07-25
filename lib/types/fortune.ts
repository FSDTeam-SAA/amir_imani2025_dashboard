export interface FortuneDefinition {
  _id: string;
  combinationKey: string;
  symbols: string[];
  fortune: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface UpdateFortuneDefinitionPayload {
  symbols?: string[];
  fortune?: string;
}

export interface FortuneDefinitionsResponse {
  success: boolean;
  message: string;
  data: FortuneDefinition[];
}

