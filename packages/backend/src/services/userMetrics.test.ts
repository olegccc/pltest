import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { createUserMetricsService } from './userMetrics.js';
import type { DbService } from './db.js';

const createTestDb = (
  events: Array<{
    event_id: string;
    user_id: string;
    event_type: string;
    timestamp: string;
    value: number | null;
  }>
): DbService => {
  const db = new Database(':memory:');

  db.exec(`
    CREATE TABLE events (
      event_id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT,
      timestamp TEXT,
      value REAL
    )
  `);

  const insert = db.prepare(`
    INSERT INTO events (event_id, user_id, event_type, timestamp, value)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const event of events) {
    insert.run(event.event_id, event.user_id, event.event_type, event.timestamp, event.value);
  }

  const query = <T = unknown>(sql: string, params?: unknown[]) => {
    const stmt = db.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
  };

  return { query };
};

describe('userMetrics service', () => {
  describe('getUserMetrics', () => {
    it('should correctly aggregate metrics for a user with multiple events', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.5,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 11:00:00',
          value: 20.3,
        },
        {
          event_id: '3',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-02 09:00:00',
          value: 15.0,
        },
        {
          event_id: '4',
          user_id: 'user1',
          event_type: 'purchase',
          timestamp: '2024-01-02 10:00:00',
          value: 100.0,
        },
        {
          event_id: '5',
          user_id: 'user2',
          event_type: 'click',
          timestamp: '2024-01-01 12:00:00',
          value: 5.0,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe('user1');
      expect(result?.total_events).toBe(4);
      expect(result?.events_per_type).toEqual({
        click: 2,
        view: 1,
        purchase: 1,
      });
      expect(result?.total_value).toBe(145.8);
      expect(result?.avg_value).toBe(36.45);
      expect(result?.events_per_day).toEqual({
        '2024-01-01': 2,
        '2024-01-02': 2,
      });
    });

    it('should handle a user with a single event', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 42.5,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe('user1');
      expect(result?.total_events).toBe(1);
      expect(result?.events_per_type).toEqual({ click: 1 });
      expect(result?.total_value).toBe(42.5);
      expect(result?.avg_value).toBe(42.5);
      expect(result?.events_per_day).toEqual({ '2024-01-01': 1 });
    });

    it('should handle a user with no value field (all values are null)', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: null,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-01 11:00:00',
          value: null,
        },
        {
          event_id: '3',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-02 09:00:00',
          value: null,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe('user1');
      expect(result?.total_events).toBe(3);
      expect(result?.events_per_type).toEqual({ click: 2, view: 1 });
      expect(result?.total_value).toBe(0);
      expect(result?.avg_value).toBe(0);
      expect(result?.events_per_day).toEqual({
        '2024-01-01': 2,
        '2024-01-02': 1,
      });
    });

    it('should handle a user with mixed null and non-null values', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.0,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-01 11:00:00',
          value: null,
        },
        {
          event_id: '3',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-02 09:00:00',
          value: 20.0,
        },
        {
          event_id: '4',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-02 10:00:00',
          value: null,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe('user1');
      expect(result?.total_events).toBe(4);
      expect(result?.total_value).toBe(30.0);
      expect(result?.avg_value).toBe(15.0);
    });

    it('should handle days with no events for a specific user', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.0,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-05 11:00:00',
          value: 20.0,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result).not.toBeNull();
      expect(result?.events_per_day).toEqual({
        '2024-01-01': 1,
        '2024-01-05': 1,
      });
      expect(Object.keys(result?.events_per_day || {}).length).toBe(2);
    });

    it('should return null for a user with no events', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.0,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user2');

      expect(result).toBeNull();
    });

    it('should correctly round values to 2 decimal places', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.333,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-01 11:00:00',
          value: 20.666,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result?.total_value).toBe(31.0);
      expect(result?.avg_value).toBe(15.5);
    });

    it('should correctly aggregate multiple events on the same day', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 08:00:00',
          value: 5.0,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-01 10:00:00',
          value: 10.0,
        },
        {
          event_id: '3',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 12:00:00',
          value: 15.0,
        },
        {
          event_id: '4',
          user_id: 'user1',
          event_type: 'purchase',
          timestamp: '2024-01-01 14:00:00',
          value: 20.0,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result?.total_events).toBe(4);
      expect(result?.events_per_day).toEqual({ '2024-01-01': 4 });
      expect(result?.events_per_type).toEqual({
        click: 2,
        view: 1,
        purchase: 1,
      });
    });

    it('should handle user with many different event types', async () => {
      const events = [
        {
          event_id: '1',
          user_id: 'user1',
          event_type: 'click',
          timestamp: '2024-01-01 10:00:00',
          value: 10.0,
        },
        {
          event_id: '2',
          user_id: 'user1',
          event_type: 'view',
          timestamp: '2024-01-01 11:00:00',
          value: 20.0,
        },
        {
          event_id: '3',
          user_id: 'user1',
          event_type: 'purchase',
          timestamp: '2024-01-01 12:00:00',
          value: 30.0,
        },
        {
          event_id: '4',
          user_id: 'user1',
          event_type: 'share',
          timestamp: '2024-01-01 13:00:00',
          value: 40.0,
        },
        {
          event_id: '5',
          user_id: 'user1',
          event_type: 'like',
          timestamp: '2024-01-01 14:00:00',
          value: 50.0,
        },
      ];

      const dbService = createTestDb(events);
      const metricsService = createUserMetricsService(dbService);
      const result = await metricsService.getUserMetrics('user1');

      expect(result?.total_events).toBe(5);
      expect(result?.events_per_type).toEqual({
        click: 1,
        view: 1,
        purchase: 1,
        share: 1,
        like: 1,
      });
      expect(result?.total_value).toBe(150.0);
      expect(result?.avg_value).toBe(30.0);
    });
  });
});
