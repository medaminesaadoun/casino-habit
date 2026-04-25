const API_BASE = 'http://localhost:3001';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Jars
  getJars: () => fetchJson(`${API_BASE}/jars`),
  updateJar: (id, data) => fetchJson(`${API_BASE}/jars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  createJar: (data) => fetchJson(`${API_BASE}/jars`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteJar: (id) => fetchJson(`${API_BASE}/jars/${id}`, {
    method: 'DELETE',
  }),

  // Habits
  getHabits: () => fetchJson(`${API_BASE}/habits`),
  updateHabit: (id, data) => fetchJson(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  createHabit: (data) => fetchJson(`${API_BASE}/habits`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteHabit: (id) => fetchJson(`${API_BASE}/habits/${id}`, {
    method: 'DELETE',
  }),

  // Reward Catalog
  getRewardCatalog: () => fetchJson(`${API_BASE}/rewardCatalog/catalog-1`),
  updateRewardCatalog: (data) => fetchJson(`${API_BASE}/rewardCatalog/catalog-1`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Inventory
  getInventory: () => fetchJson(`${API_BASE}/inventory/inv-1`),
  updateInventory: (data) => fetchJson(`${API_BASE}/inventory/inv-1`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // History
  getHistory: () => fetchJson(`${API_BASE}/history`),
  addHistory: (data) => fetchJson(`${API_BASE}/history`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteHistory: (id) => fetchJson(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
  }),
};
