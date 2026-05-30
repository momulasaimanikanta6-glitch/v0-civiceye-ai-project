import React from 'react'
import { listComplaints, updateComplaintStatus } from './api/adminApi'
import './styles.css'

const statuses = ['all', 'submitted', 'in_review', 'assigned', 'resolved', 'rejected']
const priorities = ['all', 'low', 'medium', 'high']
const categories = ['all', 'general', 'roads', 'sanitation', 'water', 'electricity', 'public safety']

function normalizeLabel(value) {
  return value.replace('_', ' ')
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Pill({ value, kind }) {
  return <span className={`pill ${kind}-${value}`}>{normalizeLabel(value || 'none')}</span>
}

function EmptyState({ title, copy }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{copy}</span>
    </div>
  )
}

export default function App() {
  const [complaints, setComplaints] = React.useState([])
  const [selectedId, setSelectedId] = React.useState(null)
  const [filters, setFilters] = React.useState({ status: 'all', priority: 'all', category: 'all' })
  const [loading, setLoading] = React.useState(true)
  const [savingId, setSavingId] = React.useState(null)
  const [error, setError] = React.useState(null)

  const selectedComplaint = complaints.find((item) => item.id === selectedId) || complaints[0] || null

  async function loadComplaints(nextFilters = filters) {
    setLoading(true)
    setError(null)
    try {
      const res = await listComplaints(nextFilters)
      setComplaints(res.data)
      setSelectedId((currentId) => {
        if (res.data.some((item) => item.id === currentId)) return currentId
        return res.data[0]?.id || null
      })
    } catch (err) {
      setError(err?.message || 'Unable to load complaints')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadComplaints()
  }, [])

  async function onFilterChange(name, value) {
    const nextFilters = { ...filters, [name]: value }
    setFilters(nextFilters)
    await loadComplaints(nextFilters)
  }

  async function onStatusChange(id, status) {
    setSavingId(id)
    setError(null)
    try {
      const res = await updateComplaintStatus(id, status)
      setComplaints((items) => items.map((item) => (item.id === id ? { ...item, status: res.data.status } : item)))
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Unable to update status')
    } finally {
      setSavingId(null)
    }
  }

  const total = complaints.length
  const open = complaints.filter((item) => !['resolved', 'rejected'].includes(item.status)).length
  const urgent = complaints.filter((item) => item.priority === 'high').length

  return (
    <main className="admin-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Municipal operations</p>
          <h1>Civiceye AI Admin</h1>
          <p className="topbar-copy">Prioritize citizen grievances, review Telugu voice transcripts, and move reports toward resolution.</p>
        </div>
        <button className="refresh-button" onClick={() => loadComplaints()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="metrics-grid">
        <Metric label="Visible reports" value={total} />
        <Metric label="Open cases" value={open} />
        <Metric label="High priority" value={urgent} />
      </section>

      <section className="workspace">
        <div className="panel list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Queue</p>
              <h2>Complaint inbox</h2>
            </div>
            <div className="filters">
              <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} aria-label="Filter by status">
                {statuses.map((item) => <option key={item} value={item}>{normalizeLabel(item)}</option>)}
              </select>
              <select value={filters.priority} onChange={(e) => onFilterChange('priority', e.target.value)} aria-label="Filter by priority">
                {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} aria-label="Filter by category">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="alert error">{error}</div>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Report</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className={selectedComplaint?.id === complaint.id ? 'selected' : ''}
                    onClick={() => setSelectedId(complaint.id)}
                  >
                    <td>#{complaint.id}</td>
                    <td>
                      <strong>{complaint.citizen_name || 'Anonymous'}</strong>
                      <span>{complaint.description}</span>
                    </td>
                    <td><Pill value={complaint.category || 'general'} kind="category" /></td>
                    <td><Pill value={complaint.priority || 'low'} kind="priority" /></td>
                    <td><Pill value={complaint.status || 'submitted'} kind="status" /></td>
                  </tr>
                ))}
                {!loading && complaints.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-row">No complaints match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel detail-panel">
          <p className="eyebrow">Case details</p>
          {selectedComplaint ? (
            <>
              <div className="case-title">
                <h2>Complaint #{selectedComplaint.id}</h2>
                <Pill value={selectedComplaint.status || 'submitted'} kind="status" />
              </div>
              <p className="case-description">{selectedComplaint.description}</p>

              <div className="detail-list">
                <div><span>Citizen</span><strong>{selectedComplaint.citizen_name || 'Anonymous'}</strong></div>
                <div><span>Category</span><strong>{selectedComplaint.category || 'general'}</strong></div>
                <div><span>Priority</span><strong>{selectedComplaint.priority || 'low'}</strong></div>
              </div>

              {selectedComplaint.transcript && (
                <div className="transcript-panel">
                  <span>Voice transcript</span>
                  <p>{selectedComplaint.transcript}</p>
                </div>
              )}

              <label className="status-control">
                <span>Update status</span>
                <select
                  value={selectedComplaint.status}
                  onChange={(e) => onStatusChange(selectedComplaint.id, e.target.value)}
                  disabled={savingId === selectedComplaint.id}
                >
                  {statuses.filter((item) => item !== 'all').map((item) => (
                    <option key={item} value={item}>{normalizeLabel(item)}</option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <EmptyState title="No case selected" copy="Select a complaint to review details." />
          )}
        </aside>
      </section>
    </main>
  )
}
