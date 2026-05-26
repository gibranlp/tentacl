export interface Port {
  IP?: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

export interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: Port[];
}

export const fetchContainers = async (): Promise<Container[]> => {
  const response = await fetch('/api/containers');
  if (!response.ok) {
    throw new Error('Failed to fetch containers');
  }
  return response.json();
};

export const startContainer = async (id: string) => {
  const response = await fetch(`/api/containers/${id}/start`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to start container');
};

export const stopContainer = async (id: string) => {
  const response = await fetch(`/api/containers/${id}/stop`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to stop container');
};

export const restartContainer = async (id: string) => {
  const response = await fetch(`/api/containers/${id}/restart`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to restart container');
};

export const removeContainer = async (id: string) => {
  const response = await fetch(`/api/containers/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove container');
};
