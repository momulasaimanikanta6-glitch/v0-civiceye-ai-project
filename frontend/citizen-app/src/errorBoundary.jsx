import React from 'react'

export default function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null)

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, Arial' }}>
        <h2>App failed to load</h2>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{String(err?.message || err)}</pre>
      </div>
    )
  }

  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  )
}

