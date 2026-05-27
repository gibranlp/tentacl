import { fetchWithAuth } from './client';

export interface User {
  username: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetchWithAuth('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (userData: any): Promise<void> => {
  const response = await fetchWithAuth('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create user');
  }
};

export const deleteUser = async (username: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/users/${username}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
};

export const changePassword = async (passwords: any): Promise<void> => {
  const response = await fetchWithAuth('/api/users/me/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwords),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to change password');
  }
};
