import type { LookupItem, SchemaResponse } from './types';

const API_BASE_URL = 'http://localhost:8000';

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json() as Promise<T>;
}

export const fetchSchema = () => apiGet<SchemaResponse>('/api/schema');
export const fetchDataTypes = () => apiGet<{ items: LookupItem[] }>('/api/datatypes');
export const fetchSponsors = () => apiGet<{ items: LookupItem[] }>('/api/sponsors');
export const fetchTherapeuticAreas = () => apiGet<{ items: LookupItem[] }>('/api/therapeutic-areas');
