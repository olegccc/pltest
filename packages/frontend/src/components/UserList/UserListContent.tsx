import { Box, Text, List } from '@chakra-ui/react';
import { FC } from 'react';
import { UserListItem } from './UserListItem';

interface UserListContentProps {
  users: string[];
  selectedUser: string | null;
  onSelectUser: (userId: string) => void;
}

export const UserListContent: FC<UserListContentProps> = ({
  users,
  selectedUser,
  onSelectUser,
}) => {
  if (users.length === 0) {
    return (
      <Box
        maxH="300px"
        overflowY="auto"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
      >
        <Text color="gray.600" textAlign="center" p={4} data-testid="user-list-empty">
          No users found
        </Text>
      </Box>
    );
  }

  return (
    <Box maxH="300px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={2}>
      <List spacing={1}>
        {users.map(userId => (
          <UserListItem
            key={userId}
            userId={userId}
            isSelected={selectedUser === userId}
            onSelect={onSelectUser}
          />
        ))}
      </List>
    </Box>
  );
};
