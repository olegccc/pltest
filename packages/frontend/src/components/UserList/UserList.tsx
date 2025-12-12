import { useEffect, useState, useMemo, FC } from 'react';
import { Heading, VStack } from '@chakra-ui/react';
import { useStore } from '../../store/store';
import { fetchUsers } from '../../services/api';
import { UserFilter } from './UserFilter';
import { UserListContent } from './UserListContent';
import { LoadingState } from '../shared/LoadingState';
import { ErrorState } from '../shared/ErrorState';

export const UserList: FC = () => {
  const { users, setUsers, selectedUser, setSelectedUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchUsers();
        setUsers(response.userIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [setUsers]);

  const filteredUsers = useMemo(() => {
    if (!filter.trim()) return users;
    return users.filter(user => user.toLowerCase().includes(filter.toLowerCase()));
  }, [users, filter]);

  if (isLoading) {
    return <LoadingState w="300px" message="Loading users..." data-testid="user-list-loading" />;
  }

  if (error) {
    return <ErrorState w="300px" message={error} data-testid="user-list-error" />;
  }

  return (
    <VStack w="300px" spacing={3} align="stretch" data-testid="user-list">
      <Heading as="h3" size="md" color="blue.700">
        Users
      </Heading>

      <UserFilter filter={filter} onFilterChange={setFilter} />

      <UserListContent
        users={filteredUsers}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />
    </VStack>
  );
};
