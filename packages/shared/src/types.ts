export interface UsersResponse {
  userIds: string[];
}

export interface UserMetricsResponse {
  user_id: string;
  total_events: number;
  events_per_type: Record<string, number>;
  total_value: number;
  avg_value: number;
  events_per_day: Record<string, number>;
}

export interface UserMetricsExplanation {
  explanation: string;
}
