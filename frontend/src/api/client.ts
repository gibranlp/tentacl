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

export interface DockerImage {
  Id: string;
  RepoTags: string[];
  Size: number;
  Created: number;
}

export interface Network {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
}

export interface Volume {
  Name: string;
  Driver: string;
  Mountpoint: string;
}

export interface HostStats {
  cpuPercent: number;
  memUsed: number;
  memTotal: number;
  uptime: number;
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('tentacl_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token.trim()}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    console.error('Unauthorized request to:', url, 'with token:', token ? 'PRESENT' : 'MISSING');
    localStorage.removeItem('tentacl_token');
    window.location.reload(); // Force re-auth
  }
  return response;
};

export const fetchContainers = async (): Promise<Container[]> => {
  const response = await fetchWithAuth('/api/containers');
  if (!response.ok) {
    throw new Error('Failed to fetch containers');
  }
  return response.json();
};

export const fetchImages = async (): Promise<DockerImage[]> => {
  const response = await fetchWithAuth('/api/images');
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
};

export const fetchImageInspect = async (id: string): Promise<any> => {
  const response = await fetchWithAuth(`/api/images/${id}`);
  if (!response.ok) throw new Error('Failed to inspect image');
  return response.json();
};

export const fetchNetworks = async (): Promise<Network[]> => {
  const response = await fetchWithAuth('/api/networks');
  if (!response.ok) throw new Error('Failed to fetch networks');
  return response.json();
};

export const fetchNetworkInspect = async (id: string): Promise<any> => {
  const response = await fetchWithAuth(`/api/networks/${id}`);
  if (!response.ok) throw new Error('Failed to inspect network');
  return response.json();
};

export const fetchVolumes = async (): Promise<Volume[]> => {
  const response = await fetchWithAuth('/api/volumes');
  if (!response.ok) throw new Error('Failed to fetch volumes');
  return response.json();
};

export const fetchVolumeInspect = async (name: string): Promise<any> => {
  const response = await fetchWithAuth(`/api/volumes/${name}`);
  if (!response.ok) throw new Error('Failed to inspect volume');
  return response.json();
};

export const fetchHostStats = async (): Promise<HostStats> => {
  const response = await fetchWithAuth('/api/host/stats');
  if (!response.ok) throw new Error('Failed to fetch host stats');
  return response.json();
};

export const removeImage = async (id: string) => {
  const response = await fetchWithAuth(`/api/images/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove image');
};

export const removeNetwork = async (id: string) => {
  const response = await fetchWithAuth(`/api/networks/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove network');
};

export const removeVolume = async (name: string) => {
  const response = await fetchWithAuth(`/api/volumes/${name}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove volume');
};

export const fetchContainerInspect = async (id: string): Promise<any> => {
  const response = await fetchWithAuth(`/api/containers/${id}/inspect`);
  if (!response.ok) throw new Error('Failed to inspect container');
  return response.json();
};

export const startContainer = async (id: string) => {
  const response = await fetchWithAuth(`/api/containers/${id}/start`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to start container');
};

export const stopContainer = async (id: string) => {
  const response = await fetchWithAuth(`/api/containers/${id}/stop`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to stop container');
};

export const restartContainer = async (id: string) => {
  const response = await fetchWithAuth(`/api/containers/${id}/restart`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to restart container');
};

export const removeContainer = async (id: string) => {
  const response = await fetchWithAuth(`/api/containers/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove container');
};

export const checkAuthStatus = async (): Promise<{ needsSetup: boolean }> => {
  const response = await fetch('/api/auth/status');
  if (!response.ok) throw new Error('Failed to check auth status');
  return response.json();
};

export const setupUser = async (credentials: any): Promise<{ token: string }> => {
  const response = await fetch('/api/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Setup failed');
  }
  return response.json();
};

export const loginUser = async (credentials: any): Promise<{ token: string }> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const pullImage = async (image: string, url?: string, token?: string) => {
  const response = await fetchWithAuth('/api/images/pull', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, url, token }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to pull image');
  }
};
