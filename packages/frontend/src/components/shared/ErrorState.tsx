import { Box, Alert, AlertIcon, BoxProps } from '@chakra-ui/react';
import { FC } from 'react';

interface ErrorStateProps extends BoxProps {
  message: string;
}

export const ErrorState: FC<ErrorStateProps> = ({ message, ...boxProps }) => {
  return (
    <Box p={4} {...boxProps}>
      <Alert status="error" data-testid="error-alert">
        <AlertIcon />
        {message}
      </Alert>
    </Box>
  );
};
