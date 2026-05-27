import { fetchWithAuth } from './client';

export interface Registry {
  id: string;
  url: string;
  user_id: string;
}

export const fetchRegistries = async (): Promise<Registry[]> => {
  const response = await fetchWithAuth('/api/registries');
  if (!response.ok) throw new Error('Failed to fetch registries');
  return response.json();
};

export const addRegistry = async (url: string, token: string): Promise<Registry> => {
  const response = await fetchWithAuth('/api/registries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, token }),
  });
  if (!response.ok) throw new Error('Failed to add registry');
  return response.json();
};

export const removeRegistry = async (id: string) => {
  const response = await fetchWithAuth(`/api/registries/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove registry');
};
