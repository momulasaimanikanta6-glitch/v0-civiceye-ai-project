import React from 'react'
import { getComplaint, listComplaints, submitComplaint, updateComplaintStatus } from './api/complaintApi'
import './styles.css'

const categories = ['general', 'roads', 'sanitation', 'water', 'electricity', 'public safety']
const priorities = ['low', 'medium', 'high']
const statuses = ['submitted', 'in_review', 'assigned', 'resolved', 'rejected']
const sampleTeluguComplaint = 'మా వీధిలో డ్రైనేజ్ బ్లాక్ అయింది. దుర్వాసన వస్తోంది, దయచేసి వెంటనే పరిష్కరించండి.'

const demoUsers = {
  citizen: { name: 'Citizen User', email: 'citizen@civiceye.ai' },
  admin: { name: 'Admin Officer', email: 'admin@civiceye.ai' }
}

function normalizeLabel(value) {
  return (value || '').replace('_', ' ')
}

function StatusPill({ value }) {
  return <span className={`pill status-${value || 'submitted'}`}>{normalizeLabel(value || 'submitted')}</span>
}

function Pill({ value, kind }) {
  return <span className={`pill ${kind}-${value || 'general'}`}>{normalizeLabel(value || 'general')}</span>
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value || 'Not provided'}</strong>
    </div>
  )
}

