import api from "./api";

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const suffix = qs.toString();
  return suffix ? `?${suffix}` : "";
}

export function createResource(basePath) {
  return {
    list: (params = {}) => api.get(`${basePath}${buildQuery(params)}`),
    get: (id) => api.get(`${basePath}${id}/`),
    create: (body) => api.post(basePath, body),
    update: (id, body) => api.patch(`${basePath}${id}/`, body),
    remove: (id) => api.delete(`${basePath}${id}/`),
    bulk: (action, ids) => api.post(`${basePath}bulk/`, { action, ids }),
  };
}
