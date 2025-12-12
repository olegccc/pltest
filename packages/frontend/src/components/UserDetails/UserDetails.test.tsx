import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { UserDetails } from './UserDetails';
import { useStore } from '../../store/store';
import * as api from '../../services/api';

vi.mock('../../services/api');

const mockFetchUserMetrics = vi.mocked(api.fetchUserMetrics);
const mockExplainUserMetrics = vi.mocked(api.explainUserMetrics);

const mockMetrics = {
  user_id: 'user123',
  total_events: 42,
  total_value: 1234.56,
  avg_value: 29.39,
  events_per_type: {
    purchase: 15,
    view: 20,
    click: 7,
  },
  events_per_day: {
    '2024-01-15': 10,
    '2024-01-14': 12,
    '2024-01-13': 20,
  },
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('UserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      selectedUser: null,
      userMetrics: null,
      users: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no user is selected', () => {
    renderWithChakra(<UserDetails />);

    expect(screen.getByTestId('user-details-empty')).toBeInTheDocument();
    expect(screen.getByTestId('empty-message')).toHaveTextContent('Select a user to view details');
  });

  it('should render loading state when fetching user metrics', async () => {
    mockFetchUserMetrics.mockImplementation(() => new Promise(() => {}));

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-loading')).toBeInTheDocument();
    });

    expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading user metrics...');
  });

  it('should render error state when fetching user metrics fails', async () => {
    const errorMessage = 'Failed to fetch metrics';
    mockFetchUserMetrics.mockRejectedValue(new Error(errorMessage));

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error-alert')).toHaveTextContent(errorMessage);
  });

  it('should fetch and display user metrics when user is selected', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-content')).toBeInTheDocument();
    });

    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByTestId('user-id-badge')).toHaveTextContent('user123');
  });

  it('should display metrics overview correctly', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('metrics-overview')).toBeInTheDocument();
    });

    expect(screen.getByTestId('total-events')).toHaveTextContent('42');
    expect(screen.getByTestId('total-value')).toHaveTextContent('$1234.56');
    expect(screen.getByTestId('avg-value')).toHaveTextContent('$29.39');
  });

  it('should display events by type correctly', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('events-by-type')).toBeInTheDocument();
    });

    expect(screen.getByTestId('event-type-purchase')).toBeInTheDocument();
    expect(screen.getByTestId('event-type-view')).toBeInTheDocument();
    expect(screen.getByTestId('event-type-click')).toBeInTheDocument();
  });

  it('should display events per day correctly', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('events-per-day')).toBeInTheDocument();
    });

    expect(screen.getByTestId('event-day-2024-01-15')).toBeInTheDocument();
    expect(screen.getByTestId('event-day-2024-01-14')).toBeInTheDocument();
    expect(screen.getByTestId('event-day-2024-01-13')).toBeInTheDocument();
  });

  it('should show explain button when metrics are loaded', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('explain-metrics-button')).toHaveTextContent('Explain these metrics');
  });

  it('should fetch and display AI explanation when explain button is clicked', async () => {
    const user = userEvent.setup();
    const explanation = 'This user has a high engagement rate with frequent purchases.';

    mockFetchUserMetrics.mockResolvedValue(mockMetrics);
    mockExplainUserMetrics.mockResolvedValue({ explanation });

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('explain-metrics-button'));

    await waitFor(() => {
      expect(screen.getByText(explanation)).toBeInTheDocument();
    });

    expect(mockExplainUserMetrics).toHaveBeenCalledWith('user123');
  });

  it('should show loading state while generating explanation', async () => {
    const user = userEvent.setup();

    mockFetchUserMetrics.mockResolvedValue(mockMetrics);
    mockExplainUserMetrics.mockImplementation(() => new Promise(() => {}));

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('explain-metrics-button'));

    await waitFor(() => {
      expect(screen.getByText('This may take a moment...')).toBeInTheDocument();
    });
  });

  it('should show error message when explanation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to generate explanation';

    mockFetchUserMetrics.mockResolvedValue(mockMetrics);
    mockExplainUserMetrics.mockRejectedValue(new Error(errorMessage));

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('explain-metrics-button'));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should clear metrics when user is deselected', async () => {
    mockFetchUserMetrics.mockResolvedValue(mockMetrics);

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-content')).toBeInTheDocument();
    });

    await act(async () => {
      useStore.setState({ selectedUser: null });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-empty')).toBeInTheDocument();
    });
  });

  it('should reset explanation state when user changes', async () => {
    const user = userEvent.setup();
    const explanation = 'First user explanation';

    mockFetchUserMetrics.mockResolvedValue(mockMetrics);
    mockExplainUserMetrics.mockResolvedValue({ explanation });

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('explain-metrics-button'));

    await waitFor(() => {
      expect(screen.getByText(explanation)).toBeInTheDocument();
    });

    await act(async () => {
      useStore.setState({ selectedUser: 'user456' });
    });

    await waitFor(() => {
      expect(screen.queryByText(explanation)).not.toBeInTheDocument();
    });
  });

  it('should handle non-Error exceptions when fetching metrics', async () => {
    mockFetchUserMetrics.mockRejectedValue('String error');

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error-alert')).toHaveTextContent('Failed to load user metrics');
  });

  it('should handle non-Error exceptions when generating explanation', async () => {
    const user = userEvent.setup();

    mockFetchUserMetrics.mockResolvedValue(mockMetrics);
    mockExplainUserMetrics.mockRejectedValue('String error');

    renderWithChakra(<UserDetails />);

    await act(async () => {
      useStore.setState({ selectedUser: 'user123' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('explain-metrics-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('explain-metrics-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate explanation')).toBeInTheDocument();
    });
  });
});
