import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { FC } from 'react';

interface MetricsOverviewProps {
  totalEvents: number;
  totalValue: number;
  avgValue: number;
}

export const MetricsOverview: FC<MetricsOverviewProps> = ({
  totalEvents,
  totalValue,
  avgValue,
}) => {
  return (
    <Box data-testid="metrics-overview">
      <Text fontWeight="semibold" color="gray.700" mb={2}>
        Overview
      </Text>
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text color="gray.600">Total Events:</Text>
          <Text fontWeight="medium" data-testid="total-events">
            {totalEvents}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="gray.600">Total Value:</Text>
          <Text fontWeight="medium" data-testid="total-value">
            ${totalValue.toFixed(2)}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="gray.600">Average Value:</Text>
          <Text fontWeight="medium" data-testid="avg-value">
            ${avgValue.toFixed(2)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};
