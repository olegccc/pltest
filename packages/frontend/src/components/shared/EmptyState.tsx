import { Box, Text, BoxProps } from '@chakra-ui/react';
import { FC } from 'react';

interface EmptyStateProps extends BoxProps {
  message: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ message, ...boxProps }) => {
  return (
    <Box p={4} bg="gray.50" borderRadius="md" {...boxProps}>
      <Text color="gray.500" textAlign="center" data-testid="empty-message">
        {message}
      </Text>
    </Box>
  );
};
