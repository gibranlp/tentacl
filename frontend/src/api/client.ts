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

export const fetchContainers = async (): Promise<Container[]> => {
  const response = await fetch('/api/containers');
  if (!response.ok) {
    throw new Error('Failed to fetch containers');
  }
  return response.json();
};

export const fetchImages = async (): Promise<DockerImage[]> => {
  const response = await fetch('/api/images');
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
};

export const fetchNetworks = async (): Promise<Network[]> => {
  const response = await fetch('/api/networks');
  if (!response.ok) throw new Error('Failed to fetch networks');
  return response.json();
};

export const fetchVolumes = async (): Promise<Volume[]> => {
  const response = await fetch('/api/volumes');
  if (!response.ok) throw new Error('Failed to fetch volumes');
  return response.json();
};

export const removeImage = async (id: string) => {
  const response = await fetch(`/api/images/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove image');
};

export const removeNetwork = async (id: string) => {
  const response = await fetch(`/api/networks/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove network');
};

export const removeVolume = async (name: string) => {
  const response = await fetch(`/api/volumes/${name}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove volume');
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
