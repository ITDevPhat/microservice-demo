const API_BASE_URL = "http://localhost:8000";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json();
}

async function fetchSchema() {
  return apiGet("/api/schema");
}

async function fetchDataTypes() {
  return apiGet("/api/datatypes");
}

async function fetchSponsors() {
  return apiGet("/api/sponsors");
}

async function fetchTherapeuticAreas() {
  return apiGet("/api/therapeutic-areas");
}
