import { ListItem, Text } from '@chakra-ui/react';
import { FC } from 'react';

interface UserListItemProps {
  userId: string;
  isSelected: boolean;
  onSelect: (userId: string) => void;
}

export const UserListItem: FC<UserListItemProps> = ({ userId, isSelected, onSelect }) => {
  return (
    <ListItem
      p={2}
      px={3}
      bg={isSelected ? 'blue.100' : 'transparent'}
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: isSelected ? 'blue.100' : 'gray.100' }}
      onClick={() => onSelect(userId)}
      data-testid={`user-item-${userId}`}
    >
      <Text fontWeight={isSelected ? 'semibold' : 'normal'}>{userId}</Text>
    </ListItem>
  );
};
