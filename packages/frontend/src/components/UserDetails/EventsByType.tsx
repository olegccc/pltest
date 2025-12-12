import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { FC } from 'react';

interface EventsByTypeProps {
  eventsPerType: Record<string, number>;
}

export const EventsByType: FC<EventsByTypeProps> = ({ eventsPerType }) => {
  return (
    <Box data-testid="events-by-type">
      <Text fontWeight="semibold" color="gray.700" mb={2}>
        Events by Type
      </Text>
      <VStack align="stretch" spacing={2}>
        {Object.entries(eventsPerType).map(([type, count]) => (
          <HStack key={type} justify="space-between" data-testid={`event-type-${type}`}>
            <Text color="gray.600" textTransform="capitalize">
              {type}:
            </Text>
            <Badge colorScheme="green">{count}</Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};
