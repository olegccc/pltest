import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

Element.prototype.animate = function () {
  return {
    finished: Promise.resolve(),
    cancel: () => {},
    play: () => {},
    pause: () => {},
    reverse: () => {},
    finish: () => {},
    onfinish: null,
    oncancel: null,
  } as unknown as Animation;
};

// Mock the fetchUsers API to prevent actual API calls in tests
vi.mock('../services/api', () => ({
  fetchUsers: vi.fn(() => Promise.resolve({ userIds: [] })),
}));

afterEach(() => {
  cleanup();
});
