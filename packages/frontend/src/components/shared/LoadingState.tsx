import { Box, Spinner, Text, BoxProps } from '@chakra-ui/react';
import { FC } from 'react';

interface LoadingStateProps extends BoxProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({ message = 'Loading...', ...boxProps }) => {
  return (
    <Box textAlign="center" p={4} {...boxProps}>
      <Spinner size="lg" color="blue.500" data-testid="loading-spinner" />
      <Text mt={2} color="gray.600" data-testid="loading-message">
        {message}
      </Text>
    </Box>
  );
};
