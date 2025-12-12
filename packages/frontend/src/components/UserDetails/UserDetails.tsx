import { useEffect, useState, FC } from 'react';
import { Box, Flex, Text, Badge, Heading, VStack, Divider } from '@chakra-ui/react';
import { useStore } from '../../store/store';
import { fetchUserMetrics, explainUserMetrics } from '../../services/api';
import { MetricsOverview } from './MetricsOverview';
import { EventsByType } from './EventsByType';
import { EventsPerDay } from './EventsPerDay';
import { AIExplanation } from './AIExplanation';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';
import { EmptyState } from '../shared/EmptyState';

export const UserDetails: FC = () => {
  const { selectedUser, userMetrics, setUserMetrics } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedUser) {
      setUserMetrics(null);
      setExplanation(null);
      setExplanationError(null);
      return;
    }

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      setExplanation(null);
      setExplanationError(null);
      try {
        const metrics = await fetchUserMetrics(selectedUser);
        setUserMetrics(metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user metrics');
        setUserMetrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [selectedUser, setUserMetrics]);

  const handleExplain = async () => {
    if (!selectedUser) return;

    setIsExplaining(true);
    setExplanationError(null);
    try {
      const result = await explainUserMetrics(selectedUser);
      setExplanation(result.explanation);
    } catch (err) {
      setExplanationError(err instanceof Error ? err.message : 'Failed to generate explanation');
    } finally {
      setIsExplaining(false);
    }
  };

  if (!selectedUser) {
    return (
      <EmptyState
        flex="1"
        border="1px"
        borderColor="gray.200"
        message="Select a user to view details"
        data-testid="user-details-empty"
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingState
        flex="1"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        message="Loading user metrics..."
        data-testid="user-details-loading"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        flex="1"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        message={error}
        data-testid="user-details-error"
      />
    );
  }

  if (!userMetrics) {
    return null;
  }

  return (
    <Box
      flex="1"
      p={4}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      data-testid="user-details-content"
    >
      <Heading as="h3" size="md" color="blue.700" mb={4}>
        User Details
      </Heading>

      <VStack align="stretch" spacing={4}>
        <Flex align="center" gap={2}>
          <Text color="gray.600">User ID:</Text>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1} data-testid="user-id-badge">
            {userMetrics.user_id}
          </Badge>
        </Flex>

        <Divider />

        <MetricsOverview
          totalEvents={userMetrics.total_events}
          totalValue={userMetrics.total_value}
          avgValue={userMetrics.avg_value}
        />

        <Divider />

        <EventsByType eventsPerType={userMetrics.events_per_type} />

        <Divider />

        <EventsPerDay eventsPerDay={userMetrics.events_per_day} />

        <Divider />

        <AIExplanation
          explanation={explanation}
          isExplaining={isExplaining}
          explanationError={explanationError}
          onExplain={handleExplain}
        />
      </VStack>
    </Box>
  );
};
