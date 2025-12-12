import { UserMetricsResponse } from 'shared';

export const createPseudoAiService = () => {
  const generateExplanation = (metrics: UserMetricsResponse): string => {
    const { total_events, events_per_type, total_value, avg_value, events_per_day } = metrics;

    // Determine activity level
    let activityLevel: string;
    if (total_events >= 50) {
      activityLevel = 'high';
    } else if (total_events >= 20) {
      activityLevel = 'moderate';
    } else {
      activityLevel = 'low';
    }

    // Find dominant event type
    const eventTypes = Object.entries(events_per_type).sort((a, b) => b[1] - a[1]);
    const dominantType = eventTypes[0];
    const dominantPercentage = ((dominantType[1] / total_events) * 100).toFixed(0);

    // Analyze value metrics
    let valueAnalysis: string;
    if (avg_value > 100) {
      valueAnalysis = 'high-value transactions';
    } else if (avg_value > 50) {
      valueAnalysis = 'moderate-value transactions';
    } else {
      valueAnalysis = 'low-value transactions';
    }

    // Analyze activity pattern
    const dates = Object.keys(events_per_day).sort();
    const dailyCounts = Object.values(events_per_day);
    const avgPerDay =
      dailyCounts.length > 0
        ? (dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length).toFixed(1)
        : '0';

    let activityPattern: string;
    if (dailyCounts.length > 0) {
      const variance =
        dailyCounts.reduce((sum, count) => {
          const diff = count - parseFloat(avgPerDay);
          return sum + diff * diff;
        }, 0) / dailyCounts.length;

      if (variance < 2) {
        activityPattern = 'consistent daily activity';
      } else if (variance < 10) {
        activityPattern = 'moderately variable activity';
      } else {
        activityPattern = 'highly variable activity with irregular patterns';
      }
    } else {
      activityPattern = 'no activity pattern';
    }

    // Build explanation
    const parts: string[] = [];

    // First sentence: activity level and event breakdown
    const eventBreakdown = eventTypes.map(([type, count]) => `${count} ${type}`).join(', ');
    parts.push(
      `This user shows ${activityLevel} activity with ${total_events} total events consisting of ${eventBreakdown}, ` +
        `with ${dominantType[0]} events dominating at ${dominantPercentage}% of all activity.`
    );

    // Second sentence: value analysis
    parts.push(
      `The user generated $${total_value.toFixed(2)} in total value across all events, ` +
        `averaging $${avg_value.toFixed(2)} per event, indicating ${valueAnalysis}.`
    );

    // Third sentence: activity pattern
    if (dates.length > 0) {
      parts.push(
        `Activity spans from ${dates[0]} to ${dates[dates.length - 1]} ` +
          `with an average of ${avgPerDay} events per day, showing ${activityPattern}.`
      );
    } else {
      parts.push(`No temporal activity pattern available.`);
    }

    return parts.join(' ');
  };

  return {
    generateExplanation,
  };
};

export type PseudoAiService = ReturnType<typeof createPseudoAiService>;
