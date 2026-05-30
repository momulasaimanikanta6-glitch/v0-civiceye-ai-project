import { api } from './axios'

export function submitComplaint(payload) {
  return api.post('/api/complaints', payload)
}

export function getComplaint(id) {
  return api.get(`/api/complaints/${id}`)
}

export function listComplaints(filters = {}) {
  return api.get('/api/admin/complaints', { params: filters })
}

export function updateComplaintStatus(id, status) {
  return api.patch(`/api/admin/complaints/${id}/status`, { status })
}
