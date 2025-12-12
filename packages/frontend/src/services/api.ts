import { UsersResponse, UserMetricsResponse, UserMetricsExplanation } from 'shared';

export const fetchUsers = async (): Promise<UsersResponse> => {
  const response = await fetch('/api/users');

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch users');
  }

  return response.json();
};

export const fetchUserMetrics = async (userId: string): Promise<UserMetricsResponse> => {
  const response = await fetch(`/api/users/${userId}/metrics`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user metrics');
  }

  return response.json();
};

export const explainUserMetrics = async (userId: string): Promise<UserMetricsExplanation> => {
  const response = await fetch(`/api/users/${userId}/explain`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to explain user metrics');
  }

  return response.json();
};
