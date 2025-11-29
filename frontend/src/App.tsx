// frontend/src/App.tsx
import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { runGAS } from './lib/api'

// Simple Home Component
const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1>CRM V10 Dashboard</h1>
    <p>Welcome to the new Clean Architecture CRM.</p>
    <Link to="/customers">View Customers</Link>
  </div>
)

// Simple Customers Component
const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    runGAS<any[]>('api_getCustomers')
      .then(data => {
        setCustomers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer List</h1>
      <Link to="/">Back to Home</Link>
      <ul>
        {customers.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> ({c.email}) - {c.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </HashRouter>
  )
}

export default App
