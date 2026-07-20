export type SubscriberStatus = "Subscribed" | "Unsubscribed";

export interface Subscriber {
  _id: string;
  subscriberName?: string;
  email: string;
  game?: string;
  gameCategory?: string;
  subscriptionDate: string;
  releaseDate?: string;
  status: SubscriberStatus;
  createdAt?: string;
}

export interface SubscribersResponse {
  success: boolean;
  message: string;
  data: Subscriber[];
}

export interface NotifySubscribersPayload {
  messageSubject: string;
  messageDescription: string;
}

export interface NotifySubscribersResult {
  totalSubscribers: number;
  sent: number;
  failed: number;
  message: string;
}
