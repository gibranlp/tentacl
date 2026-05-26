import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContainerTable } from './ContainerTable';
import { useQuery } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('ContainerTable', () => {
  it('shows FETCHING_DATA... when loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null,
    } as any);

    render(<ContainerTable />);
    expect(screen.getByText('FETCHING_DATA...')).toBeInTheDocument();
  });

  it('renders rows correctly when data is provided', () => {
    const mockContainers = [
      {
        Id: '1234567890123456',
        Names: ['/web-server'],
        Image: 'nginx:latest',
        State: 'running',
        Ports: [{ PublicPort: 80, PrivatePort: 80 }],
      },
      {
        Id: 'abcdefghijklmnop',
        Names: ['/db-server'],
        Image: 'postgres:15',
        State: 'exited',
        Ports: [],
      },
    ];

    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: mockContainers,
      error: null,
    } as any);

    render(<ContainerTable />);

    expect(screen.getByText('web-server')).toBeInTheDocument();
    expect(screen.getByText('db-server')).toBeInTheDocument();
    expect(screen.getByText('nginx:latest')).toBeInTheDocument();
    expect(screen.getByText('123456789012')).toBeInTheDocument();
  });

  it('applies correct status colors', () => {
    const mockContainers = [
      {
        Id: '1',
        Names: ['/running-box'],
        Image: 'alpine',
        State: 'running',
        Ports: [],
      },
      {
        Id: '2',
        Names: ['/stopped-box'],
        Image: 'alpine',
        State: 'exited',
        Ports: [],
      },
    ];

    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: mockContainers,
      error: null,
    } as any);

    render(<ContainerTable />);

    const runningStatus = screen.getByText('[RUNNING]');
    const stoppedStatus = screen.getByText('[EXITED]');

    expect(runningStatus).toHaveClass('text-terminal-fg');
    expect(stoppedStatus).toHaveClass('text-terminal-danger');
  });

  it('shows NO_CONTAINERS_FOUND when empty', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: [],
      error: null,
    } as any);

    render(<ContainerTable />);
    expect(screen.getByText('NO_CONTAINERS_FOUND')).toBeInTheDocument();
  });

  it('shows error message on failure', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Failed to fetch'),
    } as any);

    render(<ContainerTable />);
    expect(screen.getByText('ERROR: Failed to fetch')).toBeInTheDocument();
  });
});
