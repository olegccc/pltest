import { UserMetricsResponse } from 'shared';

export const createPromptService = () => {
  const generateUserMetricsExplanationPrompt = (metrics: UserMetricsResponse): string => {
    const eventDates = Object.keys(metrics.events_per_day).sort();
    const dateRange =
      eventDates.length > 0 ? `${eventDates[0]} to ${eventDates[eventDates.length - 1]}` : 'N/A';

    const dailyCounts = Object.values(metrics.events_per_day);
    const avgEventsPerDay =
      dailyCounts.length > 0
        ? (dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length).toFixed(1)
        : '0';

    return `Write a 2-3 sentence analysis of this user's activity. You must mention: total events, event type breakdown, total value, average value, and activity pattern.

User ${metrics.user_id}: ${metrics.total_events} events consisting of ${Object.entries(
      metrics.events_per_type
    )
      .map(([type, count]) => `${count} ${type}`)
      .join(
        ', '
      )}. Total value: $${metrics.total_value}, average value: $${metrics.avg_value} per event. Active from ${dateRange} (${avgEventsPerDay} events/day average).

Describe activity level (high/moderate/low based on event count), which event types dominate, what the total and average values indicate, and the activity pattern. Only use the data provided, no assumptions.`;
  };

  return {
    generateUserMetricsExplanationPrompt,
  };
};

export type PromptService = ReturnType<typeof createPromptService>;
