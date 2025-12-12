import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { FC } from 'react';

interface EventsPerDayProps {
  eventsPerDay: Record<string, number>;
}

export const EventsPerDay: FC<EventsPerDayProps> = ({ eventsPerDay }) => {
  return (
    <Box data-testid="events-per-day">
      <Text fontWeight="semibold" color="gray.700" mb={2}>
        Events per Day
      </Text>
      <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
        {Object.entries(eventsPerDay)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
          .map(([date, count]) => (
            <HStack key={date} justify="space-between" data-testid={`event-day-${date}`}>
              <Text color="gray.600" fontSize="sm">
                {date}:
              </Text>
              <Badge colorScheme="purple">{count}</Badge>
            </HStack>
          ))}
      </VStack>
    </Box>
  );
};
