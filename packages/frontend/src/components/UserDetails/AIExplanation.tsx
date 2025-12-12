import { Box, Text, Button, Alert, AlertIcon } from '@chakra-ui/react';
import { FC } from 'react';

interface AIExplanationProps {
  explanation: string | null;
  isExplaining: boolean;
  explanationError: string | null;
  onExplain: () => void;
}

export const AIExplanation: FC<AIExplanationProps> = ({
  explanation,
  isExplaining,
  explanationError,
  onExplain,
}) => {
  return (
    <Box>
      {!explanation && (
        <Button
          colorScheme="blue"
          size="md"
          width="full"
          onClick={onExplain}
          isLoading={isExplaining}
          loadingText="Generating explanation..."
          data-testid="explain-metrics-button"
        >
          Explain these metrics
        </Button>
      )}

      {isExplaining && (
        <Box mt={2} textAlign="center">
          <Text as="span" color="gray.600" fontSize="sm">
            This may take a moment...
          </Text>
        </Box>
      )}

      {explanationError && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {explanationError}
        </Alert>
      )}

      {explanation && !isExplaining && (
        <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
          <Text fontWeight="semibold" color="blue.700" mb={2}>
            AI Explanation
          </Text>
          <Text color="gray.700" lineHeight="1.6">
            {explanation}
          </Text>
        </Box>
      )}
    </Box>
  );
};
