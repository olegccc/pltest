import { Card, CardBody, Heading, Flex } from '@chakra-ui/react';
import { UserList } from '../components/UserList/UserList';
import { UserDetails } from '../components/UserDetails/UserDetails';

export const Home = () => {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100" p={4} data-testid="home-page">
      <Card maxW="1200px" w="full" p={6}>
        <CardBody>
          <Flex direction="column" align="center" gap={6}>
            <Heading as="h1" size="xl" color="blue.700" data-testid="home-title">
              Event Analytics
            </Heading>

            <Flex direction={{ base: 'column', md: 'row' }} gap={6} w="full" align="flex-start">
              <UserList />
              <UserDetails />
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
};
