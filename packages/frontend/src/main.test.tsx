import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactDOM from 'react-dom/client';

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
      unmount: vi.fn(),
    })),
  },
}));

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('creates root element and renders app', async () => {
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn(() => ({ render: mockRender, unmount: vi.fn() }));
    vi.mocked(ReactDOM.createRoot).mockImplementation(mockCreateRoot);

    await import('./main.tsx');

    const rootElement = document.getElementById('root');
    expect(rootElement).toBeInTheDocument();
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalled();
  });
});
