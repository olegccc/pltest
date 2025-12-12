import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FC } from 'react';

interface UserFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const UserFilter: FC<UserFilterProps> = ({ filter, onFilterChange }) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        placeholder="Filter users..."
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
        data-testid="user-filter"
      />
      {filter && (
        <InputRightElement>
          <IconButton
            aria-label="Clear filter"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            onClick={() => onFilterChange('')}
            data-testid="clear-filter"
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};
