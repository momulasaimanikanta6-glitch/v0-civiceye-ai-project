import axios from 'axios'

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050'
})

export function listComplaints(filters = {}) {
  return adminApi.get('/api/admin/complaints', { params: filters })
}

export function updateComplaintStatus(id, status) {
  return adminApi.patch(`/api/admin/complaints/${id}/status`, { status })
}
