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
