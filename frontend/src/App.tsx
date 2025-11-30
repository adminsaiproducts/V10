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
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCustomers = (query: string = '') => {
    setLoading(true)
    const apiCall = query ? runGAS<any[]>('api_searchCustomers', query) : runGAS<any[]>('api_getCustomers')
    
    apiCall
      .then(data => {
        setCustomers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCustomers(searchQuery)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer List</h1>
      <Link to="/">Back to Home</Link>
      
      <form onSubmit={handleSearch} style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone..."
          style={{ padding: '8px', width: '300px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : (
        <ul>
          {customers.length === 0 ? (
            <li>No customers found.</li>
          ) : (
            customers.map(c => (
              <li key={c.id}>
                <strong>{c.name}</strong> ({c.email}) - {c.status}
              </li>
            ))
          )}
        </ul>
      )}
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
