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
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchCustomers = (query: string = '', pageNum: number = 1) => {
    setLoading(true)
    
    if (query) {
      // Search Mode
      runGAS<any[]>('api_searchCustomers', query)
        .then(data => {
          setCustomers(data)
          setTotal(data.length)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    } else {
      // Pagination Mode
      runGAS<any>('api_getCustomersPaginated', pageNum, pageSize)
        .then(data => {
          // data structure: { items: [], total: number, page: number, pageSize: number }
          setCustomers(data.items || [])
          setTotal(data.total || 0)
          setPage(data.page || pageNum)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    fetchCustomers(searchQuery, page)
  }, [page, pageSize]) // Re-fetch when page changes (searchQuery change requires manual submit)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to page 1 on search
    fetchCustomers(searchQuery, 1)
  }

  const handleNextPage = () => {
    // If total is -1 (unknown more), we always allow next
    if (total === -1 || page * pageSize < total) {
      setPage(p => p + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Customer List</h1>
      <Link to="/">Back to Home</Link>
      
      <form onSubmit={handleSearch} style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone..."
          style={{ padding: '8px', flex: 1, fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {customers.length === 0 ? (
              <li style={{ padding: '10px', borderBottom: '1px solid #eee' }}>No customers found.</li>
            ) : (
              customers.map(c => (
                <li key={c.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                  <div style={{ color: '#666' }}>{c.email} {c.phone && `• ${c.phone}`}</div>
                  <div style={{ fontSize: '0.9em', color: '#888' }}>
                    Status: {c.status} • Joined: {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))
            )}
          </ul>

          {!searchQuery && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                style={{ padding: '8px 16px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              
              <span>
                Page {page} {total !== -1 && `of ${Math.ceil(total / pageSize)}`}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={total !== -1 && page * pageSize >= total}
                style={{
                  padding: '8px 16px',
                  cursor: (total !== -1 && page * pageSize >= total) ? 'not-allowed' : 'pointer',
                  opacity: (total !== -1 && page * pageSize >= total) ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
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
