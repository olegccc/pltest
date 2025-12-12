import { UserMetricsResponse } from 'shared';
import { DbService } from './db.js';

interface EventRow {
  event_type: string;
  value: number | null;
  date: string;
}

export const createUserMetricsService = (dbService: DbService) => {
  const getUserMetrics = async (userId: string): Promise<UserMetricsResponse | null> => {
    const events = dbService.query<EventRow>(
      `SELECT
        event_type,
        value,
        DATE(timestamp) as date
      FROM events
      WHERE user_id = ?`,
      [userId]
    );

    if (events.length === 0) {
      return null;
    }

    const total_events = events.length;

    const events_per_type: Record<string, number> = {};
    events.forEach(event => {
      events_per_type[event.event_type] = (events_per_type[event.event_type] || 0) + 1;
    });

    const eventsWithValue = events.filter(e => e.value !== null);
    const total_value = eventsWithValue.reduce((sum, e) => sum + (e.value || 0), 0);
    const avg_value = eventsWithValue.length > 0 ? total_value / eventsWithValue.length : 0;

    const events_per_day: Record<string, number> = {};
    events.forEach(event => {
      events_per_day[event.date] = (events_per_day[event.date] || 0) + 1;
    });

    return {
      user_id: userId,
      total_events,
      events_per_type,
      total_value: Math.round(total_value * 100) / 100, // Round to 2 decimal places
      avg_value: Math.round(avg_value * 100) / 100, // Round to 2 decimal places
      events_per_day,
    };
  };

  return {
    getUserMetrics,
  };
};

export type UserMetricsService = ReturnType<typeof createUserMetricsService>;