function AiInsight({ insight }) {
  if (!insight) return null

  return (
    <div className="ai-insight">
      <div className="insight-title">
        <span>AI triage</span>
        <strong>{Math.round((insight.confidence || 0) * 100)}%</strong>
      </div>
      <p>{insight.summary}</p>
      <div className="insight-grid">
        <div>
          <span>Department</span>
          <strong>{insight.department}</strong>
        </div>
        <div>
          <span>SLA</span>
          <strong>{insight.sla}</strong>
        </div>
        <div>
          <span>Language</span>
          <strong>{insight.language === 'te' ? 'Telugu' : 'English'}</strong>
        </div>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [role, setRole] = React.useState('citizen')
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState(null)

  function submitLogin(e) {
    e.preventDefault()
    setError(null)

    if (role === 'admin' && password.trim() !== 'admin123') {
      setError('Use demo admin password: admin123')
      return
    }

    onLogin({
      role,
      name: name.trim() || demoUsers[role].name,
      email: demoUsers[role].email
    })
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div className="brand-mark">CE</div>
        <p className="eyebrow">Civic operations platform</p>
        <h1>Civiceye AI</h1>
        <p>
          One secure portal for citizens to file Telugu voice grievances and for municipal teams to triage, assign, and resolve them.
        </p>

        <div className="login-proof">
          <div>
            <strong>TE</strong>
            <span>Voice filing</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>Smart routing</span>
          </div>
          <div>
            <strong>Live</strong>
            <span>Admin queue</span>
          </div>
        </div>
      </section>

      <form className="auth-card" onSubmit={submitLogin}>
        <div>
          <p className="eyebrow">Sign in</p>
          <h2>Choose your workspace</h2>
        </div>

        <div className="role-switch" role="tablist" aria-label="User role">
          <button type="button" className={role === 'citizen' ? 'active' : ''} onClick={() => setRole('citizen')}>
            Citizen
          </button>
          <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
            Admin
          </button>
        </div>

        <label>
          <span>{role === 'admin' ? 'Officer name' : 'Your name'}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={demoUsers[role].name} />
        </label>

        {role === 'admin' && (
          <label>
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" type="password" />
          </label>
        )}

        {role === 'citizen' && (
          <div className="demo-note">
            Citizen demo access does not require a password.
          </div>
        )}

        <button className="primary-button" type="submit">
          Continue as {role}
        </button>

        {error && <div className="alert error">{error}</div>}
      </form>
    </main>
  )
}

function AppTopbar({ session, onLogout, onRoleSwitch }) {
  return (
    <header className="app-topbar">
      <div className="brand-block">
        <div className="brand-mark small">CE</div>
        <div>
          <strong>Civiceye AI</strong>
          <span>{session.role === 'admin' ? 'Municipal command center' : 'Citizen grievance portal'}</span>
        </div>
      </div>

      <div className="session-actions">
        <button type="button" className="ghost-button" onClick={onRoleSwitch}>
          Switch role
        </button>
        <div className="user-chip">
          <span>{session.name}</span>
          <strong>{session.role}</strong>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

function CitizenWorkspace({ session }) {
  const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const [description, setDescription] = React.useState('')
  const [citizenName, setCitizenName] = React.useState(session.name)
  const [category, setCategory] = React.useState('')
  const [priority, setPriority] = React.useState('')
  const [inputMode, setInputMode] = React.useState('voice')
  const [transcript, setTranscript] = React.useState('')
  const [listening, setListening] = React.useState(false)
  const [trackingId, setTrackingId] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [trackingLoading, setTrackingLoading] = React.useState(false)
  const [result, setResult] = React.useState(null)
  const [trackedComplaint, setTrackedComplaint] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [voiceNotice, setVoiceNotice] = React.useState(null)
  const [trackingError, setTrackingError] = React.useState(null)
  const recognitionRef = React.useRef(null)

  React.useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  function startVoiceInput() {
    setInputMode('voice')
    setError(null)
    setVoiceNotice(null)

    if (!SpeechRecognition) {
      setTranscript(sampleTeluguComplaint)
      setDescription((current) => current || sampleTeluguComplaint)
      setVoiceNotice('Voice capture is not supported in this browser, so a Telugu demo transcript was added.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'te-IN'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition
    setListening(true)

    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((voiceResult) => voiceResult[0].transcript)
        .join(' ')
        .trim()
      setTranscript(spokenText)
      setDescription(spokenText)
    }

    recognition.onerror = () => {
      setVoiceNotice('Unable to capture voice right now. You can still type the complaint.')
      setListening(false)
    }

    recognition.onend = () => setListening(false)
    recognition.start()
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await submitComplaint({
        citizen_name: citizenName || null,
        description,
        category: category || undefined,
        priority: priority || undefined,
        transcript: transcript || undefined
      })
      setResult(res.data)
      setTrackedComplaint(res.data)
      setTrackingId(String(res.data.id))
      setDescription('')
      setTranscript('')
      setCategory('')
      setPriority('')
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function onTrack(e) {
    e.preventDefault()
    if (!trackingId.trim()) return
    setTrackingLoading(true)
    setTrackingError(null)
    setTrackedComplaint(null)
    try {
      const res = await getComplaint(trackingId.trim())
      setTrackedComplaint(res.data)
    } catch (err) {
      setTrackingError(err?.response?.status === 404 ? 'No complaint found for that ID.' : err?.message || 'Unable to track complaint')
    } finally {
      setTrackingLoading(false)
    }
  }

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Telugu voice grievance filing</p>
          <h1>Report civic issues without friction.</h1>
          <p className="hero-copy">
            Speak or type in Telugu or English, receive a tracking ID, and follow every complaint through the municipal workflow.
          </p>
        </div>
        <div className="hero-stats" aria-label="Service highlights">
          <div><strong>TE</strong><span>voice</span></div>
          <div><strong>AI</strong><span>triage</span></div>
          <div><strong>ID</strong><span>tracking</span></div>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel complaint-form" onSubmit={onSubmit}>
          <div className="panel-heading">
            <p className="eyebrow">New report</p>
            <h2>Submit a grievance</h2>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Complaint input mode">
            <button type="button" className={inputMode === 'voice' ? 'active' : ''} onClick={() => setInputMode('voice')}>
              Telugu voice
            </button>
            <button type="button" className={inputMode === 'text' ? 'active' : ''} onClick={() => setInputMode('text')}>
              Text entry
            </button>
          </div>

          {inputMode === 'voice' && (
            <div className="voice-panel">
              <div>
                <strong>{listening ? 'Listening in Telugu...' : 'Tap the mic and speak naturally'}</strong>
                <span>{transcript || 'Example: మా వీధిలో చెత్త పేరుకుపోయింది'}</span>
              </div>
              <button type="button" className={listening ? 'voice-button listening' : 'voice-button'} onClick={listening ? stopVoiceInput : startVoiceInput}>
                {listening ? 'Stop' : 'Mic'}
              </button>
            </div>
          )}
          {voiceNotice && <div className="alert notice">{voiceNotice}</div>}

          <label>
            <span>Citizen name</span>
            <input value={citizenName} onChange={(e) => setCitizenName(e.target.value)} placeholder="Your name" />
          </label>

          <label>
            <span>Complaint description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Describe the location, issue, and urgency. Telugu text is welcome."
              required
            />
          </label>

          <div className="field-pair">
            <label>
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Auto detect</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Auto detect</option>
                {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit complaint'}
          </button>

          {error && <div className="alert error">{error}</div>}
          {result && <div className="alert success">Complaint #{result.id} submitted. Save this ID to track the case.</div>}
        </form>

        <aside className="panel tracking-panel">
          <div className="panel-heading">
            <p className="eyebrow">Track status</p>
            <h2>Find a complaint</h2>
          </div>

          <form className="track-form" onSubmit={onTrack}>
            <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="Complaint ID" inputMode="numeric" />
            <button type="submit" disabled={trackingLoading}>{trackingLoading ? 'Checking...' : 'Track'}</button>
          </form>

          {trackingError && <div className="alert error">{trackingError}</div>}

          {trackedComplaint ? (
            <div className="complaint-summary">
              <div className="summary-topline">
                <strong>#{trackedComplaint.id}</strong>
                <StatusPill value={trackedComplaint.status} />
              </div>
              <p>{trackedComplaint.description}</p>
              <DetailRow label="Citizen" value={trackedComplaint.citizen_name} />
              <DetailRow label="Category" value={trackedComplaint.category} />
              <DetailRow label="Priority" value={trackedComplaint.priority} />
              <AiInsight insight={trackedComplaint.ai} />
            </div>
          ) : (
            <div className="empty-state">Enter a complaint ID to see the latest status and triage details.</div>
          )}
        </aside>
      </section>

      <section className="process-band">
        <div><span>1</span><strong>Speak</strong><p>Citizens file complaints through Telugu voice or text.</p></div>
        <div><span>2</span><strong>Triage</strong><p>The backend classifies category, urgency, and routing queue.</p></div>
        <div><span>3</span><strong>Resolve</strong><p>Admins assign, update, and close complaints.</p></div>
      </section>
    </>
  )
}

function AdminWorkspace() {
  const [complaints, setComplaints] = React.useState([])
  const [selectedId, setSelectedId] = React.useState(null)
  const [filters, setFilters] = React.useState({ status: 'all', priority: 'all', category: 'all' })
  const [loading, setLoading] = React.useState(true)
  const [savingId, setSavingId] = React.useState(null)
  const [error, setError] = React.useState(null)

  const selectedComplaint = complaints.find((item) => item.id === selectedId) || complaints[0] || null
  const total = complaints.length
  const open = complaints.filter((item) => !['resolved', 'rejected'].includes(item.status)).length
  const highPriority = complaints.filter((item) => item.priority === 'high').length

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

  return (
    <>
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Municipal command center</p>
          <h1>Resolve complaints with a live civic queue.</h1>
          <p className="hero-copy">Review citizen reports, Telugu voice transcripts, category signals, priority, and case status from one focused workspace.</p>
        </div>
        <button className="refresh-button" onClick={() => loadComplaints()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh queue'}
        </button>
      </section>

      <section className="metrics-grid">
        <div className="metric"><span>Visible reports</span><strong>{total}</strong></div>
        <div className="metric"><span>Open cases</span><strong>{open}</strong></div>
        <div className="metric"><span>High priority</span><strong>{highPriority}</strong></div>
      </section>

      <section className="admin-grid">
        <div className="panel queue-panel">
          <div className="panel-heading split">
            <div>
              <p className="eyebrow">Queue</p>
              <h2>Complaint inbox</h2>
            </div>
            <div className="filters">
              <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} aria-label="Filter by status">
                <option value="all">all statuses</option>
                {statuses.map((item) => <option key={item} value={item}>{normalizeLabel(item)}</option>)}
              </select>
              <select value={filters.priority} onChange={(e) => onFilterChange('priority', e.target.value)} aria-label="Filter by priority">
                <option value="all">all priorities</option>
                {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} aria-label="Filter by category">
                <option value="all">all categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="alert error">{error}</div>}

          <div className="case-list">
            {complaints.map((complaint) => (
              <button
                type="button"
                key={complaint.id}
                className={selectedComplaint?.id === complaint.id ? 'case-row selected' : 'case-row'}
                onClick={() => setSelectedId(complaint.id)}
              >
                <span className="case-id">#{complaint.id}</span>
                <span className="case-main">
                  <strong>{complaint.citizen_name || 'Anonymous'}</strong>
                  <small>{complaint.description}</small>
                </span>
                <Pill value={complaint.category || 'general'} kind="category" />
                <Pill value={complaint.priority || 'low'} kind="priority" />
                <StatusPill value={complaint.status} />
              </button>
            ))}
            {!loading && complaints.length === 0 && <div className="empty-state">No complaints match these filters.</div>}
          </div>
        </div>

        <aside className="panel case-panel">
          <p className="eyebrow">Case details</p>
          {selectedComplaint ? (
            <>
              <div className="case-title">
                <h2>Complaint #{selectedComplaint.id}</h2>
                <StatusPill value={selectedComplaint.status} />
              </div>
              <p className="case-description">{selectedComplaint.description}</p>
              <div className="detail-list">
                <DetailRow label="Citizen" value={selectedComplaint.citizen_name || 'Anonymous'} />
                <DetailRow label="Category" value={selectedComplaint.category || 'general'} />
                <DetailRow label="Priority" value={selectedComplaint.priority || 'low'} />
              </div>

              <AiInsight insight={selectedComplaint.ai} />

              {selectedComplaint.transcript && (
                <div className="transcript-panel">
                  <span>Voice transcript</span>
                  <p>{selectedComplaint.transcript}</p>
                </div>
              )}

              <label className="status-control">
                <span>Update status</span>
                <select
                  value={selectedComplaint.status || 'submitted'}
                  onChange={(e) => onStatusChange(selectedComplaint.id, e.target.value)}
                  disabled={savingId === selectedComplaint.id}
                >
                  {statuses.map((item) => <option key={item} value={item}>{normalizeLabel(item)}</option>)}
                </select>
              </label>
            </>
          ) : (
            <div className="empty-state">Select a complaint to review details.</div>
          )}
        </aside>
      </section>
    </>
  )
}

export default function App() {
  const [session, setSession] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem('civiceye-session')
      return saved ? JSON.parse(saved) : null
    } catch {
      window.localStorage.removeItem('civiceye-session')
      return null
    }
  })

  function handleLogin(nextSession) {
    setSession(nextSession)
    window.localStorage.setItem('civiceye-session', JSON.stringify(nextSession))
  }

  function handleLogout() {
    setSession(null)
    window.localStorage.removeItem('civiceye-session')
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <main className="app-shell">
      <AppTopbar session={session} onLogout={handleLogout} onRoleSwitch={handleLogout} />
      {session.role === 'admin' ? <AdminWorkspace /> : <CitizenWorkspace session={session} />}
    </main>
  )
}
